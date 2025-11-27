const Income = require("../models/Income");
const Expense = require("../models/Expense");

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    // Get all incomes and expenses for the user
    const incomes = await Income.find({ user: req.userId });
    const expenses = await Expense.find({ user: req.userId });

    // Calculate totals
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get chart data
exports.getChartData = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.userId }).sort({ date: 1 });
    const expenses = await Expense.find({ user: req.userId }).sort({ date: 1 });

    // Monthly data for bar chart
    const monthlyData = {};

    incomes.forEach((income) => {
      const month = new Date(income.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      monthlyData[month].income += income.amount;
    });

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      monthlyData[month].expense += expense.amount;
    });

    const barChartData = Object.values(monthlyData);

    // Category data for pie chart
    const categoryData = {};
    expenses.forEach((expense) => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0;
      }
      categoryData[expense.category] += expense.amount;
    });

    const pieChartData = Object.keys(categoryData).map((category) => ({
      name: category,
      value: categoryData[category],
    }));

    // Timeline data for line chart
    const timelineData = [...incomes, ...expenses]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .reduce((acc, item) => {
        const date = new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const existingEntry = acc.find((entry) => entry.date === date);

        if (existingEntry) {
          if (item.constructor.modelName === "Income") {
            existingEntry.income += item.amount;
          } else {
            existingEntry.expense += item.amount;
          }
        } else {
          acc.push({
            date,
            income: item.constructor.modelName === "Income" ? item.amount : 0,
            expense: item.constructor.modelName === "Expense" ? item.amount : 0,
          });
        }
        return acc;
      }, []);

    res.json({
      barChartData,
      pieChartData,
      lineChartData: timelineData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);
    const expenses = await Expense.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const transactions = [
      ...incomes.map((income) => ({ ...income.toObject(), type: "income" })),
      ...expenses.map((expense) => ({
        ...expense.toObject(),
        type: "expense",
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
