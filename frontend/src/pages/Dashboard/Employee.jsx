import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import * as XLSX from "xlsx";
import {IoDownloadOutline} from "react-icons/io5";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addTransaction,
  getTransactionsByMonth,
  deleteTransaction,
} from "../../api/employee";
import { formatCurrency } from "../../utils/formatters";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    salary: "",
    jobTitle: "",
    phoneNumber: "",
    dateJoined: new Date().toISOString().split("T")[0],
  });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee._id, formData);
      } else {
        await createEmployee(formData);
      }
      setShowModal(false);
      setFormData({
        name: "",
        salary: "",
        jobTitle: "",
        phoneNumber: "",
        dateJoined: new Date().toISOString().split("T")[0],
      });
      setEditingEmployee(null);
      await fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(error.response?.data?.message || "Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      salary: employee.salary,
      jobTitle: employee.jobTitle,
      phoneNumber: employee.phoneNumber || "",
      dateJoined: employee.dateJoined
        ? new Date(employee.dateJoined).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        setError("Failed to delete employee");
      }
    }
  };

  const handleAddNew = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      salary: "",
      jobTitle: "",
      phoneNumber: "",
      dateJoined: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [adjustmentFormData, setAdjustmentFormData] = useState({
    employeeId: "",
    type: "BONUS",
    amount: "",
    description: "",
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransactionsByMonth(selectedMonth, selectedYear);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [selectedMonth, selectedYear]);

  // Fetch transactions on mount and when month/year changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (isAddingTransaction) return;
    setIsAddingTransaction(true);
    try {
      await addTransaction({
        ...adjustmentFormData,
        month: selectedMonth,
        year: selectedYear,
      });
      setAdjustmentFormData({
        ...adjustmentFormData,
        amount: "",
        description: "",
      });
      await fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction");
    } finally {
      setIsAddingTransaction(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Delete this adjustment?")) {
      try {
        await deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const getEmployeeStats = (employee) => {
    const employeeTransactions = transactions.filter(
      (t) => t.employee && t.employee._id === employee._id
    );
    const bonuses = employeeTransactions
      .filter((t) => t.type === "BONUS")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const deductions = employeeTransactions
      .filter((t) => t.type === "DEDUCTION")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const netSalary = Number(employee.salary || 0) + bonuses - deductions;
    return { bonuses, deductions, netSalary };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.isActive &&
      (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalBaseSalaries = filteredEmployees.reduce(
    (sum, emp) => sum + emp.salary,
    0
  );

  const totalNetSalaries = filteredEmployees.reduce(
    (sum, emp) => sum + getEmployeeStats(emp).netSalary,
    0
  );

  const handleExportExcel = () => {
    const dataToExport = filteredEmployees.map((emp) => {
      const stats = getEmployeeStats(emp);
      return {
        "Employee Name": emp.name,
        "Job Title": emp.jobTitle,
        "Base Salary": emp.salary,
        Bonuses: stats.bonuses,
        Deductions: stats.deductions,
        "Net Salary": stats.netSalary,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Salaries");

    // Auto-width columns
    const max_width = dataToExport.reduce(
      (w, r) => Math.max(w, r["Employee Name"].length),
      10
    );
    worksheet["!cols"] = [{ wch: max_width }];

    XLSX.writeFile(
      workbook,
      `Salaries for ${months[selectedMonth - 1]} ${selectedYear}.xlsx`
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 gap-6 text-center md:text-left">
          <div className="w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your employees and their salaries for{" "}
              <span className="font-semibold text-blue-600">
                {months[selectedMonth - 1]} {selectedYear}
              </span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <IoDownloadOutline size={20} />
              Export to Excel
            </Button>
            <button
              onClick={() => setShowAdjustmentsModal(true)}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span>📅</span> Monthly Adjustments
            </button>
            <button
              onClick={handleAddNew}
              className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              + Add Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-linear-to-r from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Total Employees</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">
              {filteredEmployees.length}
            </p>
          </div>
          <div className="bg-linear-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
            <p className="text-green-700 text-sm font-medium">
              Total Net Salaries
            </p>
            <p className="text-4xl font-bold text-green-900 mt-2">
              {formatCurrency(totalNetSalaries)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Base: {formatCurrency(totalBaseSalaries)}
            </p>
          </div>
          <div className="bg-linear-to-r from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
            <p className="text-purple-700 text-sm font-medium">
              Average Net Salary
            </p>
            <p className="text-4xl font-bold text-purple-900 mt-2">
              {formatCurrency(
                filteredEmployees.length > 0
                  ? totalNetSalaries / filteredEmployees.length
                  : 0
              )}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search employees by name or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Employee Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading employees...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No employees found. Click "Add Employee" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bonuses
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => {
                    const stats = getEmployeeStats(employee);
                    return (
                      <tr
                        key={employee._id}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.phoneNumber || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {employee.jobTitle}
                          </div>
                          <div className="text-xs text-gray-400">
                            Joined: {formatDate(employee.dateJoined)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-600">
                            {formatCurrency(employee.salary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {stats.bonuses > 0
                              ? `+${stats.bonuses.toLocaleString()}`
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-red-600">
                            {stats.deductions > 0
                              ? `-${stats.deductions.toLocaleString()}`
                              : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded w-fit">
                            {formatCurrency(stats.netSalary)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(employee._id)}
                              className="text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl animate-in zoom-in duration-200">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-0">
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Monthly Salary (£) *
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="mb-6 md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Date Joined *
                    </label>
                    <input
                      type="date"
                      value={formData.dateJoined}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dateJoined: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingEmployee
                      ? "Update Employee"
                      : "Create Employee"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEmployee(null);
                      setFormData({
                        name: "",
                        salary: "",
                        jobTitle: "",
                        phoneNumber: "",
                        dateJoined: new Date().toISOString().split("T")[0],
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

        {/* Adjustments Modal */}
        {showAdjustmentsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl p-8 max-w-6xl w-full h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Monthly Adjustments
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage bonuses and deductions for payroll
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="border-2 border-gray-300 rounded-md px-4 py-2 font-medium"
                  >
                    {months.map((m, i) => (
                      <option key={i + 1} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="border-2 border-gray-300 rounded-md px-4 py-2 font-medium"
                  >
                    {[2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAdjustmentsModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold md:relative md:right-0 md:top-0 absolute right-0 top-0"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Employee List & Net Salary Table */}
                <div className="lg:col-span-2 overflow-y-auto pr-2">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Employee
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                          Base Salary
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-green-700 uppercase">
                          Bonuses
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-red-700 uppercase">
                          Deductions
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-blue-700 uppercase">
                          Net Salary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEmployees.map((emp) => {
                        const stats = getEmployeeStats(emp);
                        return (
                          <tr key={emp._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {emp.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">
                              {formatCurrency(emp.salary)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-green-600">
                              {stats.bonuses > 0
                                ? `+${stats.bonuses.toLocaleString()}`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-red-600">
                              {stats.deductions > 0
                                ? `-${stats.deductions.toLocaleString()}`
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-blue-700">
                              £{stats.netSalary.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td className="px-4 py-3">Totals</td>
                        <td className="px-4 py-3 text-right">
                          £
                          {filteredEmployees
                            .reduce((sum, e) => sum + Number(e.salary || 0), 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-green-700">
                          £
                          {transactions
                            .filter((t) => t.type === "BONUS")
                            .reduce((s, t) => s + Number(t.amount || 0), 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-red-700">
                          £
                          {transactions
                            .filter((t) => t.type === "DEDUCTION")
                            .reduce((s, t) => s + Number(t.amount || 0), 0)
                            .toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-blue-800">
                          £
                          {filteredEmployees
                            .reduce(
                              (sum, e) =>
                                sum +
                                Number(getEmployeeStats(e).netSalary || 0),
                              0
                            )
                            .toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Add Transaction Form & History */}
                <div className="flex flex-col gap-6 overflow-hidden ">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4">
                      Add Adjustment
                    </h3>
                    <form onSubmit={handleAddTransaction}>
                      <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Employee
                        </label>
                        <select
                          className="w-full border-gray-200 rounded-xl p-3 text-sm bg-white border-2 text-center"
                          value={adjustmentFormData.employeeId}
                          onChange={(e) =>
                            setAdjustmentFormData({
                              ...adjustmentFormData,
                              employeeId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Select Employee</option>
                          {filteredEmployees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                              {emp.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            className="w-full bg-white border-gray-200 border-2 rounded-xl p-3 text-sm text-center"
                            value={adjustmentFormData.type}
                            onChange={(e) =>
                              setAdjustmentFormData({
                                ...adjustmentFormData,
                                type: e.target.value,
                              })
                            }
                          >
                            <option value="BONUS">Bonus (+)</option>
                            <option value="DEDUCTION">Deduction (-)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Amount
                          </label>
                          <input
                            type="number"
                            className="w-full bg-white border-gray-200 border-2 rounded-xl p-3 text-sm text-center"
                            value={adjustmentFormData.amount}
                            onChange={(e) =>
                              setAdjustmentFormData({
                                ...adjustmentFormData,
                                amount: e.target.value,
                              })
                            }
                            required
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          className="w-full border-gray-200 rounded-xl p-3 text-sm bg-white border-2"
                          value={adjustmentFormData.description}
                          onChange={(e) =>
                            setAdjustmentFormData({
                              ...adjustmentFormData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Reason (optional)"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium text-sm disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={isAddingTransaction}
                      >
                        {isAddingTransaction ? "Adding..." : "Add Adjustment"}
                      </button>
                    </form>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-sm">
                      Recent Adjustments ({selectedMonth}/{selectedYear})
                    </div>
                    {transactions.length === 0 ? (
                      <p className="p-4 text-center text-gray-500 text-sm">
                        No adjustments for this month.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {transactions.map((t) => (
                          <li
                            key={t._id}
                            className="p-3 hover:bg-gray-50 flex justify-between items-center group"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-800">
                                {t.employee?.name || "Unknown Employee"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {t.type === "BONUS" ? "Bonus" : "Deduction"}
                                {t.description && ` • ${t.description}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-bold ${
                                  t.type === "BONUS"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {t.type === "BONUS" ? "+" : "-"}£{t.amount}
                              </div>
                              <button
                                onClick={() => handleDeleteTransaction(t._id)}
                                className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employee;
