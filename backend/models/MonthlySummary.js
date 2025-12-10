const mongoose = require("mongoose");

const monthlySummarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be between 1 and 12"],
      max: [12, "Month must be between 1 and 12"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Year must be 2000 or later"],
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    totalSalaries: {
      type: Number,
      default: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
    expenseBreakdown: {
      Transportation: {
        type: Number,
        default: 0,
      },
      Repair: {
        type: Number,
        default: 0,
      },
      Equipment: {
        type: Number,
        default: 0,
      },
      regularExpenses: {
        type: Number,
        default: 0,
      },
    },
    incomeBreakdown: {
      monthlyCollections: {
        type: Number,
        default: 0,
      },
      advertisingExpenses: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

// Unique constraint: one summary per user per month/year
monthlySummarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("MonthlySummary", monthlySummarySchema);
