import axios from "./axios";

// الحصول على الإيرادات مع دعم الترقيم (Pagination)
// Get incomes with pagination support
export const getIncomes = async (month, year, page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (month) params.append("month", month);
  if (year) params.append("year", year);

  const response = await axios.get(`/income?${params.toString()}`);
  return response.data; // يحتوي على data و pagination
};
