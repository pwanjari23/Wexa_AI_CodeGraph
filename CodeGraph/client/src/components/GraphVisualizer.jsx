import React, { useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data, selected }) => {
  const isTarget = data.label !== 'FrontendPage';
  const isSource = data.label !== 'DeveloperTeam' && data.label !== 'Database' && data.label !== 'ExternalService';

  return (
    <div className={`custom-flow-node node-${data.label} ${selected ? 'active-node' : ''}`}>
      {isTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#94a3b8', width: 6, height: 6 }}
        />
      )}
      
      <span className="node-title-badge">{data.label}</span>
      <div className="node-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{data.name}</div>
      


      {isSource && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#94a3b8', width: 6, height: 6 }}
        />
      )}
    </div>
  );
};

const getLayoutedElements = (nodes = [], edges = []) => {
  const columnMapping = {
    'FrontendPage': 0,
    'API': 1,
    'Service': 2,
    'Database': 3,
    'ExternalService': 3,
    'DeveloperTeam': 4
  };

  const colGroups = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  
  nodes.forEach(node => {
    const col = columnMapping[node.label] ?? 2;
    colGroups[col].push(node);
  });

  const layoutedNodes = [];

  Object.keys(colGroups).forEach(colStr => {
    const colIdx = parseInt(colStr);
    const colNodes = colGroups[colIdx];
    const totalNodes = colNodes.length;

    colNodes.forEach((node, rowIdx) => {
      const x = colIdx * 250 + 50;
      
      let y = rowIdx * 130 + 50;
      if (colIdx % 2 === 1) {
        y += 30; 
      }

      layoutedNodes.push({
        id: node.id,
        type: 'customNode',
        data: {
          name: node.name,
          label: node.label,
          riskLevel: node.riskLevel,
          description: node.description
        },
        position: { x, y }
      });
    });
  });

  const layoutedEdges = edges.map(edge => {
    const isAnimated = ['CALLS', 'DEPENDS_ON', 'USES'].includes(edge.type);
    
    let strokeColor = '#6366f1';
    if (edge.type === 'OWNED_BY') strokeColor = '#db2777'; 
    else if (edge.type === 'READS') strokeColor = '#9333ea'; 

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      animated: isAnimated,
      type: 'smoothstep',
      style: { stroke: strokeColor, strokeWidth: 1.8 },
      labelStyle: { fill: '#475569', fontSize: '0.65rem', fontWeight: 600 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.85, stroke: '#e2e8f0', strokeWidth: 0.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 15,
        height: 15,
        color: strokeColor,
      }
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const nodeTypes = {
  customNode: CustomNode
};

export default function GraphVisualizer({ nodes = [], edges = [] }) {
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    return getLayoutedElements(nodes, edges);
  }, [nodes, edges]);

  return (
    <div className="graph-container">
      {nodes.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
          No dependency paths found.
        </div>
      ) : (
        <ReactFlow
          nodes={layoutedNodes}
          edges={layoutedEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background color="#cbd5e1" gap={16} size={1} />
          
          <div className="graph-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-page-border)', backgroundColor: 'var(--node-page-bg)' }} />
              <span>Page</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-api-border)', backgroundColor: 'var(--node-api-bg)' }} />
              <span>API</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-service-border)', backgroundColor: 'var(--node-service-bg)' }} />
              <span>Service</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-db-border)', backgroundColor: 'var(--node-db-bg)' }} />
              <span>Database</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-team-border)', backgroundColor: 'var(--node-team-bg)' }} />
              <span>Team</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ color: 'var(--node-ext-border)', backgroundColor: 'var(--node-ext-bg)' }} />
              <span>External</span>
            </div>
          </div>
        </ReactFlow>
      )}
    </div>
  );
}
