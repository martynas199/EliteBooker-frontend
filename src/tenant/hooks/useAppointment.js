import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingAPI } from "../pages/booking.api";
import { slotsKeys } from "./useSlots";

/**
 * Query keys for appointments
 */
export const appointmentsKeys = {
  all: ["tenant", "appointments"],
  details: () => [...appointmentsKeys.all, "detail"],
  detail: (id) => [...appointmentsKeys.details(), id],
};

/**
 * Hook to fetch appointment details
 *
 * @param {string} appointmentId - Appointment ID
 * @param {Object} options - Query options
 * @param {boolean} [options.enabled=true] - Whether to enable the query
 * @returns {Object} Query result with { data: appointment, isLoading, error, ... }
 */
export function useAppointment(appointmentId, options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: appointmentsKeys.detail(appointmentId),
    queryFn: () => BookingAPI.getOne(appointmentId),
    staleTime: 30 * 1000, // 30 seconds (appointment details can change)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled && !!appointmentId,
    retry: 2,
  });
}

/**
 * Hook for reserving appointment without payment (pay in salon)
 * Includes cache invalidation for affected slots
 *
 * @returns {Object} Mutation object with { mutate, mutateAsync, isLoading, error, ... }
 */
export function useReserveAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData) => BookingAPI.reserveWithoutPayment(bookingData),
    onSuccess: (data, variables) => {
      // Invalidate slots for the booked date/specialist
      // This ensures availability is updated after booking
      if (variables.startISO && variables.specialistId) {
        const date = variables.startISO.split("T")[0]; // Extract YYYY-MM-DD

        // Invalidate specific slot queries for this specialist and date
        queryClient.invalidateQueries({
          queryKey: slotsKeys.all,
          predicate: (query) => {
            const params = query.queryKey[2]; // params object in query key
            return (
              params?.specialistId === variables.specialistId &&
              params?.date === date
            );
          },
        });

        // Also invalidate fully booked queries for the month
        const [year, month] = date.split("-");
        queryClient.invalidateQueries({
          queryKey: slotsKeys.fullyBooked({
            year: parseInt(year),
            month: parseInt(month),
          }),
        });
      }

      // Store appointment detail in cache
      if (data?.appointmentId) {
        queryClient.setQueryData(
          appointmentsKeys.detail(data.appointmentId),
          data
        );
      }
    },
    retry: 1,
    retryDelay: 1000,
  });
}
