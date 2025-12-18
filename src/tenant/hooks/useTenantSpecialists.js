import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/lib/apiClient";

/**
 * Query keys for specialists
 */
export const specialistsKeys = {
  all: ["tenant", "specialists"],
  lists: () => [...specialistsKeys.all, "list"],
  list: (filters) => [...specialistsKeys.lists(), filters],
  details: () => [...specialistsKeys.all, "detail"],
  detail: (id) => [...specialistsKeys.details(), id],
};

/**
 * Hook to fetch all specialists with caching
 * Cached for 10 minutes since specialist data changes infrequently
 *
 * @param {Object} options - Query options
 * @param {boolean} options.activeOnly - Filter only active specialists (default: true)
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with { data: specialists[], isLoading, error, ... }
 */
export function useTenantSpecialists(options = {}) {
  const { activeOnly = true, enabled = true } = options;

  return useQuery({
    queryKey: specialistsKeys.list({ activeOnly }),
    queryFn: async () => {
      const response = await api.get("/specialists");
      const specialists = response.data;

      // Filter active specialists if requested
      if (activeOnly) {
        return specialists.filter((s) => s.active);
      }

      return specialists;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled,
    retry: 2,
  });
}

/**
 * Hook to fetch a single specialist by ID with caching
 *
 * @param {string} specialistId - Specialist ID
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with { data: specialist, isLoading, error, ... }
 */
export function useTenantSpecialist(specialistId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: specialistsKeys.detail(specialistId),
    queryFn: async () => {
      const response = await api.get(`/specialists/${specialistId}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: enabled && !!specialistId,
    retry: 2,
  });
}
