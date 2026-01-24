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
    <div className="min-h-screen bg-[#0f1115]">
      {/* Mobile header */}
      <div className="lg:hidden bg-[#12141a] border-b border-white/6 p-4 flex justify-between items-center sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-all duration-150 text-gray-300"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <IoCloseOutline size={24} />
          ) : (
            <IoMenuOutline size={24} />
          )}
        </button>
        <h1 className="text-sm font-semibold text-gray-100 absolute left-1/2 -translate-x-1/2 text-center">
          Financial Management
        </h1>
        <div className="w-10"></div> {/* Spacer to keep title centered */}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#12141a] border-r border-white/6 transform transition-transform duration-300 ease-in-out h-screen lg:h-auto lg:min-h-screen flex flex-col
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/6 flex flex-col justify-center items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-100 text-center">
                Financial
                <br />
                Management
                <br />
                System
              </h1>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Welcome, {user?.name}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg transition-all duration-150 text-gray-400"
              aria-label="Close menu"
            >
              <IoCloseOutline size={24} />
            </button>
          </div>

          {/* Navigation - takes up available space */}
          <nav className="flex-1 p-4 overflow-y-auto lg:overflow-visible">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      location.pathname === item.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout button - stays at bottom */}
          <div className="p-4 border-t border-white/6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-all duration-150"
            >
              <IoLogOutOutline size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
