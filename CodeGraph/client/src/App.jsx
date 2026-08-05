import React, { useState, useEffect } from 'react';
import { Network, Database } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ApiDetails from './pages/ApiDetails';
import api from './services/api';

export default function App() {
  const [selectedApi, setSelectedApi] = useState(null);
  const [dbConnected, setDbConnected] = useState(true);

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const res = await api.get('/health');
        setDbConnected(res.data.database === 'Connected');
      } catch (err) {
        console.error('Error fetching database status:', err);
        setDbConnected(false);
      }
    };
    checkDbStatus();
    // Poll status every 15 seconds to keep it dynamic
    const interval = setInterval(checkDbStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <a href="#" className="brand" onClick={(e) => { e.preventDefault(); setSelectedApi(null); }}>
          <span className="brand-logo">
            <Network size={24} />
          </span>
          <h1>CodeGraph</h1>
        </a>
        
        <div className={`db-status-badge ${dbConnected ? 'connected' : 'disconnected'}`}
             style={!dbConnected ? { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' } : {}}
             title={dbConnected ? "Connected to CognoDB Cloud" : "Database Unavailable"}>
          <span className="db-dot" style={!dbConnected ? { backgroundColor: '#dc2626' } : {}} />
          <Database size={14} />
          <span>{dbConnected ? 'CognoDB Connected' : 'Database Unavailable'}</span>
        </div>
      </header>

      <main className="main-content">
        {selectedApi ? (
          <ApiDetails 
            apiName={selectedApi} 
            onBack={() => setSelectedApi(null)} 
            dbConnected={dbConnected}
          />
        ) : (
          <Dashboard 
            onSelectApi={(name) => setSelectedApi(name)} 
            dbConnected={dbConnected}
          />
        )}
      </main>
    </div>
  );
}
