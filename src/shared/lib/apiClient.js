import axios from "axios";
import { store } from "../../app/store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Use environment variable for API URL
// In development: uses localhost with Vite proxy
// In production: uses VITE_API_URL (e.g., https://elitebooker-backend.onrender.com)
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  withCredentials: true, // Send cookies with requests
});

// Request interceptor: Add tenant slug and admin auth token to requests
api.interceptors.request.use(
  (config) => {
    const pathname = window.location.pathname;
    const adminState = store.getState()?.auth?.admin;

    // Add Authorization header for admin routes (cross-domain compatibility)
    if (pathname.startsWith("/admin") && !config.headers["Authorization"]) {
      const adminToken = localStorage.getItem("adminAccessToken");
      if (adminToken) {
        config.headers["Authorization"] = `Bearer ${adminToken}`;
      }
    }

    const shouldAttachTenantHeader =
      pathname.startsWith("/admin") &&
      adminState?.role === "super_admin" &&
      adminState?.tenantId;

    if (shouldAttachTenantHeader && !config.headers["x-tenant-id"]) {
      config.headers["x-tenant-id"] = `${adminState.tenantId}`;
    }

    // Add Authorization header for client routes (like beauty salon app)
    // Also add for homepage and other routes if clientToken exists
    // Try localStorage first, fallback to sessionStorage for mobile Safari
    const clientToken =
      localStorage.getItem("clientToken") ||
      sessionStorage.getItem("clientToken");
    if (clientToken && !config.headers["Authorization"]) {
      // Add for /client routes OR for /api/client endpoints OR for favorites endpoints OR for referrals endpoints
      if (
        pathname.startsWith("/client") ||
        pathname.startsWith("/referral") ||
        config.url?.includes("/client/") ||
        config.url?.includes("/favorites") ||
        config.url?.includes("/referrals")
      ) {
        config.headers["Authorization"] = `Bearer ${clientToken}`;
      }
    }

    // Add tenant slug header by parsing the current URL
    // This ensures all API calls are scoped to the correct tenant
    if (!config.headers["x-tenant-slug"]) {
      // Check if it's an admin route
      if (pathname.startsWith("/admin")) {
        // For admin routes, the backend will extract tenantId from the JWT token
        // No need to send x-tenant-slug or x-tenant-id header - backend handles it via optionalAuth middleware
      } else if (pathname.startsWith("/client")) {
        // For client routes, no tenant context needed (cross-business)
      } else {
        // For tenant customer routes, extract slug from URL
        const pathMatch = pathname.match(/^\/salon\/([^\/]+)/);
        if (pathMatch) {
          const tenantSlug = pathMatch[1];
          config.headers["x-tenant-slug"] = tenantSlug;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor: Enhanced error handling with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        error.code === "ECONNABORTED"
          ? "Request timed out. Please check your connection and try again."
          : "Network error. Please check your internet connection.",
      );
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - Try to refresh token or clear client token
    if (error.response.status === 401 && !originalRequest._retry) {
      const pathname = window.location.pathname;

      // Skip token refresh for login/register endpoints
      if (
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register")
      ) {
        // Return structured error for login/register failures
        const errorMessage =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Authentication failed";
        const structuredError = new Error(errorMessage);
        structuredError.status = error.response?.status;
        structuredError.response = error.response;
        return Promise.reject(structuredError);
      }

      // For client routes, clear localStorage token (like beauty salon app)
      if (pathname.startsWith("/client")) {
        console.log("[API Client] 401 on client route - clearing clientToken");
        localStorage.removeItem("clientToken");
        // Don't redirect - let ClientAuthContext handle the state
        return Promise.reject(error);
      }

      // For admin routes, try to refresh token
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post("/auth/refresh");

        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed, redirect to admin login
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 429 Too Many Requests
    if (error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const errorMessage = retryAfter
        ? `Too many requests. Please wait ${retryAfter} seconds.`
        : "Too many requests. Please try again later.";

      const rateLimitError = new Error(errorMessage);
      rateLimitError.isRateLimitError = true;
      rateLimitError.retryAfter = retryAfter;
      return Promise.reject(rateLimitError);
    }

    // Handle 503 Service Unavailable
    if (error.response.status === 503) {
      const maintenanceError = new Error(
        "Service temporarily unavailable. We're working on it!",
      );
      maintenanceError.isMaintenanceError = true;
      return Promise.reject(maintenanceError);
    }

    // Return structured error
    const errorMessage =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "An unexpected error occurred";

    const structuredError = new Error(errorMessage);
    structuredError.status = error.response?.status;
    structuredError.response = error.response;

    return Promise.reject(structuredError);
  },
);
