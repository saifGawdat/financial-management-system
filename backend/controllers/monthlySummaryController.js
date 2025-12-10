const MonthlySummary = require("../models/MonthlySummary");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const ExpenseCategory = require("../models/ExpenseCategory");
const Employee = require("../models/Employee");

// Calculate and get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    const userId = req.user.id;

    // Try to find existing summary
    let summary = await MonthlySummary.findOne({
      user: userId,
      month: parseInt(month),
      year: parseInt(year),
    });

    // If not found or needs recalculation, calculate it
    if (!summary) {
      summary = await calculateMonthlySummary(
        userId,
        parseInt(month),
        parseInt(year)
      );
    }

    res.json(summary);
  } catch (error) {
    console.error("Error fetching monthly summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all monthly summaries
const getAllMonthlySummaries = async (req, res) => {
  try {
    const summaries = await MonthlySummary.find({ user: req.user.id }).sort({
      year: -1,
      month: -1,
    });

    res.json(summaries);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Force recalculation of monthly summary
const recalculateMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    const userId = req.user.id;

    const summary = await calculateMonthlySummary(
      userId,
      parseInt(month),
      parseInt(year),
      true
    );

    res.json(summary);
  } catch (error) {
    console.error("Error recalculating summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to calculate monthly summary
async function calculateMonthlySummary(
  userId,
  month,
  year,
  forceUpdate = false
) {
  try {
    // Get all income for the month
    const incomes = await Income.find({ user: userId, month, year });

    // Calculate income breakdown
    let monthlyCollections = 0;
    let advertisingExpenses = 0;

    incomes.forEach((income) => {
      if (income.type === "Monthly Collections") {
        monthlyCollections += income.amount;
      } else if (income.type === "Advertising Expenses") {
        advertisingExpenses += income.amount;
      }
    });

    const totalIncome = monthlyCollections;

    // Get all regular expenses for the month
    const expenses = await Expense.find({ user: userId, month, year });
    const regularExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Get expense categories for the month
    const expenseCategories = await ExpenseCategory.find({
      user: userId,
      month,
      year,
    });

    const expenseBreakdown = {
      Transportation: 0,
      Repair: 0,
      Equipment: 0,
      regularExpenses: regularExpenses,
    };

    expenseCategories.forEach((cat) => {
      expenseBreakdown[cat.category] += cat.amount;
    });

    const categoryExpensesTotal =
      expenseBreakdown.Transportation +
      expenseBreakdown.Repair +
      expenseBreakdown.Equipment;

    const totalExpenses =
      regularExpenses + categoryExpensesTotal + advertisingExpenses;

    // Get active employees and calculate total salaries
    const employees = await Employee.find({ user: userId, isActive: true });
    const totalSalaries = employees.reduce(
      (sum, employee) => sum + employee.salary,
      0
    );

    // Calculate profit
    const profit = totalIncome - totalExpenses - totalSalaries;

    // Update or create summary
    const summary = await MonthlySummary.findOneAndUpdate(
      { user: userId, month, year },
      {
        totalIncome,
        totalExpenses,
        totalSalaries,
        profit,
        expenseBreakdown,
        incomeBreakdown: {
          monthlyCollections,
          advertisingExpenses,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return summary;
  } catch (error) {
    console.error("Error calculating monthly summary:", error);
    throw error;
  }
}

module.exports = {
  getMonthlySummary,
  getAllMonthlySummaries,
  recalculateMonthlySummary,
  calculateMonthlySummary,
};
