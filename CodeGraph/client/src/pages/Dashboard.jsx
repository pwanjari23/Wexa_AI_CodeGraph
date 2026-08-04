import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import { ListSkeleton } from '../components/Skeletons';

export default function Dashboard({ onSelectApi }) {
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    const fetchRecentApis = async () => {
      try {
        setLoadingRecent(true);
        const recentRes = await api.get('/dashboard/recent');
        setRecent(recentRes.data.recentApis || []);
        setLoadingRecent(false);
      } catch (err) {
        console.error('Error loading recent APIs:', err);
        setLoadingRecent(false);
      }
    };

    fetchRecentApis();
  }, []);

  return (
    <div>
     
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity style={{ color: 'var(--color-indigo)' }} /> CodeGraph
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Understand What Breaks Before You Deploy
        </p>
      </div>

     
      <div className="search-wrapper">
        <h3 className="search-title">API Dependency Search</h3>
        <p className="search-subtitle">Type the name of any endpoint below to inspect its frontend usage and backend connections.</p>
        <SearchBar onSelect={onSelectApi} />
      </div>

      
      <div style={{ marginTop: '2rem' }}>
        <div className="list-card">
          <h3 className="list-card-title">
            <ChevronRight size={20} style={{ color: 'var(--color-indigo)' }} /> Recent APIs
          </h3>
          {loadingRecent ? (
            <ListSkeleton count={4} />
          ) : (
            <div className="recent-list">
              {recent.map((apiItem) => (
                <a
                  key={apiItem.name}
                  href="#"
                  className="recent-item"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectApi(apiItem.name);
                  }}
                >
                  <div className="recent-info">
                    <span className="recent-name">{apiItem.name}</span>
                    <span className="recent-desc">{apiItem.description}</span>
                  </div>
                </a>
              ))}
              {recent.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No API records available in the graph. Run seed command.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
