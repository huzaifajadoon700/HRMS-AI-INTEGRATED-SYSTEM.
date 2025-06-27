/**
 * Stripe Configuration for HRMS System
 * Payment gateway setup and environment validation
 *
 * @description Stripe API configuration with security checks
 * @version 1.0.0
 */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Environment validation for security
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set in environment variables!");
  process.exit(1);
}

module.exports = stripe;
