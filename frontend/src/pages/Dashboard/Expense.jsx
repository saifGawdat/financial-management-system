import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import TransactionList from "../../components/dashboard/TransactionList";
import Modal from "../../components/ui/Modal";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import API from "../../api/axios";
import { getUniqueCategories } from "../../api/expenseCategory";
import { exportExpenseToExcel } from "../../utils/exportToExcel";
import { formatCurrency } from "../../utils/formatters";
import { IoAddCircleOutline, IoDownloadOutline } from "react-icons/io5";

// Categories are now dynamic and fetched from the server

const Expense = () => {
  const currentDate = new Date();
  const [expenses, setExpenses] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const fetchUserCategories = useCallback(async () => {
    try {
      const data = await getUniqueCategories();
      setUserCategories(data);
    } catch (error) {
      console.error("Error fetching user categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchUserCategories();
  }, [fetchUserCategories]);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await API.get("/expense", {
        params: { month, year },
      });
      if (Array.isArray(res.data)) {
        setExpenses(res.data);
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
    setError(""); // Clear previous errors
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
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to add expense. Please check your connection.";
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await API.delete(`/expense/${id}`);
        fetchExpenses();
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  const handleExport = () => {
    exportExpenseToExcel(expenses);
  };

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

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
                  {formatCurrency(totalExpense)}
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
          </div>
        </div>

        <Card>
          <TransactionList
            transactions={expenses}
            onDelete={handleDelete}
            type="expense"
          />
        </Card>

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
              label="Amount ($)"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows="3"
              />
            </div>
            <Button type="submit" className="w-full">
              Add Expense
            </Button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
