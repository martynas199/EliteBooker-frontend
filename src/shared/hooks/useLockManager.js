/**
 * React Hook for Managing Booking Slot Locks
 * Provides automatic lock acquisition, refresh, and cleanup
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { LockAPI } from "../api/lockAPI";

/**
 * Hook for managing booking slot locks
 *
 * Features:
 * - Automatic lock acquisition when slot is selected
 * - Automatic lock refresh before expiration
 * - Automatic lock release on unmount or navigation
 * - Countdown timer display
 * - Error handling
 *
 * @param {Object} options - Hook options
 * @param {number} [options.refreshInterval=30000] - How often to refresh lock (ms)
 * @param {boolean} [options.autoRefresh=true] - Enable automatic refresh
 * @returns {Object} Lock state and methods
 */
export function useLockManager({
  refreshInterval = 30000,
  autoRefresh = true,
} = {}) {
  const [lockData, setLockData] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [error, setError] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);

  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const lockParamsRef = useRef(null);

  /**
   * Acquire a lock on a booking slot
   */
  const acquireLock = useCallback(
    async ({ tenantId, resourceId, date, startTime, duration }) => {
      setIsAcquiring(true);
      setError(null);

      try {
        console.log("[useLockManager] Acquiring lock...", {
          tenantId,
          resourceId,
          date,
          startTime,
        });

        const result = await LockAPI.acquireLock({
          tenantId,
          resourceId,
          date,
          startTime,
          duration,
        });

        if (!result.locked) {
          console.log(
            "[useLockManager] Lock acquisition failed:",
            result.reason
          );
          setError({
            type: "lock_failed",
            message:
              "This slot is currently being booked by another customer. Please choose another time.",
            reason: result.reason,
            remainingTTL: result.remainingTTL,
          });
          setIsLocked(false);
          return { success: false, error: result.reason };
        }

        console.log(
          "[useLockManager] Lock acquired successfully:",
          result.lockId
        );

        // Store lock data
        const lockInfo = {
          lockId: result.lockId,
          tenantId,
          resourceId,
          date,
          startTime,
          duration,
          expiresAt: result.expiresAt,
          expiresIn: result.expiresIn,
        };

        setLockData(lockInfo);
        setIsLocked(true);
        setRemainingTime(result.expiresIn);

        // Store params for refresh
        lockParamsRef.current = {
          tenantId,
          resourceId,
          date,
          startTime,
          lockId: result.lockId,
        };

        // Start countdown timer
        startCountdown(result.expiresIn);

        // Start auto-refresh if enabled
        if (autoRefresh) {
          startAutoRefresh();
        }

        return { success: true, lockData: lockInfo };
      } catch (err) {
        console.error("[useLockManager] Error acquiring lock:", err);
        setError({
          type: "error",
          message:
            err.message || "Failed to secure booking slot. Please try again.",
        });
        setIsLocked(false);
        return { success: false, error: err.message };
      } finally {
        setIsAcquiring(false);
      }
    },
    [autoRefresh]
  );

  /**
   * Release the lock manually
   */
  const releaseLock = useCallback(async () => {
    if (!lockData) {
      console.log("[useLockManager] No lock to release");
      return;
    }

    try {
      console.log("[useLockManager] Releasing lock...", lockData.lockId);

      await LockAPI.releaseLock({
        tenantId: lockData.tenantId,
        resourceId: lockData.resourceId,
        date: lockData.date,
        startTime: lockData.startTime,
        lockId: lockData.lockId,
      });

      console.log("[useLockManager] Lock released successfully");

      // Clear state
      setLockData(null);
      setIsLocked(false);
      setRemainingTime(0);
      lockParamsRef.current = null;

      // Clear timers
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    } catch (err) {
      console.error("[useLockManager] Error releasing lock:", err);
      // Don't set error here - lock may have already expired
    }
  }, [lockData]);

  /**
   * Refresh the lock to extend TTL
   */
  const refreshLockManually = useCallback(async () => {
    if (!lockData) {
      console.log("[useLockManager] No lock to refresh");
      return { success: false };
    }

    try {
      console.log("[useLockManager] Refreshing lock...", lockData.lockId);

      const result = await LockAPI.refreshLock({
        tenantId: lockData.tenantId,
        resourceId: lockData.resourceId,
        date: lockData.date,
        startTime: lockData.startTime,
        lockId: lockData.lockId,
      });

      if (!result.refreshed) {
        console.log("[useLockManager] Lock refresh failed:", result.reason);
        setError({
          type: "lock_expired",
          message:
            "Your booking reservation has expired. Please select a time slot again.",
        });
        setIsLocked(false);
        setLockData(null);
        return { success: false, error: result.reason };
      }

      console.log("[useLockManager] Lock refreshed successfully");

      // Update lock data
      setLockData((prev) => ({
        ...prev,
        expiresAt: result.expiresAt,
        expiresIn: result.expiresIn,
      }));
      setRemainingTime(result.expiresIn);

      // Restart countdown
      startCountdown(result.expiresIn);

      return { success: true };
    } catch (err) {
      console.error("[useLockManager] Error refreshing lock:", err);
      return { success: false, error: err.message };
    }
  }, [lockData]);

  /**
   * Start automatic lock refresh timer
   */
  const startAutoRefresh = useCallback(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Set up periodic refresh
    refreshTimerRef.current = setInterval(() => {
      console.log("[useLockManager] Auto-refreshing lock...");
      refreshLockManually();
    }, refreshInterval);
  }, [refreshInterval, refreshLockManually]);

  /**
   * Start countdown timer
   */
  const startCountdown = useCallback((initialTime) => {
    // Clear existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    let timeLeft = initialTime;

    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1000;
      setRemainingTime(Math.max(0, timeLeft));

      // When lock expires
      if (timeLeft <= 0) {
        console.log("[useLockManager] Lock has expired");
        setError({
          type: "lock_expired",
          message:
            "Your booking reservation has expired. Please select a time slot again.",
        });
        setIsLocked(false);
        setLockData(null);
        lockParamsRef.current = null;

        // Clear timers
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      }
    }, 1000);
  }, []);

  /**
   * Format remaining time for display
   */
  const formatRemainingTime = useCallback(() => {
    if (!remainingTime) return "0:00";

    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingTime]);

  /**
   * Get remaining time percentage (for progress bars)
   */
  const getRemainingTimePercentage = useCallback(() => {
    if (!lockData) return 0;
    return Math.max(0, (remainingTime / lockData.expiresIn) * 100);
  }, [lockData, remainingTime]);

  /**
   * Cleanup on unmount or navigation
   */
  useEffect(() => {
    return () => {
      console.log("[useLockManager] Component unmounting, releasing lock...");

      // Release lock
      if (lockParamsRef.current) {
        LockAPI.releaseLock(lockParamsRef.current).catch((err) => {
          console.error(
            "[useLockManager] Cleanup: Failed to release lock:",
            err
          );
        });
      }

      // Clear timers
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    lockData,
    isLocked,
    isAcquiring,
    error,
    remainingTime,

    // Methods
    acquireLock,
    releaseLock,
    refreshLock: refreshLockManually,

    // Helpers
    formatRemainingTime,
    getRemainingTimePercentage,
    clearError: () => setError(null),
  };
}

export default useLockManager;
