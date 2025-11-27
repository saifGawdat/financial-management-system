const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const auth = require("../middleware/auth");

// @route   POST /api/expense
// @desc    Add expense
// @access  Private
router.post("/", auth, expenseController.addExpense);

// @route   GET /api/expense
// @desc    Get all expenses
// @access  Private
router.get("/", auth, expenseController.getExpenses);

// @route   DELETE /api/expense/:id
// @desc    Delete expense
// @access  Private
router.delete("/:id", auth, expenseController.deleteExpense);

module.exports = router;
