import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import MonthYearSelector from "../../components/ui/MonthYearSelector";
import { getActiveEmployees } from "../../api/employee";

const MonthlySalaries = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getActiveEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleMonthYearChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
  };

  const totalSalaries = employees.reduce(
    (sum, emp) => sum + Number(emp.salary || 0),
    0,
  );

  const getMonthName = (monthNum) => {
    return new Date(2000, monthNum - 1).toLocaleDateString("en-US", {
      month: "long",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">
            Monthly Salaries Summary
          </h1>
          <p className="text-gray-400 mt-1">
            View total salaries for each month
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="bg-[#1a1d24] p-4 md:p-6 rounded-2xl border border-white/6 shadow-lg mb-6 flex md:justify-start">
          <MonthYearSelector
            onSelect={handleMonthYearChange}
            initialMonth={month}
            initialYear={year}
          />
        </div>

        {/* Total Salaries Card */}
        <div className="bg-[#1a1d24] p-8 md:p-10 rounded-2xl border border-white/6 shadow-xl mb-6 text-center md:text-left relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none"></div>
          <p className="text-lg md:text-xl text-gray-400 relative z-10 font-medium">
            Total Salaries for {getMonthName(month)} {year}
          </p>
          <p className="text-4xl md:text-6xl font-black text-blue-400 mt-2 tracking-tight relative z-10">
            £{totalSalaries.toLocaleString()}
          </p>
          <div className="mt-4 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold uppercase tracking-wider relative z-10">
            {employees.length} Active Employee
            {employees.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Employee Salaries Table */}
        <div className="bg-[#1a1d24] rounded-2xl border border-white/6 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400 font-medium">Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center text-gray-500 italic">
              No active employees found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/6 text-center">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Monthly Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Percentage of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6 text-center">
                  {employees.map((employee) => {
                    const percentage =
                      totalSalaries > 0
                        ? (employee.salary / totalSalaries) * 100
                        : 0;

                    return (
                      <tr
                        key={employee._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="text-sm font-semibold text-gray-200">
                            {employee.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="text-sm text-gray-400">
                            {employee.jobTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="text-sm font-bold text-blue-400">
                            £{employee.salary.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-xs font-bold text-gray-400 mr-3 w-10">
                              {percentage.toFixed(1)}%
                            </div>
                            <div className="w-24 bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-white/5 font-bold">
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-sm text-gray-200">
                      Total
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-blue-400">
                        £{totalSalaries.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-200">100%</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {employees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-[#1a1d24] p-6 rounded-2xl border border-white/6 shadow-lg flex flex-col items-center text-center">
              <p className="text-gray-500 text-sm font-medium">
                Average Salary
              </p>
              <p className="text-3xl font-bold text-gray-100 mt-2">
                £{Math.round(totalSalaries / employees.length).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1a1d24] p-6 rounded-2xl border border-white/6 shadow-lg flex flex-col items-center text-center">
              <p className="text-gray-500 text-sm font-medium">
                Highest Salary
              </p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                £{Math.max(...employees.map((e) => e.salary)).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1a1d24] p-6 rounded-2xl border border-white/6 shadow-lg flex flex-col items-center text-center">
              <p className="text-gray-500 text-sm font-medium">Lowest Salary</p>
              <p className="text-3xl font-bold text-gray-300 mt-2">
                £{Math.min(...employees.map((e) => e.salary)).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MonthlySalaries;
