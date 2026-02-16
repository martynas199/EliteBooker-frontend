/**
 * Example: Time Slots Page with Redis Lock Integration
 * Shows how to integrate the lock system into your existing booking flow
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useLockManager } from "../../shared/hooks/useLockManager";
import { selectBooking } from "../state/bookingSlice";
import LockTimer from "../components/LockTimer";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

export default function TimeSlotsPageWithLocks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const booking = useSelector(selectBooking);

  // Lock manager hook
  const {
    lockData,
    isLocked,
    isAcquiring,
    error: lockError,
    remainingTime,
    acquireLock,
    releaseLock,
    formatRemainingTime,
    getRemainingTimePercentage,
    clearError,
  } = useLockManager({
    refreshInterval: 30000, // Refresh every 30 seconds
    autoRefresh: true,
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load available time slots
  useEffect(() => {
    async function loadSlots() {
      try {
        setLoading(true);
        // Your existing slot loading logic here
        const slots = await fetchAvailableSlots({
          specialistId: booking.specialistId,
          serviceId: booking.serviceId,
          date: booking.date,
        });
        setAvailableSlots(slots);
      } catch (error) {
        console.error("Failed to load slots:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSlots();
  }, [booking]);

  // Handle slot selection with lock acquisition
  const handleSlotSelect = async (slot) => {
    // Prevent selection if already acquiring lock
    if (isAcquiring) return;

    // Clear any previous errors
    clearError();

    // Release any existing lock first
    if (isLocked) {
      await releaseLock();
    }

    // Acquire lock on new slot
    const result = await acquireLock({
      tenantId: tenant.id,
      resourceId: booking.specialistId,
      date: slot.date,
      startTime: slot.time,
      duration: booking.durationMin,
    });

    if (result.success) {
      // Lock acquired successfully
      setSelectedSlot(slot);

      // Update booking state with locked slot
      dispatch(
        setBookingTime({
          startTime: slot.time,
          endTime: slot.endTime,
        })
      );

      // Navigate to checkout after short delay (better UX)
      setTimeout(() => {
        navigate("/checkout");
      }, 500);
    } else {
      // Lock acquisition failed - slot is taken
      toast.error(
        "This time slot is currently being booked by another customer. Please choose a different time."
      );
    }
  };

  // Handle navigation away (cleanup)
  const handleBack = async () => {
    if (isLocked) {
      await releaseLock();
    }
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Lock Timer (fixed position overlay) */}
      {isLocked && (
        <LockTimer
          lockData={lockData}
          remainingTime={remainingTime}
          formatRemainingTime={formatRemainingTime}
          getRemainingTimePercentage={getRemainingTimePercentage}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select Time Slot
        </h1>
        <p className="text-gray-600">Choose your preferred appointment time</p>
      </div>

      {/* Lock Error Display */}
      {lockError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                {lockError.type === "lock_expired"
                  ? "Reservation Expired"
                  : "Slot Unavailable"}
              </h3>
              <p className="text-sm text-red-700">{lockError.message}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Booking Summary */}
      <div className="mb-8 p-6 bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl border border-brand-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Service</p>
            <p className="font-semibold text-gray-900">{booking.serviceName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Specialist</p>
            <p className="font-semibold text-gray-900">
              {booking.beauticianName || "Any Available"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Duration</p>
            <p className="font-semibold text-gray-900">
              {booking.durationMin} minutes
            </p>
          </div>
        </div>
      </div>

      {/* Available Time Slots */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Available Times
        </h2>

        {availableSlots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Available Slots
            </h3>
            <p className="text-gray-600">
              No time slots available for the selected date. Please choose a
              different date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableSlots.map((slot) => (
              <motion.button
                key={slot.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSlotSelect(slot)}
                disabled={
                  isAcquiring || (isLocked && selectedSlot?.id !== slot.id)
                }
                className={`
                  relative p-4 rounded-xl border-2 font-semibold transition-all
                  ${
                    selectedSlot?.id === slot.id && isLocked
                      ? "bg-brand-500 text-white border-brand-600 shadow-lg"
                      : isAcquiring
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-900 border-gray-200 hover:border-brand-500 hover:shadow-md"
                  }
                `}
              >
                {isAcquiring ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                ) : (
                  <>
                    <div className="text-lg">{slot.time}</div>
                    {selectedSlot?.id === slot.id && isLocked && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Select your preferred time slot</li>
              <li>Your reservation will be held for 2 minutes</li>
              <li>Complete the booking form before time expires</li>
              <li>If time runs out, you'll need to select a slot again</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
