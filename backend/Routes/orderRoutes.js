const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateDeliveryLocation,
  cancelOrder,
  updateOrderStatus,
  getOrderStatus,
} = require("../Controllers/orderControllers");

// ✅ Create Order (Logged-in users only)
router.post("/", ensureAuthenticated, createOrder);

// ✅ Get Orders (Logged-in users can see their own orders, admin can see all)
router.get("/", ensureAuthenticated, getOrders);

// 🔧 Debug route to test if orders route is loading
router.get("/debug", (req, res) => {
  res.json({
    message: "Orders route is working",
    timestamp: new Date().toISOString(),
    route: "/api/orders/debug"
  });
});

// ✅ Get Single Order (Any authenticated user can access any order temporarily to fix issues)
router.get("/:orderId", ensureAuthenticated, getOrderById);

// ✅ Get Order Status for Real-time Tracking (Polling-based)
router.get("/:orderId/tracking", ensureAuthenticated, getOrderStatus);

// ✅ Update Order Status (Admin only)
router.patch(
  "/:orderId/status",
  ensureAuthenticated,
  ensureAdmin,
  updateOrderStatus
);

// ✅ Update Delivery Location (Any authenticated user can update for now)
router.put(
  "/:orderId/delivery-location",
  ensureAuthenticated,
  updateDeliveryLocation
);

// ✅ Cancel Order (Any authenticated user can cancel for now)
router.delete("/:orderId", ensureAuthenticated, cancelOrder);

module.exports = router;
