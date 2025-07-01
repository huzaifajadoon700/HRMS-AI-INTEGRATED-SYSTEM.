/**
 * HRMS AI Integrated System - Security Helper Utilities
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Security utilities for authentication, authorization, and data protection
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Rate limiting helper for API endpoints
 */
class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
    }

    /**
     * Check if request is within rate limit
     * @param {string} identifier - IP address or user ID
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {Object} Rate limit status
     */
    checkLimit(identifier, maxRequests = 100, windowMs = 60000) {
        const now = Date.now();
        const windowStart = now - windowMs;
        
        if (!this.requests.has(identifier)) {
            this.requests.set(identifier, []);
        }
        
        const userRequests = this.requests.get(identifier);
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
        this.requests.set(identifier, validRequests);
        
        if (validRequests.length >= maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: Math.min(...validRequests) + windowMs,
                retryAfter: Math.ceil((Math.min(...validRequests) + windowMs - now) / 1000)
            };
        }
        
        // Add current request
        validRequests.push(now);
        this.requests.set(identifier, validRequests);
        
        return {
            allowed: true,
            remaining: maxRequests - validRequests.length,
            resetTime: now + windowMs,
            retryAfter: 0
        };
    }

    /**
     * Cleanup old entries
     */
    cleanup() {
        const now = Date.now();
        const oneHourAgo = now - 3600000; // 1 hour
        
        for (const [identifier, requests] of this.requests.entries()) {
            const validRequests = requests.filter(timestamp => timestamp > oneHourAgo);
            if (validRequests.length === 0) {
                this.requests.delete(identifier);
            } else {
                this.requests.set(identifier, validRequests);
            }
        }
    }

    /**
     * Clear rate limit for specific identifier
     * @param {string} identifier - IP address or user ID
     */
    clearLimit(identifier) {
        this.requests.delete(identifier);
    }

    /**
     * Destroy rate limiter and cleanup
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.requests.clear();
    }
}

/**
 * Generate secure random tokens
 * @param {number} length - Token length
 * @returns {string} Secure random token
 */
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate API key with prefix
 * @param {string} prefix - API key prefix
 * @returns {string} API key
 */
const generateApiKey = (prefix = 'hrms') => {
    const randomPart = crypto.randomBytes(24).toString('hex');
    return `${prefix}_${randomPart}`;
};

/**
 * Hash sensitive data using SHA-256
 * @param {string} data - Data to hash
 * @param {string} salt - Optional salt
 * @returns {string} Hashed data
 */
const hashData = (data, salt = '') => {
    const hash = crypto.createHash('sha256');
    hash.update(data + salt);
    return hash.digest('hex');
};

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {Object} Encrypted data with IV and auth tag
 */
const encryptData = (text, key = process.env.ENCRYPTION_KEY) => {
    if (!key) {
        throw new Error('Encryption key is required');
    }
    
    const algorithm = 'aes-256-gcm';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('HRMS-AI-System', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
};

/**
 * Decrypt data encrypted with encryptData
 * @param {Object} encryptedData - Encrypted data object
 * @param {string} key - Decryption key
 * @returns {string} Decrypted text
 */
const decryptData = (encryptedData, key = process.env.ENCRYPTION_KEY) => {
    if (!key) {
        throw new Error('Decryption key is required');
    }
    
    const algorithm = 'aes-256-gcm';
    const decipher = crypto.createDecipher(algorithm, key);
    
    decipher.setAAD(Buffer.from('HRMS-AI-System', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};

/**
 * Validate JWT token and extract payload
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Object} Token validation result
 */
const validateJwtToken = (token, secret = process.env.JWT_SECRET) => {
    try {
        if (!token) {
            return { valid: false, error: 'No token provided' };
        }
        
        if (!secret) {
            return { valid: false, error: 'JWT secret not configured' };
        }
        
        const decoded = jwt.verify(token, secret);
        
        return {
            valid: true,
            payload: decoded,
            expired: false
        };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Token expired', expired: true };
        }
        
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Invalid token format', expired: false };
        }
        
        return { valid: false, error: error.message, expired: false };
    }
};

/**
 * Generate password hash with salt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
    try {
        if (!password || typeof password !== 'string') {
            throw new Error('Valid password is required');
        }
        
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);
    }
};

/**
 * Verify password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Password match result
 */
const verifyPassword = async (password, hash) => {
    try {
        if (!password || !hash) {
            return false;
        }
        
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Password verification error:', error.message);
        return false;
    }
};

/**
 * Sanitize input to prevent XSS attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') {
        return input;
    }
    
    return input
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .replace(/script/gi, '') // Remove script tags
        .trim();
};

/**
 * Validate and sanitize email address
 * @param {string} email - Email address
 * @returns {Object} Validation result
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, sanitized: '', error: 'Email is required' };
    }
    
    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(sanitized)) {
        return { valid: false, sanitized, error: 'Invalid email format' };
    }
    
    return { valid: true, sanitized, error: null };
};

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
const generateCsrfToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Validate CSRF token
 * @param {string} token - CSRF token to validate
 * @param {string} sessionToken - Session CSRF token
 * @returns {boolean} Validation result
 */
const validateCsrfToken = (token, sessionToken) => {
    if (!token || !sessionToken) {
        return false;
    }
    
    return crypto.timingSafeEqual(
        Buffer.from(token, 'hex'),
        Buffer.from(sessionToken, 'hex')
    );
};

/**
 * Check for common SQL injection patterns
 * @param {string} input - User input to check
 * @returns {boolean} True if suspicious patterns found
 */
const detectSqlInjection = (input) => {
    if (typeof input !== 'string') {
        return false;
    }
    
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /(--|\/\*|\*\/)/,
        /(\b(OR|AND)\b.*=.*)/i,
        /(;|\||&)/,
        /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Generate secure session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return crypto.createHash('sha256').update(timestamp + randomBytes).digest('hex');
};

/**
 * Create rate limiter instance
 */
const rateLimiter = new RateLimiter();

module.exports = {
    RateLimiter,
    rateLimiter,
    generateSecureToken,
    generateApiKey,
    hashData,
    encryptData,
    decryptData,
    validateJwtToken,
    hashPassword,
    verifyPassword,
    sanitizeInput,
    validateEmail,
    generateCsrfToken,
    validateCsrfToken,
    detectSqlInjection,
    generateSessionId
};
