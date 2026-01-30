import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  salary: number;
  jobTitle: string;
  phoneNumber?: string;
  dateJoined: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

employeeSchema.index({ user: 1, isActive: 1 });
employeeSchema.index({ user: 1, createdAt: -1 });

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
