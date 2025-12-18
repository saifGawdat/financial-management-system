import axios from "./axios";

// Get all employees
export const getEmployees = async () => {
  const response = await axios.get("/employee");
  return response.data;
};

// Get active employees only
export const getActiveEmployees = async () => {
  const response = await axios.get("/employee/active");
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  const response = await axios.get(`/employee/${id}`);
  return response.data;
};

// Create new employee
export const createEmployee = async (employeeData) => {
  const response = await axios.post("/employee", employeeData);
  return response.data;
};

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await axios.put(`/employee/${id}`, employeeData);
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await axios.delete(`/employee/${id}`);
  return response.data;
};

// Add transaction (Bonus/Deduction)
export const addTransaction = async (transactionData) => {
  const response = await axios.post("/employee/transaction", transactionData);
  return response.data;
};

// Get transactions by month
export const getTransactionsByMonth = async (month, year) => {
  const response = await axios.get(`/employee/transaction/${month}/${year}`);
  return response.data;
};

// Delete transaction
export const deleteTransaction = async (id) => {
  const response = await axios.delete(`/employee/transaction/${id}`);
  return response.data;
};
