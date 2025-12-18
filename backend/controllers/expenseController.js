const Expense = require("../models/Expense");
const { calculateMonthlySummary } = require("./monthlySummaryController");

// Add expense
exports.addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = new Expense({
      user: req.userId,
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
    });

    await expense.save();

    // Trigger summary recalculation
    const d = new Date(expense.date);
    await calculateMonthlySummary(
      req.userId,
      d.getMonth() + 1,
      d.getFullYear()
    );

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all expenses for user
exports.getExpenses = async (req, res) => {
  try {
    const { month, year } = req.query;
    const query = { user: req.userId };

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
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // Make sure user owns the expense
    if (expense.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const d = new Date(expense.date);
    const userId = req.userId;
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    await Expense.findByIdAndDelete(req.params.id);

    // Trigger summary recalculation
    await calculateMonthlySummary(userId, month, year);

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
