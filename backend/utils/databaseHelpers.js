/**
 * HRMS AI Integrated System - Database Helper Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Database connection and query optimization utilities
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const mongoose = require('mongoose');

/**
 * Database connection health checker
 * @returns {Object} Connection status and details
 */
const checkDatabaseHealth = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    return {
        status: states[state] || 'unknown',
        state,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        isConnected: state === 1
    };
};

/**
 * Graceful database connection with retry logic
 * @param {string} connectionString - MongoDB connection string
 * @param {Object} options - Connection options
 * @returns {Promise<boolean>} Connection success status
 */
const connectWithRetry = async (connectionString, options = {}) => {
    const defaultOptions = {
        maxRetries: 5,
        retryDelay: 5000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ...options
    };

    let retries = 0;
    
    while (retries < defaultOptions.maxRetries) {
        try {
            await mongoose.connect(connectionString, defaultOptions);
            console.log(`✅ Database connected successfully on attempt ${retries + 1}`);
            return true;
        } catch (error) {
            retries++;
            console.error(`❌ Database connection attempt ${retries} failed:`, error.message);
            
            if (retries >= defaultOptions.maxRetries) {
                console.error('🚫 Max connection retries reached. Database connection failed.');
                throw error;
            }
            
            console.log(`⏳ Retrying connection in ${defaultOptions.retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, defaultOptions.retryDelay));
        }
    }
    
    return false;
};

/**
 * Graceful database disconnection
 * @returns {Promise<void>}
 */
const gracefulDisconnect = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ Database disconnected gracefully');
    } catch (error) {
        console.error('❌ Error during database disconnection:', error.message);
        throw error;
    }
};

/**
 * Database query performance monitor
 * @param {Function} queryFunction - Function that executes the query
 * @param {string} queryName - Name/description of the query
 * @returns {Promise<*>} Query result with performance metrics
 */
const monitorQuery = async (queryFunction, queryName = 'Unknown Query') => {
    const startTime = Date.now();
    
    try {
        const result = await queryFunction();
        const executionTime = Date.now() - startTime;
        
        console.log(`📊 Query Performance: ${queryName} - ${executionTime}ms`);
        
        // Log slow queries (over 1 second)
        if (executionTime > 1000) {
            console.warn(`⚠️ Slow Query Detected: ${queryName} took ${executionTime}ms`);
        }
        
        return result;
    } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Query Failed: ${queryName} - ${executionTime}ms - ${error.message}`);
        throw error;
    }
};

/**
 * Pagination helper for MongoDB queries
 * @param {Object} model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated results
 */
const paginateQuery = async (model, filter = {}, options = {}) => {
    const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        populate = null,
        select = null
    } = options;

    const skip = (page - 1) * limit;
    
    try {
        let query = model.find(filter).skip(skip).limit(limit).sort(sort);
        
        if (select) {
            query = query.select(select);
        }
        
        if (populate) {
            query = query.populate(populate);
        }
        
        const [data, total] = await Promise.all([
            query.exec(),
            model.countDocuments(filter)
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('❌ Pagination query failed:', error.message);
        throw error;
    }
};

/**
 * Bulk operations helper
 * @param {Object} model - Mongoose model
 * @param {Array} operations - Array of bulk operations
 * @returns {Promise<Object>} Bulk operation result
 */
const executeBulkOperations = async (model, operations) => {
    if (!Array.isArray(operations) || operations.length === 0) {
        throw new Error('Operations array is required and must not be empty');
    }
    
    try {
        const result = await model.bulkWrite(operations);
        
        console.log(`📦 Bulk Operations Completed:`, {
            inserted: result.insertedCount,
            modified: result.modifiedCount,
            deleted: result.deletedCount,
            upserted: result.upsertedCount
        });
        
        return result;
    } catch (error) {
        console.error('❌ Bulk operations failed:', error.message);
        throw error;
    }
};

/**
 * Database index management helper
 * @param {Object} model - Mongoose model
 * @returns {Promise<Array>} List of indexes
 */
const getModelIndexes = async (model) => {
    try {
        const indexes = await model.collection.getIndexes();
        return Object.keys(indexes).map(name => ({
            name,
            keys: indexes[name]
        }));
    } catch (error) {
        console.error('❌ Failed to get model indexes:', error.message);
        throw error;
    }
};

/**
 * Database cleanup utility for expired documents
 * @param {Object} model - Mongoose model
 * @param {string} dateField - Field name containing the date
 * @param {number} daysOld - Number of days to consider as expired
 * @returns {Promise<number>} Number of deleted documents
 */
const cleanupExpiredDocuments = async (model, dateField = 'createdAt', daysOld = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    try {
        const result = await model.deleteMany({
            [dateField]: { $lt: cutoffDate }
        });
        
        console.log(`🧹 Cleanup completed: ${result.deletedCount} expired documents removed`);
        return result.deletedCount;
    } catch (error) {
        console.error('❌ Cleanup operation failed:', error.message);
        throw error;
    }
};

/**
 * Database statistics collector
 * @param {Object} model - Mongoose model
 * @returns {Promise<Object>} Collection statistics
 */
const getCollectionStats = async (model) => {
    try {
        const stats = await model.collection.stats();
        
        return {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            storageSize: stats.storageSize,
            indexes: stats.nindexes,
            indexSize: stats.totalIndexSize
        };
    } catch (error) {
        console.error('❌ Failed to get collection stats:', error.message);
        throw error;
    }
};

/**
 * Transaction helper for atomic operations
 * @param {Function} operations - Function containing operations to execute in transaction
 * @returns {Promise<*>} Transaction result
 */
const executeTransaction = async (operations) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();
        
        const result = await operations(session);
        
        await session.commitTransaction();
        console.log('✅ Transaction completed successfully');
        
        return result;
    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Transaction aborted:', error.message);
        throw error;
    } finally {
        session.endSession();
    }
};

/**
 * Database backup helper (for development/testing)
 * @param {string} collectionName - Name of collection to backup
 * @returns {Promise<Array>} Backup data
 */
const createCollectionBackup = async (collectionName) => {
    try {
        const collection = mongoose.connection.db.collection(collectionName);
        const data = await collection.find({}).toArray();
        
        console.log(`💾 Backup created for ${collectionName}: ${data.length} documents`);
        return data;
    } catch (error) {
        console.error(`❌ Backup failed for ${collectionName}:`, error.message);
        throw error;
    }
};

/**
 * Query optimization analyzer
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query to analyze
 * @returns {Promise<Object>} Query execution plan
 */
const analyzeQuery = async (model, query) => {
    try {
        const explain = await model.find(query).explain('executionStats');
        
        return {
            executionTimeMillis: explain.executionStats.executionTimeMillis,
            totalDocsExamined: explain.executionStats.totalDocsExamined,
            totalDocsReturned: explain.executionStats.totalDocsReturned,
            indexesUsed: explain.executionStats.executionStages?.indexName || 'No index used'
        };
    } catch (error) {
        console.error('❌ Query analysis failed:', error.message);
        throw error;
    }
};

module.exports = {
    checkDatabaseHealth,
    connectWithRetry,
    gracefulDisconnect,
    monitorQuery,
    paginateQuery,
    executeBulkOperations,
    getModelIndexes,
    cleanupExpiredDocuments,
    getCollectionStats,
    executeTransaction,
    createCollectionBackup,
    analyzeQuery
};
