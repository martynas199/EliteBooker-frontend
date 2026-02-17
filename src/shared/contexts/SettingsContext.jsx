import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { api } from "../lib/apiClient";
import { SalonAPI } from "../../tenant/pages/salon.api";

const SettingsContext = createContext(null);

/**
 * SettingsProvider - Provides salon settings and data globally
 * Prevents duplicate API calls by caching the data
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [salonData, setSalonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadSettings() {
      try {
        setLoading(true);
        const [settingsResponse, salonResponse] = await Promise.all([
          api.get("/settings", { signal: controller.signal }),
          SalonAPI.get({ signal: controller.signal }).catch(() => null),
        ]);

        if (isMounted) {
          setSettings(settingsResponse.data);
          setSalonData(salonResponse);
          setError(null);
        }
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
          return;
        }

        console.error("Failed to load settings:", err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
      controller.abort(); // Cancel request on unmount
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      salonData,
      loading,
      error,
    }),
    [settings, salonData, loading, error],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings and salon data
 * @returns {{ settings, salonData, loading, error }}
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
