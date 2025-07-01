/**
 * HRMS AI Integrated System - Enhanced Error Handling & Logging Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Comprehensive error handling and logging system for better debugging and monitoring
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01 - Enhanced error handling and logging system
 */

/**
 * Enhanced Logger Class for structured logging
 */
class Logger {
    static log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            service: 'HRMS-Backend',
            ...meta
        };
        
        // Color coding for console output
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            WARN: '\x1b[33m',    // Yellow
            ERROR: '\x1b[31m',   // Red
            DEBUG: '\x1b[35m',   // Magenta
            RESET: '\x1b[0m'     // Reset
        };
        
        const color = colors[level.toUpperCase()] || colors.RESET;
        console.log(`${color}[${logEntry.level}] ${logEntry.timestamp} - ${logEntry.message}${colors.RESET}`);
        
        if (Object.keys(meta).length > 0) {
            console.log(JSON.stringify(meta, null, 2));
        }
        
        // In production, integrate with external logging service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to external logging service (Winston, LogRocket, etc.)
            this.sendToExternalLogger(logEntry);
        }
    }
    
    static info(message, meta = {}) {
        this.log('info', message, meta);
    }
    
    static warn(message, meta = {}) {
        this.log('warn', message, meta);
    }
    
    static error(message, error = null, meta = {}) {
        const errorMeta = error ? {
            error: {
                name: error.name,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }
        } : {};
        
        this.log('error', message, { ...errorMeta, ...meta });
    }
    
    static debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }
    
    static apiRequest(req, meta = {}) {
        this.info(`API Request: ${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
            ...meta
        });
    }
    
    static apiResponse(req, res, responseTime, meta = {}) {
        this.info(`API Response: ${req.method} ${req.originalUrl} - ${res.statusCode}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: req.user?.id,
            ...meta
        });
    }
    
    static sendToExternalLogger(logEntry) {
        // Placeholder for external logging service integration
        // Example: Send to Winston, LogRocket, Datadog, etc.
    }
}

/**
 * Enhanced Error Handler Class with detailed error types
 */
class ErrorHandler extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
        super(message);
        this.name = 'ErrorHandler';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.isOperational = true; // Distinguish operational errors from programming errors
        
        Error.captureStackTrace(this, this.constructor);
    }
    
    // Client Error (4xx) Methods
    static badRequest(message = 'Bad Request', details = {}) {
        return new ErrorHandler(message, 400, 'BAD_REQUEST', details);
    }
    
    static unauthorized(message = 'Authentication required', details = {}) {
        return new ErrorHandler(message, 401, 'UNAUTHORIZED', details);
    }
    
    static forbidden(message = 'Access forbidden', details = {}) {
        return new ErrorHandler(message, 403, 'FORBIDDEN', details);
    }
    
    static notFound(message = 'Resource not found', details = {}) {
        return new ErrorHandler(message, 404, 'NOT_FOUND', details);
    }
    
    static conflict(message = 'Resource conflict', details = {}) {
        return new ErrorHandler(message, 409, 'CONFLICT', details);
    }
    
    static validationError(message = 'Validation failed', details = {}) {
        return new ErrorHandler(message, 422, 'VALIDATION_ERROR', details);
    }
    
    static tooManyRequests(message = 'Too many requests', details = {}) {
        return new ErrorHandler(message, 429, 'TOO_MANY_REQUESTS', details);
    }
    
    // Server Error (5xx) Methods
    static internalError(message = 'Internal server error', details = {}) {
        return new ErrorHandler(message, 500, 'INTERNAL_ERROR', details);
    }
    
    static serviceUnavailable(message = 'Service temporarily unavailable', details = {}) {
        return new ErrorHandler(message, 503, 'SERVICE_UNAVAILABLE', details);
    }
    
    static databaseError(message = 'Database operation failed', details = {}) {
        return new ErrorHandler(message, 500, 'DATABASE_ERROR', details);
    }
    
    static externalServiceError(message = 'External service error', details = {}) {
        return new ErrorHandler(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
    }
    
    // Business Logic Errors
    static businessLogicError(message = 'Business rule violation', details = {}) {
        return new ErrorHandler(message, 400, 'BUSINESS_LOGIC_ERROR', details);
    }
    
    static paymentError(message = 'Payment processing failed', details = {}) {
        return new ErrorHandler(message, 402, 'PAYMENT_ERROR', details);
    }
    
    static bookingError(message = 'Booking operation failed', details = {}) {
        return new ErrorHandler(message, 400, 'BOOKING_ERROR', details);
    }
    
    static reservationError(message = 'Reservation operation failed', details = {}) {
        return new ErrorHandler(message, 400, 'RESERVATION_ERROR', details);
    }
    
    static mlModelError(message = 'ML model operation failed', details = {}) {
        return new ErrorHandler(message, 500, 'ML_MODEL_ERROR', details);
    }
}

/**
 * Async wrapper for handling async function errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        const startTime = Date.now();
        
        // Log incoming request
        Logger.apiRequest(req);
        
        Promise.resolve(fn(req, res, next))
            .then(() => {
                // Log successful response
                const responseTime = Date.now() - startTime;
                Logger.apiResponse(req, res, responseTime);
            })
            .catch((error) => {
                // Log error and pass to error handler
                const responseTime = Date.now() - startTime;
                Logger.error(`API Error: ${req.method} ${req.originalUrl}`, error, {
                    method: req.method,
                    url: req.originalUrl,
                    responseTime: `${responseTime}ms`,
                    userId: req.user?.id
                });
                next(error);
            });
    };
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    
    // Log the error
    Logger.error('Global Error Handler', err, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
    });
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Invalid resource ID format';
        error = ErrorHandler.badRequest(message, { field: err.path, value: err.value });
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate value for ${field}`;
        error = ErrorHandler.conflict(message, { field, value: err.keyValue[field] });
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
        error = ErrorHandler.validationError('Validation failed', { errors });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = ErrorHandler.unauthorized('Invalid token');
    }
    
    if (err.name === 'TokenExpiredError') {
        error = ErrorHandler.unauthorized('Token expired');
    }
    
    // Send error response
    res.status(error.statusCode || 500).json({
        success: false,
        error: {
            message: error.message || 'Server Error',
            code: error.code || 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && { 
                stack: error.stack,
                details: error.details 
            })
        },
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    });
};

module.exports = {
    Logger,
    ErrorHandler,
    asyncHandler,
    globalErrorHandler
};
