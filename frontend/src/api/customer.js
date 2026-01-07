import API from "./axios";

export const customerAPI = {
  getCustomers: async (month, year, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (month) params.append("month", month);
    if (year) params.append("year", year);

    const response = await API.get(`/customer?${params.toString()}`);
    return response.data;
  },

  create: async (customerData) => {
    const response = await API.post("/customer", customerData);
    return response.data;
  },

  pay: async (id, month, year) => {
    const response = await API.post(`/customer/pay/${id}`, { month, year });
    return response.data;
  },

  unpay: async (id, month, year) => {
    const response = await API.post(`/customer/unpay/${id}`, { month, year });
    return response.data;
  },

  delete: async (id) => {
    const response = await API.delete(`/customer/${id}`);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await API.put(`/customer/${id}`, customerData);
    return response.data;
  },
};

export default customerAPI;
