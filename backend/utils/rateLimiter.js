/**
 * Rate limiting utilities for API protection
 * Provides configurable rate limiting with different strategies
 */

/**
 * In-memory store for rate limiting data
 */
class MemoryStore {
  constructor() {
    this.store = new Map();
    this.resetTimes = new Map();
  }

  /**
   * Get current count for a key
   * @param {string} key - Rate limit key
   * @returns {number} Current count
   */
  get(key) {
    return this.store.get(key) || 0;
  }

  /**
   * Increment count for a key
   * @param {string} key - Rate limit key
   * @param {number} windowMs - Window duration in milliseconds
   * @returns {Object} Current state
   */
  increment(key, windowMs) {
    const now = Date.now();
    const resetTime = this.resetTimes.get(key);
    
    // Reset if window has expired
    if (!resetTime || now >= resetTime) {
      this.store.set(key, 1);
      this.resetTimes.set(key, now + windowMs);
      return {
        count: 1,
        resetTime: now + windowMs
      };
    }
    
    const newCount = (this.store.get(key) || 0) + 1;
    this.store.set(key, newCount);
    
    return {
      count: newCount,
      resetTime: resetTime
    };
  }

  /**
   * Reset count for a key
   * @param {string} key - Rate limit key
   */
  reset(key) {
    this.store.delete(key);
    this.resetTimes.delete(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, resetTime] of this.resetTimes) {
      if (now >= resetTime) {
        this.store.delete(key);
        this.resetTimes.delete(key);
      }
    }
  }
}

/**
 * Rate limiter class
 */
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    this.maxRequests = options.maxRequests || 100;
    this.message = options.message || 'Too many requests, please try again later';
    this.statusCode = options.statusCode || 429;
    this.headers = options.headers !== false;
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
    this.store = options.store || new MemoryStore();
    
    // Auto cleanup every 10 minutes
    if (this.store instanceof MemoryStore) {
      setInterval(() => this.store.cleanup(), 10 * 60 * 1000);
    }
  }

  /**
   * Default key generator (uses IP address)
   * @param {Object} req - Express request object
   * @returns {string} Rate limit key
   */
  defaultKeyGenerator(req) {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  /**
   * Create middleware function
   * @returns {Function} Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const result = this.store.increment(key, this.windowMs);
      
      // Add rate limit headers
      if (this.headers) {
        res.set({
          'X-RateLimit-Limit': this.maxRequests,
          'X-RateLimit-Remaining': Math.max(0, this.maxRequests - result.count),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        });
      }
      
      // Check if limit exceeded
      if (result.count > this.maxRequests) {
        return res.status(this.statusCode).json({
          success: false,
          message: this.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    };
  }
}

/**
 * Create rate limiter with predefined configurations
 */
const createRateLimiter = {
  /**
   * Strict rate limiter for sensitive endpoints
   */
  strict: (options = {}) => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many attempts, please try again later',
    ...options
  }),

  /**
   * Standard rate limiter for general API endpoints
   */
  standard: (options = {}) => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Rate limit exceeded, please try again later',
    ...options
  }),

  /**
   * Lenient rate limiter for public endpoints
   */
  lenient: (options = {}) => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
    message: 'Rate limit exceeded, please try again later',
    ...options
  }),

  /**
   * Login rate limiter
   */
  login: (options = {}) => new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many login attempts, please try again later',
    keyGenerator: (req) => `login:${req.ip}:${req.body.email || 'unknown'}`,
    ...options
  }),

  /**
   * Password reset rate limiter
   */
  passwordReset: (options = {}) => new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Too many password reset attempts, please try again later',
    keyGenerator: (req) => `password-reset:${req.ip}:${req.body.email || 'unknown'}`,
    ...options
  }),

  /**
   * File upload rate limiter
   */
  fileUpload: (options = {}) => new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'Too many file uploads, please try again later',
    ...options
  })
};

/**
 * Sliding window rate limiter
 */
class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000;
    this.maxRequests = options.maxRequests || 100;
    this.message = options.message || 'Too many requests, please try again later';
    this.statusCode = options.statusCode || 429;
    this.keyGenerator = options.keyGenerator || ((req) => req.ip);
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} key - Rate limit key
   * @returns {Object} Rate limit result
   */
  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this key
    let requests = this.requests.get(key) || [];
    
    // Remove requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: requests[0] + this.windowMs
      };
    }
    
    // Add current request
    requests.push(now);
    this.requests.set(key, requests);
    
    return {
      allowed: true,
      remaining: this.maxRequests - requests.length,
      resetTime: now + this.windowMs
    };
  }

  /**
   * Create middleware function
   * @returns {Function} Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const result = this.isAllowed(key);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.maxRequests,
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      if (!result.allowed) {
        return res.status(this.statusCode).json({
          success: false,
          message: this.message,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    };
  }

  /**
   * Clean up old requests
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, requests] of this.requests) {
      const filteredRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (filteredRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filteredRequests);
      }
    }
  }
}

/**
 * Create sliding window rate limiter
 * @param {Object} options - Configuration options
 * @returns {SlidingWindowRateLimiter} Rate limiter instance
 */
const createSlidingWindowLimiter = (options = {}) => {
  const limiter = new SlidingWindowRateLimiter(options);
  
  // Auto cleanup every 5 minutes
  setInterval(() => limiter.cleanup(), 5 * 60 * 1000);
  
  return limiter;
};

/**
 * IP whitelist middleware
 * @param {Array} whitelist - Array of whitelisted IPs
 * @returns {Function} Express middleware
 */
const ipWhitelist = (whitelist = []) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    if (whitelist.includes(clientIp)) {
      return next();
    }
    
    // Apply rate limiting for non-whitelisted IPs
    next();
  };
};

module.exports = {
  RateLimiter,
  MemoryStore,
  SlidingWindowRateLimiter,
  createRateLimiter,
  createSlidingWindowLimiter,
  ipWhitelist
};
