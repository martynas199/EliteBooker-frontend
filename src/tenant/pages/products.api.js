import { api } from "../../shared/lib/apiClient";

export const ProductsAPI = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/products?${query}` : "/products";
    const response = await api.get(url);
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post("/products", data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/products/${id}/upload-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async uploadImages(id, files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const response = await api.post(`/products/${id}/upload-images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteImage(id, imageIndex) {
    const response = await api.delete(`/products/${id}/images/${imageIndex}`);
    return response.data;
  },
};
