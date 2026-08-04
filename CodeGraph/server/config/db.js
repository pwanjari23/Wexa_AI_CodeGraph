const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  console.warn('WARNING: CognoDB environment variables are missing in your .env configuration. The application will run in degraded/mock mode until database connection credentials are provided.');
}

let driver = null;
try {
  if (uri && username && password) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
      disableLosslessIntegers: true
    });
    console.log('Neo4j/CognoDB driver initialized successfully.');
  }
} catch (error) {
  console.error('CRITICAL: Failed to initialize Neo4j driver:', error.message);
}


const getSession = (options = {}) => {
  if (!driver) {
    throw new Error('Database driver not initialized. Please verify your environment variables in .env.');
  }
  return driver.session(options);
};

const closeDriver = async () => {
  if (driver) {
    await driver.close();
    console.log('Database driver connection closed.');
  }
};

module.exports = {
  driver,
  getSession,
  closeDriver
};
