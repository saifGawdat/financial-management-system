import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import TransactionList from "../../components/dashboard/TransactionList";
import Modal from "../../components/ui/Modal";
import API from "../../api/axios";
import { exportIncomeToExcel } from "../../utils/exportToExcel";
import { IoAddCircleOutline, IoDownloadOutline } from "react-icons/io5";

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await API.get("/income");
      setIncomes(res.data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    }
  };

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
            <p className="text-gray-600 mt-1">
              Total Income:{" "}
              <span className="text-green-600 font-bold text-xl">
                ${totalIncome.toFixed(2)}
              </span>
            </p>
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
              label="Amount"
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
