import { QueryClient } from "@tanstack/react-query";

// Create a client with performance-optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for longer periods
      staleTime: 2 * 60 * 1000, // 2 minutes (was 5, reduced for faster updates)

      // Cache time: Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes (reduced from 10)

      // Reduce retry attempts for faster failure feedback
      retry: 1, // Reduced from 2
      retryDelay: 500, // Faster retry (was exponential backoff)

      // Disable aggressive refetching to improve performance
      refetchOnWindowFocus: false, // Disabled - was causing slowness

      // Keep reconnect refetching for offline users
      refetchOnReconnect: true,

      // Only refetch on mount if data is stale (performance optimization)
      refetchOnMount: "stale",
    },
    mutations: {
      // Retry mutations once
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query Keys Factory - Centralized key management
export const queryKeys = {
  // About Us queries
  aboutUs: {
    all: ["about-us"],
    public: () => [...queryKeys.aboutUs.all, "public"],
    admin: () => [...queryKeys.aboutUs.all, "admin"],
  },

  // Admin queries
  admin: {
    all: ["admin"],
    profile: () => [...queryKeys.admin.all, "profile"],
    beauticians: () => [...queryKeys.admin.all, "beauticians"],
    appointments: (filters) => [
      ...queryKeys.admin.all,
      "appointments",
      filters,
    ],
    settings: () => [...queryKeys.admin.all, "settings"],
  },

  // Public queries
  services: {
    all: ["services"],
    list: () => [...queryKeys.services.all, "list"],
    byId: (id) => [...queryKeys.services.all, "detail", id],
  },

  // Beauticians
  beauticians: {
    all: ["beauticians"],
    list: () => [...queryKeys.beauticians.all, "list"],
    byId: (id) => [...queryKeys.beauticians.all, "detail", id],
    availability: (id, date) => [
      ...queryKeys.beauticians.all,
      id,
      "availability",
      date,
    ],
  },

  // Appointments
  appointments: {
    all: ["appointments"],
    byUser: (userId) => [...queryKeys.appointments.all, "user", userId],
    byBeautician: (beauticianId) => [
      ...queryKeys.appointments.all,
      "beautician",
      beauticianId,
    ],
    byDate: (date) => [...queryKeys.appointments.all, "date", date],
  },
};

// Error handler for queries
export const queryErrorHandler = (error) => {
  console.error("Query Error:", error);

  // You can add global error handling here
  // For example, redirect to login on 401, show toast on network errors, etc.
  if (error?.response?.status === 401) {
    // Handle authentication errors
    window.location.href = "/admin/login";
  }
};

// Success handler for mutations
export const mutationSuccessHandler = (data, variables, context) => {
  console.log("Mutation Success:", { data, variables, context });
};

// Default error handler for mutations
export const mutationErrorHandler = (error, variables, context) => {
  console.error("Mutation Error:", { error, variables, context });
};
