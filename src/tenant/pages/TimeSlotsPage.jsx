import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  setDateTime,
  setSpecialist as setSpecialistInState,
  setService as setServiceInState,
} from "../state/bookingSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackBar from "../../shared/components/ui/BackBar";
import DateTimePicker from "../../shared/components/DateTimePicker";
import ServiceStackBar from "../components/ServiceStackBar";
import BookingSummary from "../components/BookingSummary";
import BookingProgress from "../components/BookingProgress";
import BookingConfirmLeaveModal from "../components/BookingConfirmLeaveModal";
import { api } from "../../shared/lib/apiClient";
import PageTransition from "../../shared/components/ui/PageTransition";
import toast from "react-hot-toast";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useBookingGuard } from "../hooks/useBookingGuard";

export default function TimeSlots() {
  const {
    service: bookingService,
    specialist: bookingSpecialist,
    services: bookingServices,
  } = useSelector((s) => s.booking);
  const serviceId = bookingService?.serviceId;
  const variantName = bookingService?.variantName;
  const specialistId = bookingSpecialist?.specialistId; // Backend field name preserved
  const any = bookingSpecialist?.any;
  const { tenant } = useTenant();
  const { client } = useClientAuth();

  // Calculate total duration from all selected services
  const totalDuration = useMemo(() => {
    if (!bookingServices || bookingServices.length === 0) return null;
    return bookingServices.reduce(
      (sum, svc) => sum + (svc.durationMin || 0),
      0
    );
  }, [bookingServices]);

  const [specialist, setSpecialist] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Enable booking guard to warn on navigation away
  const { showModal, onConfirmLeave, onCancelLeave, checkNavigation } =
    useBookingGuard();

  // Handle back navigation with guard
  const handleBack = () => {
    const canNavigate = checkNavigation(
      window.location.pathname.split("/").slice(0, -1).join("/"),
      () => navigate(-1)
    );
    if (canNavigate) navigate(-1);
  };

  // Restore booking state from URL parameters if Redux state is empty
  useEffect(() => {
    if (!serviceId || !specialistId) {
      const serviceParam = searchParams.get("service");
      const variantParam = searchParams.get("variant");
      const specialistParam = searchParams.get("specialist"); // URL param name unchanged

      if (serviceParam && specialistParam) {
        // Restore service and specialist to Redux from URL
        api
          .get(`/services/${serviceParam}`)
          .then((res) => {
            const service = res.data;
            const variant =
              service.variants?.find((v) => v.name === variantParam) ||
              service.variants?.[0];

            if (variant) {
              const finalPrice = variant.promoPrice || variant.price;
              dispatch(
                setServiceInState({
                  serviceId: service._id,
                  serviceName: service.name,
                  variantName: variant.name,
                  price: finalPrice,
                  durationMin: variant.durationMin,
                  bufferBeforeMin: variant.bufferBeforeMin,
                  bufferAfterMin: variant.bufferAfterMin,
                })
              );
            }
          })
          .catch((err) => console.error("Failed to restore service:", err));

        api
          .get(`/specialists/${specialistParam}`)
          .then((res) => {
            dispatch(
              setSpecialistInState({
                specialistId: res.data._id,
                any: false,
                inSalonPayment: res.data.inSalonPayment || false,
              })
            );
          })
          .catch((err) => console.error("Failed to restore specialist:", err));
      }
    }
  }, [serviceId, specialistId, searchParams, dispatch]);

  // Fetch service and specialist details
  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create AbortController for request cancellation
    const abortController = new AbortController();
    let isCancelled = false;

    // Fetch service first to get assigned specialist
    api
      .get(`/services/${serviceId}`, {
        signal: abortController.signal, // Add cancellation signal
      })
      .then((serviceResponse) => {
        if (isCancelled) return; // Don't update state if unmounted

        setService(serviceResponse.data);

        // Determine which specialist to use
        // Note: primaryBeauticianId might be populated (object) or just an ID (string)
        const primaryBeautician = serviceResponse.data.primaryBeauticianId;
        const legacyBeautician = serviceResponse.data.specialistId;
        const legacyBeauticianArray = serviceResponse.data.beauticianIds?.[0];

        const targetBeauticianId =
          specialistId ||
          (typeof primaryBeautician === "object"
            ? primaryBeautician._id
            : primaryBeautician) ||
          (typeof legacyBeautician === "object"
            ? legacyBeautician._id
            : legacyBeautician) ||
          (typeof legacyBeauticianArray === "object"
            ? legacyBeauticianArray._id
            : legacyBeauticianArray);

        if (!targetBeauticianId) {
          setError("No specialist assigned to this service");
          setLoading(false);
          return;
        }

        // Fetch specialist details with cancellation FIRST
        return api.get(`/specialists/${targetBeauticianId}`, {
          signal: abortController.signal,
        });
      })
      .then((specialistResponse) => {
        if (isCancelled || !specialistResponse) return;

        const specialistData = specialistResponse.data;

        // Store specialist ID AND inSalonPayment flag in Redux state for checkout
        dispatch(
          setSpecialistInState({
            specialistId: specialistData._id,
            any: false,
            inSalonPayment: specialistData.inSalonPayment || false,
          })
        );

        // Convert legacy working hours to new format if needed
        if (
          (!specialistData.workingHours ||
            specialistData.workingHours.length === 0) &&
          specialistData.legacyWorkingHours
        ) {
          const dayMapping = {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6,
            sun: 0,
          };

          const convertedHours = [];
          for (const [dayKey, schedule] of Object.entries(
            specialistData.legacyWorkingHours
          )) {
            if (schedule && schedule.start && schedule.end) {
              convertedHours.push({
                dayOfWeek: dayMapping[dayKey],
                start: schedule.start,
                end: schedule.end,
              });
            }
          }

          specialistData.workingHours = convertedHours;
        }

        setSpecialist(specialistData);
      })
      .catch((err) => {
        // Ignore cancellation errors
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        if (isCancelled) return;

        console.error("Failed to load service/specialist:", err);
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to load availability";
        setError(errorMsg);
        toast.error(errorMsg);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    // Cleanup: Cancel request if component unmounts
    return () => {
      isCancelled = true;
      abortController.abort();
    };
  }, [serviceId, specialistId]);

  const handleSlotSelect = (slot) => {
    // Store the selected slot's start time
    const slotDate = new Date(slot.startISO);
    dispatch(
      setDateTime({
        date: slotDate.toISOString().split("T")[0],
        time: slot.startISO,
      })
    );
    // Navigate to checkout with URL params preserved
    const currentParams = new URLSearchParams(searchParams);
    navigate(`../checkout?${currentParams.toString()}`);
  };

  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/10"
        >
          <motion.svg
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </motion.svg>
          <p className="text-gray-700 text-lg mb-6">
            Please select a service first.
          </p>
          <button
            onClick={() => navigate(`/salon/${tenant?.slug}/specialists`)}
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Choose Service
          </button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-full transition-all duration-300"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Booking Guard Modal */}
      <BookingConfirmLeaveModal
        isOpen={showModal}
        onConfirm={onConfirmLeave}
        onCancel={onCancelLeave}
      />

      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-white" />

      <PageTransition className="min-h-screen relative">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:max-w-7xl lg:mx-auto px-4 sm:px-6 lg:px-8 pt-8"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors font-semibold group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
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
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:max-w-7xl lg:mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Select a Time
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-light">
            Choose an available date and time for your appointment
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:max-w-7xl lg:mx-auto px-4 sm:px-6 lg:px-8 pb-12"
        >
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading availability...</p>
              </div>
            </div>
          ) : specialist ? (
            <DateTimePicker
              specialistId={specialist._id}
              serviceId={serviceId}
              variantName={variantName}
              totalDuration={totalDuration}
              salonTz="Europe/London"
              stepMin={15}
              beauticianWorkingHours={(specialist.workingHours || []).filter(
                (wh) => wh && wh.dayOfWeek != null
              )}
              customSchedule={specialist.customSchedule || {}}
              waitlistClient={client}
              onSelect={handleSlotSelect}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-12 text-center">
              <motion.svg
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </motion.svg>
              <p className="text-gray-700 text-lg">
                Unable to load availability. Please try again.
              </p>
            </div>
          )}
        </motion.div>

        {/* Service Stack Bar - Hidden on time selection page */}
        {/* <ServiceStackBar /> */}
      </PageTransition>
    </>
  );
}
