const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
  { timestamps: true }
);

// Index for faster queries
employeeSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
