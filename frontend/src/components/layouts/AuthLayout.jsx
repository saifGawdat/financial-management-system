import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            Financial Management System
          </h1>
          <p className="text-blue-100/80 text-sm md:text-base">
            Manage your finances with ease
          </p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 ">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
