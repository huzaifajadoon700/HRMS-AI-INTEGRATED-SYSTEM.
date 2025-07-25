// Feedback Routes - Handles customer feedback submission and analytics endpoints
const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getFeedbackAnalytics,
  getUserFeedback,
} = require("../Controllers/feedbackController");
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");

// User routes
router.post("/", ensureAuthenticated, submitFeedback);
router.get("/my-feedback", ensureAuthenticated, getUserFeedback);

// Admin routes
router.get(
  "/analytics",
  ensureAuthenticated,
  ensureAdmin,
  getFeedbackAnalytics
);

module.exports = router;
