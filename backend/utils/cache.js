// Caching helpers for performance optimization. No business logic is present in this file.
/**
 * Caching utilities for improved application performance
 * Provides in-memory caching with TTL support and cache management
 */

/**
 * Simple in-memory cache implementation
 */
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes
    this.maxSize = options.maxSize || 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.defaultTTL) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // Clear existing timer if key exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value and timer
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });

    // Set expiration timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    this.stats.sets++;
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return undefined;
    }

    // Check if item has expired
    if (item.ttl > 0 && Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and not expired
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key was deleted
   */
  delete(key) {
    const existed = this.cache.has(key);
    
    if (existed) {
      this.cache.delete(key);
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      
      this.stats.deletes++;
    }
    
    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      maxSize: this.maxSize
    };
  }

  /**
   * Get all cache keys
   * @returns {Array} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.cache.size;
  }
}

/**
 * Cache wrapper for functions with automatic memoization
 */
class FunctionCache {
  constructor(options = {}) {
    this.cache = new MemoryCache(options);
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
  }

  /**
   * Default key generator for function arguments
   * @param {Array} args - Function arguments
   * @returns {string} Cache key
   */
  defaultKeyGenerator(args) {
    return JSON.stringify(args);
  }

  /**
   * Wrap a function with caching
   * @param {Function} fn - Function to wrap
   * @param {number} ttl - Cache TTL in milliseconds
   * @returns {Function} Wrapped function
   */
  wrap(fn, ttl) {
    return (...args) => {
      const key = this.keyGenerator(args);
      
      // Try to get from cache first
      const cached = this.cache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      // Execute function and cache result
      const result = fn(...args);
      this.cache.set(key, result, ttl);
      
      return result;
    };
  }

  /**
   * Wrap an async function with caching
   * @param {Function} fn - Async function to wrap
   * @param {number} ttl - Cache TTL in milliseconds
   * @returns {Function} Wrapped async function
   */
  wrapAsync(fn, ttl) {
    return async (...args) => {
      const key = this.keyGenerator(args);
      
      // Try to get from cache first
      const cached = this.cache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      // Execute function and cache result
      const result = await fn(...args);
      this.cache.set(key, result, ttl);
      
      return result;
    };
  }
}

/**
 * Redis-like cache interface for future Redis integration
 */
class CacheInterface {
  constructor(implementation) {
    this.impl = implementation;
  }

  async get(key) {
    return this.impl.get(key);
  }

  async set(key, value, ttl) {
    return this.impl.set(key, value, ttl);
  }

  async del(key) {
    return this.impl.delete(key);
  }

  async exists(key) {
    return this.impl.has(key);
  }

  async clear() {
    return this.impl.clear();
  }

  async keys(pattern = '*') {
    const allKeys = this.impl.keys();
    if (pattern === '*') return allKeys;
    
    // Simple pattern matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  async ttl(key) {
    const item = this.impl.cache.get(key);
    if (!item) return -2; // Key doesn't exist
    if (item.ttl <= 0) return -1; // No expiration
    
    const remaining = item.ttl - (Date.now() - item.timestamp);
    return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
  }
}

/**
 * Create cache instances
 */
const createCache = {
  /**
   * Create memory cache
   * @param {Object} options - Cache options
   * @returns {MemoryCache} Memory cache instance
   */
  memory: (options = {}) => new MemoryCache(options),

  /**
   * Create function cache
   * @param {Object} options - Cache options
   * @returns {FunctionCache} Function cache instance
   */
  function: (options = {}) => new FunctionCache(options),

  /**
   * Create cache interface
   * @param {Object} implementation - Cache implementation
   * @returns {CacheInterface} Cache interface instance
   */
  interface: (implementation) => new CacheInterface(implementation)
};

/**
 * Global cache instances for common use cases
 */
const globalCaches = {
  // General purpose cache
  default: new MemoryCache({ defaultTTL: 300000, maxSize: 1000 }),
  
  // Short-term cache for API responses
  api: new MemoryCache({ defaultTTL: 60000, maxSize: 500 }),
  
  // Long-term cache for static data
  static: new MemoryCache({ defaultTTL: 3600000, maxSize: 100 }),
  
  // Session cache
  session: new MemoryCache({ defaultTTL: 1800000, maxSize: 1000 })
};

/**
 * Cache middleware for Express routes
 * @param {Object} options - Middleware options
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300000,
    keyGenerator = (req) => `${req.method}:${req.originalUrl}`,
    cache = globalCaches.api,
    condition = () => true
  } = options;

  return (req, res, next) => {
    // Skip caching if condition not met
    if (!condition(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  MemoryCache,
  FunctionCache,
  CacheInterface,
  createCache,
  globalCaches,
  cacheMiddleware
};
