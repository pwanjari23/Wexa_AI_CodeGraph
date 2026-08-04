const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { closeDriver } = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for client requests
app.use(cors());
app.use(express.json());

// Log incoming request paths
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Route registration
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/apis', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express handler caught unhandled error:', err);
  res.status(500).json({
    error: 'Server Error',
    message: err.message
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`CodeGraph backend server running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

// Shutdown hook
const handleGracefulShutdown = async () => {
  console.log('\nClosing server process...');
  server.close(() => {
    console.log('Express HTTP server terminated.');
  });
  await closeDriver();
  console.log('Graph database driver closed. Safe exit.');
  process.exit(0);
};

process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);
