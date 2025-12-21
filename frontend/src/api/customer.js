import API from "./axios";

export const customerAPI = {
  getAll: async (params) => {
    const response = await API.get("/customer", { params });
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
};

export default customerAPI;
