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

// الحصول على جميع المصاريف للمستخدم مع دعم الترقيم (Pagination)
// Get all expenses for user with pagination support
exports.getExpenses = async (req, res) => {
  try {
    const { month, year, page, limit } = req.query;
    const query = { user: req.userId };

    // معاملات الترقيم - Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const validatedPage = pageNum < 1 ? 1 : pageNum;
    const validatedLimit = limitNum < 1 ? 10 : limitNum > 100 ? 100 : limitNum;
    const skip = (validatedPage - 1) * validatedLimit;

    if (month && year) {
      const startDate = new Date(
        Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0)
      );
      const endDate = new Date(
        Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)
      );
      query.date = { $gte: startDate, $lte: endDate };
    }

    // حساب إجمالي المصاريف - Count total expenses
    const totalItems = await Expense.countDocuments(query);
    const totalPages = Math.ceil(totalItems / validatedLimit);

    // جلب المصاريف مع تطبيق الترقيم والترتيب
    // Fetch expenses with pagination and sorting
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(validatedLimit)
      .lean();

    // إرجاع البيانات مع معلومات الترقيم
    // Return data with pagination metadata
    res.json({
      data: expenses,
      pagination: {
        currentPage: validatedPage,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: validatedLimit,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    });
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
