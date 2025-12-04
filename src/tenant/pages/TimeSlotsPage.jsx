import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  setDateTime,
  setBeautician as setBeauticianInState,
  setService as setServiceInState,
} from "../state/bookingSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackBar from "../../shared/components/ui/BackBar";
import DateTimePicker from "../../shared/components/DateTimePicker";
import { api } from "../../shared/lib/apiClient";
import PageTransition from "../../shared/components/ui/PageTransition";
import toast from "react-hot-toast";

export default function TimeSlots() {
  const { service: bookingService, beautician: bookingBeautician } =
    useSelector((s) => s.booking);
  const serviceId = bookingService?.serviceId;
  const variantName = bookingService?.variantName;
  const beauticianId = bookingBeautician?.beauticianId;
  const any = bookingBeautician?.any;

  const [beautician, setBeautician] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Restore booking state from URL parameters if Redux state is empty
  useEffect(() => {
    if (!serviceId || !beauticianId) {
      const serviceParam = searchParams.get("service");
      const variantParam = searchParams.get("variant");
      const beauticianParam = searchParams.get("beautician");

      if (serviceParam && beauticianParam) {
        // Restore service and beautician to Redux from URL
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
          .get(`/beauticians/${beauticianParam}`)
          .then((res) => {
            dispatch(
              setBeauticianInState({
                beauticianId: res.data._id,
                any: false,
                inSalonPayment: res.data.inSalonPayment || false,
              })
            );
          })
          .catch((err) => console.error("Failed to restore beautician:", err));
      }
    }
  }, [serviceId, beauticianId, searchParams, dispatch]);

  // Fetch service and beautician details
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

    // Fetch service first to get assigned beautician
    api
      .get(`/services/${serviceId}`, {
        signal: abortController.signal, // Add cancellation signal
      })
      .then((serviceResponse) => {
        if (isCancelled) return; // Don't update state if unmounted

        setService(serviceResponse.data);

        // Determine which beautician to use
        // Note: primaryBeauticianId might be populated (object) or just an ID (string)
        const primaryBeautician = serviceResponse.data.primaryBeauticianId;
        const legacyBeautician = serviceResponse.data.beauticianId;
        const legacyBeauticianArray = serviceResponse.data.beauticianIds?.[0];

        const targetBeauticianId =
          beauticianId ||
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
          setError("No beautician assigned to this service");
          setLoading(false);
          return;
        }

        // Fetch beautician details with cancellation FIRST
        return api.get(`/beauticians/${targetBeauticianId}`, {
          signal: abortController.signal,
        });
      })
      .then((beauticianResponse) => {
        if (isCancelled || !beauticianResponse) return;

        const beauticianData = beauticianResponse.data;

        // Store beautician ID AND inSalonPayment flag in Redux state for checkout
        dispatch(
          setBeauticianInState({
            beauticianId: beauticianData._id,
            any: false,
            inSalonPayment: beauticianData.inSalonPayment || false,
          })
        );

        // Convert legacy working hours to new format if needed
        if (
          (!beauticianData.workingHours ||
            beauticianData.workingHours.length === 0) &&
          beauticianData.legacyWorkingHours
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
            beauticianData.legacyWorkingHours
          )) {
            if (schedule && schedule.start && schedule.end) {
              convertedHours.push({
                dayOfWeek: dayMapping[dayKey],
                start: schedule.start,
                end: schedule.end,
              });
            }
          }

          beauticianData.workingHours = convertedHours;
        }

        setBeautician(beauticianData);
      })
      .catch((err) => {
        // Ignore cancellation errors
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        if (isCancelled) return;

        console.error("Failed to load service/beautician:", err);
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
  }, [serviceId, beauticianId]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10"
        >
          <motion.svg
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 text-white/40"
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
          <p className="text-white/70 text-lg mb-6">
            Please select a service first.
          </p>
          <button
            onClick={() => navigate("/services")}
            className="px-8 py-3 bg-white hover:bg-green-400 text-black font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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
          className="max-w-md mx-auto text-center bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10"
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
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all duration-300 border border-white/20"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Noise Texture */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <PageTransition className="min-h-screen relative z-0">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto px-4 pt-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors font-semibold group"
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
          className="max-w-4xl mx-auto px-4 mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Select Date & Time
          </h1>
          <p className="text-xl text-white/70 font-light">
            Choose an available date and time for your appointment
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto px-4 pb-12"
        >
          {loading ? (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white/60">Loading availability...</p>
              </div>
            </div>
          ) : beautician ? (
            <DateTimePicker
              beauticianId={beautician._id}
              serviceId={serviceId}
              variantName={variantName}
              salonTz="Europe/London"
              stepMin={15}
              beauticianWorkingHours={(beautician.workingHours || []).filter(
                (wh) => wh && wh.dayOfWeek != null
              )}
              onSelect={handleSlotSelect}
            />
          ) : (
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
              <motion.svg
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 text-white/40"
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
              <p className="text-white/70 text-lg">
                Unable to load availability. Please try again.
              </p>
            </div>
          )}
        </motion.div>
      </PageTransition>
    </>
  );
}
