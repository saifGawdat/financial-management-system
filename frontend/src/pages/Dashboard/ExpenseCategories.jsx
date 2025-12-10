import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import {
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
} from "../../api/expenseCategory";

const ExpenseCategories = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
  });

  const defaultCategories = ["Transportation", "Repair", "Equipment"];

  useEffect(() => {
    fetchCategories();
  }, [month, year]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getExpenseCategories(month, year);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load expense categories");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createExpenseCategory({
        category: formData.category,
        amount: parseFloat(formData.amount),
        month,
        year,
        description: formData.description,
      });
      setShowModal(false);
      setFormData({ category: "", amount: "", description: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error adding expense:", error);
      setError("Failed to add expense");
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpenseCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting expense:", error);
        setError("Failed to delete expense");
      }
    }
  };

  // Group categories
  const groupedCategories = {};
  categories.forEach((cat) => {
    if (!groupedCategories[cat.category]) {
      groupedCategories[cat.category] = [];
    }
    groupedCategories[cat.category].push(cat);
  });

  const getCategoryTotal = (categoryName) => {
    return (groupedCategories[categoryName] || []).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );
  };

  const allCategoryNames = [...new Set(categories.map((c) => c.category))];
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Expense Categories
            </h1>
            <p className="text-gray-600 mt-1">
              Track monthly expenses by category
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            + Add Expense
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
          <MonthYearSelector
            onSelect={handleMonthYearChange}
            initialMonth={month}
            initialYear={year}
          />
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-6">
          <p className="text-lg opacity-90">Total Category Expenses</p>
          <p className="text-5xl font-bold mt-2">
            ${totalExpenses.toLocaleString()}
          </p>
          <p className="text-sm opacity-75 mt-1">
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCategoryNames.map((categoryName) => {
            const categoryData = groupedCategories[categoryName];
            const total = getCategoryTotal(categoryName);

            return (
              <div
                key={categoryName}
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4">
                  <h3 className="text-lg font-semibold">{categoryName}</h3>
                  <p className="text-3xl font-bold mt-2">
                    ${total.toLocaleString()}
                  </p>
                </div>
                <div className="p-4">
                  {categoryData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No expenses recorded
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categoryData.map((expense) => (
                        <div
                          key={expense._id}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              ${expense.amount.toLocaleString()}
                            </p>
                            {expense.description && (
                              <p className="text-sm text-gray-600">
                                {expense.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Breakdown Chart */}
        {totalExpenses > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-lg mt-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Expense Breakdown
            </h3>
            <div className="space-y-4">
              {allCategoryNames.map((categoryName) => {
                const total = getCategoryTotal(categoryName);
                const percentage =
                  totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

                return (
                  <div key={categoryName}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">
                        {categoryName}
                      </span>
                      <span className="font-semibold text-gray-800">
                        ${total.toLocaleString()} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Add Expense
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., Transportation, Repair, Equipment"
                    required
                  />
                  <datalist id="category-suggestions">
                    {defaultCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">
                    Type a new category or select from suggestions
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows="3"
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    Add Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        category: "",
                        amount: "",
                        description: "",
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExpenseCategories;
