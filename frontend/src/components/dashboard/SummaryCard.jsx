import React from "react";
import { formatCurrency } from "../../utils/formatters";

const SummaryCard = ({ title, amount, icon: Icon, iconColor, bgGradient }) => {
  return (
    <div
      className={`bg-gradient-to-br ${bgGradient} rounded-xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold">{formatCurrency(amount)}</h3>
        </div>
        <div className={`${iconColor} bg-white bg-opacity-20 p-4 rounded-full`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
