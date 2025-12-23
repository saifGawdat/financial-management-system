import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import {
  getMonthlySummary,
  getAllMonthlySummaries,
  recalculateMonthlySummary,
} from "../../api/monthlySummary";
import { formatCurrency } from "../../utils/formatters";

const ProfitSummary = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [summary, setSummary] = useState(null);
  const [allSummaries, setAllSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState(false);
  const [viewMode, setViewMode] = useState("single"); // 'single' or 'all'

  useEffect(() => {
    if (viewMode === "single") {
      fetchMonthlySummary();
    } else {
      fetchAllSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, viewMode]);

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const data = await getMonthlySummary(month, year);
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError("Failed to load monthly summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSummaries = async () => {
    try {
      setLoading(true);
      const data = await getAllMonthlySummaries();
      setAllSummaries(data);
    } catch (error) {
      console.error("Error fetching summaries:", error);
      setError("Failed to load summaries");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError("");
      await recalculateMonthlySummary(month, year);
      await fetchMonthlySummary();
      // Show success message briefly
      setError("✓ Summary recalculated successfully!");
      setTimeout(() => setError(""), 3000);
    } catch (error) {
      console.error("Error recalculating:", error);
      setError("Failed to recalculate summary");
    } finally {
      setRecalculating(false);
    }
  };

  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const getMonthName = (monthNum) => {
    return new Date(2000, monthNum - 1).toLocaleDateString("en-US", {
      month: "long",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Profit Summary
          </h1>
          <p className="text-gray-600 mt-1">
            View monthly profit and financial overview
          </p>
        </div>

        {error && (
          <div
            className={`border px-4 py-3 rounded mb-4 ${
              error.startsWith("✓")
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 overflow-x-auto">
          <div className="flex gap-4 justify-center md:justify-start min-w-max">
            <button
              onClick={() => setViewMode("single")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex-1 md:flex-none ${
                viewMode === "single"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Single Month
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex-1 md:flex-none ${
                viewMode === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Months
            </button>
          </div>
        </div>

        {viewMode === "single" ? (
          <>
            {/* Month/Year Selector */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex justify-center w-full md:w-auto">
                <MonthYearSelector
                  onSelect={handleMonthYearChange}
                  initialMonth={month}
                  initialYear={year}
                />
              </div>
              <button
                onClick={handleRecalculate}
                disabled={recalculating}
                className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
                  recalculating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {recalculating ? "Recalculating..." : "Recalculate"}
              </button>
            </div>

            {loading ? (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                Loading summary...
              </div>
            ) : summary ? (
              <>
                {/* Profit Card */}
                <div
                  className={`p-8 rounded-lg shadow mb-6 ${
                    summary.profit >= 0
                      ? "bg-linear-to-r from-green-500 to-green-600"
                      : "bg-linear-to-r from-red-500 to-red-600"
                  } text-white`}
                >
                  <p className="text-xl opacity-90">
                    {getMonthName(summary.month)} {summary.year} Profit
                  </p>
                  <p className="text-5xl font-bold mt-2">
                    {formatCurrency(Math.abs(summary.profit))}
                  </p>
                  <p className="text-lg opacity-75 mt-1">
                    {summary.profit >= 0 ? "Profit" : "Loss"}
                  </p>
                </div>

                {/* Financial Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Total Income</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {formatCurrency(summary.totalIncome)}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {formatCurrency(summary.totalExpenses)}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-600 text-sm">Total Salaries</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatCurrency(summary.totalSalaries)}
                    </p>
                  </div>
                </div>

                {/* Income Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Income Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-gray-700 font-medium">
                        Monthly Collections
                      </p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {formatCurrency(
                          summary.incomeBreakdown.monthlyCollections
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-gray-700 font-medium">
                        Advertising Expenses
                      </p>
                      <p className="text-2xl font-bold text-red-600 mt-1">
                        {formatCurrency(
                          summary.incomeBreakdown.advertisingExpenses
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Expense Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">
                        Transportation
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatCurrency(
                          summary.expenseBreakdown.Transportation
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Repair</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatCurrency(summary.expenseBreakdown.Repair)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">Equipment</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatCurrency(summary.expenseBreakdown.Equipment)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 font-medium">
                        Regular Expenses
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">
                        {formatCurrency(
                          summary.expenseBreakdown.regularExpenses
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                No data available for this month
              </div>
            )}
          </>
        ) : (
          /* All Months View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading summaries...
              </div>
            ) : allSummaries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No summaries available
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Month
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Income
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Expenses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Salaries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Profit/Loss
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allSummaries.map((s) => (
                      <tr
                        key={`${s.month}-${s.year}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getMonthName(s.month)} {s.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(s.totalIncome)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(s.totalExpenses)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            {formatCurrency(s.totalSalaries)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-sm font-bold ${
                              s.profit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(Math.abs(s.profit))}
                            {s.profit >= 0 ? " ↑" : " ↓"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfitSummary;
