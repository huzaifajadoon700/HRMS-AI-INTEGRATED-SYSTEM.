const express = require("express");
const {
  addShift,
  getAllShifts,
  updateShiftStatus,
  deleteShift,
} = require("../Controllers/ShiftController");
const { ensureAuthenticated } = require("../Middlewares/Auth");

const router = express.Router();

// Test route to verify shift routes are working (no auth required)
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Shift routes are working",
    timestamp: new Date().toISOString(),
    route: "/api/shift/test"
  });
});

// Apply authentication middleware to all other routes
router.use(ensureAuthenticated);

// Shift routes
router.post("/add", addShift);
router.get("/", getAllShifts);
router.patch("/:id/status", updateShiftStatus);
router.delete("/:id", deleteShift);

module.exports = router;
