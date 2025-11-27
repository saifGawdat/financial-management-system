const express = require("express");
const auth = require("../middleware/auth");
const warehouseController = require("../controllers/warehouseController");
const router = express.Router();

// @route   POST /api/warehouse
// @desc    Add warehouse
// @access  Private
router.post("/", auth, warehouseController.addWarehouse);

// @route   GET /api/warehouse
// @desc    Get all warehouses
// @access  Private
router.get("/", auth, warehouseController.getWarehouses);

// @route   PUT /api/warehouse/:id
// @desc    Update warehouse
// @access  Private
router.put("/:id", auth, warehouseController.updateWarehouse);

// @route   DELETE /api/warehouse/:id
// @desc    Delete warehouse
// @access  Private
router.delete("/:id", auth, warehouseController.deleteWarehouse);

module.exports = router;
