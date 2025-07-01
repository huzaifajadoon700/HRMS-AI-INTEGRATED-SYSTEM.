const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Test route is working',
    timestamp: new Date().toISOString()
  });
});

// Another test route
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Pong! Route system is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
