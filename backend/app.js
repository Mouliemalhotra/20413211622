const express = require('express');
const cors = require('cors');
const database = require('./config/database');
const { loggerMiddleware } = require('./middleware/logger');
const shortUrlRoutes = require('./routes/shorturl');
const urlService = require('./services/urlService');

const app = express();

// Connect to MongoDB
database.connect().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Custom logging middleware
app.use(loggerMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = database.getConnectionStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbStatus.isConnected,
      readyState: dbStatus.readyState
    }
  });
});

// Routes
app.use('/', shortUrlRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong'
  });
});

// Cleanup expired URLs every 5 minutes
setInterval(async () => {
  try {
    await urlService.cleanupExpiredUrls();
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
}, 5 * 60 * 1000);

module.exports = app;