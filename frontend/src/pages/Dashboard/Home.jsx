import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import SummaryCard from "../../components/dashboard/SummaryCard";
import RecentTransactions from "../../components/dashboard/RecentTransactions";
import BarChart from "../../components/charts/BarChart";
import PieChart from "../../components/charts/PieChart";
import LineChart from "../../components/charts/LineChart";
import Card from "../../components/ui/Card";
import API from "../../api/axios";
import {
  IoWalletOutline,
  IoTrendingUpOutline,
  IoTrendingDownOutline,
} from "react-icons/io5";

const Home = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartRes, recentRes] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get("/dashboard/chart-data"),
        API.get("/dashboard/recent"),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
      setRecentTransactions(recentRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Dashboard Overview
        </h1>

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
      </div>
    </DashboardLayout>
  );
};

export default Home;
