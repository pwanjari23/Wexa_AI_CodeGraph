import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, GitFork, AlertCircle } from 'lucide-react';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import { ListSkeleton, StatsSkeleton } from '../components/Skeletons';
import GraphVisualizer from '../components/GraphVisualizer';

export default function Dashboard({ onSelectApi, dbConnected }) {
  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  // Statistics State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Shortest Path Finder State
  const [allNodes, setAllNodes] = useState([]);
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [pathResult, setPathResult] = useState(null);
  const [loadingPath, setLoadingPath] = useState(false);
  const [pathError, setPathError] = useState(null);

  useEffect(() => {
    if (!dbConnected) return;

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

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.stats || null);
        setLoadingStats(false);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setLoadingStats(false);
      }
    };

    const fetchAllNodes = async () => {
      try {
        const nodesRes = await api.get('/apis/all-nodes');
        setAllNodes(nodesRes.data || []);
      } catch (err) {
        console.error('Error loading all nodes for pathfinder:', err);
      }
    };

    fetchRecentApis();
    fetchStats();
    fetchAllNodes();
  }, [dbConnected]);

  const handleFindPath = async (e) => {
    e.preventDefault();
    if (!startNode || !endNode) return;
    
    setLoadingPath(true);
    setPathError(null);
    setPathResult(null);

    try {
      const pathRes = await api.get('/apis/shortest-path', {
        params: { start: startNode, end: endNode }
      });
      setPathResult(pathRes.data);
    } catch (err) {
      console.error('Error finding shortest path:', err);
      setPathError('Could not calculate path between selected nodes.');
    } finally {
      setLoadingPath(false);
    }
  };

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

      {/* Stats Cards Section */}
      {loadingStats ? (
        <StatsSkeleton />
      ) : (
        stats && (
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--node-page-bg)', color: 'var(--node-page-border)', fontSize: '1.5rem' }}>
                🖥️
              </div>
              <div className="stats-details">
                <h3>Frontend Pages</h3>
                <div className="stats-value">{stats.pages}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--node-api-bg)', color: 'var(--node-api-border)', fontSize: '1.5rem' }}>
                🔌
              </div>
              <div className="stats-details">
                <h3>APIs</h3>
                <div className="stats-value">{stats.apis}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--node-service-bg)', color: 'var(--node-service-border)', fontSize: '1.5rem' }}>
                ⚙️
              </div>
              <div className="stats-details">
                <h3>Microservices</h3>
                <div className="stats-value">{stats.services}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--node-db-bg)', color: 'var(--node-db-border)', fontSize: '1.5rem' }}>
                🗄️
              </div>
              <div className="stats-details">
                <h3>Databases</h3>
                <div className="stats-value">{stats.databases}</div>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-icon-wrapper" style={{ backgroundColor: 'var(--node-team-bg)', color: 'var(--node-team-border)', fontSize: '1.5rem' }}>
                🔗
              </div>
              <div className="stats-details">
                <h3>Relationships</h3>
                <div className="stats-value">{stats.relationships}</div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Search Section */}
      <div className="search-wrapper">
        <h3 className="search-title">API Dependency Search</h3>
        <p className="search-subtitle">Type the name of any endpoint below to inspect its frontend usage and backend connections.</p>
        <SearchBar onSelect={onSelectApi} />
      </div>

      {/* Shortest Path Finder Section */}
      <div className="search-wrapper">
        <h3 className="search-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitFork size={20} style={{ color: 'var(--color-indigo)' }} /> Shortest Dependency Path
        </h3>
        <p className="search-subtitle">Select two nodes to discover the shortest path of connections between them.</p>
        
        <form onSubmit={handleFindPath} className="shortest-path-form">
          <div className="input-label-group">
            <label htmlFor="start-node">Start Node</label>
            <select
              id="start-node"
              className="path-select"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
            >
              <option value="">-- Choose Node --</option>
              {allNodes.map(node => (
                <option key={`${node.label}-${node.name}`} value={node.name}>
                  {node.name} ({node.label})
                </option>
              ))}
            </select>
          </div>

          <div className="input-label-group">
            <label htmlFor="end-node">End Node</label>
            <select
              id="end-node"
              className="path-select"
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
            >
              <option value="">-- Choose Node --</option>
              {allNodes.map(node => (
                <option key={`${node.label}-${node.name}`} value={node.name}>
                  {node.name} ({node.label})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loadingPath || !startNode || !endNode}
          >
            Find Path
          </button>
        </form>

        {loadingPath && <ListSkeleton count={2} />}
        
        {pathError && (
          <div style={{ color: 'var(--risk-high)', fontSize: '0.875rem', marginTop: '1rem' }}>
            {pathError}
          </div>
        )}

        {pathResult && pathResult.nodes && pathResult.nodes.length > 0 && (
          <div style={{ marginTop: '1.5rem', height: '400px', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <GraphVisualizer nodes={pathResult.nodes} edges={pathResult.edges} />
          </div>
        )}

        {pathResult && (!pathResult.nodes || pathResult.nodes.length === 0) && !loadingPath && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', backgroundColor: 'var(--bg-app)', borderRadius: '12px', marginTop: '1rem' }}>
            No path exists between "{startNode}" and "{endNode}" in the current architecture graph.
          </div>
        )}
      </div>

      {/* Recent APIs Section */}
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
