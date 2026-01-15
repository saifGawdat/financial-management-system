import React from "react";
import { formatCurrency } from "../../utils/formatters";

const SummaryCard = ({ title, amount, icon: Icon, iconColor, bgGradient }) => {
  return (
    <div
      className={`bg-linear-to-br ${bgGradient} rounded-3xl shadow-2xl p-8 text-white transform hover:scale-105 transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold">{formatCurrency(amount)}</h3>
        </div>
        <div className={`${iconColor} bg-white bg-opacity-20 p-4 rounded-full`}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
