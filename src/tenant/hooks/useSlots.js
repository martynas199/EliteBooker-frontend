import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { api } from "../../shared/lib/apiClient";

/**
 * Query keys for slots
 */
export const slotsKeys = {
  all: ["tenant", "slots"],
  available: (params) => [...slotsKeys.all, "available", params],
  fullyBooked: (params) => [...slotsKeys.all, "fullyBooked", params],
};

/**
 * Hook to fetch available time slots with debouncing, caching, and cancellation
 * 
 * Features:
 * - Debouncing: 300ms delay when parameters change
 * - Automatic cancellation: Stale requests are cancelled
 * - Query key includes all parameters for precise caching
 * - Slot validation on client side
 * 
 * @param {Object} params - Slot query parameters
 * @param {string} params.specialistId - Specialist ID
 * @param {string} params.serviceId - Service ID
 * @param {string} params.variantName - Service variant name
 * @param {string} params.date - Date in YYYY-MM-DD format
 * @param {number} [params.totalDuration] - Total duration for multi-service bookings
 * @param {boolean} [params.any] - Whether to check "any specialist" availability
 * @param {Object} options - Additional options
 * @param {string} [options.salonTz="Europe/London"] - Salon timezone
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @param {number} [options.debounceMs=300] - Debounce delay in milliseconds
 * @returns {Object} Query result with { data: slots[], isLoading, error, isFetching, ... }
 */
export function useSlots(params, options = {}) {
  const {
    salonTz = "Europe/London",
    enabled = true,
    debounceMs = 300,
  } = options;

  const { specialistId, serviceId, variantName, date, totalDuration, any } = params;

  // Debounced parameters to prevent excessive API calls
  const [debouncedParams, setDebouncedParams] = useState(params);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedParams(params);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [specialistId, serviceId, variantName, date, totalDuration, any, debounceMs]);

  // Check if all required params are present
  const hasRequiredParams = !!(
    debouncedParams.serviceId &&
    debouncedParams.variantName &&
    debouncedParams.date
  );

  return useQuery({
    queryKey: slotsKeys.available({
      specialistId: debouncedParams.specialistId,
      serviceId: debouncedParams.serviceId,
      variantName: debouncedParams.variantName,
      date: debouncedParams.date,
      totalDuration: debouncedParams.totalDuration,
      any: debouncedParams.any,
    }),
    queryFn: async ({ signal }) => {
      const queryParams = {
        serviceId: debouncedParams.serviceId,
        variantName: debouncedParams.variantName,
        date: debouncedParams.date,
      };

      // Add optional params
      if (debouncedParams.specialistId) {
        queryParams.specialistId = debouncedParams.specialistId;
      }
      if (debouncedParams.totalDuration) {
        queryParams.totalDuration = debouncedParams.totalDuration;
      }
      if (debouncedParams.any) {
        queryParams.any = debouncedParams.any;
      }

      const response = await api.get("/slots", {
        params: queryParams,
        signal, // Automatic cancellation support
      });

      const fetchedSlots = response.data.slots || [];

      // Client-side validation
      const validatedSlots = fetchedSlots.filter((slot) => {
        try {
          const start = dayjs(slot.startISO);
          const end = dayjs(slot.endISO);

          // Validation rules
          if (!start.isValid() || !end.isValid()) {
            console.error("Invalid ISO string in slot:", slot);
            return false;
          }

          if (!end.isAfter(start)) {
            console.error("Slot end not after start:", slot);
            return false;
          }

          // Verify slot is on correct date
          const slotDate = start.tz(salonTz).format("YYYY-MM-DD");
          if (slotDate !== debouncedParams.date) {
            console.error(
              "Slot not on selected date:",
              slot,
              "slotDate:",
              slotDate,
              "expected:",
              debouncedParams.date
            );
            return false;
          }

          return true;
        } catch (err) {
          console.error("Slot validation error:", err, slot);
          return false;
        }
      });

      // Warn if too many slots were invalidated
      if (
        fetchedSlots.length > 0 &&
        validatedSlots.length < fetchedSlots.length * 0.8
      ) {
        console.warn(
          `Too many invalid slots: ${fetchedSlots.length - validatedSlots.length}/${fetchedSlots.length}`
        );
      }

      return validatedSlots;
    },
    staleTime: 45 * 1000, // 45 seconds
    gcTime: 3 * 60 * 1000, // 3 minutes
    enabled: enabled && hasRequiredParams,
    retry: 1,
    retryDelay: 500,
    // Prevent automatic refetching while user is still selecting
    refetchOnWindowFocus: false,
    refetchOnMount: "stale",
  });
}

/**
 * Hook to fetch fully booked dates for a month
 * Used by date pickers to disable unavailable dates
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.year - Year (e.g., 2025)
 * @param {number} params.month - Month (1-12)
 * @param {string} [params.specialistId] - Optional specialist ID filter
 * @param {string} [params.serviceId] - Optional service ID filter
 * @param {Object} options - Additional options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} Query result with { data: fullyBooked[], isLoading, error, ... }
 */
export function useFullyBookedDates(params, options = {}) {
  const { enabled = true } = options;
  const { year, month, specialistId, serviceId } = params;

  const hasRequiredParams = !!(year && month);

  return useQuery({
    queryKey: slotsKeys.fullyBooked({ year, month, specialistId, serviceId }),
    queryFn: async ({ signal }) => {
      const queryParams = { year, month };

      if (specialistId) queryParams.specialistId = specialistId;
      if (serviceId) queryParams.serviceId = serviceId;

      const response = await api.get("/slots/fully-booked", {
        params: queryParams,
        signal,
      });

      return response.data.fullyBooked || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (availability changes more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled && hasRequiredParams,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
