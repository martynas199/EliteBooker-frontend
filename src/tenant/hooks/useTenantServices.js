import { useQuery } from "@tanstack/react-query";
import { ServicesAPI } from "../pages/services.api";

/**
 * Query keys for services
 */
export const servicesKeys = {
  all: ["tenant", "services"],
  lists: () => [...servicesKeys.all, "list"],
  list: (filters) => [...servicesKeys.lists(), filters],
  details: () => [...servicesKeys.all, "detail"],
  detail: (id) => [...servicesKeys.details(), id],
};

/**
 * Hook to fetch all services with caching
 * Cached for 5-10 minutes since services change infrequently
 *
 * @param {Object} options - Query options
 * @param {Object} options.filters - Optional filters (e.g., { specialistId: "123" })
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with { data: services[], isLoading, error, ... }
 */
export function useTenantServices(options = {}) {
  const { filters = {}, enabled = true } = options;

  return useQuery({
    queryKey: servicesKeys.list(filters),
    queryFn: async ({ signal }) => {
      const services = await ServicesAPI.list({ signal });

      // Apply client-side filters if provided
      if (filters.specialistId) {
        return services.filter(
          (service) =>
            service.specialistId === filters.specialistId ||
            (service.beauticianIds || []).includes(filters.specialistId),
        );
      }

      return services;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled,
    retry: 2,
  });
}

/**
 * Hook to fetch a single service by ID with caching
 *
 * @param {string} serviceId - Service ID
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Whether query should run
 * @returns {Object} Query result with { data: service, isLoading, error, ... }
 */
export function useTenantService(serviceId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: servicesKeys.detail(serviceId),
    queryFn: ({ signal }) => ServicesAPI.get(serviceId, { signal }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: enabled && !!serviceId,
    retry: 2,
  });
}
