/**
 * API Client with Multi-Tenant Support
 *
 * Axios instance configured with:
 * - Automatic tenant ID header
 * - JWT token management
 * - Error handling
 * - Request/response interceptors
 */

import axios from "axios";
import { env } from "./env";

// Create axios instance
const api = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get tenant ID from localStorage
 */
function getTenantId() {
  return localStorage.getItem("tenantId");
}

/**
 * Get JWT token from localStorage
 */
function getToken() {
  return localStorage.getItem("token");
}

/**
 * Request Interceptor
 * Adds tenant ID and JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Add tenant ID header if available
    const tenantId = getTenantId();
    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    // Add JWT token if available
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Handles common errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("tenantId");

        // Redirect to login if not already there
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/admin/login";
        }
      }

      // Handle 403 Forbidden (tenant access denied)
      if (status === 403) {
        console.error("Access denied:", data.message);
        // Could show a toast notification here
      }

      // Handle 404 Not Found (tenant not found)
      if (status === 404 && data.error === "Tenant not found") {
        console.error("Tenant not found");
        // Could redirect to a tenant selection page
      }

      // Handle 400 Bad Request (tenant context required)
      if (status === 400 && data.error === "Tenant context required") {
        console.error("Tenant context missing");
        // Could show a notification to select a tenant
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Helper function to set tenant context
 * Call this after tenant resolution
 */
export function setTenantContext(tenantId) {
  if (tenantId) {
    localStorage.setItem("tenantId", tenantId);
  } else {
    localStorage.removeItem("tenantId");
  }
}

/**
 * Helper function to set auth token
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/**
 * Helper function to clear all auth data
 */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("tenantId");
}

/**
 * API Methods
 */

// Tenant APIs
export const tenantAPI = {
  create: (data) => api.post("/api/tenants/create", data),
  getBySlug: (slug) => api.get(`/api/tenants/slug/${slug}`),
  get: (id) => api.get(`/api/tenants/${id}`),
  update: (id, data) => api.put(`/api/tenants/${id}`, data),
  list: (params) => api.get("/api/tenants", { params }),
  suspend: (id) => api.post(`/api/tenants/${id}/suspend`),
  activate: (id) => api.post(`/api/tenants/${id}/activate`),
};

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (data) => api.post("/api/auth/register", data),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
};

// Services APIs (automatically filtered by tenant)
export const servicesAPI = {
  list: (params) => api.get("/api/services", { params }),
  get: (id) => api.get(`/api/services/${id}`),
  create: (data) => api.post("/api/services", data),
  update: (id, data) => api.put(`/api/services/${id}`, data),
  delete: (id) => api.delete(`/api/services/${id}`),
};

// Specialists APIs (renamed from specialists)
export const specialistsAPI = {
  list: (params) => api.get("/api/specialists", { params }),
  get: (id) => api.get(`/api/specialists/${id}`),
  create: (data) => api.post("/api/specialists", data),
  update: (id, data) => api.put(`/api/specialists/${id}`, data),
  delete: (id) => api.delete(`/api/specialists/${id}`),
};

// Legacy specialists API (backward compatibility - redirects to specialists)
export const beauticiansAPI = specialistsAPI;

// Appointments APIs
export const appointmentsAPI = {
  list: (params) => api.get("/api/appointments", { params }),
  get: (id) => api.get(`/api/appointments/${id}`),
  create: (data) => api.post("/api/appointments", data),
  update: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) =>
    api.post(`/api/appointments/${id}/cancel`, { reason }),
};

// Products APIs
export const productsAPI = {
  list: (params) => api.get("/api/products", { params }),
  get: (id) => api.get(`/api/products/${id}`),
  create: (data) => api.post("/api/products", data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Orders APIs
export const ordersAPI = {
  list: (params) => api.get("/api/orders", { params }),
  get: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post("/api/orders", data),
  update: (id, data) => api.put(`/api/orders/${id}`, data),
};

// Slots APIs
export const slotsAPI = {
  getAvailable: (params) => api.get("/api/slots", { params }),
};

// Settings APIs
export const settingsAPI = {
  get: () => api.get("/api/settings"),
  update: (data) => api.put("/api/settings", data),
};

export default api;
