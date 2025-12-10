import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Expense Tracker
          </h1>
          <p className="text-blue-100">Manage your finances with ease</p>
        </div>
        <div className=" bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
