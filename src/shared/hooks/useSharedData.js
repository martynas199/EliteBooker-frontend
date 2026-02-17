import { useQueries } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import { queryKeys } from "../lib/queryClient";

const SHARED_DATA_DEBUG =
  import.meta.env.DEV && import.meta.env.VITE_SHARED_DATA_DEBUG === "true";

const sharedDataDebug = (...args) => {
  if (SHARED_DATA_DEBUG) {
    console.log(...args);
  }
};

/**
 * Shared hook to prevent duplicate fetches of common admin data
 *
 * This hook provides cached access to specialists and services data that
 * is frequently accessed across multiple admin pages (Staff, Services,
 * Appointments, Dashboard).
 *
 * Performance Benefits:
 * - Eliminates duplicate API calls (reduces 15-20 calls to 4-7 per session)
 * - Caches data with appropriate stale times
 * - Automatic background refetching when stale
 * - Request cancellation on unmount
 *
 * Used by: Staff.jsx, Services.jsx, Appointments.jsx, Dashboard.jsx
 *
 * @returns {Object} Shared data and loading state
 * @returns {Array} specialists - Array of all specialists (cached 10 min)
 * @returns {Array} services - Array of all services (cached 5 min)
 * @returns {boolean} isLoading - True if any query is loading
 * @returns {boolean} isError - True if any query has error
 * @returns {Array} errors - Array of error objects from failed queries
 */
export function useSharedData() {
  const results = useQueries({
    queries: [
      {
        queryKey: queryKeys.specialists.list(),
        queryFn: async ({ signal }) => {
          sharedDataDebug(
            "[useSharedData] Fetching specialists with limit: 1000",
          );
          const response = await api.get("/specialists", {
            params: { limit: 1000 },
            signal, // Enable request cancellation
          });

          // Handle different response formats:
          // 1. Raw array: [...]
          // 2. Paginated: { data: [...], pagination: {...} }
          // 3. Standard API: { success: true, data: [...] }

          if (Array.isArray(response.data)) {
            // Raw array format (no pagination)
            return response.data;
          }

          if (response.data?.data) {
            // Paginated format or standard API format
            return response.data.data;
          }

          // Fallback - shouldn't happen but handle gracefully
          if (SHARED_DATA_DEBUG) {
            console.warn(
              "Unexpected specialists response format:",
              response.data,
            );
          }
          return [];
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - specialists rarely change
        gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes after last use
        retry: 1, // Fast failure for better UX
        refetchOnWindowFocus: false, // Disable aggressive refetching
        refetchOnReconnect: true, // Refetch on reconnect for offline users
        refetchOnMount: "stale", // Only refetch if stale
      },
      {
        queryKey: queryKeys.services.list(),
        queryFn: async ({ signal }) => {
          sharedDataDebug("[useSharedData] Fetching services with limit: 1000");
          const response = await api.get("/services", {
            params: { limit: 1000 },
            signal, // Enable request cancellation
          });

          // Handle different response formats (same as specialists)
          if (Array.isArray(response.data)) {
            // Raw array format
            return response.data;
          }

          if (response.data?.data) {
            // Paginated format or standard API format
            return response.data.data;
          }

          // Fallback
          if (SHARED_DATA_DEBUG) {
            console.warn("Unexpected services response format:", response.data);
          }
          return [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - services change occasionally
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes after last use
        retry: 1, // Fast failure
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: "stale",
      },
    ],
  });

  return {
    specialists: results[0].data || [],
    services: results[1].data || [],
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    errors: results.map((r) => r.error).filter(Boolean),
  };
}
