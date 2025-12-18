const Employee = require("../models/Employee");

// Get all employees for the authenticated user
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ user: req.userId }).sort({
      createdAt: -1,
    });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get active employees only
const getActiveEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      user: req.userId,
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    console.error("Error fetching active employees:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { name, salary, jobTitle, phoneNumber, dateJoined } = req.body;

    // Validation
    if (!name || !salary || !jobTitle) {
      return res.status(400).json({
        message: "Please provide name, salary, and job title",
      });
    }

    if (salary < 0) {
      return res.status(400).json({
        message: "Salary cannot be negative",
      });
    }

    const employee = new Employee({
      user: req.userId,
      name,
      salary,
      jobTitle,
      phoneNumber,
      dateJoined: dateJoined || Date.now(),
    });

    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { name, salary, jobTitle, phoneNumber, dateJoined, isActive } =
      req.body;

    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update fields if provided
    if (name !== undefined) employee.name = name;
    if (salary !== undefined) {
      if (salary < 0) {
        return res.status(400).json({ message: "Salary cannot be negative" });
      }
      employee.salary = salary;
    }
    if (jobTitle !== undefined) employee.jobTitle = jobTitle;
    if (phoneNumber !== undefined) employee.phoneNumber = phoneNumber;
    if (dateJoined !== undefined) employee.dateJoined = dateJoined;
    if (isActive !== undefined) employee.isActive = isActive;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete employee (soft delete)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Soft delete
    employee.isActive = false;
    await employee.save();

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Transaction Management
const EmployeeTransaction = require("../models/EmployeeTransaction");
const { calculateMonthlySummary } = require("./monthlySummaryController");

// Add transaction (bonus/deduction)
const addTransaction = async (req, res) => {
  try {
    const { employeeId, type, amount, month, year, description } = req.body;

    if (!employeeId || !type || !amount || !month || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const employee = await Employee.findOne({
      _id: employeeId,
      user: req.userId,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const transaction = new EmployeeTransaction({
      user: req.userId,
      employee: employeeId,
      type,
      amount,
      month,
      year,
      description,
    });

    await transaction.save();

    // Trigger summary recalculation
    await calculateMonthlySummary(req.userId, month, year);

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transactions for a month
const getTransactionsByMonth = async (req, res) => {
  try {
    const { month, year } = req.params;

    const transactions = await EmployeeTransaction.find({
      user: req.userId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate("employee", "name");

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await EmployeeTransaction.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Adjustment not found" });
    }

    const { month, year } = transaction;
    const userId = req.userId;

    await EmployeeTransaction.findByIdAndDelete(req.params.id);

    // Trigger summary recalculation
    await calculateMonthlySummary(userId, month, year);

    res.json({ message: "Adjustment deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getEmployees,
  getActiveEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addTransaction,
  getTransactionsByMonth,
  deleteTransaction,
};
