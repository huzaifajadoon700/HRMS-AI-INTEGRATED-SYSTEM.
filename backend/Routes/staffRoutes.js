const express = require("express");
const {
  addStaff,
  getAllStaff,
  updateStaff,
  deleteStaff,
} = require("../Controllers/StaffController");
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

router.post("/add", ensureAdmin, addStaff);
router.get("/", getAllStaff);
router.put("/:id", ensureAdmin, updateStaff);
router.delete("/:id", ensureAdmin, deleteStaff);

module.exports = router;
