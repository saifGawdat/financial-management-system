const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const auth = require("../middleware/auth");

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get("/stats", auth, dashboardController.getStats);

// @route   GET /api/dashboard/chart-data
// @desc    Get chart data
// @access  Private
router.get("/chart-data", auth, dashboardController.getChartData);

// @route   GET /api/dashboard/recent
// @desc    Get recent transactions
// @access  Private
router.get("/recent", auth, dashboardController.getRecentTransactions);

module.exports = router;
