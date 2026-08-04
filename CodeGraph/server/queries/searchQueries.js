const SEARCH_APIS = `
  MATCH (n:API) 
  WHERE toLower(n.name) CONTAINS toLower($query) OR toLower(n.description) CONTAINS toLower($query) 
  RETURN n.name AS name, n.description AS description, n.riskLevel AS riskLevel LIMIT 10
`;

const LIST_ALL_APIS = `
  MATCH (n:API)
  RETURN n.name AS name, n.description AS description, n.riskLevel AS riskLevel
  ORDER BY n.name ASC
`;

module.exports = {
  SEARCH_APIS,
  LIST_ALL_APIS
};
