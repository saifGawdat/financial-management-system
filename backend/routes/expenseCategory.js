const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getExpenseCategories,
  getMonthlyExpenseBreakdown,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} = require("../controllers/expenseCategoryController");

// All routes require authentication
router.use(auth);

// @route   GET /api/expense-category
// @desc    Get all expense categories with optional filtering
router.get("/", getExpenseCategories);

// @route   GET /api/expense-category/monthly/:month/:year
// @desc    Get monthly expense breakdown
router.get("/monthly/:month/:year", getMonthlyExpenseBreakdown);

// @route   POST /api/expense-category
// @desc    Create new expense category
router.post("/", createExpenseCategory);

// @route   PUT /api/expense-category/:id
// @desc    Update expense category
router.put("/:id", updateExpenseCategory);

// @route   DELETE /api/expense-category/:id
// @desc    Delete expense category
router.delete("/:id", deleteExpenseCategory);

module.exports = router;
