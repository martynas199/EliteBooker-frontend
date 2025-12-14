import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookingAPI } from "./booking.api";
import Button from "../../shared/components/ui/Button";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SuccessPage() {
  const q = useQuery();
  const appointmentId = q.get("appointmentId");
  const sessionId = q.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | confirmed | pending | error
  const [appt, setAppt] = useState(null);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    let timeoutId = null;

    async function fetchAppt() {
      if (!appointmentId) {
        setStatus("error");
        return;
      }
      try {
        // Only call confirm endpoint once on first attempt
        if (attempts === 0 && sessionId) {
          try {
            const apiUrl =
              import.meta.env.VITE_API_URL || "http://localhost:4000";
            await fetch(
              `${apiUrl}/api/checkout/confirm?session_id=${encodeURIComponent(
                sessionId
              )}`
            );
          } catch {}
        }

        const a = await BookingAPI.getOne(appointmentId);
        if (!mounted) return;
        setAppt(a);

        if (a?.status === "confirmed") {
          setStatus("confirmed");
          return;
        }

        // Wait for webhook to confirm; poll with increasing intervals up to 10 attempts
        attempts++;
        if (attempts < 10) {
          setStatus("pending");
          // Increase delay: 1s, 2s, 3s, etc.
          timeoutId = setTimeout(fetchAppt, attempts * 1000);
        } else {
          setStatus("pending"); // still pending; show message
        }
      } catch (e) {
        if (!mounted) return;
        setStatus("error");
      }
    }

    fetchAppt();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [appointmentId, sessionId]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-brand-500/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-brand-600/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 sm:py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          {status === "confirmed" ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
              {/* Success Icon & Header */}
              <div className="px-4 sm:px-8 py-8 sm:py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                  className="bg-green-100 border-2 border-green-600 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6"
                >
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3"
                >
                  Booking Confirmed!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-base sm:text-lg"
                >
                  Your appointment has been successfully booked
                </motion.p>
              </div>

              {/* Appointment Details */}
              {appt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="px-4 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6"
                >
                  {/* Service Info */}
                  <div className="text-center pb-4 sm:pb-6 border-b border-gray-200">
                    {appt?.services && appt.services.length > 0 ? (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                          {appt.services.length === 1
                            ? "Service Booked"
                            : `${appt.services.length} Services Booked`}
                        </h2>
                        <div className="space-y-2 sm:space-y-3">
                          {appt.services.map((service, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-3 sm:p-4"
                            >
                              <p className="text-base sm:text-lg font-bold text-gray-900">
                                {service.service?.name || "Service"}
                              </p>
                              <p className="text-sm sm:text-base text-gray-600 mt-1">
                                {service.variantName} •{" "}
                                {service.duration || service.durationMin || 0}{" "}
                                min
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                          {appt?.service?.name}
                        </h2>
                        <p className="text-base sm:text-lg text-black font-semibold">
                          {appt?.variantName}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200">
                      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ marginTop: "-1px" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide leading-none">
                          Specialist
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 break-words">
                        {appt?.specialist?.name || "Any specialist"}
                      </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-200">
                      <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-black flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ marginTop: "-1px" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide leading-none">
                          Date & Time
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">
                        {new Date(appt.start).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-semibold text-gray-700">
                        Service Price
                      </span>
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        £{Number(appt.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment breakdown for deposits */}
                  {appt.payment?.mode === "deposit" &&
                    appt.payment?.amountTotal && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="bg-green-500/10 border border-green-600/30 rounded-xl p-4 sm:p-6">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                              Paid Today
                            </h3>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm sm:text-base text-gray-600">
                              <span>Deposit</span>
                              <span className="font-semibold">
                                £
                                {(
                                  (appt.payment.amountTotal - 50) /
                                  100
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm sm:text-base text-gray-600">
                              <span>Booking Fee</span>
                              <span className="font-semibold">£0.50</span>
                            </div>
                            <div className="flex justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-green-600/30">
                              <span className="font-bold text-gray-900 text-sm sm:text-base">
                                Total
                              </span>
                              <span className="text-xl sm:text-2xl font-bold text-green-600">
                                £{(appt.payment.amountTotal / 100).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-600/30 rounded-xl p-4 sm:p-6">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <svg
                              className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                              Balance Due at Salon
                            </h3>
                          </div>
                          <div className="text-3xl sm:text-4xl font-bold text-amber-600">
                            £
                            {(
                              Number(appt.price || 0) -
                              (appt.payment.amountTotal - 50) / 100
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="pt-4 sm:pt-6 border-t border-white/10">
                    <Link to="..">
                      <Button
                        variant="brand"
                        className="w-full text-base sm:text-lg py-3 sm:py-4"
                      >
                        Back to Home
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          ) : status === "pending" ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden text-center px-4 sm:px-8 py-8 sm:py-12">
              <div className="bg-yellow-100 border-2 border-yellow-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-3 border-yellow-600"></div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Processing Payment
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                We received your payment. Your booking will be confirmed
                shortly.
              </p>
            </div>
          ) : status === "loading" ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden text-center px-4 sm:px-8 py-8 sm:py-12">
              <div className="bg-white/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-3 border-white/50"></div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Verifying Payment
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Hold on while we verify your payment…
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden text-center px-4 sm:px-8 py-8 sm:py-12">
              <div className="bg-red-100 border-2 border-red-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Something Went Wrong
              </h1>
              <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
                Could not verify your booking. Please contact the salon with
                your email and time of payment.
              </p>
              <Link to="..">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-900 hover:bg-gray-100 text-base sm:text-lg"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
