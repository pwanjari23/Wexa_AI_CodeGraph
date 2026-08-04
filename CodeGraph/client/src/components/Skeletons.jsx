import React from 'react';

export const StatsSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem', width: '100%' }}>
    {[1, 2, 3, 4].map(n => (
      <div key={n} className="stats-card" style={{ opacity: 0.7 }}>
        <div className="skeleton-rect" style={{ width: '48px', height: '48px', margin: 0, borderRadius: '12px' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-line short" />
          <div className="skeleton-line medium" style={{ margin: 0 }} />
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div style={{ width: '100%' }}>
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '0.75rem', opacity: 0.7 }}>
        <div className="skeleton-line medium" />
        <div className="skeleton-line long" style={{ margin: 0 }} />
      </div>
    ))}
  </div>
);

export const GraphSkeleton = () => (
  <div className="graph-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
    <div className="skeleton-line" style={{ width: '150px' }} />
    <div style={{ display: 'flex', gap: '2rem' }}>
      <div className="skeleton-rect" style={{ width: '120px', height: '60px' }} />
      <div className="skeleton-rect" style={{ width: '120px', height: '60px' }} />
    </div>
    <div className="skeleton-line short" />
  </div>
);

export const OverviewSkeleton = () => (
  <div className="overview-grid">
    <div className="overview-block">
      <div className="skeleton-line short" style={{ marginBottom: '1.5rem' }} />
      <div className="skeleton-line long" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line short" />
    </div>
    <div className="overview-block">
      <div className="skeleton-line short" style={{ marginBottom: '1.5rem' }} />
      <div className="skeleton-line long" />
      <div className="skeleton-line long" />
    </div>
  </div>
);
