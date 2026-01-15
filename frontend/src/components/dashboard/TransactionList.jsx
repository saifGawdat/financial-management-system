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
    <div className="space-y-3 w-full">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="flex flex-col  sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow group gap-4"
        >
          <div className="flex-1 w-full">
            <h4 className="font-semibold text-gray-800 break-words">
              {transaction.title}
            </h4>
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
              <p className="text-sm text-gray-600 mt-1 break-words">
                {transaction.description}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
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
              className="text-gray-400 hover:text-red-600 sm:opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-full"
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
