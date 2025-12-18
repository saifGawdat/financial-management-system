const Expense = require("../models/Expense");
const ExpenseCategory = require("../models/ExpenseCategory");
const { calculateMonthlySummary } = require("./monthlySummaryController");

// Get all expense categories with optional filtering and include matching individual expenses
const getExpenseCategories = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.userId };

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);

    const categories = await ExpenseCategory.find(filter).sort({
      category: 1,
    });

    // If we have a specific month/year, let's also fetch related individual expenses
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(
        parseInt(year),
        parseInt(month),
        0,
        23,
        59,
        59,
        999
      );

      const allExpenses = await Expense.find({
        user: req.userId,
        date: { $gte: startDate, $lte: endDate },
      });

      // Merge data
      const response = categories.map((cat) => {
        const matchingExpenses = allExpenses.filter(
          (e) => e.category === cat.category
        );
        return {
          ...cat.toObject(),
          actualExpenses: matchingExpenses,
          expensesTotal: matchingExpenses.reduce((sum, e) => sum + e.amount, 0),
        };
      });

      // Add categories that have expenses but NO bucket record (optional but helpful)
      const bucketCategoryNames = new Set(categories.map((c) => c.category));
      allExpenses.forEach((exp) => {
        if (!bucketCategoryNames.has(exp.category)) {
          // Find if we already added this "virtual" category to response
          let virtualCat = response.find(
            (r) => r.category === exp.category && r._id === undefined
          );
          if (!virtualCat) {
            virtualCat = {
              category: exp.category,
              amount: 0, // No bucket amount
              month: parseInt(month),
              year: parseInt(year),
              actualExpenses: [],
              expensesTotal: 0,
              isVirtual: true,
            };
            response.push(virtualCat);
          }
          virtualCat.actualExpenses.push(exp);
          virtualCat.expensesTotal += exp.amount;
        }
      });

      return res.json(response);
    }

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
      if (breakdown.hasOwnProperty(cat.category)) {
        breakdown[cat.category] += cat.amount;
      }
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

    // Trigger summary recalculation
    await calculateMonthlySummary(req.userId, month, year);

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

    const oldMonth = expenseCategory.month;
    const oldYear = expenseCategory.year;

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

    // Trigger summary recalculation for both old and new month if they changed
    await calculateMonthlySummary(
      req.userId,
      updatedCategory.month,
      updatedCategory.year
    );
    if (
      oldMonth !== updatedCategory.month ||
      oldYear !== updatedCategory.year
    ) {
      await calculateMonthlySummary(req.userId, oldMonth, oldYear);
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating expense category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete expense category
const deleteExpenseCategory = async (req, res) => {
  try {
    const expenseCategory = await ExpenseCategory.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!expenseCategory) {
      return res.status(404).json({ message: "Expense category not found" });
    }

    const { month, year } = expenseCategory;
    const userId = req.userId;

    await ExpenseCategory.findByIdAndDelete(req.params.id);

    // Trigger summary recalculation
    await calculateMonthlySummary(userId, month, year);

    res.json({ message: "Expense category deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all unique category names for a user
const getUniqueCategories = async (req, res) => {
  try {
    const categories = await ExpenseCategory.distinct("category", {
      user: req.userId,
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching unique categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getExpenseCategories,
  getMonthlyExpenseBreakdown,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getUniqueCategories,
};
