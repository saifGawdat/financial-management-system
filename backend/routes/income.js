const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");
const auth = require("../middleware/auth");

// @route   POST /api/income
// @desc    Add income
// @access  Private
router.post("/", auth, incomeController.addIncome);

// @route   GET /api/income
// @desc    Get all incomes
// @access  Private
router.get("/", auth, incomeController.getIncomes);

// @route   DELETE /api/income/:id
// @desc    Delete income
// @access  Private
router.delete("/:id", auth, incomeController.deleteIncome);

module.exports = router;
