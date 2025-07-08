const app = require('./app');
const database = require('./config/database');
const { logger } = require('./middleware/logger');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  database.disconnect().then(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  database.disconnect().then(() => {
    process.exit(0);
  });
});