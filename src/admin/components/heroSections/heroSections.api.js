import { api } from "../../../shared/lib/apiClient";

export const HeroSectionsAPI = {
  list: () => api.get("/hero-sections").then((r) => r.data),

  get: (id) => api.get(`/hero-sections/${id}`).then((r) => r.data),

  create: (data) => api.post("/hero-sections", data).then((r) => r.data),

  update: (id, data) =>
    api.patch(`/hero-sections/${id}`, data).then((r) => r.data),

  delete: (id) => api.delete(`/hero-sections/${id}`).then((r) => r.data),

  uploadCenterImage: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api
      .post(`/hero-sections/${id}/upload-center-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  uploadRightImage: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api
      .post(`/hero-sections/${id}/upload-right-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
