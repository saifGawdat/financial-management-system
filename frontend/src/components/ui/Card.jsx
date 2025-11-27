import React from "react";

const Card = ({ children, className = "", title, subtitle }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
