import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Modal from "../ui/Modal";
import {
  IoHomeOutline,
  IoWalletOutline,
  IoCartOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoPeopleOutline,
  IoPricetagsOutline,
  IoCashOutline,
  IoStatsChartOutline,
  IoTrashOutline,
  IoWarningOutline,
} from "react-icons/io5";

const DashboardLayout = ({ children }) => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setIsDeleting(true);

    try {
      const result = await deleteAccount();

      if (result.success) {
        // Account deleted successfully, user is logged out, redirect to login
        navigate("/login");
      } else {
        // Show error message
        setDeleteError(result.error);
        setIsDeleting(false);
      }
    } catch {
      setDeleteError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  };

  const navItems = [
    { path: "/dashboard", icon: IoHomeOutline, label: "Dashboard" },
    { path: "/income", icon: IoWalletOutline, label: "Income" },
    { path: "/expense", icon: IoCartOutline, label: "Expenses" },
    { path: "/employees", icon: IoPeopleOutline, label: "Employees" },
    {
      path: "/expense-categories",
      icon: IoPricetagsOutline,
      label: "Expense Categories",
    },
    {
      path: "/monthly-salaries",
      icon: IoCashOutline,
      label: "Monthly Salaries",
    },
    {
      path: "/profit-summary",
      icon: IoStatsChartOutline,
      label: "Profit Summary",
    },
    { path: "/customers", icon: IoPeopleOutline, label: "Customers" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <IoCloseOutline size={28} />
          ) : (
            <IoMenuOutline size={28} />
          )}
        </button>
        <h1 className="text-md font-bold text-purple-600 absolute left-1/2 -translate-x-1/2 text-center ">
          Financial Management System
        </h1>
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out h-screen lg:h-auto lg:min-h-screen flex flex-col
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">
                Financial Management System
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome, {user?.name}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            >
              <IoCloseOutline size={28} />
            </button>
          </div>

          {/* Navigation - takes up available space */}
          <nav className="flex-1 p-4 overflow-y-auto lg:overflow-visible">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      location.pathname === item.path
                        ? "bg-purple-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon size={22} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout and Delete Account buttons - stay at bottom */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <IoLogOutOutline size={22} />
              <span className="font-medium">Logout</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <IoTrashOutline size={22} />
              <span className="font-medium">Delete Account</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
            <IoWarningOutline
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={24}
            />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Warning: This action cannot be undone!
              </h3>
              <p className="text-sm text-red-700">
                Deleting your account will permanently remove all your data,
                including transactions, expenses, and income records.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800">{deleteError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IoTrashOutline size={20} />
                  Delete Account
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardLayout;
