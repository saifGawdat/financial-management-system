const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    items: [
      {
        name: String,
        quantity: Number,
        unit: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Warehouse", warehouseSchema);
