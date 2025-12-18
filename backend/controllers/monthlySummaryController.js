const MonthlySummary = require("../models/MonthlySummary");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const ExpenseCategory = require("../models/ExpenseCategory");
const Employee = require("../models/Employee");
const EmployeeTransaction = require("../models/EmployeeTransaction");

// Calculate and get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    const userId = req.userId;

    // Try to find existing summary
    let summary = await MonthlySummary.findOne({
      user: userId,
      month: parseInt(month),
      year: parseInt(year),
    });

    // If not found, calculate it
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
    const summaries = await MonthlySummary.find({ user: req.userId }).sort({
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
    const userId = req.userId;

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
    // Define date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Calculate Total Income
    const incomes = await Income.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    // 2. Calculate Total Expenses
    // Regular Expenses (from Expense model)
    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });
    const regularExpensesTotal = expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    // Categorized Monthly Expenses (from ExpenseCategory model)
    const expenseCategories = await ExpenseCategory.find({
      user: userId,
      month,
      year,
    });
    const categoryExpensesTotal = expenseCategories.reduce(
      (sum, cat) => sum + cat.amount,
      0
    );

    const totalExpenses = regularExpensesTotal + categoryExpensesTotal;

    // 3. Calculate Total Salaries (Base + Bonuses - Deductions)
    const activeEmployees = await Employee.find({
      user: userId,
      isActive: true,
    });
    const totalBaseSalary = activeEmployees.reduce(
      (sum, emp) => sum + emp.salary,
      0
    );

    const transactions = await EmployeeTransaction.find({
      user: userId,
      month,
      year,
    });
    const totalBonuses = transactions
      .filter((t) => t.type === "BONUS")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDeductions = transactions
      .filter((t) => t.type === "DEDUCTION")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSalaries = totalBaseSalary + totalBonuses - totalDeductions;

    // 4. Calculate Profit
    const profit = totalIncome - totalExpenses - totalSalaries;

    // Build breakdown for storage (optional, for UI backward compatibility)
    const expenseBreakdown = {
      Transportation: 0,
      Repair: 0,
      Equipment: 0,
      regularExpenses: regularExpensesTotal,
    };
    expenseCategories.forEach((cat) => {
      if (expenseBreakdown.hasOwnProperty(cat.category)) {
        expenseBreakdown[cat.category] += cat.amount;
      }
    });

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
          monthlyCollections: totalIncome, // Defaulting for simple display
          advertisingExpenses: 0,
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
