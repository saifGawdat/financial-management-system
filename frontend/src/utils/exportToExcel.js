import * as XLSX from "xlsx";

export const exportToExcel = (
  data,
  filename = "export.xlsx",
  sheetName = "Data"
) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate and download file
  XLSX.writeFile(workbook, filename);
};

export const exportIncomeToExcel = (incomes) => {
  const data = incomes.map((income) => ({
    Title: income.title,
    Amount: income.amount,
    Category: income.category,
    Date: new Date(income.date).toLocaleDateString(),
    Description: income.description || "-",
  }));

  exportToExcel(data, "income-report.xlsx", "Income");
};

export const exportExpenseToExcel = (expenses) => {
  const data = expenses.map((expense) => ({
    Title: expense.title,
    Amount: expense.amount,
    Category: expense.category,
    Date: new Date(expense.date).toLocaleDateString(),
    Description: expense.description || "-",
  }));

  exportToExcel(data, "expense-report.xlsx", "Expenses");
};
