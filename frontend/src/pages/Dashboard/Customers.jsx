import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { customerAPI } from "../../api/customer";
import {
  IoAddOutline,
  IoTrashOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import * as XLSX from "xlsx";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [formData, setFormData] = useState({
    name: "",
    brandName: "",
    phoneNumber: "",
    monthlyAmount: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, [selectedMonth, selectedYear]);

  const fetchCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await customerAPI.getAll({
        month: selectedMonth,
        year: selectedYear,
      });
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const handlePay = async (id) => {
    if (
      window.confirm(
        "Confirm payment for this customer for the selected month?"
      )
    ) {
      try {
        await customerAPI.pay(id, selectedMonth, selectedYear);
        fetchCustomers();
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    }
  };

  const handleUnpay = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to mark this customer as UNPAID for this month? (This will remove the payment from income)"
      )
    ) {
      try {
        await customerAPI.unpay(id, selectedMonth, selectedYear);
        fetchCustomers();
      } catch (error) {
        console.error("Error reversing payment:", error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this customer?")) {
      try {
        await customerAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await customerAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        name: "",
        brandName: "",
        phoneNumber: "",
        monthlyAmount: "",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Error creating customer:", error);
    }
  };

  const handleExport = () => {
    const dataToExport = customers.map((c) => ({
      "Customer Name": c.name,
      "Brand Name": c.brandName || "N/A",
      "Phone Number": c.phoneNumber,
      "Monthly Amount": c.monthlyAmount,
      Status: c.isPaid ? "Paid" : "Unpaid",
      Month: selectedMonth,
      Year: selectedYear,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Customers_${selectedMonth}_${selectedYear}.xlsx`);
  };

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

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 mb-8 text-center md:text-left">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Customers
            </h1>
            <p className="text-gray-500 mt-2">
              Monthly subscribers and payment tracking
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 w-full md:w-auto">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all flex-1 sm:flex-none"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all flex-1 sm:flex-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm border border-gray-200 font-semibold w-full sm:w-auto"
            >
              <IoDownloadOutline size={20} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-200 w-full sm:w-auto"
            >
              <IoAddOutline size={20} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => {
              const paid = customer.isPaid;
              return (
                <div
                  key={customer._id}
                  className={`bg-white rounded-2xl shadow-sm border-l-8 p-6 transition-all hover:shadow-md ${
                    paid ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {customer.name}
                        </h3>
                        {customer.brandName && (
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                            {customer.brandName}
                          </span>
                        )}
                        {paid ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                            <IoCheckmarkCircleOutline size={18} />
                            Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-semibold bg-red-50 px-2 py-0.5 rounded-full">
                            <IoCloseCircleOutline size={18} />
                            Unpaid
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                        <div>
                          <p className="text-gray-400 mb-1 font-medium">
                            Phone
                          </p>
                          <p className="font-semibold text-gray-700">
                            {customer.phoneNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-1 font-medium">
                            Monthly
                          </p>
                          <p className="font-bold text-purple-600 text-lg">
                            $
                            {parseFloat(
                              customer.monthlyAmount
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-400 mb-1 font-medium">
                            Total Spent
                          </p>
                          <p className="text-gray-700 font-medium italic">
                            Tracking...
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-400 mb-1 font-medium">
                            Last Payment
                          </p>
                          <p className="text-gray-700">
                            {customer.lastPaidDate
                              ? new Date(
                                  customer.lastPaidDate
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!paid ? (
                        <button
                          onClick={() => handlePay(customer._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-md shadow-green-100"
                        >
                          <IoCashOutline size={20} />
                          <span>Pay</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpay(customer._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-semibold"
                          title="Undo payment"
                        >
                          <IoCloseCircleOutline size={20} />
                          <span>Undo</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove customer"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {customers.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
                <p className="text-gray-500 italic">
                  No customers found. Add your first customer to get started!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Add New Customer
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand/Company Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData({ ...formData, brandName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  required
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. +1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Amount
                </label>
                <input
                  required
                  type="number"
                  value={formData.monthlyAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyAmount: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. 500"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg shadow-purple-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Customers;
