import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import { ListSkeleton } from '../components/Skeletons';

const RECENT_LIMIT = 5;

export default function Dashboard({ onSelectApi, dbConnected }) {
  const [allApis, setAllApis] = useState([]);
  const [loadingApis, setLoadingApis] = useState(true);

  useEffect(() => {
    if (!dbConnected) return;

    const fetchAllApis = async () => {
      try {
        setLoadingApis(true);
        const apisRes = await api.get('/apis');
        setAllApis(apisRes.data.apis || []);
        setLoadingApis(false);
      } catch (err) {
        console.error('Error loading APIs:', err);
        setLoadingApis(false);
      }
    };

    fetchAllApis();
  }, [dbConnected]);

  if (!dbConnected) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', color: '#dc2626', margin: '2rem 0' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#dc2626' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Database Connection Error</h3>
        <p>Unable to connect to the CodeGraph database. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity style={{ color: 'var(--color-indigo)' }} /> CodeGraph
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Understand What Breaks Before You Deploy
        </p>
      </div>

      {/* Search Section */}
      <div className="search-wrapper">
        <h3 className="search-title">API Dependency Search</h3>
        <p className="search-subtitle">Select any endpoint below to inspect its frontend usage and backend connections.</p>
        <SearchBar onSelect={onSelectApi} />
      </div>

      {/* Recent APIs List */}
      <div style={{ marginTop: '2rem' }}>
        <div className="list-card">
          <h3 className="list-card-title">
            <ChevronRight size={20} style={{ color: 'var(--color-indigo)' }} /> Recent APIs
          </h3>
          {loadingApis ? (
            <ListSkeleton count={RECENT_LIMIT} />
          ) : (
            <div className="recent-list">
              {allApis.slice(0, RECENT_LIMIT).map((apiItem) => (
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
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                </a>
              ))}
              {allApis.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No API records available in the graph.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
