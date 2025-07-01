// Vercel serverless function entry point
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import the main app configuration
const app = express();

// CORS Setup for Vercel
const corsOptions = {
  origin: ["https://your-frontend-domain.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Import database connection
require("../Models/db");

// Import routes
const menuRoutes = require("../Routes/menuRoutes");
const fileRoutes = require("../Routes/PicRoutes");
const tableRoutes = require("../Routes/tableRoutes");
const roomRoutes = require("../Routes/roomRoutes");
const staffRoutes = require("../Routes/staffRoutes");
const shiftRoutes = require("../Routes/shiftroutes");
const AuthRouter = require("../Routes/AuthRouter");
const ProductRouter = require("../Routes/ProductRouter");
const GoogleRoutes = require("../Routes/GoogleRoutes");
const bookingRoutes = require("../Routes/bookingRoutes");
const orderRoutes = require("../Routes/orderRoutes");
const reservationRoutes = require("../Routes/ReservationRoutes");
const userRoutes = require("../Routes/UserRoutes");
const feedbackRoutes = require("../Routes/feedbackRoutes");
const adminRoutes = require('../Routes/AdminRoutes');
const paymentRoutes = require('../Routes/paymentRoutes');
const recommendationRoutes = require('../Routes/recommendationRoutes');

// Register Routes
app.use("/api/menus", menuRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shift", shiftRoutes);
app.use("/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/auth", GoogleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/table-reservations", reservationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/food-recommendations", recommendationRoutes);
app.use("/api/table-recommendations", tableRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Serverless function is running'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hotel Management System API - Serverless',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// Export for Vercel
module.exports = app;
