// Graceful Stripe initialization for serverless
let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
    try {
        stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log('✅ Stripe initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Stripe:', error.message);
    }
} else {
    console.warn('⚠️ STRIPE_SECRET_KEY not set - Stripe features will be disabled');
}

module.exports = stripe;