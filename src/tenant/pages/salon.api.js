import { api } from "../../shared/lib/apiClient";
export const SalonAPI = {
  get: async (options = {}) =>
    (
      await api.get("/salon", {
        signal: options.signal,
      })
    ).data,
};
