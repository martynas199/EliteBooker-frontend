import { create } from "zustand";
import { api } from "../lib/apiClient";

/**
 * Get current admin info from API
 * Returns admin data including tenantId
 */
const getCurrentAdmin = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data.admin;
  } catch (error) {
    console.error("Failed to get current admin:", error);
    throw error;
  }
};

/**
 * Tenant Settings Store
 * Manages feature flags and configuration settings in memory
 * Data is loaded from database on demand and kept in memory for performance
 */
const useTenantSettingsStore = create((set, get) => ({
  // Feature flags
  featureFlags: {
    smsConfirmations: false,
    smsReminders: false,
    giftCards: false,
    onlinePayments: true,
    ecommerce: false,
    emailNotifications: true,
    multiLocation: false,
    seminars: false,
    payOnTap: true, // Tap to Pay feature - now enabled by default
  },

  // Gateway connections
  smsGatewayConnected: false,
  stripeConnected: true,

  // E-commerce state
  ecommerceEnabled: false,

  // Tenant ID
  tenantId: null,

  // Loading state
  loading: false,

  /**
   * Update a single feature flag
   * @param {string} feature - Feature flag name
   * @param {boolean} value - New value
   * @param {string} tenantId - Tenant ID (optional, will use stored if not provided)
   */
  updateFeatureFlag: async (feature, value, tenantId = null) => {
    set({ loading: true });

    try {
      // Use provided tenantId or get from store
      const finalTenantId = tenantId || get().tenantId;

      if (!finalTenantId) {
        console.error("[TenantSettings] No tenantId available");
        throw new Error("Tenant ID required");
      }

      console.log("[TenantSettings] Using tenantId:", finalTenantId);

      // Map frontend feature names to backend schema
      const featureMapping = {
        ecommerce: "enableProducts",
        giftCards: "enableGiftCards",
        // Add more mappings as needed
      };

      const backendFeatureName = featureMapping[feature] || feature;

      console.log("[TenantSettings] Updating feature:", {
        frontendName: feature,
        backendName: backendFeatureName,
        value: value,
        tenantId: finalTenantId,
      });

      // Update tenant features in database
      const updateResponse = await api.put(`/tenants/${finalTenantId}`, {
        features: {
          [backendFeatureName]: value,
        },
      });

      console.log("[TenantSettings] Update response:", updateResponse.data);

      set((state) => ({
        featureFlags: {
          ...state.featureFlags,
          [feature]: value,
        },
        // Special handling for ecommerce flag
        ecommerceEnabled:
          feature === "ecommerce" ? value : state.ecommerceEnabled,
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ loading: false });
      console.error("[TenantSettings] Failed to update feature flag:", error);
      console.error("[TenantSettings] Error response:", error.response?.data);
      console.error("[TenantSettings] Error status:", error.response?.status);
      throw error;
    }
  },

  /**
   * Load tenant settings from API
   */
  loadSettings: async () => {
    set({ loading: true });

    try {
      // Get current admin info from API
      const admin = await getCurrentAdmin();

      if (!admin || !admin.tenantId) {
        set({ loading: false });
        return;
      }

      const tenantId = admin.tenantId;

      const response = await api.get(`/tenants/${tenantId}`);

      const tenant = response.data.tenant || response.data;

      // Map backend features to frontend flags
      const features = tenant.features || {};

      console.log("[TenantSettings] Loaded features from DB:", features);

      set({
        featureFlags: {
          smsConfirmations: features.smsConfirmations === true,
          smsReminders: features.smsReminders === true,
          giftCards: features.enableGiftCards === true,
          onlinePayments: features.onlinePayments === true,
          ecommerce: features.enableProducts === true,
          emailNotifications: features.emailNotifications === true,
          multiLocation: features.multiLocation === true,
          seminars: features.seminars !== false,
          payOnTap: features.payOnTap !== false,
        },
        ecommerceEnabled: features.enableProducts === true,
        tenantId: tenant._id,
        loading: false,
      });

      console.log("[TenantSettings] Set feature flags:", {
        smsConfirmations: features.smsConfirmations === true,
        smsReminders: features.smsReminders === true,
        giftCards: features.enableGiftCards === true,
        onlinePayments: features.onlinePayments === true,
        ecommerce: features.enableProducts === true,
        emailNotifications: features.emailNotifications === true,
        multiLocation: features.multiLocation === true,
        seminars: features.seminars !== false,
        payOnTap: features.payOnTap !== false,
      });
    } catch (error) {
      console.error("Failed to load tenant settings:", error);
      set({ loading: false });
      throw error;
    }
  },

  /**
   * Reset to defaults
   */
  reset: () => {
    set({
      featureFlags: {
        smsConfirmations: false,
        smsReminders: false,
        giftCards: false,
        onlinePayments: true,
        ecommerce: false,
        emailNotifications: true,
        multiLocation: false,
        seminars: true,
        payOnTap: true,
      },
      smsGatewayConnected: false,
      stripeConnected: true,
      ecommerceEnabled: false,
    });
  },
}));

/**
 * Custom hook for accessing tenant settings
 */
export const useTenantSettings = () => {
  const store = useTenantSettingsStore();

  return {
    featureFlags: store.featureFlags,
    smsGatewayConnected: store.smsGatewayConnected,
    stripeConnected: store.stripeConnected,
    ecommerceEnabled: store.ecommerceEnabled,
    multiLocation: store.featureFlags.multiLocation,
    seminarsEnabled: store.featureFlags.seminars,
    payOnTapEnabled: store.featureFlags.payOnTap,
    loading: store.loading,
    updateFeatureFlag: store.updateFeatureFlag,
    loadSettings: store.loadSettings,
    reset: store.reset,
  };
};

export default useTenantSettingsStore;
