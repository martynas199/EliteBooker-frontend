import { api } from "../../shared/lib/apiClient";

export const OrdersAPI = {
  async create(data) {
    const response = await api.post("/orders", data);
    return response.data;
  },

  async createCheckout(data) {
    const response = await api.post("/orders/checkout", data);
    return response.data;
  },

  async confirmCheckout(sessionId, orderId) {
    const response = await api.get(
      `/orders/confirm-checkout?session_id=${sessionId}&orderId=${orderId}`
    );
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async getByOrderNumber(orderNumber) {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/orders?${query}` : "/orders";
    const response = await api.get(url);
    return response.data;
  },

  async update(id, data) {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  async cancel(id) {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  async markReadyForCollection(id) {
    const response = await api.patch(`/orders/${id}/ready-for-collection`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};
