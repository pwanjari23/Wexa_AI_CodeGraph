import React, { useState, useEffect } from 'react';
import { Network, Database, Loader2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ApiDetails from './pages/ApiDetails';
import api from './services/api';

export default function App() {
  const [selectedApi, setSelectedApi] = useState(null);
  const [dbConnected, setDbConnected] = useState(null); // null = still checking

  useEffect(() => {
    let attempts = 0;

    const checkDbStatus = async () => {
      try {
        const res = await api.get('/health');
        const connected = res.data.database === 'Connected';
        setDbConnected(connected);
        if (connected) attempts = 0; // reset on success
      } catch (err) {
        attempts++;
        console.warn(`Health check failed (attempt ${attempts}):`, err.message);
        // Only mark as fully disconnected after 3 consecutive failures
        if (attempts >= 3) setDbConnected(false);
        else setDbConnected(null); // still "connecting"
      }
    };

    checkDbStatus();
    const interval = setInterval(checkDbStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Badge styling based on connection state
  const badgeConnected = dbConnected === true;
  const badgeConnecting = dbConnected === null;
  const badgeFailed = dbConnected === false;

  return (
    <div className="app-container">
      <header className="app-header">
        <a href="#" className="brand" onClick={(e) => { e.preventDefault(); setSelectedApi(null); }}>
          <span className="brand-logo">
            <Network size={24} />
          </span>
          <h1>CodeGraph</h1>
        </a>
        
        <div
          className={`db-status-badge ${badgeConnected ? 'connected' : 'disconnected'}`}
          style={badgeFailed ? { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }
               : badgeConnecting ? { backgroundColor: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }
               : {}}
          title={badgeConnected ? 'Connected to CognoDB Cloud' : badgeConnecting ? 'Waking up backend…' : 'Database Unavailable'}
        >
          {badgeConnecting
            ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : <span className="db-dot" style={badgeFailed ? { backgroundColor: '#dc2626' } : {}} />}
          <Database size={14} />
          <span>
            {badgeConnected ? 'CognoDB Connected'
             : badgeConnecting ? 'Connecting…'
             : 'Database Unavailable'}
          </span>
        </div>
      </header>

      <main className="main-content">
        {selectedApi ? (
          <ApiDetails 
            apiName={selectedApi} 
            onBack={() => setSelectedApi(null)} 
            dbConnected={dbConnected === true}
          />
        ) : (
          <Dashboard 
            onSelectApi={(name) => setSelectedApi(name)} 
            dbConnected={dbConnected === true}
          />
        )}
      </main>
    </div>
  );
}
