import mongoose, { Document, Schema } from "mongoose";

export interface IExpenseCategory extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  month: number;
  year: number;
  description?: string;
  createdAt: Date;
}

const expenseCategorySchema = new Schema<IExpenseCategory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

expenseCategorySchema.index({ user: 1, month: 1, year: 1 });

export const ExpenseCategory = mongoose.model<IExpenseCategory>(
  "ExpenseCategory",
  expenseCategorySchema,
);
