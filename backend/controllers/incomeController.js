const Income = require("../models/Income");

// Add income
exports.addIncome = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const income = new Income({
      user: req.userId,
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
    });

    await income.save();
    res.status(201).json(income);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all incomes for user
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.userId }).sort({ date: -1 });
    res.json(incomes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    // Make sure user owns the income
    if (income.user.toString() !== req.userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
