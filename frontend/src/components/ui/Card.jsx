import React from "react";

const Card = ({ children, className = "", title, subtitle }) => {
  return (
    <div
      className={`bg-[#1a1d24] rounded-xl border border-white/6 p-6 transition-all duration-150 hover:border-white/10 ${className}`}
    >
      {title && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
