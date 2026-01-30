import mongoose, { Document, Schema } from "mongoose";

export interface IExpenseBreakdown {
  Transportation: number;
  Repair: number;
  Equipment: number;
  regularExpenses: number;
}

export interface IIncomeBreakdown {
  monthlyCollections: number;
  advertisingExpenses: number;
}

export interface IMonthlySummary extends Document {
  user: mongoose.Types.ObjectId;
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalSalaries: number;
  profit: number;
  expenseBreakdown: IExpenseBreakdown;
  incomeBreakdown: IIncomeBreakdown;
  createdAt: Date;
  updatedAt: Date;
}

const monthlySummarySchema = new Schema<IMonthlySummary>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
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
      Transportation: { type: Number, default: 0 },
      Repair: { type: Number, default: 0 },
      Equipment: { type: Number, default: 0 },
      regularExpenses: { type: Number, default: 0 },
    },
    incomeBreakdown: {
      monthlyCollections: { type: Number, default: 0 },
      advertisingExpenses: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

monthlySummarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export const MonthlySummary = mongoose.model<IMonthlySummary>(
  "MonthlySummary",
  monthlySummarySchema,
);
