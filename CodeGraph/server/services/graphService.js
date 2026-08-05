const { getSession, driver } = require('../config/db');
const dashboardQueries = require('../queries/dashboardQueries');
const searchQueries = require('../queries/searchQueries');
const dependencyQueries = require('../queries/dependencyQueries');
const impactQueries = require('../queries/impactQueries');

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

const checkDbConnectionOrThrow = async () => {
  const connected = await checkConnection();
  if (!connected) {
    throw new Error('Unable to connect to the CodeGraph database. Please try again later.');
  }
};

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
  await checkDbConnectionOrThrow();
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
  } finally {
    await session.close();
  }
};

const searchApis = async (query = '') => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(searchQueries.SEARCH_APIS, { query });
    const apis = result.records.map(record => ({
      name: record.get('name'),
      description: record.get('description') || '',
      riskLevel: record.get('riskLevel') || 'Low'
    }));
    return { apis, dbConnected: true };
  } finally {
    await session.close();
  }
};

const getApis = async () => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(searchQueries.LIST_ALL_APIS);
    const apis = result.records.map(record => ({
      name: record.get('name'),
      description: record.get('description') || '',
      riskLevel: record.get('riskLevel') || 'Low'
    }));
    return { apis, dbConnected: true };
  } finally {
    await session.close();
  }
};

const getApiDetails = async (name) => {
  await checkDbConnectionOrThrow();
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
  } finally {
    await session.close();
  }
};

const getApiDependencies = async (name) => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(dependencyQueries.GET_DOWNSTREAM_DEPENDENCIES, { name });
    const graph = parsePaths(result.records);
    return { ...graph, dbConnected: true };
  } finally {
    await session.close();
  }
};

const getApiImpact = async (name) => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(impactQueries.GET_UPSTREAM_IMPACT, { name });
    const graph = parsePaths(result.records);

    const circularResult = await session.run(impactQueries.DETECT_CIRCULAR_DEPENDENCY, { name });
    const hasCircular = circularResult.records.length > 0;

    return { ...graph, hasCircular, dbConnected: true };
  } finally {
    await session.close();
  }
};

const getStats = async () => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(dashboardQueries.GET_STATS_CARD_DATA);
    if (result.records.length > 0) {
      const record = result.records[0];
      return {
        stats: {
          pages: record.get('pages') || 0,
          apis: record.get('apis') || 0,
          services: record.get('services') || 0,
          databases: record.get('databases') || 0,
          relationships: record.get('relationships') || 0
        },
        dbConnected: true
      };
    }
    throw new Error('No statistics records found.');
  } finally {
    await session.close();
  }
};

const getAllNodes = async () => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(
      `MATCH (n)
       RETURN DISTINCT n.name AS name, labels(n)[0] AS label
       ORDER BY name ASC`
    );
    const nodes = result.records.map(record => ({
      name: record.get('name'),
      label: record.get('label')
    }));
    return { nodes, dbConnected: true };
  } finally {
    await session.close();
  }
};

const getShortestPath = async (startName, endName) => {
  await checkDbConnectionOrThrow();
  let session = getSession();
  try {
    const result = await session.run(
      `MATCH (start {name: $startName}), (end {name: $endName})
       MATCH path = shortestPath((start)-[:USES|DEPENDS_ON|CALLS|READS|OWNED_BY*..10]-(end))
       RETURN path`,
      { startName, endName }
    );
    const graph = parsePaths(result.records);
    return { ...graph, dbConnected: true };
  } finally {
    await session.close();
  }
};

module.exports = {
  checkConnection,
  getRecentApis,
  searchApis,
  getApis,
  getApiDetails,
  getApiDependencies,
  getApiImpact,
  getStats,
  getAllNodes,
  getShortestPath
};
