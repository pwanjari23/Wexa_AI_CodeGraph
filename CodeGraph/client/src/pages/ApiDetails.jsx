import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { OverviewSkeleton } from '../components/Skeletons';
import GraphVisualizer from '../components/GraphVisualizer';

export default function ApiDetails({ apiName, onBack, dbConnected }) {
  const [metadata, setMetadata] = useState(null);
  const [downstreamData, setDownstreamData] = useState({ nodes: [], edges: [] });
  const [upstreamData, setUpstreamData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'dependencies', 'impact'

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

  const tabStyle = (tabName) => ({
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    borderBottom: activeTab === tabName ? '3px solid var(--color-indigo)' : '3px solid transparent',
    color: activeTab === tabName ? 'var(--color-indigo)' : 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.95rem',
    background: 'none',
    border: 'none',
    outline: 'none',
    transition: 'var(--transition-fast)'
  });

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

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '1rem' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>
          📋 Overview Grid
        </button>
        <button style={tabStyle('dependencies')} onClick={() => setActiveTab('dependencies')}>
          🔌 Dependency Flow
        </button>
        <button style={tabStyle('impact')} onClick={() => setActiveTab('impact')}>
          💥 Impact Flow
        </button>
      </div>

      {activeTab === 'overview' && (
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
      )}

      {activeTab === 'dependencies' && (
        <div className="list-card" style={{ height: '550px', position: 'relative' }}>
          <h3 className="list-card-title">Downstream Dependency Graph</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Visualizes all microservices, databases, and third-party tools this API relies on.
          </p>
          <div style={{ height: 'calc(100% - 60px)' }}>
            <GraphVisualizer nodes={downstreamData.nodes} edges={downstreamData.edges} />
          </div>
        </div>
      )}

      {activeTab === 'impact' && (
        <div className="list-card" style={{ height: '550px', position: 'relative' }}>
          <h3 className="list-card-title">Upstream Impact Graph</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Visualizes all frontend pages and other APIs that will be affected if this API changes.
          </p>
          {upstreamData.hasCircular && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ <strong>Circular Dependency Detected!</strong> This API is part of a dependency loop.
            </div>
          )}
          <div style={{ height: 'calc(100% - 60px)' }}>
            <GraphVisualizer nodes={upstreamData.nodes} edges={upstreamData.edges} />
          </div>
        </div>
      )}
    </div>
  );
}
