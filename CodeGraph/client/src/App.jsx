import React, { useState, useEffect } from 'react';
import { Database, Loader2 } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ApiDetails from './pages/ApiDetails';
import api from './services/api';
import { ListSkeleton } from './components/Skeletons';

export default function App() {
  const [selectedApi, setSelectedApi] = useState(null);
  const [dbConnected, setDbConnected] = useState(null); 

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
        if (attempts >= 3) setDbConnected(false);
        else setDbConnected(null); 
      }
    };

    checkDbStatus();
    const interval = setInterval(checkDbStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const badgeConnected = dbConnected === true;
  const badgeConnecting = dbConnected === null;
  const badgeFailed = dbConnected === false;

  return (
    <div className="app-container">
      <header className="app-header">
        <div />

        
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
        {dbConnected === null ? (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="skeleton-line" style={{ width: '200px', height: '28px', borderRadius: '8px' }} />
              <div className="skeleton-line" style={{ width: '300px', marginTop: '0.5rem' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="skeleton-rect" style={{ width: '100%', height: '56px', borderRadius: '12px' }} />
            </div>
            <div className="list-card">
              <div className="skeleton-line short" style={{ marginBottom: '1.5rem' }} />
              <ListSkeleton count={5} />
            </div>
          </div>
        ) : selectedApi ? (
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
