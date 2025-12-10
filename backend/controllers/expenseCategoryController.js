const ExpenseCategory = require("../models/ExpenseCategory");

// Get all expense categories with optional filtering
const getExpenseCategories = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.userId };

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const categories = await ExpenseCategory.find(filter).sort({
      year: -1,
      month: -1,
      category: 1,
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get monthly expense breakdown
const getMonthlyExpenseBreakdown = async (req, res) => {
  try {
    const { month, year } = req.params;

    const categories = await ExpenseCategory.find({
      user: req.userId,
      month: parseInt(month),
      year: parseInt(year),
    });

    // Calculate breakdown
    const breakdown = {
      Transportation: 0,
      Repair: 0,
      Equipment: 0,
      total: 0,
    };

    categories.forEach((cat) => {
      breakdown[cat.category] += cat.amount;
      breakdown.total += cat.amount;
    });

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      breakdown,
      details: categories,
    });
  } catch (error) {
    console.error("Error fetching monthly breakdown:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new expense category
const createExpenseCategory = async (req, res) => {
  try {
    const { category, amount, month, year, description } = req.body;

    // Validation
    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        message: "Please provide category, amount, month, and year",
      });
    }

    if (amount < 0) {
      return res.status(400).json({ message: "Amount cannot be negative" });
    }

    const expenseCategory = new ExpenseCategory({
      user: req.userId,
      category,
      amount,
      month,
      year,
      description,
    });

    const savedCategory = await expenseCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error("Error creating expense category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update expense category
const updateExpenseCategory = async (req, res) => {
  try {
    const { category, amount, month, year, description } = req.body;

    const expenseCategory = await ExpenseCategory.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expenseCategory) {
      return res.status(404).json({ message: "Expense category not found" });
    }

    // Update fields if provided
    if (category !== undefined) expenseCategory.category = category;
    if (amount !== undefined) {
      if (amount < 0) {
        return res.status(400).json({ message: "Amount cannot be negative" });
      }
      expenseCategory.amount = amount;
    }
    if (month !== undefined) expenseCategory.month = month;
    if (year !== undefined) expenseCategory.year = year;
    if (description !== undefined) expenseCategory.description = description;

    const updatedCategory = await expenseCategory.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating expense category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete expense category
const deleteExpenseCategory = async (req, res) => {
  try {
    const expenseCategory = await ExpenseCategory.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expenseCategory) {
      return res.status(404).json({ message: "Expense category not found" });
    }

    res.json({ message: "Expense category deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getExpenseCategories,
  getMonthlyExpenseBreakdown,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
