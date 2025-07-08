const mongoose = require('mongoose');

/**
 * Database connection configuration and utilities
 * Handles MongoDB connection with proper error handling and monitoring
 */

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise} MongoDB connection promise
 */
const connectDB = async (uri) => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    const conn = await mongoose.connect(uri, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Gracefully close database connection
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

/**
 * Get database connection status
 * @returns {string} Connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Database health check
 * @returns {Object} Health check result
 */
const healthCheck = async () => {
  try {
    const status = getConnectionStatus();
    const dbStats = await mongoose.connection.db.stats();
    
    return {
      status: 'healthy',
      connection: status,
      database: mongoose.connection.name,
      collections: dbStats.collections,
      dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      connection: getConnectionStatus()
    };
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🔄 Received SIGINT. Gracefully shutting down...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Received SIGTERM. Gracefully shutting down...');
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  healthCheck
};
