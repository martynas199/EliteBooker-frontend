import { useEffect, useMemo, useState } from "react";
import { TimeOffAPI as timeOffAPI } from "../components/timeoff/timeoff.api";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import EmptyStateCard from "../../shared/components/ui/EmptyStateCard";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import dayjs from "dayjs";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";
import AdminPageShell from "../components/AdminPageShell";
import toast from "react-hot-toast";
import { confirmDialog } from "../../shared/lib/confirmDialog";

export default function TimeOff() {
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
      toast.error("Failed to load time-off data");
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
      toast.error(error.response?.data?.error || "Failed to add time-off period");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(timeOff) {
    const confirmed = await confirmDialog({
      title: "Remove time-off?",
      message: `Remove time-off for ${timeOff.beauticianName} (${formatDateRange(
        timeOff.start,
        timeOff.end,
      )})?`,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await timeOffAPI.delete(timeOff.specialistId, timeOff._id);
      setTimeOffList(timeOffList.filter((t) => t._id !== timeOff._id));
    } catch (error) {
      console.error("Error deleting time-off:", error);
      toast.error("Failed to delete time-off period");
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

  const timeOffSummary = useMemo(
    () => ({
      current: currentTimeOff.length,
      upcoming: upcomingTimeOff.length,
      specialists: specialists.length,
      total: timeOffList.length,
    }),
    [currentTimeOff.length, upcomingTimeOff.length, specialists.length, timeOffList.length]
  );

  const pageAction = (
    <Button
      type="button"
      onClick={() => setShowAddForm((prev) => !prev)}
      variant={showAddForm ? "outline" : "brand"}
      size="md"
      className="w-full sm:w-auto"
    >
      {showAddForm ? "Close Form" : "Add Time Off"}
    </Button>
  );

  if (loading) {
    return (
      <AdminPageShell
        title="Time Off Management"
        description="Schedule and manage specialist availability."
        action={pageAction}
        maxWidth="2xl"
      >
        <Card className="border border-gray-200 py-10 shadow-sm">
          <LoadingSpinner center size="lg" />
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Time Off Management"
      description="Schedule and manage specialist availability."
      action={pageAction}
      maxWidth="2xl"
      contentClassName="space-y-6"
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Total
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {timeOffSummary.total}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Active Now
          </p>
          <p className="mt-1 text-lg font-semibold text-red-700">
            {timeOffSummary.current}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Upcoming
          </p>
          <p className="mt-1 text-lg font-semibold text-blue-700">
            {timeOffSummary.upcoming}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Team Members
          </p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {timeOffSummary.specialists}
          </p>
        </div>
      </div>

      {/* Add Time Off Form */}
      {showAddForm && (
        <Card className="overflow-visible border border-gray-200 shadow-sm">
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Add Time Off Period
            </h2>
          </div>
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 bg-white"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Specialist Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff Member <span className="text-red-600">*</span>
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
                  <p className="text-red-600 text-sm mt-1">
                    {errors.specialistId}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason{" "}
                  <span className="text-gray-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., Vacation, Sick leave, Holiday"
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 font-medium text-gray-900 transition-all focus:border-gray-900 focus:ring-2 focus:ring-gray-900"
                  style={{ fontSize: "16px" }}
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Optional note visible to team
                </p>
              </div>

              {/* Start Date */}
              <div className="date-picker-container relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowStartPicker(!showStartPicker);
                    setShowEndPicker(false);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-medium focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-left bg-white hover:bg-gray-50 flex items-center justify-between ${
                    errors.start ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-900">
                    {formData.start
                      ? dayjs(formData.start).format("MMM DD, YYYY")
                      : "Select start date"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  <p className="text-red-600 text-sm mt-1 font-semibold">
                    {errors.start}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div className="date-picker-container relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowEndPicker(!showEndPicker);
                    setShowStartPicker(false);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl font-medium focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all text-left bg-white hover:bg-gray-50 flex items-center justify-between ${
                    errors.end ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <span className="text-gray-900">
                    {formData.end
                      ? dayjs(formData.end).format("MMM DD, YYYY")
                      : "Select end date"}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                        selected: "!bg-gray-900 !text-white font-semibold",
                        today: "!text-gray-900 font-semibold",
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Last day of time off
                </p>
                {errors.end && (
                  <p className="text-red-600 text-sm mt-1 font-semibold">
                    {errors.end}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
                className="w-full sm:w-auto px-6 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 rounded-lg border border-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Current Time Off */}
      {currentTimeOff.length > 0 && (
        <Card className="overflow-hidden shadow-sm border border-gray-200">
          <div className="bg-red-50 border-b border-red-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
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
                  <h2 className="text-lg font-semibold text-gray-900">
                    Currently Off
                  </h2>
                  <p className="text-sm text-gray-600">
                    Active time-off periods
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-red-600">
                  {currentTimeOff.length}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 bg-white">
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
        <Card className="overflow-hidden shadow-sm border border-gray-200">
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="flex items-center justify-between">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Upcoming
                  </h2>
                  <p className="text-sm text-gray-600">
                    Scheduled time-off
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-blue-600">
                  {upcomingTimeOff.length}
                </span>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3 bg-white">
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
        <Card className="overflow-hidden shadow-sm border border-gray-200">
          <details className="group">
            <summary className="cursor-pointer list-none">
              <div className="bg-gray-50 hover:bg-gray-100 border-b border-gray-200 px-6 py-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-green-600"
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
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Past Time Off
                      </h2>
                      <p className="text-sm text-gray-600">
                        Historical records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <span className="text-lg font-semibold text-green-600">
                        {pastTimeOff.length}
                      </span>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-600 transition-transform group-open:rotate-180"
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
                  </div>
                </div>
              </div>
            </summary>
            <div className="p-5 space-y-3 bg-white">
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
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
      {timeOffList.length === 0 && !showAddForm && (
        <EmptyStateCard
          title="No time off scheduled"
          description="Get started by adding your first time-off period."
          icon={
            <svg
              className="w-10 h-10 text-gray-500"
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
          }
          primaryAction={{
            label: "Add First Time Off",
            onClick: () => setShowAddForm(true),
            icon: (
              <svg
                className="w-4 h-4"
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
            ),
          }}
          className="py-16"
        />
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
    </AdminPageShell>
  );
}

function TimeOffCard({ timeOff, onDelete, status }) {
  const daysCount = getDaysCount(timeOff.start, timeOff.end);

  const bgClass =
    status === "current"
      ? "bg-white border-red-200 shadow-sm hover:shadow-md"
      : status === "upcoming"
      ? "bg-white border-blue-200 shadow-sm hover:shadow-md"
      : "bg-gray-50 border-gray-200 shadow-sm hover:shadow-md";

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
            className="mt-3 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 sm:mt-0 sm:w-auto sm:flex-shrink-0"
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
