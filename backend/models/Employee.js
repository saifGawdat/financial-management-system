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

// فهرس لتسريع الاستعلامات الأساسية (البحث حسب المستخدم والحالة النشطة)
// Index for faster queries (search by user and active status)
employeeSchema.index({ user: 1, isActive: 1 });

// فهرس مركب لتحسين أداء الترقيم (Pagination)
// يدعم الفلترة حسب المستخدم والترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
// Compound index for pagination optimization
// Supports filtering by user and sorting by creation date (newest first)
employeeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Employee", employeeSchema);
