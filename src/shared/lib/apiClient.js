import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Use environment variable for API URL
// In development: uses localhost with Vite proxy
// In production: uses VITE_API_URL (e.g., https://elitebooker-backend.onrender.com)
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
  withCredentials: true, // Send cookies with requests
});

// Request interceptor: Add tenant slug to requests
// Note: accessToken cookie is automatically sent by browser with withCredentials: true
api.interceptors.request.use(
  (config) => {
    // Add tenant slug header by parsing the current URL
    // This ensures all API calls are scoped to the correct tenant
    if (!config.headers["x-tenant-slug"]) {
      const pathname = window.location.pathname;

      // Check if it's an admin route
      if (pathname.startsWith("/admin")) {
        // For admin routes, the backend will extract tenantId from the JWT token
        // The accessToken cookie contains the admin's tenantId
        // No need to send x-tenant-slug or x-tenant-id header - backend handles it via optionalAuth middleware
        console.log(
          "[API Client] Admin route detected, tenantId will be extracted from JWT token"
        );
      } else {
        // For tenant customer routes, extract slug from URL
        const pathMatch = pathname.match(/^\/salon\/([^\/]+)/);
        if (pathMatch) {
          const tenantSlug = pathMatch[1];
          config.headers["x-tenant-slug"] = tenantSlug;
          console.log(
            "[API Client] Adding x-tenant-slug header:",
            tenantSlug,
            "for request:",
            config.url
          );
        } else {
          console.log("[API Client] No tenant slug in URL:", pathname);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
          : "Network error. Please check your internet connection."
      );
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
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
        "Service temporarily unavailable. We're working on it!"
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
  }
);
