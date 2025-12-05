import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/apiClient";
import { queryKeys, mutationErrorHandler } from "../lib/queryClient";

// ============================================================================
// AUTH QUERIES
// ============================================================================

/**
 * Hook to get current admin profile
 * Auto-refreshes and handles authentication state
 */
export const useAdminProfile = () => {
  return useQuery({
    queryKey: queryKeys.admin.profile(),
    queryFn: async () => {
      const response = await api.get("/auth/me");

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch profile");
      }

      // Backend returns: { success: true, admin }
      return response.data.admin;
    },
    staleTime: 5 * 60 * 1000, // Profile data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (auth failures)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },

    // Handle auth errors gracefully
    throwOnError: false,
  });
};

// ============================================================================
// AUTH MUTATIONS
// ============================================================================

/**
 * Hook for admin login
 * Features: Automatic cache updates, error handling
 */
export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Login failed");
      }

      // Backend now returns: { success: true, admin, accessToken, refreshToken }
      // Store tokens in localStorage for cross-domain compatibility
      if (response.data.accessToken) {
        localStorage.setItem("adminAccessToken", response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem("adminRefreshToken", response.data.refreshToken);
      }

      return {
        admin: response.data.admin,
        accessToken: response.data.accessToken,
      };
    },

    onSuccess: (data) => {
      // Update the admin profile cache with login data
      queryClient.setQueryData(queryKeys.admin.profile(), data);

      // Invalidate and refetch all admin queries
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "admin",
      });

      console.log("✅ Admin login successful");
    },

    onError: (error) => {
      console.error("❌ Admin login failed:", error);
      mutationErrorHandler(error);
    },
  });
};

/**
 * Hook for admin logout
 * Features: Cache cleanup, automatic redirects
 */
export const useAdminLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/logout");
      return response.data;
    },

    onSuccess: () => {
      // Clear localStorage tokens
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");

      // Clear all admin-related cache
      queryClient.clear();

      // Or more specifically, remove admin queries
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "admin",
      });

      console.log("✅ Admin logout successful");
    },

    onError: (error) => {
      // Even if logout fails on server, clear local cache and tokens
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      queryClient.clear();
      console.warn("⚠️ Logout API failed, but cleared local cache:", error);
    },

    onSettled: () => {
      // Always clear cache and redirect regardless of success/failure
      queryClient.clear();
    },
  });
};

/**
 * Hook to update admin profile
 */
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const response = await api.patch("/auth/me", profileData);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update profile");
      }

      // Backend returns: { success: true, admin }
      return response.data.admin;
    },

    // Optimistic update
    onMutate: async (newProfileData) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.profile() });

      const previousProfile = queryClient.getQueryData(
        queryKeys.admin.profile()
      );

      // Optimistically update profile
      if (previousProfile) {
        queryClient.setQueryData(queryKeys.admin.profile(), {
          ...previousProfile,
          ...newProfileData,
        });
      }

      return { previousProfile };
    },

    onError: (error, newProfileData, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.admin.profile(),
          context.previousProfile
        );
      }
      mutationErrorHandler(error, newProfileData, context);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.profile() });
    },
  });
};

/**
 * Hook to change admin password
 */
export const useChangeAdminPassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword, confirmPassword }) => {
      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to change password");
      }

      return response.data;
    },

    onSuccess: () => {
      console.log("✅ Password changed successfully");
    },

    onError: (error) => {
      console.error("❌ Password change failed:", error);
      mutationErrorHandler(error);
    },
  });
};

/**
 * Hook for forgot password - request reset link
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await api.post("/auth/forgot-password", { email });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send reset email");
      }

      return response.data;
    },

    onSuccess: () => {
      console.log("✅ Password reset email sent");
    },

    onError: (error) => {
      console.error("❌ Forgot password failed:", error);
      mutationErrorHandler(error);
    },
  });
};

/**
 * Hook for reset password - set new password using token
 */
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, password }) => {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to reset password");
      }

      // Backend returns: { success: true, token, admin }
      return {
        token: response.data.token,
        admin: response.data.admin,
      };
    },

    onSuccess: (data) => {
      // Update the admin profile cache with login data
      queryClient.setQueryData(queryKeys.admin.profile(), data.admin);

      // Invalidate and refetch all admin queries
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "admin",
      });

      console.log("✅ Password reset successful");
    },

    onError: (error) => {
      console.error("❌ Password reset failed:", error);
      mutationErrorHandler(error);
    },
  });
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Custom hook to check if admin is authenticated
 * Derived from the admin profile query
 */
export const useIsAuthenticated = () => {
  const { data: admin, isLoading, isError } = useAdminProfile();

  return {
    isAuthenticated: !!admin && !isError,
    admin,
    isLoading,
    isError,
  };
};

/**
 * Hook to check if admin has specific permissions
 */
export const useAdminPermissions = () => {
  const { data: admin } = useAdminProfile();

  return {
    isSuperAdmin: admin?.role === "super_admin",
    isAdmin: admin?.role === "admin" || admin?.role === "super_admin",
    canManageStaff: admin?.role === "super_admin",
    canManageServices: admin?.role === "admin" || admin?.role === "super_admin",
    canViewReports: admin?.role === "admin" || admin?.role === "super_admin",
  };
};
