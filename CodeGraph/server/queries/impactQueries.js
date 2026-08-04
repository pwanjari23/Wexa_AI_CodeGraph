const GET_UPSTREAM_IMPACT = `
  MATCH path = (upstream)-[:CALLS|DEPENDS_ON|USES*1..4]->(a:API {name: $name})
  RETURN path
`;

const DETECT_CIRCULAR_DEPENDENCY = `
  MATCH path = (a:API {name: $name})-[:DEPENDS_ON*1..5]->(a)
  RETURN path LIMIT 1
`;

module.exports = {
  GET_UPSTREAM_IMPACT,
  DETECT_CIRCULAR_DEPENDENCY
};
