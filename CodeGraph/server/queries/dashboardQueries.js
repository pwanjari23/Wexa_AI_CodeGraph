const GET_STATS_CARD_DATA = `
  OPTIONAL MATCH (f:FrontendPage) WITH count(f) as pages
  OPTIONAL MATCH (a:API) WITH pages, count(a) as apis
  OPTIONAL MATCH (s:Service) WITH pages, apis, count(s) as services
  OPTIONAL MATCH (d:Database) WITH pages, apis, services, count(d) as databases
  OPTIONAL MATCH ()-[r]->() RETURN pages, apis, services, databases, count(r) as relationships
`;

const GET_RECENT_APIS = `
  MATCH (n:API) 
  RETURN n.name AS name, n.description AS description, n.riskLevel AS riskLevel, n.createdAt AS createdAt
  ORDER BY n.createdAt DESC LIMIT 5
`;

module.exports = {
  GET_STATS_CARD_DATA,
  GET_RECENT_APIS
};
