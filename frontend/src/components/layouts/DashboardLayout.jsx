import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  IoSettingsOutline,
} from "react-icons/io5";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
    { path: "/settings", icon: IoSettingsOutline, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
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
              aria-label="Close menu"
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

          {/* Logout button - stays at bottom */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <IoLogOutOutline size={22} />
              <span className="font-medium">Logout</span>
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
    </div>
  );
};

export default DashboardLayout;
