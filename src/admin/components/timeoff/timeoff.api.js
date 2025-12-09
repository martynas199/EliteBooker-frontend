import { api } from "../../../shared/lib/apiClient";

export const TimeOffAPI = {
  /**
   * Get all time-off periods
   */
  async getAll() {
    const response = await api.get("/timeoff");
    return response.data;
  },

  /**
   * Add a new time-off period
   */
  async create(data) {
    const response = await api.post("/timeoff", data);
    return response.data;
  },

  /**
   * Delete a time-off period
   */
  async delete(specialistId, timeOffId) {
    const response = await api.delete(`/timeoff/${specialistId}/${timeOffId}`);
    return response.data;
  },
};
