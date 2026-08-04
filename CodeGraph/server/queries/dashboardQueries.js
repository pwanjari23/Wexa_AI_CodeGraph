const GET_STATS_CARD_DATA = `
  OPTIONAL MATCH (a:API) WITH count(a) as apis
  OPTIONAL MATCH (s:Service) WITH apis, count(s) as services
  OPTIONAL MATCH (d:Database) WITH apis, services, count(d) as databases
  OPTIONAL MATCH (f:FrontendPage) RETURN apis, services, databases, count(f) as pages
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
