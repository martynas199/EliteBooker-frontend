import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import {
  queryKeys,
  mutationErrorHandler,
  mutationSuccessHandler,
} from "../lib/queryClient";

// ============================================================================
// ABOUT US QUERIES
// ============================================================================

/**
 * Hook to fetch public About Us content
 * Features: Auto-refetch, caching, background updates
 */
export const useAboutUs = () => {
  return useQuery({
    queryKey: queryKeys.aboutUs.public(),
    queryFn: async () => {
      const response = await api.get("/about-us");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch About Us content"
        );
      }

      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes (About Us changes rarely)
    gcTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 3, // Retry 3 times for public content
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

    // Custom error handling
    throwOnError: false, // Don't throw errors, handle them in components
  });
};

/**
 * Hook to fetch About Us content for admin editing
 * Requires admin authentication
 */
export const useAboutUsAdmin = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.aboutUs.admin(),
    queryFn: async () => {
      const response = await api.get("/about-us/admin");

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch admin About Us content"
        );
      }

      return response.data.data;
    },
    enabled, // Can be disabled when admin is not logged in
    staleTime: 2 * 60 * 1000, // Admin data is fresher (2 minutes)
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Less retries for admin endpoints
  });
};

// ============================================================================
// ABOUT US MUTATIONS
// ============================================================================

/**
 * Hook to update About Us content (admin only)
 * Features: Optimistic updates, automatic cache invalidation
 */
export const useUpdateAboutUs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // FormData for file uploads
      const response = await api.put("/about-us/admin", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update About Us content"
        );
      }

      return response.data.data;
    },

    // Optimistic Updates
    onMutate: async (newData) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.aboutUs.all });

      // Snapshot the previous value
      const previousData = {
        public: queryClient.getQueryData(queryKeys.aboutUs.public()),
        admin: queryClient.getQueryData(queryKeys.aboutUs.admin()),
      };

      // Optimistically update both caches if we have the data
      if (previousData.public && newData.quote && newData.description) {
        const optimisticData = {
          ...previousData.public,
          quote: newData.quote,
          description: newData.description,
          // Don't optimistically update image until we get the Cloudinary URL
        };

        queryClient.setQueryData(queryKeys.aboutUs.public(), optimisticData);
        queryClient.setQueryData(queryKeys.aboutUs.admin(), optimisticData);
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (error, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.aboutUs.public(),
          context.previousData.public
        );
        queryClient.setQueryData(
          queryKeys.aboutUs.admin(),
          context.previousData.admin
        );
      }

      mutationErrorHandler(error, newData, context);
    },

    // Always refetch after error or success to ensure cache is correct
    onSettled: (data, error, variables, context) => {
      // Invalidate and refetch both queries
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutUs.all });

      if (data) {
        mutationSuccessHandler(data, variables, context);
      }
    },
  });
};

/**
 * Hook to delete About Us image (admin only)
 */
export const useDeleteAboutUsImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete("/about-us/admin/image");

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete image");
      }

      return response.data;
    },

    // Optimistic update - remove image immediately
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.aboutUs.all });

      const previousData = {
        public: queryClient.getQueryData(queryKeys.aboutUs.public()),
        admin: queryClient.getQueryData(queryKeys.aboutUs.admin()),
      };

      // Remove image from both caches
      if (previousData.public) {
        const withoutImage = { ...previousData.public, image: null };
        queryClient.setQueryData(queryKeys.aboutUs.public(), withoutImage);
        queryClient.setQueryData(queryKeys.aboutUs.admin(), withoutImage);
      }

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          queryKeys.aboutUs.public(),
          context.previousData.public
        );
        queryClient.setQueryData(
          queryKeys.aboutUs.admin(),
          context.previousData.admin
        );
      }
      mutationErrorHandler(error, variables, context);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aboutUs.all });
    },
  });
};

// ============================================================================
// PREFETCHING UTILITIES
// ============================================================================

/**
 * Prefetch About Us content (useful for route preloading)
 */
export const prefetchAboutUs = (queryClient) => {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.aboutUs.public(),
    queryFn: async () => {
      const response = await api.get("/about-us");
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch About Us content"
        );
      }
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // Same as useAboutUs
  });
};
