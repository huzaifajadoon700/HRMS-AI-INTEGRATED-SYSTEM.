/**
 * HRMS AI Integrated System - Performance Monitoring Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Performance monitoring and metrics collection for API endpoints and system resources
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const os = require('os');
const process = require('process');

/**
 * Performance metrics collector
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            requests: new Map(),
            systemMetrics: [],
            alerts: [],
            startTime: Date.now()
        };
        
        this.thresholds = {
            responseTime: 5000, // 5 seconds
            memoryUsage: 0.9, // 90% of available memory
            cpuUsage: 0.8, // 80% CPU usage
            errorRate: 0.1 // 10% error rate
        };

        // Start system monitoring
        this.startSystemMonitoring();
    }

    /**
     * Record API request metrics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {number} responseTime - Response time in milliseconds
     */
    recordRequest(req, res, responseTime) {
        const endpoint = `${req.method} ${req.route?.path || req.path}`;
        const timestamp = new Date().toISOString();
        
        if (!this.metrics.requests.has(endpoint)) {
            this.metrics.requests.set(endpoint, {
                count: 0,
                totalTime: 0,
                errors: 0,
                responseTimes: [],
                lastAccessed: timestamp
            });
        }

        const endpointMetrics = this.metrics.requests.get(endpoint);
        endpointMetrics.count++;
        endpointMetrics.totalTime += responseTime;
        endpointMetrics.lastAccessed = timestamp;
        
        // Keep only last 100 response times for percentile calculations
        endpointMetrics.responseTimes.push(responseTime);
        if (endpointMetrics.responseTimes.length > 100) {
            endpointMetrics.responseTimes.shift();
        }

        // Record errors
        if (res.statusCode >= 400) {
            endpointMetrics.errors++;
        }

        // Check for performance alerts
        this.checkPerformanceAlerts(endpoint, responseTime, res.statusCode);
    }

    /**
     * Get performance statistics for an endpoint
     * @param {string} endpoint - API endpoint
     * @returns {Object} Performance statistics
     */
    getEndpointStats(endpoint) {
        const metrics = this.metrics.requests.get(endpoint);
        if (!metrics) {
            return null;
        }

        const responseTimes = metrics.responseTimes.sort((a, b) => a - b);
        const avgResponseTime = metrics.totalTime / metrics.count;
        const errorRate = metrics.errors / metrics.count;

        return {
            endpoint,
            totalRequests: metrics.count,
            totalErrors: metrics.errors,
            errorRate: (errorRate * 100).toFixed(2) + '%',
            averageResponseTime: Math.round(avgResponseTime),
            medianResponseTime: this.calculatePercentile(responseTimes, 50),
            p95ResponseTime: this.calculatePercentile(responseTimes, 95),
            p99ResponseTime: this.calculatePercentile(responseTimes, 99),
            lastAccessed: metrics.lastAccessed
        };
    }

    /**
     * Get all endpoint statistics
     * @returns {Array} Array of endpoint statistics
     */
    getAllEndpointStats() {
        const stats = [];
        for (const endpoint of this.metrics.requests.keys()) {
            stats.push(this.getEndpointStats(endpoint));
        }
        return stats.sort((a, b) => b.totalRequests - a.totalRequests);
    }

    /**
     * Calculate percentile from sorted array
     * @param {Array} sortedArray - Sorted array of numbers
     * @param {number} percentile - Percentile to calculate (0-100)
     * @returns {number} Percentile value
     */
    calculatePercentile(sortedArray, percentile) {
        if (sortedArray.length === 0) return 0;
        
        const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
        return sortedArray[Math.max(0, index)];
    }

    /**
     * Get system resource metrics
     * @returns {Object} System metrics
     */
    getSystemMetrics() {
        const memUsage = process.memoryUsage();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        
        return {
            timestamp: new Date().toISOString(),
            uptime: {
                process: Math.round(process.uptime()),
                system: Math.round(os.uptime())
            },
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                external: Math.round(memUsage.external / 1024 / 1024), // MB
                systemUsed: Math.round(usedMemory / 1024 / 1024), // MB
                systemTotal: Math.round(totalMemory / 1024 / 1024), // MB
                systemUsagePercent: ((usedMemory / totalMemory) * 100).toFixed(2)
            },
            cpu: {
                loadAverage: os.loadavg(),
                cores: os.cpus().length
            },
            eventLoop: {
                delay: this.measureEventLoopDelay()
            }
        };
    }

    /**
     * Measure event loop delay
     * @returns {number} Event loop delay in milliseconds
     */
    measureEventLoopDelay() {
        const start = process.hrtime.bigint();
        setImmediate(() => {
            const delay = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
            return delay;
        });
        return 0; // Placeholder - actual implementation would use async measurement
    }

    /**
     * Start system monitoring interval
     */
    startSystemMonitoring() {
        setInterval(() => {
            const metrics = this.getSystemMetrics();
            this.metrics.systemMetrics.push(metrics);
            
            // Keep only last 100 system metrics
            if (this.metrics.systemMetrics.length > 100) {
                this.metrics.systemMetrics.shift();
            }

            // Check system alerts
            this.checkSystemAlerts(metrics);
        }, 30000); // Every 30 seconds
    }

    /**
     * Check for performance alerts
     * @param {string} endpoint - API endpoint
     * @param {number} responseTime - Response time in milliseconds
     * @param {number} statusCode - HTTP status code
     */
    checkPerformanceAlerts(endpoint, responseTime, statusCode) {
        const alerts = [];

        // Slow response time alert
        if (responseTime > this.thresholds.responseTime) {
            alerts.push({
                type: 'SLOW_RESPONSE',
                severity: 'WARNING',
                message: `Slow response time detected: ${endpoint} took ${responseTime}ms`,
                timestamp: new Date().toISOString(),
                metadata: { endpoint, responseTime, statusCode }
            });
        }

        // Error rate alert
        const endpointMetrics = this.metrics.requests.get(endpoint);
        if (endpointMetrics) {
            const errorRate = endpointMetrics.errors / endpointMetrics.count;
            if (errorRate > this.thresholds.errorRate && endpointMetrics.count > 10) {
                alerts.push({
                    type: 'HIGH_ERROR_RATE',
                    severity: 'ERROR',
                    message: `High error rate detected: ${endpoint} has ${(errorRate * 100).toFixed(2)}% error rate`,
                    timestamp: new Date().toISOString(),
                    metadata: { endpoint, errorRate, totalRequests: endpointMetrics.count }
                });
            }
        }

        // Store alerts
        this.metrics.alerts.push(...alerts);
        
        // Keep only last 1000 alerts
        if (this.metrics.alerts.length > 1000) {
            this.metrics.alerts = this.metrics.alerts.slice(-1000);
        }

        // Log critical alerts
        alerts.forEach(alert => {
            if (alert.severity === 'ERROR') {
                console.error(`🚨 Performance Alert: ${alert.message}`);
            } else {
                console.warn(`⚠️ Performance Warning: ${alert.message}`);
            }
        });
    }

    /**
     * Check for system resource alerts
     * @param {Object} metrics - System metrics
     */
    checkSystemAlerts(metrics) {
        const alerts = [];

        // Memory usage alert
        const memoryUsagePercent = parseFloat(metrics.memory.systemUsagePercent) / 100;
        if (memoryUsagePercent > this.thresholds.memoryUsage) {
            alerts.push({
                type: 'HIGH_MEMORY_USAGE',
                severity: 'WARNING',
                message: `High memory usage: ${metrics.memory.systemUsagePercent}%`,
                timestamp: new Date().toISOString(),
                metadata: { memoryUsage: metrics.memory }
            });
        }

        // CPU load alert
        const avgLoad = metrics.cpu.loadAverage[0];
        const cpuUsagePercent = avgLoad / metrics.cpu.cores;
        if (cpuUsagePercent > this.thresholds.cpuUsage) {
            alerts.push({
                type: 'HIGH_CPU_USAGE',
                severity: 'WARNING',
                message: `High CPU usage: ${(cpuUsagePercent * 100).toFixed(2)}%`,
                timestamp: new Date().toISOString(),
                metadata: { cpuLoad: metrics.cpu }
            });
        }

        // Store and log alerts
        this.metrics.alerts.push(...alerts);
        alerts.forEach(alert => {
            console.warn(`⚠️ System Alert: ${alert.message}`);
        });
    }

    /**
     * Get recent alerts
     * @param {number} limit - Number of alerts to return
     * @returns {Array} Recent alerts
     */
    getRecentAlerts(limit = 50) {
        return this.metrics.alerts
            .slice(-limit)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getPerformanceSummary() {
        const totalRequests = Array.from(this.metrics.requests.values())
            .reduce((sum, metrics) => sum + metrics.count, 0);
        
        const totalErrors = Array.from(this.metrics.requests.values())
            .reduce((sum, metrics) => sum + metrics.errors, 0);

        const avgResponseTime = Array.from(this.metrics.requests.values())
            .reduce((sum, metrics) => sum + (metrics.totalTime / metrics.count), 0) / this.metrics.requests.size;

        const uptime = Date.now() - this.metrics.startTime;
        const systemMetrics = this.getSystemMetrics();

        return {
            uptime: {
                milliseconds: uptime,
                formatted: this.formatUptime(uptime)
            },
            requests: {
                total: totalRequests,
                errors: totalErrors,
                errorRate: totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + '%' : '0%',
                averageResponseTime: Math.round(avgResponseTime || 0)
            },
            endpoints: {
                total: this.metrics.requests.size,
                mostActive: this.getMostActiveEndpoint()
            },
            system: systemMetrics,
            alerts: {
                total: this.metrics.alerts.length,
                recent: this.getRecentAlerts(10)
            }
        };
    }

    /**
     * Get most active endpoint
     * @returns {Object} Most active endpoint info
     */
    getMostActiveEndpoint() {
        let mostActive = null;
        let maxRequests = 0;

        for (const [endpoint, metrics] of this.metrics.requests.entries()) {
            if (metrics.count > maxRequests) {
                maxRequests = metrics.count;
                mostActive = { endpoint, requests: metrics.count };
            }
        }

        return mostActive;
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
     * Reset all metrics
     */
    reset() {
        this.metrics.requests.clear();
        this.metrics.systemMetrics = [];
        this.metrics.alerts = [];
        this.metrics.startTime = Date.now();
    }

    /**
     * Export metrics to JSON
     * @returns {Object} Exported metrics
     */
    exportMetrics() {
        return {
            summary: this.getPerformanceSummary(),
            endpoints: this.getAllEndpointStats(),
            systemMetrics: this.metrics.systemMetrics.slice(-10), // Last 10 system metrics
            alerts: this.getRecentAlerts(100)
        };
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Express middleware for performance monitoring
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const performanceMiddleware = (req, res, next) => {
    const startTime = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        performanceMonitor.recordRequest(req, res, responseTime);
        originalEnd.apply(this, args);
    };

    next();
};

module.exports = {
    PerformanceMonitor,
    performanceMonitor,
    performanceMiddleware
};
