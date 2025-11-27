import React from "react";
import { IoTrash } from "react-icons/io5";
import { formatCurrency, formatDate } from "../../utils/formatters";

const TransactionList = ({ transactions, onDelete, type }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No {type} found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow group"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{transaction.title}</h4>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-500">
                {transaction.category}
              </span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                {formatDate(transaction.date)}
              </span>
            </div>
            {transaction.description && (
              <p className="text-sm text-gray-600 mt-1">
                {transaction.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`text-lg font-bold ${
                type === "income" ? "text-green-600" : "text-red-600"
              }`}
            >
              {type === "income" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </span>
            <button
              onClick={() => onDelete(transaction._id)}
              className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
            >
              <IoTrash size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
