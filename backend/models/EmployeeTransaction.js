const mongoose = require("mongoose");

const employeeTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["BONUS", "DEDUCTION"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for efficiently fetching transactions for a specific employee in a specific month
employeeTransactionSchema.index({ user: 1, employee: 1, month: 1, year: 1 });
employeeTransactionSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model(
  "EmployeeTransaction",
  employeeTransactionSchema
);
