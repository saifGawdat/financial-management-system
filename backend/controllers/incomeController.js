const Income = require("../models/Income");
const { calculateMonthlySummary } = require("./monthlySummaryController");

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

    // Trigger summary recalculation
    const d = new Date(income.date);
    await calculateMonthlySummary(
      req.userId,
      d.getMonth() + 1,
      d.getFullYear()
    );

    res.status(201).json(income);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all incomes for user
exports.getIncomes = async (req, res) => {
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

    const incomes = await Income.find(query).sort({ date: -1 });
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

    const d = new Date(income.date);
    const userId = req.userId;
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    await Income.findByIdAndDelete(req.params.id);

    // Trigger summary recalculation
    await calculateMonthlySummary(userId, month, year);

    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
