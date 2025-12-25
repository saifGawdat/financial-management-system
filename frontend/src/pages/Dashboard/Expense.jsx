import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import TransactionList from "../../components/dashboard/TransactionList";
import Modal from "../../components/ui/Modal";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import API from "../../api/axios";
import {
  getUniqueCategories,
  getExpenseCategories,
  createExpenseCategory,
  deleteExpenseCategory,
} from "../../api/expenseCategory";
import { exportExpenseToExcel } from "../../utils/exportToExcel";
import { formatCurrency } from "../../utils/formatters";
import { IoAddCircleOutline, IoDownloadOutline } from "react-icons/io5";

const Expense = () => {
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState("transactions"); // "transactions" or "categories"
  const [expenses, setExpenses] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    category: "",
    amount: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCategories = ["Transportation", "Repair", "Equipment"];

  const fetchUserCategories = useCallback(async () => {
    try {
      const data = await getUniqueCategories();
      setUserCategories(data);
    } catch (error) {
      console.error("Error fetching user categories:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getExpenseCategories(month, year);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load expense categories");
    }
  }, [month, year]);

  useEffect(() => {
    fetchUserCategories();
    fetchCategories();
  }, [fetchUserCategories, fetchCategories]);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await API.get("/expense", {
        params: {
          month,
          year,
          _t: Date.now(), // Cache buster
        },
      });
      if (Array.isArray(res.data)) {
        // Sort by createdAt (newest first) on the frontend
        const sortedExpenses = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setExpenses(sortedExpenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  }, [month, year]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(""); // Clear previous errors
    setIsSubmitting(true);
    try {
      await API.post("/expense", formData);
      setIsModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        category: "Other",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      await fetchExpenses();
      await fetchCategories(); // Refresh categories too
    } catch (error) {
      console.error("Error adding expense:", error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to add expense. Please check your connection.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await createExpenseCategory({
        category: categoryFormData.category,
        amount: parseFloat(categoryFormData.amount) || 0,
        month,
        year,
        description: categoryFormData.description,
      });
      setShowCategoryModal(false);
      setCategoryFormData({ category: "", amount: "", description: "" });
      await fetchCategories();
    } catch (error) {
      console.error("Error adding expense category:", error);
      const msg =
        error.response?.data?.message ||
        "Failed to add expense category. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await API.delete(`/expense/${id}`);
        fetchExpenses();
        fetchCategories(); // Refresh categories too
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  const handleDeleteCategoryExpense = async (id) => {
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

  const handleExport = () => {
    exportExpenseToExcel(expenses);
  };

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const totalCategoryExpenses = categories.reduce(
    (sum, cat) =>
      sum + Number(cat.amount || 0) + Number(cat.expensesTotal || 0),
    0
  );

  const getCategoryTotal = (categoryName) => {
    const groupedCategories = {};
    categories.forEach((cat) => {
      if (!groupedCategories[cat.category]) {
        groupedCategories[cat.category] = [];
      }
      groupedCategories[cat.category].push(cat);
    });
    return (groupedCategories[categoryName] || []).reduce(
      (sum, cat) => sum + cat.amount,
      0
    );
  };

  const allCategoryNames = [...new Set(categories.map((c) => c.category))];

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 gap-6 text-center md:text-left">
          <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Expense Management
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 justify-center md:justify-start">
              <p className="text-gray-600">
                Total Expenses:{" "}
                <span className="text-red-600 font-bold text-xl">
                  {formatCurrency(
                    activeTab === "transactions"
                      ? totalExpense
                      : totalCategoryExpenses
                  )}
                </span>
              </p>
              <div className="hidden md:block h-6 w-px bg-gray-300 mx-2"></div>
              <MonthYearSelector
                onSelect={(m, y) => {
                  setMonth(m);
                  setYear(y);
                }}
                initialMonth={month}
                initialYear={year}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {activeTab === "transactions" && (
              <>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <IoDownloadOutline size={20} />
                  Export to Excel
                </Button>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <IoAddCircleOutline size={20} />
                  Add Expense
                </Button>
              </>
            )}
            {activeTab === "categories" && (
              <Button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <IoAddCircleOutline size={20} />
                Add Category Expense
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "transactions"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === "categories"
                ? "bg-purple-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Categories
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            {error}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <Card>
            <TransactionList
              transactions={expenses}
              onDelete={handleDelete}
              type="expense"
            />
          </Card>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {categories.map((cat) => {
                const hasBucket = cat._id !== undefined;
                const actualExpenses = cat.actualExpenses || [];
                const total = (cat.amount || 0) + (cat.expensesTotal || 0);

                return (
                  <div
                    key={cat._id || cat.category}
                    className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
                  >
                    <div className="bg-linear-to-r from-gray-700 to-gray-800 text-white p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          {cat.category}
                        </h3>
                        {cat.isVirtual && (
                          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                            Transaction Only
                          </span>
                        )}
                      </div>
                      <p className="text-3xl font-bold mt-2">
                        £{total.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {/* The Primary Bucket (if exists) */}
                        {hasBucket && cat.amount > 0 && (
                          <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div>
                              <p className="font-semibold text-purple-800">
                                £{cat.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-purple-600">
                                Monthly Bucket
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteCategoryExpense(cat._id)
                              }
                              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}

                        {/* Individual Linked Expenses */}
                        {actualExpenses.map((expense) => (
                          <div
                            key={expense._id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                £{expense.amount.toLocaleString()}
                              </p>
                              <p className="text-xs text-blue-600 font-medium">
                                {expense.title || "Untitled Expense"}
                              </p>
                              {expense.description && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  {expense.description}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">
                              {new Date(expense.date).toLocaleDateString()}
                            </span>
                          </div>
                        ))}

                        {cat.amount === 0 && actualExpenses.length === 0 && (
                          <p className="text-gray-500 text-center py-4 text-sm">
                            No spend recorded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Breakdown Chart */}
            {totalCategoryExpenses > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Expense Breakdown
                </h3>
                <div className="space-y-4">
                  {allCategoryNames.map((categoryName) => {
                    const total = getCategoryTotal(categoryName);
                    const percentage =
                      totalCategoryExpenses > 0
                        ? (total / totalCategoryExpenses) * 100
                        : 0;

                    return (
                      <div key={categoryName}>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700 font-medium">
                            {categoryName}
                          </span>
                          <span className="font-semibold text-gray-800">
                            £{total.toLocaleString()} ({percentage.toFixed(1)}%)
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
          </div>
        )}

        {/* Add Transaction Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Expense"
        >
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Groceries"
              required
            />
            <Input
              label="Amount (£)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="Other">Other</option>
                {Array.isArray(userCategories) &&
                  userCategories
                    .filter((cat) => cat && cat !== "Other")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add notes..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows="3"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Expense"}
            </Button>
          </form>
        </Modal>

        {/* Add Category Expense Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in zoom-in duration-200">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Add Category Expense
              </h2>
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={categoryFormData.category}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    Amount (£) *
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.amount}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows="3"
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:bg-purple-300 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Expense"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setCategoryFormData({
                        category: "",
                        amount: "",
                        description: "",
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-xl font-semibold transition-all"
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

export default Expense;
