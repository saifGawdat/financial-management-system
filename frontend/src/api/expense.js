import axios from "./axios";

// الحصول على المصاريف مع دعم الترقيم (Pagination)
// Get expenses with pagination support
export const getExpenses = async (month, year, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (month) params.append("month", month);
  if (year) params.append("year", year);

  const response = await axios.get(`/expense?${params.toString()}`);
  return response.data; // يحتوي على data و pagination
};

// ملفات الإضافة والحذف موجودة بالفعل بشكل مضمن في المكونات أو في ملفات أخرى
// Add and delete functions are currently handled inline or in other files
