const Income = require("../models/Income");
const Expense = require("../models/Expense");
const Employee = require("../models/Employee");
const ExpenseCategory = require("../models/ExpenseCategory");
const EmployeeTransaction = require("../models/EmployeeTransaction");

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.userId };

    if (month && year) {
      const startDate = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0)
      );
      const endDate = new Date(
        Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      );
      query.date = { $gte: startDate, $lte: endDate };
    }

    const incomes = await Income.find(query);
    const expenses = await Expense.find(query);

    // Get expense categories and salaries for comprehensive total
    let totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (month && year) {
      const categories = await ExpenseCategory.find({
        user: req.userId,
        month: parseInt(month),
        year: parseInt(year),
      });
      totalExpense += categories.reduce((sum, cat) => sum + cat.amount, 0);

      const employees = await Employee.find({
        user: req.userId,
        isActive: true,
      });
      const transactions = await EmployeeTransaction.find({
        user: req.userId,
        month: parseInt(month),
        year: parseInt(year),
      });

      const totalSalaries =
        employees.reduce((sum, emp) => sum + emp.salary, 0) +
        transactions
          .filter((t) => t.type === "BONUS")
          .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter((t) => t.type === "DEDUCTION")
          .reduce((sum, t) => sum + t.amount, 0);

      totalExpense += totalSalaries;
    }

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
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
    const { month, year } = req.query;
    let incomes, expenses;

    if (month && year) {
      // Data for specific month
      const startDate = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0)
      );
      const endDate = new Date(
        Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      );

      incomes = await Income.find({
        user: req.userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      expenses = await Expense.find({
        user: req.userId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });

      // Daily data for line chart of the selected month
      const dailyTimelineData = [];
      const daysInMonth = new Date(
        parseInt(year),
        parseInt(month),
        0
      ).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(parseInt(year), parseInt(month) - 1, day);
        const dateStr = currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        const dayIncomes = incomes.filter(
          (inc) => new Date(inc.date).getDate() === day
        );
        const dayExpenses = expenses.filter(
          (exp) => new Date(exp.date).getDate() === day
        );

        dailyTimelineData.push({
          date: dateStr,
          income: dayIncomes.reduce((sum, inc) => sum + inc.amount, 0),
          expense: dayExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        });
      }

      // Bar chart for last 6 months ending in selected month
      const startOf6Months = new Date(parseInt(year), parseInt(month) - 6, 1);
      const sixMonthIncomes = await Income.find({
        user: req.userId,
        date: { $gte: startOf6Months, $lte: endDate },
      });
      const sixMonthExpenses = await Expense.find({
        user: req.userId,
        date: { $gte: startOf6Months, $lte: endDate },
      });

      const monthlyData = {};
      for (let i = 0; i < 6; i++) {
        const d = new Date(parseInt(year), parseInt(month) - 1 - i, 1);
        const mStr = d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        monthlyData[mStr] = {
          month: mStr,
          income: 0,
          expense: 0,
          sortKey: d.getTime(),
        };
      }

      sixMonthIncomes.forEach((inc) => {
        const mStr = new Date(inc.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (monthlyData[mStr]) monthlyData[mStr].income += inc.amount;
      });
      sixMonthExpenses.forEach((exp) => {
        const mStr = new Date(exp.date).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (monthlyData[mStr]) monthlyData[mStr].expense += exp.amount;
      });

      const barChartData = Object.values(monthlyData).sort(
        (a, b) => a.sortKey - b.sortKey
      );

      const expenseCategories = await ExpenseCategory.find({
        user: req.userId,
        month: parseInt(month),
        year: parseInt(year),
      });

      const employees = await Employee.find({
        user: req.userId,
        isActive: true,
      });
      const transactions = await EmployeeTransaction.find({
        user: req.userId,
        month: parseInt(month),
        year: parseInt(year),
      });

      // PIE CHART - GRANULAR BREAKDOWN
      const pieDataMap = {};

      // 1. Salaries
      const salaryTotal =
        employees.reduce((sum, emp) => sum + emp.salary, 0) +
        transactions
          .filter((t) => t.type === "BONUS")
          .reduce((sum, t) => sum + t.amount, 0) -
        transactions
          .filter((t) => t.type === "DEDUCTION")
          .reduce((sum, t) => sum + t.amount, 0);

      if (salaryTotal > 0) {
        pieDataMap["Salaries (Net)"] = salaryTotal;
      }

      // 2. Expense Categories (Monthly)
      expenseCategories.forEach((cat) => {
        pieDataMap[cat.category] = (pieDataMap[cat.category] || 0) + cat.amount;
      });

      // 3. Normal Expenses
      expenses.forEach((exp) => {
        pieDataMap[exp.category] = (pieDataMap[exp.category] || 0) + exp.amount;
      });

      const pieChartData = Object.keys(pieDataMap)
        .map((name) => ({
          name,
          value: pieDataMap[name],
        }))
        .filter((item) => item.value > 0);

      return res.json({
        barChartData,
        pieChartData,
        lineChartData: dailyTimelineData,
      });
    } else {
      // Legacy "all-time" or no filter logic
      incomes = await Income.find({ user: req.userId }).sort({ date: 1 });
      expenses = await Expense.find({ user: req.userId }).sort({ date: 1 });

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

      const timelineData = [...incomes, ...expenses]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((acc, item) => {
          const date = new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const existingEntry = acc.find((entry) => entry.date === date);

          const isIncome = item.constructor.modelName === "Income";

          if (existingEntry) {
            if (isIncome) {
              existingEntry.income += item.amount;
            } else {
              existingEntry.expense += item.amount;
            }
          } else {
            acc.push({
              date,
              income: isIncome ? item.amount : 0,
              expense: isIncome ? 0 : item.amount,
            });
          }
          return acc;
        }, []);

      res.json({
        barChartData,
        pieChartData,
        lineChartData: timelineData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.userId };

    if (month && year) {
      const startDate = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0)
      );
      const endDate = new Date(
        Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      );
      query.date = { $gte: startDate, $lte: endDate };
    }

    const incomes = await Income.find(query).sort({ createdAt: -1 }).limit(10);
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(10);

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
