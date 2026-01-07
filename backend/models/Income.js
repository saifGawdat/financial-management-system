const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: 0,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    default: "Other",
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// فهرس مركب لتحسين أداء الترقيم (Pagination)
// Compound index for pagination optimization
incomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Income", incomeSchema);
