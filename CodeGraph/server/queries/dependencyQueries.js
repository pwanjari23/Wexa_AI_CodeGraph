const GET_API_OVERVIEW = `
  MATCH (a:API {name: $name})
  RETURN a.name AS name, a.description AS description
`;

const GET_DOWNSTREAM_DEPENDENCIES = `
  MATCH path = (a:API {name: $name})-[r:DEPENDS_ON|USES|READS|OWNED_BY|CALLS*1..4]->(target)
  RETURN path
`;

module.exports = {
  GET_API_OVERVIEW,
  GET_DOWNSTREAM_DEPENDENCIES
};
