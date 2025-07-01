const express = require("express");
const cors = require("cors");

const app = express();

// Basic middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Minimal HRMS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test successful',
    environment: process.env.NODE_ENV || 'production',
    envVars: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasMongoConn: !!process.env.Mongo_Conn,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HRMS Backend API - Minimal Version',
    version: '1.0.0',
    status: 'running',
    endpoints: ['/api/health', '/api/test']
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;
