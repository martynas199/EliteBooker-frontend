import { useQuery } from "@tanstack/react-query";
import { SalonAPI } from "../pages/salon.api";

/**
 * Query keys for salon/settings
 */
export const salonKeys = {
  all: ["tenant", "salon"],
  details: () => [...salonKeys.all, "details"],
};

/**
 * Hook to fetch salon/settings data with caching
 * Cached for 10-30 minutes since salon settings change very infrequently
 *
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with { data: salon, isLoading, error, ... }
 */
export function useSalon(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: salonKeys.details(),
    queryFn: ({ signal }) => SalonAPI.get({ signal }),
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled,
    retry: 2,
  });
}
