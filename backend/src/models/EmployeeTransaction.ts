import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "BONUS" | "DEDUCTION";

export interface IEmployeeTransaction extends Document {
  user: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  month: number;
  year: number;
  description?: string;
  createdAt: Date;
}

const employeeTransactionSchema = new Schema<IEmployeeTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
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
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

employeeTransactionSchema.index({ user: 1, month: 1, year: 1 });

export const EmployeeTransaction = mongoose.model<IEmployeeTransaction>(
  "EmployeeTransaction",
  employeeTransactionSchema,
);
