import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import SummaryCard from "../../components/dashboard/SummaryCard";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";
import LineChart from "../../components/charts/LineChart";
import Card from "../../components/ui/Card";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import API from "../../api/axios";
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
} from "react-icons/io5";

const Home = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [chartData, setChartData] = useState({
    barChartData: [],
    pieChartData: [],
    lineChartData: [],
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { month, year };
      const [statsRes, chartRes, recentRes] = await Promise.all([
        API.get("/dashboard/stats", { params }),
        API.get("/dashboard/chart-data", { params }),
        API.get("/dashboard/recent", { params }),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecentTransactions(recentRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 gap-4 text-center md:text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-1">
            Financial summary for{" "}
            {new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="w-full md:w-auto flex justify-center">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Balance"
          amount={stats.balance}
          icon={IoWalletOutline}
          iconColor="text-purple-600"
          bgGradient="from-purple-500 to-purple-700"
      
        />
        <SummaryCard
          title="Total Income"
          amount={stats.totalIncome}
          icon={IoTrendingUpOutline}
          iconColor="text-green-600"
          bgGradient="from-green-500 to-green-700"
        />
        <SummaryCard
          title="Total Expenses"
          amount={stats.totalExpense}
          icon={IoTrendingDownOutline}
          iconColor="text-red-600"
          bgGradient="from-red-500 to-red-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Income vs Expense" subtitle="Monthly comparison">
          <BarChart data={chartData.barChartData} />
        </Card>
        <Card title="Expense Categories" subtitle="Distribution by category">
          <PieChart data={chartData.pieChartData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card title="Trend Over Time" subtitle="Income and expense timeline">
          <LineChart data={chartData.lineChartData} />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" subtitle="Your latest 5 transactions">
        <RecentTransactions transactions={recentTransactions} />
      </Card>
    </DashboardLayout>
  );
};

export default Home;
