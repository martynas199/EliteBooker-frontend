import { api } from "../../shared/lib/apiClient";

export const SeminarsAPI = {
  // Public endpoints
  async listPublic(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/seminars/public?${query}` : "/seminars/public";
    const response = await api.get(url);
    return response.data;
  },

  async getPublic(slug) {
    const response = await api.get(`/seminars/public/${slug}`);
    return response.data;
  },

  // Admin endpoints
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/seminars?${query}` : "/seminars";
    const response = await api.get(url);
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/seminars/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/seminars", data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.patch(`/seminars/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/seminars/${id}`);
    return response.data;
  },

  async publish(id) {
    const response = await api.patch(`/seminars/${id}/publish`);
    return response.data;
  },

  async archive(id) {
    const response = await api.patch(`/seminars/${id}/archive`);
    return response.data;
  },

  // Image uploads
  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/seminars/${id}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async uploadImages(id, files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const response = await api.post(`/seminars/${id}/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Booking management
  async getBookings(id) {
    const response = await api.get(`/seminars/${id}/bookings`);
    return response.data;
  },

  async getSessionAttendees(id, sessionId) {
    const response = await api.get(
      `/seminars/${id}/sessions/${sessionId}/attendees`
    );
    return response.data;
  },

  // Client booking endpoints
  async createCheckout(data) {
    const response = await api.post("/seminars/checkout/create-session", data);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get("/seminars/bookings/my-bookings");
    return response.data;
  },

  async getBooking(id) {
    const response = await api.get(`/seminars/bookings/${id}`);
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.patch(`/seminars/bookings/${id}/cancel`);
    return response.data;
  },
};
