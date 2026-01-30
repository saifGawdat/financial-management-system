import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  brandName?: string;
  phoneNumber: string;
  monthlyAmount: number;
  lastPaidDate?: Date;
  paymentDeadline?: Date;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Customer name is required"],
    trim: true,
  },
  brandName: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  monthlyAmount: {
    type: Number,
    required: [true, "Monthly amount is required"],
    min: 0,
  },
  lastPaidDate: {
    type: Date,
    default: null,
  },
  paymentDeadline: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

customerSchema.index({ user: 1, createdAt: -1 });

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
