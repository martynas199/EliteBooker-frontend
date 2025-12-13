import { useState, useEffect } from "react";
import { TimeOffAPI as timeOffAPI } from "../components/timeoff/timeoff.api";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import { Input } from "../../shared/components/ui/Input";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";

export default function TimeOff() {
  const { language } = useLanguage();
  const [timeOffList, setTimeOffList] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    specialistId: "",
    start: "",
    end: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [visiblePastCount, setVisiblePastCount] = useState(5);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Drawer state for mobile specialist selection
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Close date pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".date-picker-container")) {
        setShowStartPicker(false);
        setShowEndPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [timeOffData, staffResponse] = await Promise.all([
        timeOffAPI.getAll(),
        api.get("/specialists", { params: { limit: 1000 } }),
      ]);
      setTimeOffList(timeOffData || []);
      setSpecialists(staffResponse.data?.filter((b) => b.active) || []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load time-off data");
      setTimeOffList([]);
      setSpecialists([]);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.specialistId) {
      newErrors.specialistId = "Please select a specialist";
    }

    if (!formData.start) {
      newErrors.start = "Start date is required";
    }

    if (!formData.end) {
      newErrors.end = "End date is required";
    }

    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      // Allow same day (single day off) - end date just cannot be BEFORE start date
      if (endDate < startDate) {
        newErrors.end = "End date cannot be before start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const newTimeOff = await timeOffAPI.create({
        specialistId: formData.specialistId, // Map specialistId to specialistId for API
        start: formData.start,
        end: formData.end,
        reason: formData.reason,
      });

      setTimeOffList([...timeOffList, newTimeOff]);
      setFormData({ specialistId: "", start: "", end: "", reason: "" });
      setShowAddForm(false);
      setErrors({});
    } catch (error) {
      console.error("Error adding time-off:", error);
      alert(error.response?.data?.error || "Failed to add time-off period");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(timeOff) {
    if (
      !confirm(
        `Remove time-off for ${timeOff.beauticianName} (${formatDateRange(
          timeOff.start,
          timeOff.end
        )})?`
      )
    ) {
      return;
    }

    try {
      await timeOffAPI.delete(timeOff.specialistId, timeOff._id);
      setTimeOffList(timeOffList.filter((t) => t._id !== timeOff._id));
    } catch (error) {
      console.error("Error deleting time-off:", error);
      alert("Failed to delete time-off period");
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateRange(start, end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }

  function getDaysCount(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  function isUpcoming(start) {
    return new Date(start) > new Date();
  }

  function isCurrent(start, end) {
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  }

  // Group time-off by status
  const currentTimeOff = timeOffList.filter((t) => isCurrent(t.start, t.end));
  const upcomingTimeOff = timeOffList
    .filter((t) => isUpcoming(t.start))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const pastTimeOff = timeOffList
    .filter((t) => !isCurrent(t.start, t.end) && !isUpcoming(t.start))
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  if (loading) {
    return <LoadingSpinner center size="lg" />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl shadow-2xl p-4 sm:p-8">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgNC40MTgtMy41ODIgOC04IDhzLTgtMy41ODItOC04IDMuNTgyLTggOC04IDggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white"
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
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                Time Off Management
              </h1>
            </div>
            <p className="text-brand-50 text-base sm:text-lg font-medium">
              Manage team availability and schedule time-off periods
            </p>
            {timeOffList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {currentTimeOff.length}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Active Now
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {upcomingTimeOff.length}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Upcoming
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-gray-900">
                        {specialists.length}
                      </span>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Team Members
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            className="whitespace-nowrap bg-white text-brand-600 hover:bg-gray-50 border-0 shadow-xl hover:shadow-2xl transition-all font-bold px-8 py-3 text-base"
          >
            {showAddForm ? "✕ Cancel" : "+ Add Time Off"}
          </Button>
        </div>
      </div>

      {/* Add Time Off Form */}
      {showAddForm && (
        <Card className="overflow-visible shadow-2xl border-0 ring-1 ring-gray-900/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Add Time Off Period
              </h2>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Specialist Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Staff Member <span className="text-red-500">*</span>
                </label>
                <SelectButton
                  value={formData.specialistId}
                  placeholder="Select staff member"
                  options={specialists.map((specialist) => ({
                    value: specialist._id,
                    label: specialist.name,
                  }))}
                  onClick={() => setShowSpecialistDrawer(true)}
                  className={`w-full px-4 py-3 rounded-xl font-medium ${
                    errors.specialistId ? "border-red-500" : ""
                  }`}
                />
                {errors.specialistId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specialistId}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., Vacation, Sick leave, Holiday"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Optional note visible to team
                </p>
              </div>

              {/* Start Date */}
              <div className="date-picker-container relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStartPicker(!showStartPicker);
                    setShowEndPicker(false);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-left bg-white hover:bg-gray-50 flex items-center justify-between ${
                    errors.start ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-900">
                    {formData.start
                      ? dayjs(formData.start).format("MMM DD, YYYY")
                      : "Select start date"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                </button>
                {showStartPicker && (
                  <div className="absolute left-0 z-[100] mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                    <DayPicker
                      mode="single"
                      selected={
                        formData.start ? new Date(formData.start) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const newStart = dayjs(date).format("YYYY-MM-DD");
                          setFormData({ ...formData, start: newStart });
                          setShowStartPicker(false);

                          // Auto-adjust end date if it becomes invalid
                          if (
                            formData.end &&
                            dayjs(newStart).isAfter(dayjs(formData.end))
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              start: newStart,
                              end: newStart,
                            }));
                          }
                        }
                      }}
                      className="rdp-custom"
                      modifiersClassNames={{
                        selected: "!bg-brand-600 !text-white font-semibold",
                        today: "!text-brand-600 font-bold",
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  First day of time off
                </p>
                {errors.start && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">
                    {errors.start}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="date-picker-container relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndPicker(!showEndPicker);
                    setShowStartPicker(false);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-left bg-white hover:bg-gray-50 flex items-center justify-between ${
                    errors.end ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-900">
                    {formData.end
                      ? dayjs(formData.end).format("MMM DD, YYYY")
                      : "Select end date"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400"
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
                </button>
                {showEndPicker && (
                  <div className="absolute left-0 z-[100] mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
                    <DayPicker
                      mode="single"
                      selected={
                        formData.end ? new Date(formData.end) : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          const newEnd = dayjs(date).format("YYYY-MM-DD");
                          setFormData({ ...formData, end: newEnd });
                          setShowEndPicker(false);

                          // Auto-adjust start date if it becomes invalid
                          if (
                            formData.start &&
                            dayjs(formData.start).isAfter(dayjs(newEnd))
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              end: newEnd,
                              start: newEnd,
                            }));
                          }
                        }
                      }}
                      fromDate={
                        formData.start ? new Date(formData.start) : undefined
                      }
                      className="rdp-custom"
                      modifiersClassNames={{
                        selected: "!bg-brand-600 !text-white font-semibold",
                        today: "!text-brand-600 font-bold",
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Last day of time off
                </p>
                {errors.end && (
                  <p className="text-red-500 text-sm mt-1 font-semibold">
                    {errors.end}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold py-3 rounded-xl text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Add Time Off
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    specialistId: "",
                    start: "",
                    end: "",
                    reason: "",
                  });
                  setErrors({});
                }}
                className="w-full sm:w-auto px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Current Time Off */}
      {currentTimeOff.length > 0 && (
        <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-red-900/5">
          <div className="bg-gradient-to-br from-red-500 via-red-600 to-rose-600 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">
                    Currently Off
                  </h2>
                  <p className="text-red-50 text-sm font-medium">
                    Active time-off periods
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <span className="text-xl font-bold text-red-600">
                  {currentTimeOff.length}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {currentTimeOff.map((timeOff, index) => (
              <div
                key={timeOff._id}
                className="animate-in slide-in-from-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TimeOffCard
                  timeOff={timeOff}
                  onDelete={handleDelete}
                  status="current"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Time Off */}
      {upcomingTimeOff.length > 0 && (
        <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-blue-900/5">
          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">
                    Upcoming
                  </h2>
                  <p className="text-blue-50 text-sm font-medium">
                    Scheduled time-off
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <span className="text-xl font-bold text-blue-600">
                  {upcomingTimeOff.length}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 bg-gradient-to-b from-gray-50 to-white">
            {upcomingTimeOff.map((timeOff, index) => (
              <div
                key={timeOff._id}
                className="animate-in slide-in-from-right"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TimeOffCard
                  timeOff={timeOff}
                  onDelete={handleDelete}
                  status="upcoming"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Past Time Off */}
      {pastTimeOff.length > 0 && (
        <Card className="overflow-hidden shadow-2xl border-0 ring-1 ring-gray-900/5">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-600 hover:via-green-700 hover:to-teal-700 px-4 sm:px-6 py-4 sm:py-5 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-white/30">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white drop-shadow-lg">
                        Past Time Off
                      </h2>
                      <p className="text-green-50 text-sm font-medium">
                        Historical records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-green-600">
                        {pastTimeOff.length}
                      </span>
                    </div>
                    <svg
                      className="w-7 h-7 text-white transition-transform group-open:rotate-180 drop-shadow-md"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </summary>
            <div className="p-5 space-y-3 bg-gradient-to-b from-gray-50 to-white">
              {pastTimeOff.slice(0, visiblePastCount).map((timeOff, index) => (
                <div
                  key={timeOff._id}
                  className="animate-in fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TimeOffCard
                    timeOff={timeOff}
                    onDelete={handleDelete}
                    status="past"
                  />
                </div>
              ))}
              {pastTimeOff.length > visiblePastCount && (
                <div className="pt-4">
                  <button
                    onClick={() => setVisiblePastCount((prev) => prev + 5)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl border-2 border-green-200 hover:border-green-300 text-green-700 font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Load More ({pastTimeOff.length - visiblePastCount}{" "}
                    remaining)
                  </button>
                </div>
              )}
            </div>
          </details>
        </Card>
      )}

      {/* Empty State */}
      {timeOffList.length === 0 && (
        <Card className="p-16 text-center shadow-2xl border-0 ring-1 ring-gray-900/5">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-gray-400"
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
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No Time Off Scheduled
          </h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
            Add time-off periods to block dates when staff members are
            unavailable
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all text-base"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add First Time Off
          </button>
        </Card>
      )}

      {/* Specialist Selection Drawer */}
      <SelectDrawer
        open={showSpecialistDrawer}
        onClose={() => setShowSpecialistDrawer(false)}
        title="Select Staff Member"
        options={specialists.map((specialist) => ({
          value: specialist._id,
          label: specialist.name,
        }))}
        value={formData.specialistId}
        onChange={(value) => setFormData({ ...formData, specialistId: value })}
      />
    </div>
  );
}

function TimeOffCard({ timeOff, onDelete, status }) {
  const daysCount = getDaysCount(timeOff.start, timeOff.end);

  const bgClass =
    status === "current"
      ? "bg-white border-red-200 shadow-lg hover:shadow-xl"
      : status === "upcoming"
      ? "bg-white border-blue-200 shadow-lg hover:shadow-xl"
      : "bg-gray-50 border-gray-200 shadow-md hover:shadow-lg";

  const badgeClass =
    status === "current"
      ? "bg-red-100 text-red-700 border-red-300"
      : status === "upcoming"
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-gray-200 text-gray-700 border-gray-300";

  return (
    <div className={`p-5 border-2 rounded-xl transition-all ${bgClass}`}>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg">
              {timeOff.beauticianName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base sm:text-lg block">
                {timeOff.beauticianName}
              </span>
              {status === "current" && (
                <span className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full animate-pulse inline-flex items-center gap-1.5 shadow-md mt-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  LIVE
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-700 mb-1">
            {formatDateRange(timeOff.start, timeOff.end)}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>
              {daysCount} {daysCount === 1 ? "day" : "days"}
            </span>
            {timeOff.reason && (
              <span className="text-sm text-gray-600 font-medium italic">
                {timeOff.reason}
              </span>
            )}
          </div>
        </div>
        {status !== "past" && (
          <button
            onClick={() => onDelete(timeOff)}
            className="w-full sm:w-auto sm:flex-shrink-0 px-4 py-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg mt-3 sm:mt-0"
            title="Remove this time-off period"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function getDaysCount(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return `${startDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} - ${endDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}
