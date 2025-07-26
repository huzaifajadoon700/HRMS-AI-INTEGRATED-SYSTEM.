/**
 * Environment configuration helper
 * Centralizes environment variable management and provides defaults
 * This file contains only configuration helpers, no business logic
 */

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/hrms",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || "",

  // File Upload Configuration
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "5MB",
  UPLOAD_PATH: process.env.UPLOAD_PATH || "./uploads",

  // API Configuration
  API_VERSION: process.env.API_VERSION || "v1",
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15, // minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // requests per window

  // Security Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,

  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // Feature Flags - Toggle application features
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === "true" || false,
  ENABLE_METRICS: process.env.ENABLE_METRICS === "true" || false,
};

/**
 * Validates required environment variables
 * @returns {Array} Array of missing required variables
 */
const validateConfig = () => {
  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  return missing;
};

/**
 * Checks if the application is running in production
 * @returns {boolean} True if in production environment
 */
const isProduction = () => {
  return config.NODE_ENV === "production";
};

/**
 * Checks if the application is running in development
 * @returns {boolean} True if in development environment
 */
const isDevelopment = () => {
  return config.NODE_ENV === "development";
};

/**
 * Checks if the application is running in test environment
 * @returns {boolean} True if in test environment
 */
const isTest = () => {
  return config.NODE_ENV === "test";
};

module.exports = {
  config,
  validateConfig,
  isProduction,
  isDevelopment,
  isTest,
};
