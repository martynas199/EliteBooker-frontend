/**
 * Lock Service API Client
 * Frontend interface for managing booking slot locks
 */

import { api } from "./apiClient";

/**
 * Acquire a temporary lock on a booking slot
 *
 * @param {Object} params - Lock parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.resourceId - Resource (specialist) identifier
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.startTime - Start time in HH:mm format
 * @param {number} [params.duration] - Booking duration in minutes
 * @param {number} [params.ttl] - Custom TTL in milliseconds
 * @returns {Promise<Object>} Lock result
 */
export async function acquireLock({
  tenantId,
  resourceId,
  date,
  startTime,
  duration,
  ttl,
}) {
  try {
    const response = await api.post("/locks/acquire", {
      tenantId,
      resourceId,
      date,
      startTime,
      duration,
      ttl,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Slot is already locked
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Verify that a lock exists and is valid
 *
 * @param {Object} params - Verification parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.resourceId - Resource identifier
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.startTime - Start time in HH:mm format
 * @param {string} params.lockId - Lock identifier to verify
 * @returns {Promise<Object>} Verification result
 */
export async function verifyLock({
  tenantId,
  resourceId,
  date,
  startTime,
  lockId,
}) {
  try {
    const response = await api.post("/locks/verify", {
      tenantId,
      resourceId,
      date,
      startTime,
      lockId,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Lock is invalid
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Release a lock manually
 *
 * @param {Object} params - Release parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.resourceId - Resource identifier
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.startTime - Start time in HH:mm format
 * @param {string} params.lockId - Lock identifier for ownership verification
 * @returns {Promise<Object>} Release result
 */
export async function releaseLock({
  tenantId,
  resourceId,
  date,
  startTime,
  lockId,
}) {
  try {
    const response = await api.post("/locks/release", {
      tenantId,
      resourceId,
      date,
      startTime,
      lockId,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Lock not found (already expired or released)
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Refresh/extend the TTL of an existing lock
 *
 * @param {Object} params - Refresh parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.resourceId - Resource identifier
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.startTime - Start time in HH:mm format
 * @param {string} params.lockId - Lock identifier for ownership verification
 * @param {number} [params.ttl] - New TTL in milliseconds
 * @returns {Promise<Object>} Refresh result
 */
export async function refreshLock({
  tenantId,
  resourceId,
  date,
  startTime,
  lockId,
  ttl,
}) {
  try {
    const response = await api.post("/locks/refresh", {
      tenantId,
      resourceId,
      date,
      startTime,
      lockId,
      ttl,
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Lock not found
      return error.response.data;
    }
    throw error;
  }
}

/**
 * Get all active locks for a tenant (Admin only)
 *
 * @param {string} tenantId - Tenant identifier
 * @param {number} [limit=100] - Maximum number of locks to return
 * @returns {Promise<Object>} Active locks list
 */
export async function getActiveLocks(tenantId, limit = 100) {
  const response = await api.get("/locks/admin/active", {
    params: { tenantId, limit },
  });

  return response.data;
}

/**
 * Force release a lock (Admin only)
 *
 * @param {Object} params - Force release parameters
 * @param {string} params.tenantId - Tenant identifier
 * @param {string} params.resourceId - Resource identifier
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {string} params.startTime - Start time in HH:mm format
 * @returns {Promise<Object>} Release result
 */
export async function forceReleaseLock({
  tenantId,
  resourceId,
  date,
  startTime,
}) {
  const response = await api.post("/locks/admin/force-release", {
    tenantId,
    resourceId,
    date,
    startTime,
  });

  return response.data;
}

/**
 * Get lock service metrics (Admin only)
 *
 * @returns {Promise<Object>} Metrics data
 */
export async function getLockMetrics() {
  const response = await api.get("/locks/metrics");
  return response.data;
}

/**
 * Health check for lock service
 *
 * @returns {Promise<Object>} Health status
 */
export async function checkLockHealth() {
  const response = await api.get("/locks/health");
  return response.data;
}

export const LockAPI = {
  acquireLock,
  verifyLock,
  releaseLock,
  refreshLock,
  getActiveLocks,
  forceReleaseLock,
  getLockMetrics,
  checkLockHealth,
};
