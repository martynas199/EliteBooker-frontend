import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import {
  queryKeys,
  mutationErrorHandler,
  mutationSuccessHandler,
} from "../lib/queryClient";

// ============================================================================
// SERVICES QUERIES - OPTIMIZED FOR PERFORMANCE
// ============================================================================

/**
 * Hook to fetch all services - PERFORMANCE OPTIMIZED
 */
export const useServices = () => {
  return useQuery({
    queryKey: queryKeys.services.list(),
    queryFn: async () => {
      // Fetch all services without limit for admin panel
      console.log("[useServices] Fetching services with limit: 1000");
      const response = await api.get("/services", {
        params: { limit: 1000 }, // High limit to get all services
      });

      console.log("[useServices] Raw response:", response.data);

      // Handle different response formats:
      // 1. Paginated: { data: [...], pagination: {...} }
      // 2. Raw array: [...]
      // 3. Standard API: { success: true, data: [...] }

      if (Array.isArray(response.data)) {
        // Raw array format (no pagination)
        console.log(
          "[useServices] Returning array format, count:",
          response.data.length
        );
        return response.data;
      }

      if (response.data?.data) {
        // Paginated format or standard API format
        console.log(
          "[useServices] Returning data format, count:",
          response.data.data.length
        );
        return response.data.data;
      }

      // Fallback - shouldn't happen but handle gracefully
      console.warn("Unexpected services response format:", response.data);
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for admin performance
    gcTime: 8 * 60 * 1000, // 8 minutes cache
    retry: 1, // Fast failure

    // Performance optimizations - disable aggressive refetching
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: "stale", // Only refetch if stale
  });
};

/**
 * Hook to fetch single service by ID - PERFORMANCE OPTIMIZED
 */
export const useService = (serviceId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.services.byId(serviceId),
    queryFn: async () => {
      if (!serviceId) throw new Error("Service ID is required");

      const response = await api.get(`/services/${serviceId}`);

      // Handle different response formats:
      // Single service endpoint returns the service object directly
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Check if it's wrapped in a success response
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // Direct service object
        return response.data;
      }

      throw new Error("Invalid service response format");
    },
    enabled: !!serviceId && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // Individual services are more stable
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// BEAUTICIANS QUERIES - PERFORMANCE OPTIMIZED
// ============================================================================

/**
 * Hook to fetch all beauticians - PERFORMANCE OPTIMIZED
 */
export const useBeauticians = () => {
  return useQuery({
    queryKey: queryKeys.beauticians.list(),
    queryFn: async () => {
      // Fetch all beauticians without limit for admin panel
      console.log("[useBeauticians] Fetching beauticians with limit: 1000");
      const response = await api.get("/beauticians", {
        params: { limit: 1000 }, // High limit to get all beauticians
      });

      console.log("[useBeauticians] Raw response:", response.data);

      // Handle different response formats (same as services)
      if (Array.isArray(response.data)) {
        // Raw array format
        console.log(
          "[useBeauticians] Returning array format, count:",
          response.data.length
        );
        return response.data;
      }

      if (response.data?.data) {
        // Standard API or paginated format
        console.log(
          "[useBeauticians] Returning data format, count:",
          response.data.data.length
        );
        return response.data.data;
      }

      // Fallback
      console.warn("Unexpected beauticians response format:", response.data);
      return [];
    },
    staleTime: 5 * 60 * 1000, // Staff changes rarely
    gcTime: 20 * 60 * 1000, // Longer cache for stable data
    retry: 1,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: "stale",
  });
};

/**
 * Hook to fetch single beautician by ID - PERFORMANCE OPTIMIZED
 */
export const useBeautician = (beauticianId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.beauticians.byId(beauticianId),
    queryFn: async () => {
      if (!beauticianId) throw new Error("Beautician ID is required");

      const response = await api.get(`/beauticians/${beauticianId}`);

      // Handle different response formats (same as single service)
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Check if it's wrapped in a success response
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // Direct beautician object
        return response.data;
      }

      throw new Error("Invalid beautician response format");
    },
    enabled: !!beauticianId && options.enabled !== false,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch beautician availability - OPTIMIZED
 */
export const useBeauticianAvailability = (beauticianId, date, options = {}) => {
  return useQuery({
    queryKey: queryKeys.beauticians.availability(beauticianId, date),
    queryFn: async () => {
      if (!beauticianId || !date) {
        throw new Error("Beautician ID and date are required");
      }

      const response = await api.get(
        `/beauticians/${beauticianId}/availability`,
        {
          params: { date },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to fetch availability"
        );
      }

      return response.data.data;
    },
    enabled: !!beauticianId && !!date && options.enabled !== false,
    staleTime: 1 * 60 * 1000, // Availability changes more frequently
    gcTime: 3 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// SERVICES MUTATIONS - PERFORMANCE OPTIMIZED
// ============================================================================

/**
 * Hook to create a new service - FAST MUTATIONS
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData) => {
      const response = await api.post("/services", serviceData);

      // Handle response format - create service returns the service object directly
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Check if it's wrapped
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // Direct service object
        return response.data;
      }

      throw new Error("Failed to create service");
    },

    // Simple, fast optimistic update
    onMutate: async (newService) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.services.list() });

      const previousServices = queryClient.getQueryData(
        queryKeys.services.list()
      );

      if (previousServices) {
        const optimisticService = {
          _id: "temp-" + Date.now(),
          ...newService,
          createdAt: new Date().toISOString(),
        };

        queryClient.setQueryData(queryKeys.services.list(), [
          ...previousServices,
          optimisticService,
        ]);
      }

      return { previousServices };
    },

    onError: (error, newService, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(
          queryKeys.services.list(),
          context.previousServices
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

/**
 * Hook to update an existing service - FAST MUTATIONS
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, serviceData }) => {
      const response = await api.patch(`/services/${serviceId}`, serviceData);

      // Handle response format - update returns the service object directly
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        // Check if it's wrapped
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        // Direct service object
        return response.data;
      }

      throw new Error("Failed to update service");
    },

    // Fast optimistic update
    onMutate: async ({ serviceId, serviceData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.services.all });

      const previousServices = queryClient.getQueryData(
        queryKeys.services.list()
      );
      const previousService = queryClient.getQueryData(
        queryKeys.services.byId(serviceId)
      );

      // Update service in list
      if (previousServices) {
        const updatedServices = previousServices.map((service) =>
          service._id === serviceId ? { ...service, ...serviceData } : service
        );
        queryClient.setQueryData(queryKeys.services.list(), updatedServices);
      }

      // Update individual service
      if (previousService) {
        queryClient.setQueryData(queryKeys.services.byId(serviceId), {
          ...previousService,
          ...serviceData,
        });
      }

      return { previousServices, previousService };
    },

    onError: (error, variables, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(
          queryKeys.services.list(),
          context.previousServices
        );
      }
      if (context?.previousService) {
        queryClient.setQueryData(
          queryKeys.services.byId(variables.serviceId),
          context.previousService
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

/**
 * Hook to delete a service - FAST MUTATIONS
 */
export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId) => {
      const response = await api.delete(`/services/${serviceId}`);

      // Delete returns { ok: true, message: "..." }
      if (response.data?.ok || response.data?.success) {
        return response.data;
      }

      throw new Error(response.data?.message || "Failed to delete service");
    },

    // Fast optimistic update
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.services.all });

      const previousServices = queryClient.getQueryData(
        queryKeys.services.list()
      );

      // Remove service from list immediately
      if (previousServices) {
        const filteredServices = previousServices.filter(
          (service) => service._id !== serviceId
        );
        queryClient.setQueryData(queryKeys.services.list(), filteredServices);
      }

      // Remove individual service cache
      queryClient.removeQueries({
        queryKey: queryKeys.services.byId(serviceId),
      });

      return { previousServices };
    },

    onError: (error, serviceId, context) => {
      if (context?.previousServices) {
        queryClient.setQueryData(
          queryKeys.services.list(),
          context.previousServices
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
};

// ============================================================================
// BEAUTICIANS MUTATIONS - PERFORMANCE OPTIMIZED
// ============================================================================

/**
 * Hook to create a new beautician - FAST
 */
export const useCreateBeautician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beauticianData) => {
      const response = await api.post("/beauticians", beauticianData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle response format
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        if (response.data.success && response.data.data) {
          return response.data.data;
        }
        return response.data;
      }

      throw new Error("Failed to create beautician");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beauticians.all });
    },
  });
};

/**
 * Hook to delete a beautician - FAST
 */
export const useDeleteBeautician = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (beauticianId) => {
      const response = await api.delete(`/beauticians/${beauticianId}`);

      // Delete returns { ok: true, message: "..." }
      if (response.data?.ok || response.data?.success) {
        return response.data;
      }

      throw new Error(response.data?.message || "Failed to delete beautician");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.beauticians.all });
    },
  });
};

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Prefetch services for better perceived performance
 */
export const prefetchServices = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.services.list(),
    queryFn: async () => {
      const response = await api.get("/services");

      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data?.data) {
        return response.data.data;
      }

      return [];
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Prefetch beauticians for better perceived performance
 */
export const prefetchBeauticians = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.beauticians.list(),
    queryFn: async () => {
      const response = await api.get("/beauticians");

      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data?.data) {
        return response.data.data;
      }

      return [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
