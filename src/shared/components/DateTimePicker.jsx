import { useState, useEffect, useCallback, useMemo } from "react";
import { DayPicker } from "react-day-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "react-day-picker/dist/style.css";
import { useAvailableDates } from "../hooks/useAvailableDates";
import { api } from "../lib/apiClient";
import { StaggerContainer, StaggerItem } from "./ui/PageTransition";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * DateTimePicker - Production-ready date and time slot picker
 *
 * @param {object} props
 * @param {string} props.specialistId - ID of the specialist
 * @param {string} props.serviceId - ID of the selected service
 * @param {string} props.variantName - Name of the selected variant
 * @param {number} props.totalDuration - Total duration in minutes for multi-service bookings
 * @param {string} props.salonTz - Timezone (e.g., "Europe/London")
 * @param {number} props.stepMin - Step interval in minutes (default 15)
 * @param {function} props.onSelect - Callback when slot selected: (slot) => void
 * @param {object} props.beauticianWorkingHours - Array of { dayOfWeek, start, end }
 * @param {object} props.customSchedule - Custom schedule overrides: { "YYYY-MM-DD": [{ start, end }] }
 */
export default function DateTimePicker({
  specialistId,
  serviceId,
  variantName,
  totalDuration,
  salonTz = "Europe/London",
  stepMin = 15,
  onSelect,
  beauticianWorkingHours = [],
  customSchedule = {},
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [mobileCalendarOpen, setMobileCalendarOpen] = useState(false);

  // Get today in salon timezone
  const today = useMemo(() => {
    return dayjs().tz(salonTz).startOf("day").toDate();
  }, [salonTz]);

  // Fetch fully booked dates for current month
  const {
    fullyBooked,
    isLoading: loadingAvailableDates,
    error: availableDatesError,
    refetch: refetchAvailableDates,
  } = useAvailableDates(
    specialistId,
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  );

  // Log fully booked dates when they change (disabled for production)
  // useEffect(() => {
  //   console.log("[DateTimePicker] Fully booked dates:", fullyBooked);
  // }, [fullyBooked]);

  // Build set of working days (0=Sunday, 6=Saturday)
  const workingDaysSet = useMemo(() => {
    const workingDays = beauticianWorkingHours.map((wh) => wh.dayOfWeek);
    return new Set(workingDays);
  }, [beauticianWorkingHours, customSchedule]);

  // Determine if a date should be disabled
  const isDateDisabled = useCallback(
    (date) => {
      // Safety check
      if (!date) return true;

      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const dayOfWeek = date.getDay();

      // Past dates
      if (date < today) {
        return true;
      }

      // Check if date has custom schedule override
      if (customSchedule[dateStr]) {
        const customHours = customSchedule[dateStr];
        // If custom schedule exists but is empty array, day is not working
        if (customHours.length === 0) {
          return true;
        }
        // If custom schedule has hours, day is working
        return false;
      }

      // Not a working day (check weekly schedule)
      if (!workingDaysSet.has(dayOfWeek)) {
        return true;
      }

      // Fully booked
      if (fullyBooked.includes(dateStr)) {
        return true;
      }

      return false;
    },
    [today, workingDaysSet, fullyBooked, customSchedule]
  );

  // Get disabled reason for tooltip
  const getDisabledReason = useCallback(
    (date) => {
      // Safety check
      if (!date) return "";

      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const dayOfWeek = date.getDay();

      if (date < today) return "Past date";

      // Check custom schedule first
      if (customSchedule[dateStr]) {
        const customHours = customSchedule[dateStr];
        if (customHours.length === 0) return "Not working (custom schedule)";
        // Has custom hours, so not disabled by schedule
      } else if (!workingDaysSet.has(dayOfWeek)) {
        return "Not working";
      }

      if (fullyBooked.includes(dateStr)) return "Fully booked";
      return "";
    },
    [today, workingDaysSet, fullyBooked, customSchedule]
  );

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSlotsError(null);
      setSelectedSlot(null);

      try {
        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
        const params = {
          specialistId,
          serviceId,
          variantName,
          date: dateStr,
        };
        
        // If totalDuration is provided (multi-service), send it instead of relying on single service
        if (totalDuration) {
          params.totalDuration = totalDuration;
        }
        
        console.log('[TIMESLOTS] Fetching slots with params:', params);
        
        const response = await api.get("/slots", { params });
        
        console.log('[TIMESLOTS] Received slots:', {
          count: response.data.slots?.length || 0,
          date: dateStr,
          totalDuration: params.totalDuration
        });

        const fetchedSlots = response.data.slots || [];

        // Client-side validation of slots
        const validatedSlots = fetchedSlots.filter((slot) => {
          try {
            // Rule 1: Valid ISO strings
            const start = dayjs(slot.startISO);
            const end = dayjs(slot.endISO);
            if (!start.isValid() || !end.isValid()) {
              console.error("Invalid ISO string in slot:", slot);
              return false;
            }

            // Rule 2: End after start
            if (!end.isAfter(start)) {
              console.error("Slot end not after start:", slot);
              return false;
            }

            // Rule 3: Slot in correct date
            const slotDate = start.tz(salonTz).format("YYYY-MM-DD");
            if (slotDate !== dateStr) {
              console.error(
                "Slot not on selected date:",
                slot,
                "slotDate:",
                slotDate,
                "expected:",
                dateStr
              );
              return false;
            }

            return true;
          } catch (err) {
            console.error("Slot validation error:", err, slot);
            return false;
          }
        });

        // If too many slots invalidated, show error
        if (
          fetchedSlots.length > 0 &&
          validatedSlots.length < fetchedSlots.length * 0.8
        ) {
          console.error(
            `Too many invalid slots: ${
              fetchedSlots.length - validatedSlots.length
            }/${fetchedSlots.length}`
          );
          setSlotsError(
            "Temporary error fetching slots — please try another date"
          );
          setSlots([]);
        } else {
          setSlots(validatedSlots);
        }
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setSlotsError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load available times"
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, specialistId, serviceId, variantName, salonTz]);

  const handleDateSelect = (date) => {
    if (!date || isDateDisabled(date)) return;
    setSelectedDate(date);
    setMobileCalendarOpen(false);
  };

  const handleSlotSelect = (slot) => {
    if (selectedSlot?.startISO === slot.startISO) return; // Already selected
    setSelectedSlot(slot);
    onSelect(slot);
  };

  const handleRetrySlots = () => {
    if (selectedDate) {
      // Trigger re-fetch by clearing and re-setting date
      const date = selectedDate;
      setSelectedDate(null);
      setTimeout(() => setSelectedDate(date), 50);
    }
  };

  const handleRetryAvailableDates = () => {
    refetchAvailableDates();
  };

  // Format slot time for display
  const formatSlotTime = (isoString) => {
    return dayjs(isoString).tz(salonTz).format("HH:mm");
  };

  // Format selected date for display
  const formatSelectedDate = (date) => {
    return dayjs(date).format("dddd, MMMM D, YYYY");
  };

  return (
    <div className="w-full max-w-5xl mx-auto min-w-0">
      {/* Error banner for available dates */}
      {availableDatesError && (
        <div
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
            <div className="flex-1">
              <h4 className="text-red-900 font-semibold text-sm mb-1">
                Setup Required
              </h4>
              <p className="text-red-800 text-sm">
                {availableDatesError.includes("dayOfWeek")
                  ? "The specialist's working hours have not been configured yet. Please contact the salon administrator to set up availability."
                  : `Failed to load available dates: ${availableDatesError}`}
              </p>
              <button
                onClick={handleRetryAvailableDates}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Calendar Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-2 sm:p-6 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 sm:mb-6">
            Select a Date
          </h3>

          {/* Mobile: Compact date button */}
          <button
            className="lg:hidden w-full px-3 py-3 rounded-lg text-left flex items-center justify-between mb-4 text-gray-900 hover:bg-gray-100 transition-all"
            onClick={() => setMobileCalendarOpen(!mobileCalendarOpen)}
            aria-expanded={mobileCalendarOpen}
            aria-label="Open calendar"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-base">
                {selectedDate
                  ? formatSelectedDate(selectedDate)
                  : "Choose date"}
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-green-400 transform transition-transform duration-200 ${
                mobileCalendarOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Calendar - hidden on mobile unless opened */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out lg:!block lg:!max-h-none lg:!opacity-100 ${
              mobileCalendarOpen
                ? "max-h-[600px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="relative">
              {loadingAvailableDates && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="text-gray-900 font-semibold">
                    Loading calendar...
                  </div>
                </div>
              )}

              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={isDateDisabled}
                fromDate={today}
                toDate={dayjs(today).add(3, "month").toDate()}
                modifiersClassNames={{
                  selected: "rdp-selected-custom",
                  disabled: "rdp-disabled-custom",
                  today: "rdp-today-custom",
                }}
                className="mx-auto"
                components={{
                  DayButton: ({ day, modifiers, ...props }) => {
                    const date = day.date;

                    // Safety check for undefined dates
                    if (!date) {
                      return <button {...props} />;
                    }

                    const disabled = modifiers?.disabled;
                    const reason = disabled ? getDisabledReason(date) : "";

                    return (
                      <>
                        <button
                          {...props}
                          title={reason}
                          aria-label={`${dayjs(date).format("MMMM D, YYYY")}${
                            reason ? ` - ${reason}` : ""
                          }`}
                        />
                        {disabled && reason && (
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-20 pointer-events-none">
                            {reason}
                          </div>
                        )}
                      </>
                    );
                  },
                }}
              />
            </div>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            /* Calendar custom styles - Light Theme */
            .rdp-selected-custom,
            .rdp-selected-custom button {
              background-color: #000000 !important;
              color: #ffffff !important;
              font-weight: 700;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            }
            .rdp-disabled-custom {
              background-color: #fee !important;
              color: #fca5a5 !important;
              cursor: not-allowed !important;
              text-decoration: line-through;
              font-weight: 500;
              opacity: 0.5;
              position: relative;
              border: 1px solid rgba(252, 165, 165, 0.3) !important;
            }
            .rdp-disabled-custom::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 2px;
              height: 140%;
              background-color: #ef4444;
              transform: translate(-50%, -50%) rotate(45deg);
            }
            .rdp-today-custom {
              font-weight: 700;
              border: 2px solid #000000 !important;
              color: #000000 !important;
            }
            
            /* Fix weekday headers */
            .rdp-root {
              --rdp-accent-color: #000000;
              --rdp-background-color: #f9fafb;
            }
            .rdp-month {
              width: 100%;
            }
            .rdp-caption {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 0;
              margin-bottom: 1rem;
            }
            .rdp-caption_label {
              color: #111827;
              font-weight: 700;
              font-size: 1rem;
            }
            .rdp-nav {
              display: flex;
              gap: 0.5rem;
            }
            .rdp-nav button {
              width: 2rem;
              height: 2rem;
              border-radius: 0.375rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #111827;
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              transition: all 0.2s;
            }
            .rdp-nav button:hover {
              background-color: #f3f4f6;
              border-color: #9ca3af;
            }
            .rdp-nav button svg {
              width: 1rem;
              height: 1rem;
            }
            .rdp-weekdays {
              display: flex;
              margin-bottom: 0.75rem;
              background-color: #f9fafb;
              border-radius: 0.5rem;
              padding: 0.5rem 0;
              border: 1px solid #e5e7eb;
            }
            .rdp-weekday {
              flex: 1;
              text-align: center;
              font-size: 0.875rem;
              font-weight: 700;
              color: #6b7280;
              padding: 0.25rem 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .rdp-week {
              display: flex;
              margin-bottom: 0.25rem;
            }
            .rdp-day {
              flex: 1;
              text-align: center;
            }
            .rdp-day button {
              width: 2.5rem;
              height: 2.5rem;
              border-radius: 0.5rem;
              font-size: 0.875rem;
              margin: 0 auto;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
              color: #111827;
              font-weight: 500;
              border: 1px solid transparent;
            }
            .rdp-day button:hover:not(:disabled) {
              background-color: #f3f4f6;
              border-color: #9ca3af;
              color: #000000;
            }
            .rdp-day button:disabled {
              cursor: not-allowed;
              opacity: 0.3;
            }
          `,
            }}
          />
        </div>

        {/* Time Slots Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6 min-w-0">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {selectedDate ? "Available Times" : "Select a date first"}
          </h3>

          {!selectedDate && (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg">Please select a date from the calendar</p>
            </div>
          )}

          {selectedDate && loadingSlots && (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded-lg animate-pulse"
                  role="status"
                  aria-label="Loading time slots"
                />
              ))}
            </div>
          )}

          {selectedDate && !loadingSlots && slotsError && (
            <div
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              role="alert"
            >
              <p className="text-red-400 text-sm mb-3">{slotsError}</p>
              <button
                onClick={handleRetrySlots}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {selectedDate &&
            !loadingSlots &&
            !slotsError &&
            slots.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
                <p className="font-bold text-gray-900 text-lg">
                  No available times for this date
                </p>
                <p className="text-sm mt-2">Please try another date</p>
              </div>
            )}

          {selectedDate && !loadingSlots && !slotsError && slots.length > 0 && (
            <StaggerContainer
              className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto"
              role="listbox"
              aria-label="Available time slots"
            >
              {slots.map((slot, index) => {
                const isSelected = selectedSlot?.startISO === slot.startISO;
                return (
                  <StaggerItem key={`${slot.startISO}-${index}`}>
                    <button
                      onClick={() => handleSlotSelect(slot)}
                      disabled={isSelected}
                      className={`
                        px-3 py-3 rounded-xl font-bold text-sm transition-all duration-300
                        hover:scale-105 active:scale-95
                        ${
                          isSelected
                            ? "bg-green-400 text-black ring-2 ring-green-300 shadow-lg shadow-green-400/30"
                            : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300 hover:border-gray-400"
                        }
                        disabled:cursor-not-allowed
                        focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent
                      `}
                      role="option"
                      aria-selected={isSelected}
                      aria-label={`Time slot ${formatSlotTime(slot.startISO)}`}
                    >
                      {formatSlotTime(slot.startISO)}
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </div>
    </div>
  );
}
