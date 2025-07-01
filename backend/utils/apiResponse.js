/**
 * HRMS AI Integrated System - Standardized API Response Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Standardized API response formats for consistent client-server communication
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01 - Standardized API response system
 */

const { Logger } = require('./errorHandler');

/**
 * Standardized API Response Class
 */
class ApiResponse {
    /**
     * Send successful response
     * @param {Object} res - Express response object
     * @param {*} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     * @param {Object} meta - Additional metadata
     */
    static success(res, data = null, message = 'Operation successful', statusCode = 200, meta = {}) {
        const response = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString(),
            ...meta
        };

        Logger.debug('API Success Response', {
            statusCode,
            message,
            dataType: data ? typeof data : 'null',
            hasData: !!data
        });

        return res.status(statusCode).json(response);
    }

    /**
     * Send error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {string} code - Error code
     * @param {Object} details - Error details
     */
    static error(res, message = 'Operation failed', statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
        const response = {
            success: false,
            error: {
                message,
                code,
                ...(Object.keys(details).length > 0 && { details })
            },
            timestamp: new Date().toISOString()
        };

        Logger.debug('API Error Response', {
            statusCode,
            message,
            code,
            hasDetails: Object.keys(details).length > 0
        });

        return res.status(statusCode).json(response);
    }

    /**
     * Send paginated response
     * @param {Object} res - Express response object
     * @param {Array} data - Array of items
     * @param {Object} pagination - Pagination metadata
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     */
    static paginated(res, data = [], pagination = {}, message = 'Data retrieved successfully', statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            pagination: {
                currentPage: pagination.currentPage || 1,
                totalPages: pagination.totalPages || 1,
                totalItems: pagination.totalItems || data.length,
                itemsPerPage: pagination.itemsPerPage || data.length,
                hasNextPage: pagination.hasNextPage || false,
                hasPrevPage: pagination.hasPrevPage || false
            },
            timestamp: new Date().toISOString()
        };

        Logger.debug('API Paginated Response', {
            statusCode,
            message,
            itemCount: data.length,
            pagination: response.pagination
        });

        return res.status(statusCode).json(response);
    }

    /**
     * Send created resource response
     * @param {Object} res - Express response object
     * @param {*} data - Created resource data
     * @param {string} message - Success message
     * @param {string} resourceId - ID of created resource
     */
    static created(res, data = null, message = 'Resource created successfully', resourceId = null) {
        const response = {
            success: true,
            message,
            data,
            ...(resourceId && { resourceId }),
            timestamp: new Date().toISOString()
        };

        Logger.info('Resource Created', {
            message,
            resourceId,
            hasData: !!data
        });

        return res.status(201).json(response);
    }

    /**
     * Send updated resource response
     * @param {Object} res - Express response object
     * @param {*} data - Updated resource data
     * @param {string} message - Success message
     * @param {string} resourceId - ID of updated resource
     */
    static updated(res, data = null, message = 'Resource updated successfully', resourceId = null) {
        const response = {
            success: true,
            message,
            data,
            ...(resourceId && { resourceId }),
            timestamp: new Date().toISOString()
        };

        Logger.info('Resource Updated', {
            message,
            resourceId,
            hasData: !!data
        });

        return res.status(200).json(response);
    }

    /**
     * Send deleted resource response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     * @param {string} resourceId - ID of deleted resource
     */
    static deleted(res, message = 'Resource deleted successfully', resourceId = null) {
        const response = {
            success: true,
            message,
            ...(resourceId && { resourceId }),
            timestamp: new Date().toISOString()
        };

        Logger.info('Resource Deleted', {
            message,
            resourceId
        });

        return res.status(200).json(response);
    }

    /**
     * Send no content response
     * @param {Object} res - Express response object
     */
    static noContent(res) {
        Logger.debug('API No Content Response');
        return res.status(204).send();
    }

    /**
     * Send validation error response
     * @param {Object} res - Express response object
     * @param {Array|Object} errors - Validation errors
     * @param {string} message - Error message
     */
    static validationError(res, errors = [], message = 'Validation failed') {
        const response = {
            success: false,
            error: {
                message,
                code: 'VALIDATION_ERROR',
                details: {
                    errors: Array.isArray(errors) ? errors : [errors]
                }
            },
            timestamp: new Date().toISOString()
        };

        Logger.warn('Validation Error', {
            message,
            errorCount: Array.isArray(errors) ? errors.length : 1
        });

        return res.status(422).json(response);
    }

    /**
     * Send unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static unauthorized(res, message = 'Authentication required') {
        const response = {
            success: false,
            error: {
                message,
                code: 'UNAUTHORIZED'
            },
            timestamp: new Date().toISOString()
        };

        Logger.warn('Unauthorized Access Attempt', { message });
        return res.status(401).json(response);
    }

    /**
     * Send forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static forbidden(res, message = 'Access forbidden') {
        const response = {
            success: false,
            error: {
                message,
                code: 'FORBIDDEN'
            },
            timestamp: new Date().toISOString()
        };

        Logger.warn('Forbidden Access Attempt', { message });
        return res.status(403).json(response);
    }

    /**
     * Send not found response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {string} resource - Resource type that was not found
     */
    static notFound(res, message = 'Resource not found', resource = null) {
        const response = {
            success: false,
            error: {
                message,
                code: 'NOT_FOUND',
                ...(resource && { resource })
            },
            timestamp: new Date().toISOString()
        };

        Logger.info('Resource Not Found', { message, resource });
        return res.status(404).json(response);
    }

    /**
     * Send conflict response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {Object} details - Conflict details
     */
    static conflict(res, message = 'Resource conflict', details = {}) {
        const response = {
            success: false,
            error: {
                message,
                code: 'CONFLICT',
                ...(Object.keys(details).length > 0 && { details })
            },
            timestamp: new Date().toISOString()
        };

        Logger.warn('Resource Conflict', { message, details });
        return res.status(409).json(response);
    }

    /**
     * Send too many requests response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} retryAfter - Seconds to wait before retry
     */
    static tooManyRequests(res, message = 'Too many requests', retryAfter = 60) {
        const response = {
            success: false,
            error: {
                message,
                code: 'TOO_MANY_REQUESTS',
                retryAfter
            },
            timestamp: new Date().toISOString()
        };

        res.set('Retry-After', retryAfter);
        Logger.warn('Rate Limit Exceeded', { message, retryAfter });
        return res.status(429).json(response);
    }
}

module.exports = ApiResponse;
