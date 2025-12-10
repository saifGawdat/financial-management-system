const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getMonthlySummary,
  getAllMonthlySummaries,
  recalculateMonthlySummary,
} = require("../controllers/monthlySummaryController");

// All routes require authentication
router.use(auth);

// @route   GET /api/monthly-summary
// @desc    Get all monthly summaries
router.get("/", getAllMonthlySummaries);

// @route   GET /api/monthly-summary/:month/:year
// @desc    Get monthly summary for specific month
router.get("/:month/:year", getMonthlySummary);

// @route   POST /api/monthly-summary/recalculate/:month/:year
// @desc    Force recalculation of monthly summary
router.post("/recalculate/:month/:year", recalculateMonthlySummary);

module.exports = router;
