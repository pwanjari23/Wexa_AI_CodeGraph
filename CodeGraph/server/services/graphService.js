const { getSession, driver } = require('../config/db');
const dashboardQueries = require('../queries/dashboardQueries');
const searchQueries = require('../queries/searchQueries');
const dependencyQueries = require('../queries/dependencyQueries');
const impactQueries = require('../queries/impactQueries');


const mockData = {
  recentApis: [
    { name: 'Payment API', description: 'Processes payment details with gateway', createdAt: '2026-08-04T12:00:00Z' },
    { name: 'Checkout API', description: 'Initiates purchase transactions', createdAt: '2026-08-03T11:00:00Z' },
    { name: 'Orders API', description: 'Creates records and handles shipping dispatch', createdAt: '2026-08-02T10:00:00Z' },
    { name: 'Cart API', description: 'Manages items in persistent sessions', createdAt: '2026-08-01T09:00:00Z' },
    { name: 'Login API', description: 'Validates credentials and issues tokens', createdAt: '2026-07-31T08:00:00Z' }
  ],
  apis: [
    { name: 'Login API', description: 'Validates credentials and issues tokens' },
    { name: 'Register API', description: 'Registers new accounts' },
    { name: 'Products API', description: 'Fetches catalog and details' },
    { name: 'Cart API', description: 'Manages items in persistent sessions' },
    { name: 'Checkout API', description: 'Initiates purchase transactions' },
    { name: 'Payment API', description: 'Processes payment details with gateway' },
    { name: 'Orders API', description: 'Creates records and handles shipping dispatch' },
    { name: 'Profile API', description: 'Retrieves or updates user details' }
  ]
};


let isDbConnected = false;


const checkConnection = async () => {
  if (!driver) {
    isDbConnected = false;
    return false;
  }
  let session = null;
  try {
    session = getSession();
    await session.run('RETURN 1');
    isDbConnected = true;
    return true;
  } catch (error) {
    isDbConnected = false;
    return false;
  } finally {
    if (session) await session.close();
  }
};


checkConnection().catch(() => { });


const parsePaths = (records) => {
  const nodesMap = new Map();
  const edgesMap = new Map();

  records.forEach(record => {

    const path = record.get('path');
    if (!path) return;


    const registerNode = (node) => {
      const id = node.elementId || node.identity.toString();
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id: id,
          label: node.labels[0],
          labels: node.labels,
          name: node.properties.name || node.properties.id || id,
          description: node.properties.description || '',
          riskLevel: node.properties.riskLevel || 'Low',
          createdAt: node.properties.createdAt || ''
        });
      }
    };


    const registerRel = (rel) => {
      const id = rel.elementId || rel.identity.toString();
      const startId = rel.startNodeElementId || rel.start.toString();
      const endId = rel.endNodeElementId || rel.end.toString();
      if (!edgesMap.has(id)) {
        edgesMap.set(id, {
          id: id,
          source: startId,
          target: endId,
          type: rel.type,
          label: rel.type
        });
      }
    };

    if (path.start) registerNode(path.start);
    if (path.end) registerNode(path.end);

    if (path.segments && Array.isArray(path.segments)) {
      path.segments.forEach(segment => {
        registerNode(segment.start);
        registerNode(segment.end);
        registerRel(segment.relationship);
      });
    }
  });

  return {
    nodes: Array.from(nodesMap.values()),
    edges: Array.from(edgesMap.values())
  };
};

const getRecentApis = async () => {
  const connected = await checkConnection();
  if (!connected) {
    return { recentApis: mockData.recentApis, dbConnected: false };
  }

  let session = getSession();
  try {
    const result = await session.run(dashboardQueries.GET_RECENT_APIS);
    const recentApis = result.records.map(record => ({
      name: record.get('name'),
      description: record.get('description') || '',
      riskLevel: record.get('riskLevel') || 'Low',
      createdAt: record.get('createdAt') || ''
    }));
    return { recentApis, dbConnected: true };
  } catch (error) {
    console.error('getRecentApis error:', error);
    return { recentApis: mockData.recentApis, dbConnected: false, error: error.message };
  } finally {
    await session.close();
  }
};

const searchApis = async (query = '') => {
  const connected = await checkConnection();
  if (!connected) {
    const filtered = mockData.apis.filter(api =>
      api.name.toLowerCase().includes(query.toLowerCase()) ||
      api.description.toLowerCase().includes(query.toLowerCase())
    );
    return { apis: filtered, dbConnected: false };
  }

  let session = getSession();
  try {
    const result = await session.run(searchQueries.SEARCH_APIS, { query });
    const apis = result.records.map(record => ({
      name: record.get('name'),
      description: record.get('description') || '',
      riskLevel: record.get('riskLevel') || 'Low'
    }));
    return { apis, dbConnected: true };
  } catch (error) {
    console.error('searchApis error:', error);
    return { apis: mockData.apis, dbConnected: false, error: error.message };
  } finally {
    await session.close();
  }
};

const getApis = async () => {
  const connected = await checkConnection();
  if (!connected) {
    return { apis: mockData.apis, dbConnected: false };
  }

  let session = getSession();
  try {
    const result = await session.run(searchQueries.LIST_ALL_APIS);
    const apis = result.records.map(record => ({
      name: record.get('name'),
      description: record.get('description') || '',
      riskLevel: record.get('riskLevel') || 'Low'
    }));
    return { apis, dbConnected: true };
  } catch (error) {
    console.error('getApis error:', error);
    return { apis: mockData.apis, dbConnected: false, error: error.message };
  } finally {
    await session.close();
  }
};

const getApiDetails = async (name) => {
  const connected = await checkConnection();
  if (!connected) {
    const api = mockData.apis.find(a => a.name.toLowerCase() === name.toLowerCase()) || {
      name,
      description: 'API description placeholder (Demo Mode)'
    };

    return {
      name: api.name,
      description: api.description,
      dbConnected: false
    };
  }

  let session = getSession();
  try {
    const result = await session.run(dependencyQueries.GET_API_OVERVIEW, { name });
    if (result.records.length > 0) {
      const record = result.records[0];
      return {
        name: record.get('name'),
        description: record.get('description') || '',
        dbConnected: true
      };
    }
    return null;
  } catch (error) {
    console.error('getApiDetails error:', error);
    return null;
  } finally {
    await session.close();
  }
};


const getApiDependencies = async (name) => {
  const connected = await checkConnection();
  if (!connected) {

    return getMockGraphData(name, 'downstream');
  }

  let session = getSession();
  try {
    const result = await session.run(dependencyQueries.GET_DOWNSTREAM_DEPENDENCIES, { name });
    const graph = parsePaths(result.records);
    return { ...graph, dbConnected: true };
  } catch (error) {
    console.error('getApiDependencies error:', error);
    return { nodes: [], edges: [], dbConnected: false, error: error.message };
  } finally {
    await session.close();
  }
};


const getApiImpact = async (name) => {
  const connected = await checkConnection();
  if (!connected) {
    return getMockGraphData(name, 'upstream');
  }

  let session = getSession();
  try {
    const result = await session.run(impactQueries.GET_UPSTREAM_IMPACT, { name });
    const graph = parsePaths(result.records);


    const circularResult = await session.run(impactQueries.DETECT_CIRCULAR_DEPENDENCY, { name });
    const hasCircular = circularResult.records.length > 0;

    return { ...graph, hasCircular, dbConnected: true };
  } catch (error) {
    console.error('getApiImpact error:', error);
    return { nodes: [], edges: [], hasCircular: false, dbConnected: false, error: error.message };
  } finally {
    await session.close();
  }
};



function getMockGraphData(name, direction) {
  const nodes = [
    { id: 'p_checkout', label: 'FrontendPage', name: 'Checkout Page', description: 'Checkout forms & options', riskLevel: 'High' },
    { id: 'p_cart', label: 'FrontendPage', name: 'Cart Page', description: 'View shopping items', riskLevel: 'Low' },
    { id: 'p_login', label: 'FrontendPage', name: 'Login Page', description: 'Identity entrypoint', riskLevel: 'Low' },
    { id: 'a_login', label: 'API', name: 'Login API', description: 'Validates password credentials', riskLevel: 'High' },
    { id: 'a_checkout', label: 'API', name: 'Checkout API', description: 'Initiates cart billing process', riskLevel: 'High' },
    { id: 'a_payment', label: 'API', name: 'Payment API', description: 'Transacts money with banks', riskLevel: 'High' },
    { id: 'a_orders', label: 'API', name: 'Orders API', description: 'Persists purchase confirmation ledger', riskLevel: 'High' },
    { id: 'a_cart', label: 'API', name: 'Cart API', description: 'Stores user cart state', riskLevel: 'Medium' },
    { id: 's_auth', label: 'Service', name: 'Authentication Service', description: 'Validates tokens and identities' },
    { id: 's_payment', label: 'Service', name: 'Payment Service', description: 'Ledgers bank responses' },
    { id: 's_order', label: 'Service', name: 'Order Service', description: 'Updates inventory and logistics status' },
    { id: 'd_system', label: 'Database', name: 'System DB', description: 'Main consolidated application database' },
    { id: 't_commerce', label: 'DeveloperTeam', name: 'Commerce Team', description: 'Builds shopping systems' },
    { id: 't_payments', label: 'DeveloperTeam', name: 'Payments Team', description: 'Builds billing adapters' },
    { id: 't_auth', label: 'DeveloperTeam', name: 'Authentication Team', description: 'Secures system APIs' },
    { id: 'e_stripe', label: 'ExternalService', name: 'Stripe', description: 'US payment gateway' },
    { id: 'e_razorpay', label: 'ExternalService', name: 'Razorpay', description: 'APAC payment gateway' }
  ];

  const edges = [
    { id: 'e1', source: 'p_checkout', target: 'a_checkout', type: 'CALLS', label: 'CALLS' },
    { id: 'e2', source: 'p_cart', target: 'a_cart', type: 'CALLS', label: 'CALLS' },
    { id: 'e3', source: 'p_login', target: 'a_login', type: 'CALLS', label: 'CALLS' },
    { id: 'e4', source: 'a_checkout', target: 'a_payment', type: 'DEPENDS_ON', label: 'DEPENDS_ON' },
    { id: 'e5', source: 'a_checkout', target: 'a_orders', type: 'DEPENDS_ON', label: 'DEPENDS_ON' },
    { id: 'e6', source: 'a_payment', target: 's_payment', type: 'USES', label: 'USES' },
    { id: 'e7', source: 'a_orders', target: 's_order', type: 'USES', label: 'USES' },
    { id: 'e8', source: 'a_login', target: 's_auth', type: 'USES', label: 'USES' },
    { id: 'e9', source: 'a_checkout', target: 's_auth', type: 'USES', label: 'USES' },
    { id: 'e10', source: 'a_payment', target: 's_auth', type: 'USES', label: 'USES' },
    { id: 'e11', source: 's_auth', target: 'd_system', type: 'READS', label: 'READS' },
    { id: 'e12', source: 's_payment', target: 'd_system', type: 'READS', label: 'READS' },
    { id: 'e13', source: 's_order', target: 'd_system', type: 'READS', label: 'READS' },
    { id: 'e14', source: 's_auth', target: 't_auth', type: 'OWNED_BY', label: 'OWNED_BY' },
    { id: 'e15', source: 's_payment', target: 't_payments', type: 'OWNED_BY', label: 'OWNED_BY' },
    { id: 'e16', source: 's_order', target: 't_commerce', type: 'OWNED_BY', label: 'OWNED_BY' },
    { id: 'e17', source: 's_payment', target: 'e_stripe', type: 'CALLS', label: 'CALLS' },
    { id: 'e18', source: 's_payment', target: 'e_razorpay', type: 'CALLS', label: 'CALLS' },
    { id: 'e19', source: 'a_cart', target: 's_auth', type: 'USES', label: 'USES' }
  ];

  if (name === 'Cart API') {
    edges.push({ id: 'e_circ1', source: 'a_cart', target: 'a_checkout', type: 'DEPENDS_ON', label: 'DEPENDS_ON' });
    edges.push({ id: 'e_circ2', source: 'a_checkout', target: 'a_cart', type: 'DEPENDS_ON', label: 'DEPENDS_ON' });
  }

  let apiId = 'a_checkout';
  if (name.includes('Login')) apiId = 'a_login';
  else if (name.includes('Payment')) apiId = 'a_payment';
  else if (name.includes('Order')) apiId = 'a_orders';
  else if (name.includes('Cart')) apiId = 'a_cart';

  const matchedNodeIds = new Set([apiId]);
  const matchedEdges = [];

  const maxHops = 4;
  for (let hop = 0; hop < maxHops; hop++) {
    const startingSize = matchedNodeIds.size;
    edges.forEach(e => {
      if (direction === 'downstream') {
        if (matchedNodeIds.has(e.source) && !matchedNodeIds.has(e.target)) {
          matchedNodeIds.add(e.target);
          matchedEdges.push(e);
        } else if (matchedNodeIds.has(e.source) && matchedNodeIds.has(e.target) && !matchedEdges.includes(e)) {
          matchedEdges.push(e);
        }
      } else {
        if (matchedNodeIds.has(e.target) && !matchedNodeIds.has(e.source)) {
          matchedNodeIds.add(e.source);
          matchedEdges.push(e);
        } else if (matchedNodeIds.has(e.target) && matchedNodeIds.has(e.source) && !matchedEdges.includes(e)) {
          matchedEdges.push(e);
        }
      }
    });
    if (matchedNodeIds.size === startingSize) break;
  }

  edges.forEach(e => {
    if (e.type === 'OWNED_BY' && matchedNodeIds.has(e.source)) {
      matchedNodeIds.add(e.target);
      if (!matchedEdges.includes(e)) matchedEdges.push(e);
    }
  });

  const matchedNodes = nodes.filter(n => matchedNodeIds.has(n.id));
  const hasCircular = (name === 'Cart API');

  return { nodes: matchedNodes, edges: matchedEdges, hasCircular, dbConnected: false };
}

module.exports = {
  checkConnection,
  getRecentApis,
  searchApis,
  getApis,
  getApiDetails,
  getApiDependencies,
  getApiImpact
};
