/**
 * Authentication Routes for HRMS System
 * Defines API endpoints for user authentication and authorization
 *
 * @description Express router with validation middleware and auth controllers
 * @version 1.0.0
 */

const express = require("express");
const {
  signup,
  login,
  promoteToAdmin,
} = require("../Controllers/AuthController");
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");
const {
  signupValidation,
  loginValidation,
} = require("../Middlewares/AuthValidation");

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.put(
  "/promote/:userId",
  ensureAuthenticated,
  ensureAdmin,
  promoteToAdmin
);

module.exports = router;
