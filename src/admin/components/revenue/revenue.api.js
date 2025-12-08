import { api } from "../../../shared/lib/apiClient";

export const RevenueAPI = {
  /**
   * Get revenue analytics for a date range
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Revenue data with specialists array
   */
  async getRevenue(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await api.get(`/revenue?${params}`);
    return res.data;
  },

  /**
   * Get platform revenue with Stripe Connect fees
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Platform revenue with Connect breakdown
   */
  async getPlatformRevenue(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await api.get(`/reports/revenue?${params}`);
    return res.data;
  },

  /**
   * Get specialist earnings from Stripe Connect
   * @param {string} beauticianId - Beautician ID
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate - YYYY-MM-DD
   * @returns {Promise<Object>} Beautician earnings breakdown
   */
  async getBeauticianEarnings(beauticianId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await api.get(
      `/reports/specialist-earnings/${beauticianId}?${params}`
    );
    return res.data;
  },
};
