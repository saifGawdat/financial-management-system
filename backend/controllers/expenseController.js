const Expense = require("../models/Expense");

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
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all expenses for user
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({
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

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
