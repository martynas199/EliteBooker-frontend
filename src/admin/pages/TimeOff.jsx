import { useState, useEffect } from "react";
import { TimeOffAPI as timeOffAPI } from "../components/timeoff/timeoff.api";
import { api } from "../../shared/lib/apiClient";
import Card from "../../shared/components/ui/Card";
import Button from "../../shared/components/ui/Button";
import { Input } from "../../shared/components/ui/Input";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";

export default function TimeOff() {
  const { language } = useLanguage();
  const [timeOffList, setTimeOffList] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    beauticianId: "",
    start: "",
    end: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [timeOffData, staffResponse] = await Promise.all([
        TimeOffAPI.getAll(),
        api.get("/beauticians", { params: { limit: 1000 } }),
      ]);
      setTimeOffList(timeOffData);
      setBeauticians(staffResponse.data.filter((b) => b.active));
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load time-off data");
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.beauticianId) {
      newErrors.beauticianId = "Please select a beautician";
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
      const newTimeOff = await TimeOffAPI.create({
        beauticianId: formData.beauticianId,
        start: formData.start,
        end: formData.end,
        reason: formData.reason,
      });

      setTimeOffList([...timeOffList, newTimeOff]);
      setFormData({ beauticianId: "", start: "", end: "", reason: "" });
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
      await TimeOffAPI.delete(timeOff.beauticianId, timeOff._id);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("timeOffManagement", language)}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("blockDatesWhenStaffUnavailable", language)}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="brand">
          {showAddForm
            ? t("cancel", language)
            : `+ ${t("addTimeOff", language)}`}
        </Button>
      </div>

      {/* Add Time Off Form */}
      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("addTimeOffPeriod", language)}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Beautician Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.beauticianId}
                  onChange={(e) =>
                    setFormData({ ...formData, beauticianId: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                    errors.beauticianId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select staff member</option>
                  {beauticians.map((beautician) => (
                    <option key={beautician._id} value={beautician._id}>
                      {beautician.name}
                    </option>
                  ))}
                </select>
                {errors.beauticianId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.beauticianId}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("reasonLabel", language)}{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <Input
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="e.g., Vacation, Sick leave, Holiday"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("reasonHint", language)}
                </p>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("startDateLabel", language)}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.start}
                  onChange={(e) =>
                    setFormData({ ...formData, start: e.target.value })
                  }
                  className={errors.start ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("startDateHint", language)}
                </p>
                {errors.start && (
                  <p className="text-red-500 text-sm mt-1">{errors.start}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("endDateLabel", language)}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.end}
                  onChange={(e) =>
                    setFormData({ ...formData, end: e.target.value })
                  }
                  className={errors.end ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("endDateHint", language)}
                </p>
                {errors.end && (
                  <p className="text-red-500 text-sm mt-1">{errors.end}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="brand"
                disabled={submitting}
                loading={submitting}
              >
                Add Time Off
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    beauticianId: "",
                    start: "",
                    end: "",
                    reason: "",
                  });
                  setErrors({});
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Current Time Off */}
      {currentTimeOff.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">??</span>
            Currently Off ({currentTimeOff.length})
          </h2>
          <div className="space-y-3">
            {currentTimeOff.map((timeOff) => (
              <TimeOffCard
                key={timeOff._id}
                timeOff={timeOff}
                onDelete={handleDelete}
                status="current"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming Time Off */}
      {upcomingTimeOff.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">??</span>
            Upcoming Time Off ({upcomingTimeOff.length})
          </h2>
          <div className="space-y-3">
            {upcomingTimeOff.map((timeOff) => (
              <TimeOffCard
                key={timeOff._id}
                timeOff={timeOff}
                onDelete={handleDelete}
                status="upcoming"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Past Time Off */}
      {pastTimeOff.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">?</span>
            Past Time Off ({pastTimeOff.length})
          </h2>
          <div className="space-y-3">
            {pastTimeOff.slice(0, 10).map((timeOff) => (
              <TimeOffCard
                key={timeOff._id}
                timeOff={timeOff}
                onDelete={handleDelete}
                status="past"
              />
            ))}
          </div>
          {pastTimeOff.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing 10 most recent past time-off periods
            </p>
          )}
        </Card>
      )}

      {/* Empty State */}
      {timeOffList.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">??</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Time Off Scheduled
          </h3>
          <p className="text-gray-600 mb-4">
            Add time-off periods to block dates when staff are unavailable
          </p>
          <Button variant="brand" onClick={() => setShowAddForm(true)}>
            Add First Time Off
          </Button>
        </Card>
      )}
    </div>
  );
}

function TimeOffCard({ timeOff, onDelete, status }) {
  const daysCount = getDaysCount(timeOff.start, timeOff.end);

  const statusColors = {
    current: "bg-red-50 border-red-200",
    upcoming: "bg-blue-50 border-blue-200",
    past: "bg-gray-50 border-gray-200",
  };

  return (
    <div className={`p-4 border rounded-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">
              {timeOff.beauticianName}
            </span>
            {status === "current" && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">
                OFF NOW
              </span>
            )}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            {formatDateRange(timeOff.start, timeOff.end)}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>
              {daysCount} {daysCount === 1 ? "day" : "days"}
            </span>
            {timeOff.reason && (
              <>
                <span>�</span>
                <span>{timeOff.reason}</span>
              </>
            )}
          </div>
        </div>
        {status !== "past" && (
          <button
            onClick={() => onDelete(timeOff)}
            className="text-red-600 hover:text-red-700 text-sm font-medium ml-4"
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
