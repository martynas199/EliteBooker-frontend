import { api } from "../../shared/lib/apiClient";
export const BookingAPI = {
  reserveWithoutPayment: async (b) => (await api.post("/appointments", b)).data,
  getOne: async (id) => (await api.get(`/appointments/${id}`)).data,
};

