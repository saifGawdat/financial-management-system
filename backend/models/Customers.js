const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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

module.exports = mongoose.model("Customer", customerSchema);
