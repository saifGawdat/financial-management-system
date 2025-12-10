const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getEmployees,
  getActiveEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// All routes require authentication
router.use(auth);

// @route   GET /api/employee
// @desc    Get all employees
router.get("/", getEmployees);

// @route   GET /api/employee/active
// @desc    Get active employees only
router.get("/active", getActiveEmployees);

// @route   GET /api/employee/:id
// @desc    Get employee by ID
router.get("/:id", getEmployeeById);

// @route   POST /api/employee
// @desc    Create new employee
router.post("/", createEmployee);

// @route   PUT /api/employee/:id
// @desc    Update employee
router.put("/:id", updateEmployee);

// @route   DELETE /api/employee/:id
// @desc    Delete employee (soft delete)
router.delete("/:id", deleteEmployee);

module.exports = router;
