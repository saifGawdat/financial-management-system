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
    0
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Monthly Salaries Summary
          </h1>
          <p className="text-gray-600 mt-1">
            View total salaries for each month
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Month/Year Selector */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-2xl shadow-md mb-6 flex md:justify-start border border-gray-100 ">
          <MonthYearSelector
            onSelect={handleMonthYearChange}
            initialMonth={month}
            initialYear={year}
          />
        </div>

        {/* Total Salaries Card */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-3xl shadow-xl mb-6 text-center md:text-left relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-lg md:text-xl opacity-90">
            Total Salaries for {getMonthName(month)} {year}
          </p>
          <p className="text-3xl md:text-5xl font-bold mt-2">
            £{totalSalaries.toLocaleString()}
          </p>
          <p className="text-base md:text-lg opacity-75 mt-1">
            {employees.length} Active Employee
            {employees.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Employee Salaries Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading employees...
            </div>
          ) : employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No active employees found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => {
                    const percentage =
                      totalSalaries > 0
                        ? (employee.salary / totalSalaries) * 100
                        : 0;

                    return (
                      <tr key={employee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {employee.jobTitle}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-blue-600">
                            £{employee.salary.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 mr-2">
                              {percentage.toFixed(1)}%
                            </div>
                            <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-sm font-bold text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-blue-600">
                        £{totalSalaries.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        100%
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {employees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm">Average Salary</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                £{Math.round(totalSalaries / employees.length).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm">Highest Salary</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                £{Math.max(...employees.map((e) => e.salary)).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600 text-sm">Lowest Salary</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">
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
