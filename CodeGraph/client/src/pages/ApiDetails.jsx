import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { OverviewSkeleton } from '../components/Skeletons';

export default function ApiDetails({ apiName, onBack, dbConnected }) {
  const [metadata, setMetadata] = useState(null);
  const [downstreamData, setDownstreamData] = useState({ nodes: [], edges: [] });
  const [upstreamData, setUpstreamData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dbConnected) return;

    const fetchApiData = async () => {
      setLoading(true);
      setError(null);
      try {
        const metaRes = await api.get(`/apis/${encodeURIComponent(apiName)}`);
        setMetadata(metaRes.data);

        const downRes = await api.get(`/apis/${encodeURIComponent(apiName)}/dependencies`);
        setDownstreamData(downRes.data);

        const upRes = await api.get(`/apis/${encodeURIComponent(apiName)}/impact`);
        setUpstreamData(upRes.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching API details:', err);
        setError('Error loading API dependencies.');
        setLoading(false);
      }
    };
    
    fetchApiData();
  }, [apiName, dbConnected]);

  if (!dbConnected) {
    return (
      <div>
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onBack(); }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '16px', color: '#dc2626', margin: '2rem 0' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', color: '#dc2626' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Database Connection Error</h3>
          <p>Unable to connect to the CodeGraph database. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onBack(); }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
        <OverviewSkeleton />
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div>
        <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onBack(); }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </a>
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '16px', color: '#9f1239' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Details Error</h3>
          <p>{error || 'API details could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  const frontendPages = upstreamData.nodes.filter(n => n.label === 'FrontendPage');
  const callerApis = upstreamData.nodes.filter(n => n.label === 'API' && n.name !== apiName);
  const services = downstreamData.nodes.filter(n => n.label === 'Service');
  const databases = downstreamData.nodes.filter(n => n.label === 'Database');
  const externalServices = downstreamData.nodes.filter(n => n.label === 'ExternalService');

  return (
    <div>
      <a href="#" className="back-button" onClick={(e) => { e.preventDefault(); onBack(); }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </a>

      <div className="api-hero" style={{ marginBottom: '2rem' }}>
        <div className="api-hero-left">
          <h2>{metadata.name}</h2>
          <p style={{ marginTop: '0.5rem' }}>{metadata.description || 'No description provided.'}</p>
        </div>
      </div>

      {/* Overview Grid — always shown, no tabs */}
      <div className="overview-grid">
        <div className="overview-block" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🖥️ Frontend (Where this API is used)
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Website Pages calling this API:
            </h4>
            <div className="direct-dep-list">
              {frontendPages.map(n => (
                <div key={n.id} className="direct-dep-item" style={{ background: 'var(--bg-app)' }}>
                  <div>
                    <span className="direct-dep-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.name}</span>
                    {n.description && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.description}</span>}
                  </div>
                </div>
              ))}
              {frontendPages.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  No frontend pages call this API directly.
                </div>
              )}
            </div>
          </div>

          {callerApis.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Other APIs calling this API:
              </h4>
              <div className="direct-dep-list">
                {callerApis.map(n => (
                  <div key={n.id} className="direct-dep-item" style={{ background: 'var(--bg-app)' }}>
                    <div>
                      <span className="direct-dep-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.name}</span>
                      {n.description && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="overview-block" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Backend (What this API relies on)
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Microservices used:
            </h4>
            <div className="direct-dep-list">
              {services.map(n => (
                <div key={n.id} className="direct-dep-item" style={{ background: 'var(--bg-app)' }}>
                  <div>
                    <span className="direct-dep-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.name}</span>
                    {n.description && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.description}</span>}
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  No backend microservices used.
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Databases connected:
            </h4>
            <div className="direct-dep-list">
              {databases.map(n => (
                <div key={n.id} className="direct-dep-item" style={{ background: 'var(--bg-app)' }}>
                  <div>
                    <span className="direct-dep-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.name}</span>
                    {n.description && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.description}</span>}
                  </div>
                </div>
              ))}
              {databases.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem' }}>
                  No database connections.
                </div>
              )}
            </div>
          </div>

          {externalServices.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                Third-party External Services:
              </h4>
              <div className="direct-dep-list">
                {externalServices.map(n => (
                  <div key={n.id} className="direct-dep-item" style={{ background: 'var(--bg-app)' }}>
                    <div>
                      <span className="direct-dep-name" style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.name}</span>
                      {n.description && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{n.description}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
