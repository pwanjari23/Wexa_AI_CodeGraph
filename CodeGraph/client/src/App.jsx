import React, { useState } from 'react';
import { Network, Database } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ApiDetails from './pages/ApiDetails';

export default function App() {
  const [selectedApi, setSelectedApi] = useState(null);

  return (
    <div className="app-container">
      <main className="main-content">
        {selectedApi ? (
          <ApiDetails 
            apiName={selectedApi} 
            onBack={() => setSelectedApi(null)} 
          />
        ) : (
          <Dashboard 
            onSelectApi={(name) => setSelectedApi(name)} 
          />
        )}
      </main>
    </div>
  );
}
