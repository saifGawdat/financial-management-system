import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-2 tracking-tight">
            Financial Management System
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Manage your finances with ease
          </p>
        </div>
        <div className="bg-[#1a1d24] border border-white/6 rounded-xl shadow-xl p-6 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
