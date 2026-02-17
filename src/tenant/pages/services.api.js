import { api } from "../../shared/lib/apiClient";

export const ServicesAPI = {
  list: async (options = {}) => {
    const response = await api.get("/services", {
      signal: options.signal,
      params: options.params,
    });
    return response.data;
  },
  get: async (id, options = {}) => {
    const response = await api.get(`/services/${id}`, {
      signal: options.signal,
    });
    return response.data;
  },
};
