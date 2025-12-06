import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Tenant Settings Store
 * Manages feature flags and configuration settings
 */
const useTenantSettingsStore = create(
  persist(
    (set, get) => ({
      // Feature flags
      featureFlags: {
        smsConfirmations: false,
        smsReminders: false,
        onlinePayments: true,
        bookingFee: false,
        ecommerce: false,
        emailNotifications: true,
      },

      // Gateway connections
      smsGatewayConnected: false,
      stripeConnected: true,

      // E-commerce state
      ecommerceEnabled: false,

      // Loading state
      loading: false,

      /**
       * Update a single feature flag
       * @param {string} feature - Feature flag name
       * @param {boolean} value - New value
       */
      updateFeatureFlag: async (feature, value) => {
        set({ loading: true });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 300));

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
          throw error;
        }
      },

      /**
       * Load tenant settings from API
       */
      loadSettings: async () => {
        set({ loading: true });

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 500));

          // In production, this would fetch from your API:
          // const response = await fetch('/api/tenant/settings');
          // const data = await response.json();

          set({
            loading: false,
          });
        } catch (error) {
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
            onlinePayments: true,
            bookingFee: false,
            ecommerce: false,
            emailNotifications: true,
          },
          smsGatewayConnected: false,
          stripeConnected: true,
          ecommerceEnabled: false,
        });
      },
    }),
    {
      name: "tenant-settings-storage",
      partialize: (state) => ({
        featureFlags: state.featureFlags,
        ecommerceEnabled: state.ecommerceEnabled,
      }),
    }
  )
);

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
    loading: store.loading,
    updateFeatureFlag: store.updateFeatureFlag,
    loadSettings: store.loadSettings,
    reset: store.reset,
  };
};

export default useTenantSettingsStore;
