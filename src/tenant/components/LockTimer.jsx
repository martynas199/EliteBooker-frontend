/**
 * Lock Timer Component
 * Displays countdown timer and lock status for booking reservations
 */

import { motion, AnimatePresence } from "framer-motion";
import { useLockManager } from "../../shared/hooks/useLockManager";

export default function LockTimer({
  lockData,
  remainingTime,
  formatRemainingTime,
  getRemainingTimePercentage,
}) {
  if (!lockData) return null;

  const percentage = getRemainingTimePercentage();
  const isExpiringSoon = remainingTime < 30000; // Less than 30 seconds

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div
          className={`
          bg-white rounded-xl shadow-2xl border-2 p-4
          ${
            isExpiringSoon ? "border-red-500 animate-pulse" : "border-brand-500"
          }
        `}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isExpiringSoon ? "bg-red-100" : "bg-brand-100"}
            `}
            >
              <svg
                className={`w-6 h-6 ${
                  isExpiringSoon ? "text-red-600" : "text-brand-600"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Slot Reserved</h3>
              <p className="text-xs text-gray-600">
                Complete your booking before time expires
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Time Remaining:
              </span>
              <span
                className={`
                text-2xl font-black
                ${isExpiringSoon ? "text-red-600" : "text-brand-600"}
              `}
              >
                {formatRemainingTime()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`
                  h-full rounded-full
                  ${isExpiringSoon ? "bg-red-500" : "bg-brand-500"}
                `}
                initial={{ width: "100%" }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold text-gray-900">
                {lockData.date}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold text-gray-900">
                {lockData.startTime}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold text-gray-900">
                {lockData.duration} min
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {isExpiringSoon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-xs text-red-800 font-medium text-center">
                ⚠️ Hurry! Your reservation expires soon
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
