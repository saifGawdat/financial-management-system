import React from "react";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { IoArrowUp, IoArrowDown } from "react-icons/io5";

const RecentTransactions = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 min-w-full">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow " 
        >
          <div className="flex items-center gap-3 ">
            <div
              className={`p-2 rounded-full ${
                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {transaction.type === "income" ? (
                <IoArrowUp className="text-green-600" size={20} />
              ) : (
                <IoArrowDown className="text-red-600" size={20} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">
                {transaction.title}
              </h4>
              <p className="text-sm text-gray-500">
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
          <span
            className={`text-lg font-bold ${
              transaction.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;
