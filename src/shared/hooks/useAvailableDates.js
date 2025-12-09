import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/apiClient";

// Cache for fully booked dates
// Key format: "specialistId:YYYY-MM"
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

/**
 * useAvailableDates - Fetch and cache fully booked dates for a specialist/month
 *
 * @param {string} specialistId - Specialist ID
 * @param {number} year - Year (e.g., 2025)
 * @param {number} month - Month (1-12)
 * @returns {object} { fullyBooked: string[], isLoading: boolean, error: string|null, refetch: function }
 */
export function useAvailableDates(specialistId, year, month) {
  const [fullyBooked, setFullyBooked] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const cacheKey = `${specialistId}:${year}-${String(month).padStart(2, "0")}`;

  const fetchFullyBooked = useCallback(async () => {
    if (!specialistId || !year || !month) {
      setFullyBooked([]);
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setFullyBooked(cached.data);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/slots/fully-booked", {
        params: {
          specialistId,
          year,
          month,
        },
        signal: abortControllerRef.current.signal,
      });

      const dates = response.data.fullyBooked || [];

      console.log(
        `[useAvailableDates] Fully booked response for ${specialistId} (${year}-${month}):`,
        dates
      );

      // Store in cache
      cache.set(cacheKey, {
        data: dates,
        timestamp: Date.now(),
      });

      setFullyBooked(dates);
      setError(null);
    } catch (err) {
      if (err.name === "AbortError" || err.name === "CanceledError") {
        // Request was cancelled, ignore
        return;
      }

      console.error("Failed to fetch fully booked dates:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load available dates"
      );
      setFullyBooked([]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [specialistId, year, month, cacheKey]);

  // Debounced fetch on month change
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (200ms)
    debounceTimerRef.current = setTimeout(() => {
      fetchFullyBooked();
    }, 200);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchFullyBooked]);

  const refetch = useCallback(() => {
    // Clear cache for this key
    cache.delete(cacheKey);
    fetchFullyBooked();
  }, [cacheKey, fetchFullyBooked]);

  return {
    fullyBooked,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Clear all cached fully booked data
 */
export function clearAvailableDatesCache() {
  cache.clear();
}

/**
 * Clear cache for specific specialist
 */
export function clearBeauticianCache(specialistId) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${specialistId}:`)) {
      cache.delete(key);
    }
  }
}
