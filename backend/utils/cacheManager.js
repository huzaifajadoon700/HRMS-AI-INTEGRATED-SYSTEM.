/**
 * HRMS AI Integrated System - Cache Management Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive caching system with TTL, LRU eviction, and multiple storage backends
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

/**
 * Cache Manager Class with LRU eviction and TTL support
 */
class CacheManager {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 1000;
        this.defaultTTL = options.defaultTTL || 3600000; // 1 hour in milliseconds
        this.checkInterval = options.checkInterval || 300000; // 5 minutes
        this.enableStats = options.enableStats !== false;
        
        // Storage
        this.cache = new Map();
        this.accessOrder = new Map(); // For LRU tracking
        this.timers = new Map(); // For TTL timers
        
        // Statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            expired: 0,
            startTime: Date.now()
        };
        
        // Start cleanup interval
        this.startCleanupInterval();
    }

    /**
     * Set cache item with optional TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     * @returns {boolean} Success status
     */
    set(key, value, ttl = this.defaultTTL) {
        try {
            // Remove existing entry if present
            if (this.cache.has(key)) {
                this.delete(key);
            }

            // Check if we need to evict items (LRU)
            if (this.cache.size >= this.maxSize) {
                this.evictLRU();
            }

            // Calculate expiration time
            const expiresAt = ttl > 0 ? Date.now() + ttl : null;

            // Store the item
            const cacheItem = {
                value,
                createdAt: Date.now(),
                expiresAt,
                accessCount: 0,
                lastAccessed: Date.now()
            };

            this.cache.set(key, cacheItem);
            this.accessOrder.set(key, Date.now());

            // Set TTL timer if needed
            if (expiresAt) {
                const timer = setTimeout(() => {
                    this.delete(key);
                    this.stats.expired++;
                }, ttl);
                this.timers.set(key, timer);
            }

            this.stats.sets++;
            return true;
        } catch (error) {
            console.error('Cache set error:', error.message);
            return false;
        }
    }

    /**
     * Get cache item
     * @param {string} key - Cache key
     * @returns {*} Cached value or null
     */
    get(key) {
        const cacheItem = this.cache.get(key);
        
        if (!cacheItem) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
            this.delete(key);
            this.stats.misses++;
            this.stats.expired++;
            return null;
        }

        // Update access information
        cacheItem.lastAccessed = Date.now();
        cacheItem.accessCount++;
        this.accessOrder.set(key, Date.now());

        this.stats.hits++;
        return cacheItem.value;
    }

    /**
     * Check if key exists in cache
     * @param {string} key - Cache key
     * @returns {boolean} Exists status
     */
    has(key) {
        const cacheItem = this.cache.get(key);
        
        if (!cacheItem) {
            return false;
        }

        // Check if expired
        if (cacheItem.expiresAt && Date.now() > cacheItem.expiresAt) {
            this.delete(key);
            return false;
        }

        return true;
    }

    /**
     * Delete cache item
     * @param {string} key - Cache key
     * @returns {boolean} Success status
     */
    delete(key) {
        const existed = this.cache.has(key);
        
        if (existed) {
            this.cache.delete(key);
            this.accessOrder.delete(key);
            
            // Clear timer if exists
            const timer = this.timers.get(key);
            if (timer) {
                clearTimeout(timer);
                this.timers.delete(key);
            }
            
            this.stats.deletes++;
        }
        
        return existed;
    }

    /**
     * Clear all cache items
     */
    clear() {
        // Clear all timers
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.cache.clear();
        this.accessOrder.clear();
        this.timers.clear();
        
        // Reset stats except start time
        const startTime = this.stats.startTime;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            expired: 0,
            startTime
        };
    }

    /**
     * Get or set cache item (cache-aside pattern)
     * @param {string} key - Cache key
     * @param {Function} fetchFunction - Function to fetch data if not cached
     * @param {number} ttl - Time to live in milliseconds
     * @returns {Promise<*>} Cached or fetched value
     */
    async getOrSet(key, fetchFunction, ttl = this.defaultTTL) {
        // Try to get from cache first
        let value = this.get(key);
        
        if (value !== null) {
            return value;
        }

        // Fetch data and cache it
        try {
            value = await fetchFunction();
            this.set(key, value, ttl);
            return value;
        } catch (error) {
            console.error('Cache fetch function error:', error.message);
            throw error;
        }
    }

    /**
     * Evict least recently used item
     */
    evictLRU() {
        if (this.accessOrder.size === 0) return;

        // Find the least recently used key
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, accessTime] of this.accessOrder.entries()) {
            if (accessTime < oldestTime) {
                oldestTime = accessTime;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.delete(oldestKey);
            this.stats.evictions++;
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
        const uptime = Date.now() - this.stats.startTime;

        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: parseFloat(hitRate.toFixed(2)),
            totalRequests,
            uptime: this.formatUptime(uptime),
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Get memory usage estimation
     * @returns {Object} Memory usage info
     */
    getMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, item] of this.cache.entries()) {
            // Rough estimation of memory usage
            totalSize += this.estimateSize(key) + this.estimateSize(item);
        }

        return {
            estimated: totalSize,
            formatted: this.formatBytes(totalSize),
            averagePerItem: this.cache.size > 0 ? totalSize / this.cache.size : 0
        };
    }

    /**
     * Estimate size of an object in bytes
     * @param {*} obj - Object to estimate
     * @returns {number} Estimated size in bytes
     */
    estimateSize(obj) {
        if (obj === null || obj === undefined) return 0;
        
        switch (typeof obj) {
            case 'string':
                return obj.length * 2; // UTF-16
            case 'number':
                return 8;
            case 'boolean':
                return 4;
            case 'object':
                if (obj instanceof Date) return 8;
                if (Array.isArray(obj)) {
                    return obj.reduce((size, item) => size + this.estimateSize(item), 0);
                }
                return Object.keys(obj).reduce((size, key) => {
                    return size + this.estimateSize(key) + this.estimateSize(obj[key]);
                }, 0);
            default:
                return 0;
        }
    }

    /**
     * Get all cache keys
     * @returns {Array} Array of cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Get cache items by pattern
     * @param {RegExp|string} pattern - Pattern to match keys
     * @returns {Object} Matching cache items
     */
    getByPattern(pattern) {
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        const matches = {};

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                matches[key] = this.get(key);
            }
        }

        return matches;
    }

    /**
     * Delete cache items by pattern
     * @param {RegExp|string} pattern - Pattern to match keys
     * @returns {number} Number of deleted items
     */
    deleteByPattern(pattern) {
        const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
        let deletedCount = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.delete(key);
                deletedCount++;
            }
        }

        return deletedCount;
    }

    /**
     * Set multiple cache items
     * @param {Object} items - Object with key-value pairs
     * @param {number} ttl - Time to live in milliseconds
     * @returns {number} Number of items set
     */
    setMultiple(items, ttl = this.defaultTTL) {
        let setCount = 0;
        
        for (const [key, value] of Object.entries(items)) {
            if (this.set(key, value, ttl)) {
                setCount++;
            }
        }
        
        return setCount;
    }

    /**
     * Get multiple cache items
     * @param {Array} keys - Array of cache keys
     * @returns {Object} Object with key-value pairs
     */
    getMultiple(keys) {
        const results = {};
        
        for (const key of keys) {
            const value = this.get(key);
            if (value !== null) {
                results[key] = value;
            }
        }
        
        return results;
    }

    /**
     * Increment numeric cache value
     * @param {string} key - Cache key
     * @param {number} delta - Increment amount
     * @param {number} ttl - Time to live in milliseconds
     * @returns {number} New value
     */
    increment(key, delta = 1, ttl = this.defaultTTL) {
        const currentValue = this.get(key);
        const newValue = (typeof currentValue === 'number' ? currentValue : 0) + delta;
        
        this.set(key, newValue, ttl);
        return newValue;
    }

    /**
     * Decrement numeric cache value
     * @param {string} key - Cache key
     * @param {number} delta - Decrement amount
     * @param {number} ttl - Time to live in milliseconds
     * @returns {number} New value
     */
    decrement(key, delta = 1, ttl = this.defaultTTL) {
        return this.increment(key, -delta, ttl);
    }

    /**
     * Start cleanup interval for expired items
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupExpired();
        }, this.checkInterval);
    }

    /**
     * Clean up expired items
     * @returns {number} Number of cleaned items
     */
    cleanupExpired() {
        let cleanedCount = 0;
        const now = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt && now > item.expiresAt) {
                this.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired items`);
        }

        return cleanedCount;
    }

    /**
     * Export cache data
     * @returns {Object} Cache export data
     */
    export() {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                size: this.cache.size,
                maxSize: this.maxSize,
                stats: this.getStats()
            },
            items: {}
        };

        for (const [key, item] of this.cache.entries()) {
            exportData.items[key] = {
                value: item.value,
                createdAt: item.createdAt,
                expiresAt: item.expiresAt,
                accessCount: item.accessCount,
                lastAccessed: item.lastAccessed
            };
        }

        return exportData;
    }

    /**
     * Import cache data
     * @param {Object} data - Cache import data
     * @returns {number} Number of imported items
     */
    import(data) {
        if (!data || !data.items) {
            throw new Error('Invalid import data format');
        }

        let importedCount = 0;
        const now = Date.now();

        for (const [key, item] of Object.entries(data.items)) {
            // Skip expired items
            if (item.expiresAt && now > item.expiresAt) {
                continue;
            }

            // Calculate remaining TTL
            const ttl = item.expiresAt ? item.expiresAt - now : this.defaultTTL;
            
            if (this.set(key, item.value, ttl)) {
                // Restore metadata
                const cacheItem = this.cache.get(key);
                if (cacheItem) {
                    cacheItem.createdAt = item.createdAt;
                    cacheItem.accessCount = item.accessCount || 0;
                    cacheItem.lastAccessed = item.lastAccessed || now;
                }
                importedCount++;
            }
        }

        return importedCount;
    }

    /**
     * Format uptime duration
     * @param {number} milliseconds - Uptime in milliseconds
     * @returns {string} Formatted uptime
     */
    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Format bytes to human readable format
     * @param {number} bytes - Bytes to format
     * @returns {string} Formatted bytes
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

/**
 * Specialized cache instances for different use cases
 */
class HRMSCacheManager {
    constructor() {
        // Different cache instances for different data types
        this.userCache = new CacheManager({ maxSize: 500, defaultTTL: 1800000 }); // 30 minutes
        this.roomCache = new CacheManager({ maxSize: 200, defaultTTL: 3600000 }); // 1 hour
        this.menuCache = new CacheManager({ maxSize: 100, defaultTTL: 7200000 }); // 2 hours
        this.sessionCache = new CacheManager({ maxSize: 1000, defaultTTL: 1800000 }); // 30 minutes
        this.apiCache = new CacheManager({ maxSize: 300, defaultTTL: 600000 }); // 10 minutes
    }

    /**
     * Cache user data
     * @param {string} userId - User ID
     * @param {Object} userData - User data
     * @param {number} ttl - Time to live
     */
    cacheUser(userId, userData, ttl) {
        return this.userCache.set(`user:${userId}`, userData, ttl);
    }

    /**
     * Get cached user data
     * @param {string} userId - User ID
     * @returns {Object|null} User data
     */
    getUser(userId) {
        return this.userCache.get(`user:${userId}`);
    }

    /**
     * Cache room availability
     * @param {string} date - Date string
     * @param {Array} availability - Room availability data
     * @param {number} ttl - Time to live
     */
    cacheRoomAvailability(date, availability, ttl) {
        return this.roomCache.set(`rooms:${date}`, availability, ttl);
    }

    /**
     * Get cached room availability
     * @param {string} date - Date string
     * @returns {Array|null} Room availability
     */
    getRoomAvailability(date) {
        return this.roomCache.get(`rooms:${date}`);
    }

    /**
     * Cache API response
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Request parameters
     * @param {*} response - API response
     * @param {number} ttl - Time to live
     */
    cacheApiResponse(endpoint, params, response, ttl) {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return this.apiCache.set(key, response, ttl);
    }

    /**
     * Get cached API response
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Request parameters
     * @returns {*} Cached response
     */
    getCachedApiResponse(endpoint, params) {
        const key = `api:${endpoint}:${JSON.stringify(params)}`;
        return this.apiCache.get(key);
    }

    /**
     * Get overall cache statistics
     * @returns {Object} Combined statistics
     */
    getOverallStats() {
        return {
            user: this.userCache.getStats(),
            room: this.roomCache.getStats(),
            menu: this.menuCache.getStats(),
            session: this.sessionCache.getStats(),
            api: this.apiCache.getStats()
        };
    }

    /**
     * Clear all caches
     */
    clearAll() {
        this.userCache.clear();
        this.roomCache.clear();
        this.menuCache.clear();
        this.sessionCache.clear();
        this.apiCache.clear();
    }
}

// Create singleton instances
const cacheManager = new CacheManager();
const hrmsCacheManager = new HRMSCacheManager();

module.exports = {
    CacheManager,
    HRMSCacheManager,
    cacheManager,
    hrmsCacheManager
};
