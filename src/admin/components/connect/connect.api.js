import { api } from "../../../shared/lib/apiClient";

/**
 * Stripe Connect API functions
 */

export const StripeConnectAPI = {
  /**
   * Create onboarding link for a specialist
   */
  createOnboardingLink: async (specialistId, email) => {
    const response = await api.post("/connect/onboard", {
      specialistId,
      email,
    });
    return response.data;
  },

  /**
   * Get Stripe Connect account status for a specialist
   */
  getAccountStatus: async (specialistId) => {
    const response = await api.get(`/connect/status/${specialistId}`);
    return response.data;
  },

  /**
   * Generate Stripe Express dashboard login link
   */
  getDashboardLink: async (specialistId) => {
    const response = await api.post(`/connect/dashboard-link/${specialistId}`);
    return response.data;
  },

  /**
   * Disconnect Stripe account (admin only)
   */
  disconnectAccount: async (specialistId) => {
    const response = await api.delete(`/connect/disconnect/${specialistId}`);
    return response.data;
  },

  /**
   * Get specialist earnings
   */
  getEarnings: async (specialistId, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/reports/specialist-earnings/${specialistId}?${params}`
    );
    return response.data;
  },

  /**
   * Get platform revenue (admin only)
   */
  getPlatformRevenue: async (
    startDate = null,
    endDate = null,
    specialistId = null
  ) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (specialistId) params.append("specialistId", specialistId);

    const response = await api.get(`/reports/revenue?${params}`);
    return response.data;
  },
};

export default StripeConnectAPI;
