import { useState } from "react";

const MonthYearSelector = ({ onSelect, initialMonth, initialYear }) => {
  const currentDate = new Date();
  const [month, setMonth] = useState(
    initialMonth || currentDate.getMonth() + 1
  );
  const [year, setYear] = useState(initialYear || currentDate.getFullYear());

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [];
  for (let i = 2020; i <= currentDate.getFullYear() + 1; i++) {
    years.push(i);
  }

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    setMonth(newMonth);
    if (onSelect) {
      onSelect(newMonth, year);
    }
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setYear(newYear);
    if (onSelect) {
      onSelect(month, newYear);
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="flex flex-col justify-center items-center ">
        <label className="text-sm font-medium text-gray-700 mb-1">Month</label>
        <select
          value={month}
          onChange={handleMonthChange}
          className="px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 mb-1">Year</label>
        <select
          value={year}
          onChange={handleYearChange}
          className="px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthYearSelector;
