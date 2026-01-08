import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
import toast from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import Button from "../../shared/components/ui/Button";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";
import dayjs from "dayjs";

export default function WorkingHoursCalendar() {
  const admin = useSelector(selectAdmin);
  const isSuperAdmin = admin?.role === "super_admin";
  const isSalonAdmin = admin?.role === "salon-admin";

  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Custom schedule for specific dates (overrides default weekly schedule)
  const [customSchedule, setCustomSchedule] = useState({}); // { "2025-12-05": [{ start: "09:00", end: "12:00" }] }

  // Modal state for editing a specific date
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayHours, setDayHours] = useState([]);

  // Modal state for editing weekly schedule
  const [editWeeklyModalOpen, setEditWeeklyModalOpen] = useState(false);
  const [editingDayOfWeek, setEditingDayOfWeek] = useState(null);
  const [weeklyDayHours, setWeeklyDayHours] = useState([]);

  // Drawer state for specialist selection
  const [specialistDrawerOpen, setSpecialistDrawerOpen] = useState(false);

  // Fetch specialists
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const response = await api.get("/specialists", {
          params: { limit: 1000 },
        });
        console.log("Fetched specialists:", response.data);
        setSpecialists(response.data);

        // Auto-select specialist if not super admin (using legacy specialistId field)
        if (!isSuperAdmin && admin?.specialistId) {
          setSelectedSpecialistId(admin.specialistId);
        }
      } catch (error) {
        console.error("Failed to fetch specialists:", error);
        toast.error("Failed to load specialists");
      }
    };

    fetchSpecialists();
  }, [isSuperAdmin, admin?.specialistId]);

  // Fetch selected specialist details
  useEffect(() => {
    if (!selectedSpecialistId) {
      setSelectedSpecialist(null);
      setCustomSchedule({});
      return;
    }

    const fetchSpecialist = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/specialists/${selectedSpecialistId}`);
        console.log(
          "[WorkingHoursCalendar] Fetched specialist:",
          response.data
        );
        console.log(
          "[WorkingHoursCalendar] Working hours:",
          response.data.workingHours
        );
        console.log(
          "[WorkingHoursCalendar] Custom schedule:",
          response.data.customSchedule
        );

        // Log a summary
        if (
          response.data.workingHours &&
          Array.isArray(response.data.workingHours)
        ) {
          console.log(
            `[WorkingHoursCalendar] Total working hour entries: ${response.data.workingHours.length}`
          );
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          response.data.workingHours.forEach((wh, idx) => {
            if (wh && typeof wh.dayOfWeek === "number") {
              console.log(
                `  [${idx}] ${dayNames[wh.dayOfWeek]} (${wh.dayOfWeek}): ${
                  wh.start
                } - ${wh.end}`
              );
            } else {
              console.log(`  [${idx}] INVALID ENTRY:`, wh);
            }
          });
        } else {
          console.log(
            "[WorkingHoursCalendar] Working hours is not a valid array"
          );
        }

        setSelectedSpecialist(response.data);

        // Load custom schedule if it exists
        if (response.data.customSchedule) {
          console.log(
            "[WorkingHoursCalendar] Loading custom schedule:",
            response.data.customSchedule
          );
          setCustomSchedule(response.data.customSchedule);
        } else {
          console.log("[WorkingHoursCalendar] No custom schedule found");
          setCustomSchedule({});
        }
      } catch (error) {
        console.error("Failed to fetch specialist:", error);
        toast.error("Failed to load specialist details");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialist();
  }, [selectedSpecialistId]);

  // Get working hours for a specific date
  const getWorkingHoursForDate = (date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const dayOfWeek = date.getDay();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    console.log(
      `[getWorkingHoursForDate] Checking date: ${dateStr} (${dayNames[dayOfWeek]}, dayOfWeek=${dayOfWeek})`
    );

    // Check for custom schedule first
    if (customSchedule[dateStr]) {
      console.log(
        `[getWorkingHoursForDate] Found custom schedule for ${dateStr}:`,
        customSchedule[dateStr]
      );
      return customSchedule[dateStr];
    }

    // Fall back to default weekly schedule
    if (
      !selectedSpecialist?.workingHours ||
      !Array.isArray(selectedSpecialist.workingHours)
    ) {
      console.log(`[getWorkingHoursForDate] No working hours array found`);
      return [];
    }

    console.log(
      `[getWorkingHoursForDate] Filtering from working hours:`,
      selectedSpecialist.workingHours
    );
    const filtered = selectedSpecialist.workingHours.filter(
      (wh) =>
        wh && typeof wh.dayOfWeek === "number" && wh.dayOfWeek === dayOfWeek
    );
    console.log(
      `[getWorkingHoursForDate] Filtered result for ${dayNames[dayOfWeek]} (${dayOfWeek}):`,
      filtered
    );
    return filtered;
  };

  // Check if date has working hours set
  const hasWorkingHours = (date) => {
    const hours = getWorkingHoursForDate(date);
    const result = hours.length > 0;
    console.log(
      `[hasWorkingHours] Date ${dayjs(date).format("YYYY-MM-DD")}: ${result} (${
        hours.length
      } slots)`
    );
    return result;
  };

  // Handle day click
  const handleDayClick = (date) => {
    if (!date || !selectedSpecialist) return;

    setSelectedDate(date);
    const dateStr = dayjs(date).format("YYYY-MM-DD");

    // Get existing hours for this specific date or default weekly hours
    const existingHours =
      customSchedule[dateStr] || getWorkingHoursForDate(date);

    if (existingHours.length > 0) {
      setDayHours(existingHours);
    } else {
      // Default to one empty slot
      setDayHours([{ start: "09:00", end: "17:00" }]);
    }

    setEditModalOpen(true);
  };

  // Add another time slot
  const addTimeSlot = () => {
    setDayHours([...dayHours, { start: "09:00", end: "17:00" }]);
  };

  // Remove a time slot
  const removeTimeSlot = (index) => {
    setDayHours(dayHours.filter((_, i) => i !== index));
  };

  // Update time slot
  const updateTimeSlot = (index, field, value) => {
    const updated = [...dayHours];
    updated[index][field] = value;
    setDayHours(updated);
  };

  // Save working hours for the specific selected date
  const saveWorkingHours = async () => {
    if (!selectedDate || !selectedSpecialist) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      // Update custom schedule
      const newCustomSchedule = {
        ...customSchedule,
        [dateStr]: dayHours
          .filter((h) => h.start && h.end)
          .map((h) => ({ start: h.start, end: h.end })),
      };

      // Remove entry if no hours set
      if (newCustomSchedule[dateStr].length === 0) {
        delete newCustomSchedule[dateStr];
      }

      await api.patch(`/specialists/${selectedSpecialist._id}`, {
        customSchedule: newCustomSchedule,
      });

      // Update local state
      setCustomSchedule(newCustomSchedule);
      setSelectedSpecialist({
        ...selectedSpecialist,
        customSchedule: newCustomSchedule,
      });

      toast.success("Schedule updated successfully");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update schedule:", error);
      toast.error(error.response?.data?.error || "Failed to update schedule");
    }
  };

  // Clear working hours for the selected date
  const clearWorkingHours = async () => {
    if (!selectedDate || !selectedSpecialist) return;

    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");

    try {
      const newCustomSchedule = { ...customSchedule };
      delete newCustomSchedule[dateStr];

      await api.patch(`/specialists/${selectedSpecialist._id}`, {
        customSchedule: newCustomSchedule,
      });

      // Update local state
      setCustomSchedule(newCustomSchedule);
      setSelectedSpecialist({
        ...selectedSpecialist,
        customSchedule: newCustomSchedule,
      });

      toast.success("Schedule cleared for this date");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to clear schedule:", error);
      toast.error(error.response?.data?.error || "Failed to clear schedule");
    }
  };

  // Open weekly schedule edit modal
  const openWeeklyEditModal = (dayOfWeek) => {
    if (!selectedSpecialist) return;

    setEditingDayOfWeek(dayOfWeek);
    const existingHours =
      selectedSpecialist.workingHours?.filter(
        (wh) =>
          wh && typeof wh.dayOfWeek === "number" && wh.dayOfWeek === dayOfWeek
      ) || [];

    if (existingHours.length > 0) {
      setWeeklyDayHours(existingHours);
    } else {
      setWeeklyDayHours([{ start: "09:00", end: "17:00" }]);
    }

    setEditWeeklyModalOpen(true);
  };

  // Add time slot for weekly schedule
  const addWeeklyTimeSlot = () => {
    setWeeklyDayHours([...weeklyDayHours, { start: "09:00", end: "17:00" }]);
  };

  // Remove time slot for weekly schedule
  const removeWeeklyTimeSlot = (index) => {
    setWeeklyDayHours(weeklyDayHours.filter((_, i) => i !== index));
  };

  // Update time slot for weekly schedule
  const updateWeeklyTimeSlot = (index, field, value) => {
    const updated = [...weeklyDayHours];
    updated[index][field] = value;
    setWeeklyDayHours(updated);
  };

  // Save weekly schedule
  const saveWeeklySchedule = async () => {
    if (editingDayOfWeek === null || !selectedSpecialist) return;

    try {
      // Remove existing hours for this day
      const otherDaysHours = (selectedSpecialist.workingHours || []).filter(
        (wh) =>
          wh &&
          typeof wh.dayOfWeek === "number" &&
          wh.dayOfWeek !== editingDayOfWeek
      );

      // Add new hours for this day
      const newHours = weeklyDayHours
        .filter((h) => h.start && h.end)
        .map((h) => ({
          dayOfWeek: editingDayOfWeek,
          start: h.start,
          end: h.end,
        }));

      const updatedWorkingHours = [...otherDaysHours, ...newHours];

      await api.patch(`/specialists/${selectedSpecialist._id}`, {
        workingHours: updatedWorkingHours,
      });

      // Update local state
      setSelectedSpecialist({
        ...selectedSpecialist,
        workingHours: updatedWorkingHours,
      });

      toast.success("Weekly schedule updated successfully");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to update weekly schedule:", error);
      toast.error(
        error.response?.data?.error || "Failed to update weekly schedule"
      );
    }
  };

  // Clear weekly schedule for a day
  const clearWeeklySchedule = async () => {
    if (editingDayOfWeek === null || !selectedSpecialist) return;

    try {
      // Remove all hours for this day
      const updatedWorkingHours = (
        selectedSpecialist.workingHours || []
      ).filter((wh) => wh.dayOfWeek !== editingDayOfWeek);

      await api.patch(`/specialists/${selectedSpecialist._id}`, {
        workingHours: updatedWorkingHours,
      });

      // Update local state
      setSelectedSpecialist({
        ...selectedSpecialist,
        workingHours: updatedWorkingHours,
      });

      toast.success("Weekly schedule cleared for this day");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to clear weekly schedule:", error);
      toast.error(
        error.response?.data?.error || "Failed to clear weekly schedule"
      );
    }
  };

  const modifiers = {
    hasHours: (date) => {
      const result = hasWorkingHours(date);
      return result;
    },
    custom: (date) => {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const result = customSchedule[dateStr] !== undefined;
      if (result) {
        console.log(
          `[modifiers.custom] Date ${dateStr} has custom schedule:`,
          customSchedule[dateStr]
        );
      }
      return result;
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Working Hours Calendar
        </h1>
        <p className="text-gray-600">
          Set working hours for specific dates. Click on any date to customize.
        </p>
      </div>

      {/* Specialist Selector */}
      <div className="bg-white border rounded-lg shadow-sm p-4 sm:p-6">
        <FormField label="Select Specialist" htmlFor="specialist-select">
          <SelectButton
            value={selectedSpecialistId}
            placeholder="Select a specialist"
            disabled={!isSuperAdmin && !isSalonAdmin}
            options={specialists.map((b) => ({
              value: b._id,
              label: b.name,
            }))}
            onClick={() => setSpecialistDrawerOpen(true)}
            className="max-w-full sm:max-w-md"
          />
        </FormField>
      </div>

      {/* Specialist Selection Drawer */}
      <SelectDrawer
        open={specialistDrawerOpen}
        onClose={() => setSpecialistDrawerOpen(false)}
        title="Select Specialist"
        options={specialists.map((b) => ({
          value: b._id,
          label: b.name,
        }))}
        value={selectedSpecialistId}
        onChange={(value) => setSelectedSpecialistId(value)}
        placeholder="Select a specialist"
      />

      {/* Calendar */}
      {selectedSpecialist && (
        <div className="bg-white border rounded-lg shadow-sm p-4 md:p-8 overflow-hidden">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {selectedSpecialist.name}'s Schedule
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Click on a date to set custom working hours for that specific day.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 border-2 border-green-300 rounded-lg flex items-center justify-center text-sm font-semibold shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Default weekly hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 border-2 border-orange-400 rounded-lg flex items-center justify-center text-sm font-semibold text-orange-700 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Custom date hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">
                  Not working
                </span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <style>{`
              .rdp {
                --rdp-cell-size: 85px;
                --rdp-accent-color: #10b981;
                font-size: 16px;
                width: 100%;
              }
              @media (max-width: 768px) {
                .rdp {
                  --rdp-cell-size: 36px;
                  font-size: 10px;
                  width: 100%;
                }
              }
              .rdp-day {
                min-height: 85px !important;
                width: 85px !important;
                cursor: pointer !important;
                position: relative;
                padding: 10px 6px !important;
                border-radius: 8px !important;
                transition: all 0.2s ease;
                border: 2px solid transparent !important;
              }
              @media (max-width: 768px) {
                .rdp-day {
                  min-height: 36px !important;
                  width: 36px !important;
                  padding: 2px 1px !important;
                  border-radius: 3px !important;
                  border: 1px solid transparent !important;
                }
              }
              .rdp-day:hover:not(.rdp-day_disabled) {
                background-color: #f9fafb !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
              }
              @media (max-width: 768px) {
                .rdp-day:hover:not(.rdp-day_disabled) {
                  transform: none;
                  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
                }
              }
              .rdp-day_selected {
                background-color: #f0fdf4 !important;
                border-color: #86efac !important;
              }
              .rdp-caption {
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 1.5rem;
                color: #111827;
              }
              @media (max-width: 768px) {
                .rdp-caption {
                  font-size: 14px;
                  margin-bottom: 0.75rem;
                  font-weight: 600;
                }
              }
              .rdp-head_cell {
                font-size: 14px;
                font-weight: 600;
                padding: 10px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              @media (max-width: 768px) {
                .rdp-head_cell {
                  font-size: 8px;
                  padding: 2px 1px;
                  letter-spacing: 0;
                }
              }
              .rdp-nav_button {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                transition: all 0.2s ease;
              }
              .rdp-nav_button:hover {
                background-color: #f3f4f6;
              }
              @media (max-width: 768px) {
                .rdp-nav_button {
                  width: 26px;
                  height: 26px;
                  font-size: 12px;
                }
              }
              .rdp-table {
                border-spacing: 4px;
              }
              @media (max-width: 768px) {
                .rdp-table {
                  border-spacing: 0;
                }
              }
            `}</style>
            <DayPicker
              mode="single"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              formatters={{
                formatDay: (date) => {
                  const hours = getWorkingHoursForDate(date);
                  const dateStr = dayjs(date).format("YYYY-MM-DD");
                  const isCustom = customSchedule[dateStr] !== undefined;

                  return (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                      <span
                        className={`text-[10px] md:text-base mb-0 md:mb-1 ${
                          hours.length > 0
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {hours.length > 0 && (
                        <div className="hidden md:block text-[6px] md:text-[10px] leading-tight space-y-0.5">
                          {hours.map((h, idx) => (
                            <div
                              key={idx}
                              className={`font-medium px-0.5 md:px-1.5 py-0.5 rounded text-center ${
                                isCustom
                                  ? "text-orange-700 bg-orange-100"
                                  : "text-green-700 bg-green-100"
                              }`}
                            >
                              {h.start}-{h.end}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
              modifiers={modifiers}
              modifiersClassNames={{
                hasHours: "bg-green-50 font-semibold",
                custom: "bg-orange-100 border-orange-300",
              }}
              className="border-0"
            />
          </div>

          {/* Weekly Default Schedule Summary */}
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Default Weekly Schedule</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              These hours apply to all days unless overridden with custom hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((dayName, dayOfWeek) => {
                const dayHours =
                  selectedSpecialist.workingHours?.filter(
                    (wh) =>
                      wh &&
                      typeof wh.dayOfWeek === "number" &&
                      wh.dayOfWeek === dayOfWeek
                  ) || [];

                return (
                  <div
                    key={dayOfWeek}
                    className="flex items-center justify-between py-2 px-3 rounded border hover:bg-gray-50 gap-2"
                  >
                    <span className="font-medium text-gray-700 w-20 sm:w-28 text-sm sm:text-base">
                      {dayName}
                    </span>
                    <div className="flex-1 min-w-0">
                      {dayHours.length === 0 ? (
                        <span className="text-gray-400 text-xs sm:text-sm">
                          Not working
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {dayHours.map((h, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-green-200 whitespace-nowrap"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => openWeeklyEditModal(dayOfWeek)}
                      className="ml-2 px-2 sm:px-3 py-1 text-xs sm:text-sm text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded border border-brand-200 transition-colors whitespace-nowrap flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Dates Summary */}
          {Object.keys(customSchedule).length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Custom Date Overrides</h3>
              <div className="space-y-2">
                {Object.entries(customSchedule)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateStr, hours]) => (
                    <div
                      key={dateStr}
                      className="flex items-center justify-between py-2 px-3 rounded border border-blue-200 bg-blue-50"
                    >
                      <span className="font-medium text-gray-700">
                        {dayjs(dateStr).format("ddd, MMM D, YYYY")}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {hours.length === 0 ? (
                          <span className="text-xs text-gray-500">
                            Not working
                          </span>
                        ) : (
                          hours.map((h, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-300"
                            >
                              {h.start} - {h.end}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Day Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        variant="dashboard"
        size="md"
        title={
          selectedDate
            ? `Schedule - ${dayjs(selectedDate).format("dddd, MMMM D, YYYY")}`
            : "Edit Schedule"
        }
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 border-2 border-orange-400 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-900 leading-relaxed font-medium">
              <strong className="font-bold">Custom Date Override:</strong>{" "}
              Setting hours here will only affect{" "}
              <strong className="font-bold">
                {selectedDate && dayjs(selectedDate).format("MMMM D, YYYY")}
              </strong>
              . Leave empty to use default weekly schedule.
            </p>
          </div>

          {dayHours.map((slot, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`start-${index}`}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={slot.start}
                    onChange={(e) =>
                      updateTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-700 text-sm sm:text-base font-medium">
                    to
                  </span>
                  <input
                    type="time"
                    id={`end-${index}`}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={slot.end}
                    onChange={(e) =>
                      updateTimeSlot(index, "end", e.target.value)
                    }
                  />
                </div>
              </FormField>
              {dayHours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="px-3 sm:px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors w-full sm:w-auto"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-brand-600 border-2 border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={clearWorkingHours}
              className="px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors order-2 sm:order-1"
            >
              Clear Custom Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="flex-1 sm:flex-initial text-sm sm:text-base py-2.5 sm:py-3"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWorkingHours}
                className="flex-1 sm:flex-initial text-sm sm:text-base py-2.5 sm:py-3"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Weekly Schedule Modal */}
      <Modal
        open={editWeeklyModalOpen}
        onClose={() => setEditWeeklyModalOpen(false)}
        variant="dashboard"
        size="md"
        title={
          editingDayOfWeek !== null
            ? `Edit ${
                [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ][editingDayOfWeek]
              } Schedule`
            : "Edit Schedule"
        }
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-gray-50 border-2 border-orange-400 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-900 leading-relaxed font-medium">
              <strong className="font-bold">Weekly Schedule:</strong> These
              hours will apply to all{" "}
              {editingDayOfWeek !== null &&
                [
                  "Sundays",
                  "Mondays",
                  "Tuesdays",
                  "Wednesdays",
                  "Thursdays",
                  "Fridays",
                  "Saturdays",
                ][editingDayOfWeek]}{" "}
              unless overridden by a custom date.
            </p>
          </div>

          {weeklyDayHours.map((slot, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`weekly-start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`weekly-start-${index}`}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={slot.start}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-700 text-sm sm:text-base font-medium">
                    to
                  </span>
                  <input
                    type="time"
                    id={`weekly-end-${index}`}
                    className="border border-gray-300 rounded-lg px-3 py-2.5 w-full text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    value={slot.end}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "end", e.target.value)
                    }
                  />
                </div>
              </FormField>
              {weeklyDayHours.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeWeeklyTimeSlot(index)}
                  className="px-3 sm:px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors w-full sm:w-auto"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWeeklyTimeSlot}
            className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-brand-600 border-2 border-brand-300 rounded-lg hover:bg-brand-50 transition-colors"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={clearWeeklySchedule}
              className="px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors order-2 sm:order-1"
            >
              Clear Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditWeeklyModalOpen(false)}
                className="flex-1 sm:flex-initial text-sm sm:text-base py-2.5 sm:py-3"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWeeklySchedule}
                className="flex-1 sm:flex-initial text-sm sm:text-base py-2.5 sm:py-3"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
