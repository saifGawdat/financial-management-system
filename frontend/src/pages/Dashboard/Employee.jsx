import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../api/employee";

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
    setError("");

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
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(error.response?.data?.message || "Failed to save employee");
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

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.isActive &&
      (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSalaries = filteredEmployees.reduce(
    (sum, emp) => sum + emp.salary,
    0
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your employees and their salaries
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            + Add Employee
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-md border border-blue-200">
            <p className="text-blue-700 text-sm font-medium">Total Employees</p>
            <p className="text-4xl font-bold text-blue-900 mt-2">
              {filteredEmployees.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow-md border border-green-200">
            <p className="text-green-700 text-sm font-medium">
              Total Monthly Salaries
            </p>
            <p className="text-4xl font-bold text-green-900 mt-2">
              ${totalSalaries.toLocaleString()}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow-md border border-purple-200">
            <p className="text-purple-700 text-sm font-medium">
              Average Salary
            </p>
            <p className="text-4xl font-bold text-purple-900 mt-2">
              $
              {filteredEmployees.length > 0
                ? Math.round(
                    totalSalaries / filteredEmployees.length
                  ).toLocaleString()
                : 0}
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
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {employee.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {employee.jobTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {employee.phoneNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(employee.dateJoined)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">
                          ${employee.salary.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-4 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Monthly Salary ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                  >
                    {editingEmployee ? "Update Employee" : "Create Employee"}
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

export default Employee;
