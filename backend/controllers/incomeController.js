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

// الحصول على جميع الإيرادات للمستخدم مع دعم الترقيم (Pagination)
// Get all incomes for user with pagination support
exports.getIncomes = async (req, res) => {
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

    // حساب إجمالي الإيرادات - Count total incomes
    const totalItems = await Income.countDocuments(query);
    const totalPages = Math.ceil(totalItems / validatedLimit);

    // جلب الإيرادات مع تطبيق الترقيم والترتيب
    // Fetch incomes with pagination and sorting
    const incomes = await Income.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(validatedLimit)
      .lean();

    // إرجاع البيانات مع معلومات الترقيم
    // Return data with pagination metadata
    res.json({
      data: incomes,
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
