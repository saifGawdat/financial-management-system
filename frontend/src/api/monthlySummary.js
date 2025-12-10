import axios from "./axios";

// Get all monthly summaries
export const getAllMonthlySummaries = async () => {
  const response = await axios.get("/monthly-summary");
  return response.data;
};

// Get monthly summary for specific month
export const getMonthlySummary = async (month, year) => {
  const response = await axios.get(`/monthly-summary/${month}/${year}`);
  return response.data;
};

// Recalculate monthly summary
export const recalculateMonthlySummary = async (month, year) => {
  const response = await axios.post(
    `/monthly-summary/recalculate/${month}/${year}`
  );
  return response.data;
};
