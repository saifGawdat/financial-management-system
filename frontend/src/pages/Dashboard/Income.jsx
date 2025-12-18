import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import TransactionList from "../../components/dashboard/TransactionList";
import Modal from "../../components/ui/Modal";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import API from "../../api/axios";
import { formatCurrency } from "../../utils/formatters";
import { exportIncomeToExcel } from "../../utils/exportToExcel";
import { IoAddCircleOutline, IoDownloadOutline } from "react-icons/io5";

const Income = () => {
  const currentDate = new Date();
  const [incomes, setIncomes] = useState([]);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const fetchIncomes = useCallback(async () => {
    try {
      const res = await API.get("/income", {
        params: { month, year },
      });
      setIncomes(res.data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  }, [month, year]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/income", formData);
      setIsModalOpen(false);
      setFormData({
        title: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      fetchIncomes();
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await API.delete(`/income/${id}`);
        fetchIncomes();
      } catch (error) {
        console.error("Error deleting income:", error);
      }
    }
  };

  const handleExport = () => {
    exportIncomeToExcel(incomes);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Income Management
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600">
                Total Income:{" "}
                <span className="text-green-600 font-bold text-xl">
                  {formatCurrency(totalIncome)}
                </span>
              </p>
              <div className="h-6 w-px bg-gray-300 mx-2"></div>
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
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <IoDownloadOutline size={20} />
              Export to Excel
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <IoAddCircleOutline size={20} />
              Add Income
            </Button>
          </div>
        </div>

        <Card>
          <TransactionList
            transactions={incomes}
            onDelete={handleDelete}
            type="income"
          />
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Income"
        >
          <form onSubmit={handleSubmit}>
            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Salary"
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
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Salary, Freelance"
              required
            />
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
              Add Income
            </Button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;
