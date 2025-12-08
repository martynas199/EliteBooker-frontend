import { api } from "../../../shared/lib/apiClient";

/**
 * Stripe Connect API functions
 */

export const StripeConnectAPI = {
  /**
   * Create onboarding link for a specialist
   */
  createOnboardingLink: async (beauticianId, email) => {
    const response = await api.post("/connect/onboard", {
      beauticianId,
      email,
    });
    return response.data;
  },

  /**
   * Get Stripe Connect account status for a specialist
   */
  getAccountStatus: async (beauticianId) => {
    const response = await api.get(`/connect/status/${beauticianId}`);
    return response.data;
  },

  /**
   * Generate Stripe Express dashboard login link
   */
  getDashboardLink: async (beauticianId) => {
    const response = await api.post(`/connect/dashboard-link/${beauticianId}`);
    return response.data;
  },

  /**
   * Disconnect Stripe account (admin only)
   */
  disconnectAccount: async (beauticianId) => {
    const response = await api.delete(`/connect/disconnect/${beauticianId}`);
    return response.data;
  },

  /**
   * Get specialist earnings
   */
  getEarnings: async (beauticianId, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/specialist-earnings/${beauticianId}?${params}`
    );
    return response.data;
  },

  /**
   * Get platform revenue (admin only)
   */
  getPlatformRevenue: async (
    startDate = null,
    endDate = null,
    beauticianId = null
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (beauticianId) params.append("beauticianId", beauticianId);

    const response = await api.get(`/reports/revenue?${params}`);
    return response.data;
  },
};

export default StripeConnectAPI;
