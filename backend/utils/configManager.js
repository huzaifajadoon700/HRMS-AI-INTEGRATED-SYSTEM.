/**
 * HRMS AI Integrated System - Configuration Management Utility
 * Hotel and Restaurant Management System with AI-powered features
 *
 * @description Centralized configuration management with environment validation and defaults
 * @version 1.0.0
 * @author HRMS Development Team
 * @created 2025-07-01
 */

const path = require('path');
const fs = require('fs');

/**
 * Configuration Manager Class
 */
class ConfigManager {
    constructor() {
        this.config = {};
        this.validators = new Map();
        this.loadConfig();
        this.setupValidators();
    }

    /**
     * Load configuration from environment variables and files
     */
    loadConfig() {
        // Load environment variables
        require('dotenv').config();

        // Default configuration
        this.config = {
            // Server Configuration
            server: {
                port: this.getEnvVar('PORT', 5000, 'number'),
                host: this.getEnvVar('HOST', 'localhost'),
                nodeEnv: this.getEnvVar('NODE_ENV', 'development'),
                corsOrigin: this.getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
                trustProxy: this.getEnvVar('TRUST_PROXY', false, 'boolean')
            },

            // Database Configuration
            database: {
                uri: this.getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/hrms'),
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: this.getEnvVar('DB_MAX_POOL_SIZE', 10, 'number'),
                    serverSelectionTimeoutMS: this.getEnvVar('DB_TIMEOUT', 5000, 'number'),
                    socketTimeoutMS: this.getEnvVar('DB_SOCKET_TIMEOUT', 45000, 'number')
                }
            },

            // JWT Configuration
            jwt: {
                secret: this.getEnvVar('JWT_SECRET', this.generateRandomSecret()),
                expiresIn: this.getEnvVar('JWT_EXPIRES_IN', '24h'),
                refreshSecret: this.getEnvVar('JWT_REFRESH_SECRET', this.generateRandomSecret()),
                refreshExpiresIn: this.getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d')
            },

            // Security Configuration
            security: {
                bcryptRounds: this.getEnvVar('BCRYPT_ROUNDS', 12, 'number'),
                rateLimitWindow: this.getEnvVar('RATE_LIMIT_WINDOW', 900000, 'number'), // 15 minutes
                rateLimitMax: this.getEnvVar('RATE_LIMIT_MAX', 100, 'number'),
                encryptionKey: this.getEnvVar('ENCRYPTION_KEY', this.generateRandomSecret()),
                sessionSecret: this.getEnvVar('SESSION_SECRET', this.generateRandomSecret())
            },

            // Email Configuration
            email: {
                service: this.getEnvVar('EMAIL_SERVICE', 'gmail'),
                host: this.getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
                port: this.getEnvVar('EMAIL_PORT', 587, 'number'),
                secure: this.getEnvVar('EMAIL_SECURE', false, 'boolean'),
                user: this.getEnvVar('EMAIL_USER', ''),
                password: this.getEnvVar('EMAIL_PASSWORD', ''),
                from: this.getEnvVar('EMAIL_FROM', 'noreply@hrms.com')
            },

            // Payment Configuration
            payment: {
                stripeSecretKey: this.getEnvVar('STRIPE_SECRET_KEY', ''),
                stripePublishableKey: this.getEnvVar('STRIPE_PUBLISHABLE_KEY', ''),
                stripeWebhookSecret: this.getEnvVar('STRIPE_WEBHOOK_SECRET', ''),
                currency: this.getEnvVar('PAYMENT_CURRENCY', 'USD')
            },

            // File Upload Configuration
            upload: {
                maxFileSize: this.getEnvVar('MAX_FILE_SIZE', 5242880, 'number'), // 5MB
                allowedTypes: this.getEnvVar('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/gif,application/pdf').split(','),
                uploadPath: this.getEnvVar('UPLOAD_PATH', './uploads'),
                baseUrl: this.getEnvVar('UPLOAD_BASE_URL', 'http://localhost:5000/uploads')
            },

            // Logging Configuration
            logging: {
                level: this.getEnvVar('LOG_LEVEL', 'info'),
                file: this.getEnvVar('LOG_FILE', './logs/app.log'),
                maxSize: this.getEnvVar('LOG_MAX_SIZE', '10m'),
                maxFiles: this.getEnvVar('LOG_MAX_FILES', 5, 'number'),
                enableConsole: this.getEnvVar('LOG_CONSOLE', true, 'boolean')
            },

            // Business Configuration
            business: {
                name: this.getEnvVar('BUSINESS_NAME', 'HRMS Hotel & Restaurant'),
                address: this.getEnvVar('BUSINESS_ADDRESS', ''),
                phone: this.getEnvVar('BUSINESS_PHONE', ''),
                email: this.getEnvVar('BUSINESS_EMAIL', ''),
                timezone: this.getEnvVar('BUSINESS_TIMEZONE', 'UTC'),
                currency: this.getEnvVar('BUSINESS_CURRENCY', 'USD'),
                taxRate: this.getEnvVar('BUSINESS_TAX_RATE', 0.1, 'number')
            },

            // Feature Flags
            features: {
                enableRegistration: this.getEnvVar('ENABLE_REGISTRATION', true, 'boolean'),
                enableEmailVerification: this.getEnvVar('ENABLE_EMAIL_VERIFICATION', false, 'boolean'),
                enableTwoFactor: this.getEnvVar('ENABLE_TWO_FACTOR', false, 'boolean'),
                enableAnalytics: this.getEnvVar('ENABLE_ANALYTICS', true, 'boolean'),
                enableNotifications: this.getEnvVar('ENABLE_NOTIFICATIONS', true, 'boolean'),
                enableMLRecommendations: this.getEnvVar('ENABLE_ML_RECOMMENDATIONS', true, 'boolean')
            },

            // API Configuration
            api: {
                version: this.getEnvVar('API_VERSION', 'v1'),
                prefix: this.getEnvVar('API_PREFIX', '/api'),
                timeout: this.getEnvVar('API_TIMEOUT', 30000, 'number'),
                enableDocs: this.getEnvVar('ENABLE_API_DOCS', true, 'boolean')
            }
        };

        // Load custom configuration file if exists
        this.loadCustomConfig();
    }

    /**
     * Get environment variable with type conversion and default value
     * @param {string} key - Environment variable key
     * @param {*} defaultValue - Default value if not found
     * @param {string} type - Type conversion ('string', 'number', 'boolean', 'array')
     * @returns {*} Converted value
     */
    getEnvVar(key, defaultValue, type = 'string') {
        const value = process.env[key];
        
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }

        switch (type) {
            case 'number':
                const num = Number(value);
                return isNaN(num) ? defaultValue : num;
            
            case 'boolean':
                return value.toLowerCase() === 'true' || value === '1';
            
            case 'array':
                return value.split(',').map(item => item.trim());
            
            default:
                return value;
        }
    }

    /**
     * Generate random secret for security purposes
     * @returns {string} Random secret
     */
    generateRandomSecret() {
        const crypto = require('crypto');
        return crypto.randomBytes(64).toString('hex');
    }

    /**
     * Load custom configuration from file
     */
    loadCustomConfig() {
        const configPath = path.join(process.cwd(), 'config', 'custom.json');
        
        if (fs.existsSync(configPath)) {
            try {
                const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                this.mergeConfig(this.config, customConfig);
                console.log('✅ Custom configuration loaded successfully');
            } catch (error) {
                console.warn('⚠️ Failed to load custom configuration:', error.message);
            }
        }
    }

    /**
     * Deep merge configuration objects
     * @param {Object} target - Target configuration object
     * @param {Object} source - Source configuration object
     */
    mergeConfig(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeConfig(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * Setup configuration validators
     */
    setupValidators() {
        // Database URI validator
        this.validators.set('database.uri', (value) => {
            if (!value || typeof value !== 'string') {
                return 'Database URI is required and must be a string';
            }
            if (!value.startsWith('mongodb://') && !value.startsWith('mongodb+srv://')) {
                return 'Database URI must be a valid MongoDB connection string';
            }
            return null;
        });

        // JWT Secret validator
        this.validators.set('jwt.secret', (value) => {
            if (!value || typeof value !== 'string') {
                return 'JWT secret is required and must be a string';
            }
            if (value.length < 32) {
                return 'JWT secret must be at least 32 characters long';
            }
            return null;
        });

        // Port validator
        this.validators.set('server.port', (value) => {
            if (typeof value !== 'number' || value < 1 || value > 65535) {
                return 'Server port must be a number between 1 and 65535';
            }
            return null;
        });

        // Email configuration validator
        this.validators.set('email.user', (value) => {
            if (this.config.features.enableEmailVerification && !value) {
                return 'Email user is required when email verification is enabled';
            }
            return null;
        });
    }

    /**
     * Validate configuration
     * @returns {Object} Validation result
     */
    validateConfig() {
        const errors = [];
        const warnings = [];

        // Run validators
        for (const [path, validator] of this.validators.entries()) {
            const value = this.getConfigValue(path);
            const error = validator(value);
            if (error) {
                errors.push(`${path}: ${error}`);
            }
        }

        // Check for missing required configurations in production
        if (this.config.server.nodeEnv === 'production') {
            const requiredInProduction = [
                'jwt.secret',
                'security.encryptionKey',
                'database.uri'
            ];

            requiredInProduction.forEach(path => {
                const value = this.getConfigValue(path);
                if (!value || (typeof value === 'string' && value.length === 0)) {
                    errors.push(`${path}: Required in production environment`);
                }
            });
        }

        // Generate warnings for default values in production
        if (this.config.server.nodeEnv === 'production') {
            if (this.config.business.name === 'HRMS Hotel & Restaurant') {
                warnings.push('Using default business name in production');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get configuration value by path
     * @param {string} path - Configuration path (e.g., 'database.uri')
     * @returns {*} Configuration value
     */
    getConfigValue(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }

    /**
     * Set configuration value by path
     * @param {string} path - Configuration path
     * @param {*} value - Value to set
     */
    setConfigValue(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        
        target[lastKey] = value;
    }

    /**
     * Get all configuration
     * @returns {Object} Complete configuration object
     */
    getConfig() {
        return this.config;
    }

    /**
     * Get configuration section
     * @param {string} section - Configuration section name
     * @returns {Object} Configuration section
     */
    getSection(section) {
        return this.config[section] || {};
    }

    /**
     * Check if feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} Feature status
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] === true;
    }

    /**
     * Get environment name
     * @returns {string} Environment name
     */
    getEnvironment() {
        return this.config.server.nodeEnv;
    }

    /**
     * Check if running in production
     * @returns {boolean} True if production environment
     */
    isProduction() {
        return this.config.server.nodeEnv === 'production';
    }

    /**
     * Check if running in development
     * @returns {boolean} True if development environment
     */
    isDevelopment() {
        return this.config.server.nodeEnv === 'development';
    }

    /**
     * Export configuration to file
     * @param {string} filePath - File path to export to
     */
    exportConfig(filePath) {
        try {
            const configToExport = { ...this.config };
            
            // Remove sensitive information
            delete configToExport.jwt.secret;
            delete configToExport.jwt.refreshSecret;
            delete configToExport.security.encryptionKey;
            delete configToExport.security.sessionSecret;
            delete configToExport.email.password;
            delete configToExport.payment.stripeSecretKey;
            delete configToExport.payment.stripeWebhookSecret;

            fs.writeFileSync(filePath, JSON.stringify(configToExport, null, 2));
            console.log(`✅ Configuration exported to ${filePath}`);
        } catch (error) {
            console.error('❌ Failed to export configuration:', error.message);
        }
    }

    /**
     * Print configuration summary
     */
    printSummary() {
        console.log('\n📋 HRMS Configuration Summary');
        console.log('================================');
        console.log(`Environment: ${this.config.server.nodeEnv}`);
        console.log(`Server: ${this.config.server.host}:${this.config.server.port}`);
        console.log(`Database: ${this.config.database.uri.replace(/\/\/.*@/, '//***@')}`);
        console.log(`Business: ${this.config.business.name}`);
        console.log(`Features Enabled: ${Object.entries(this.config.features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ')}`);
        
        const validation = this.validateConfig();
        if (validation.errors.length > 0) {
            console.log('\n❌ Configuration Errors:');
            validation.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (validation.warnings.length > 0) {
            console.log('\n⚠️ Configuration Warnings:');
            validation.warnings.forEach(warning => console.log(`  - ${warning}`));
        }
        
        if (validation.isValid) {
            console.log('\n✅ Configuration is valid');
        }
        console.log('================================\n');
    }
}

// Create singleton instance
const configManager = new ConfigManager();

module.exports = {
    ConfigManager,
    configManager,
    config: configManager.getConfig()
};
