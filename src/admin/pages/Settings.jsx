import { useEffect, useState } from "react";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import Modal from "../../shared/components/ui/Modal";
import FormField from "../../shared/components/forms/FormField";
import toast from "react-hot-toast";

export default function Settings() {
  const [formData, setFormData] = useState({
    salonName: "",
    salonDescription: "",
    salonAddress: "",
    salonPhone: "",
    salonEmail: "",
    heroImage: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Working hours state
  const [workingHours, setWorkingHours] = useState([]);
  const [editWeeklyModalOpen, setEditWeeklyModalOpen] = useState(false);
  const [editingDayOfWeek, setEditingDayOfWeek] = useState(null);
  const [weeklyDayHours, setWeeklyDayHours] = useState([]);

  useEffect(() => {
    loadSettings();
    loadWorkingHours();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/settings");
      const settings = response.data;
      setFormData({
        salonName: settings.salonName || "",
        salonDescription: settings.salonDescription || "",
        salonAddress: settings.salonAddress || "",
        salonPhone: settings.salonPhone || "",
        salonEmail: settings.salonEmail || "",
        heroImage: settings.heroImage || null,
      });
      if (settings.heroImage?.url) {
        setImagePreview(settings.heroImage.url);
      }

      // Load working hours from settings
      if (settings.workingHours) {
        const hours = settings.workingHours;
        const hoursArray = [];

        const dayMap = {
          sun: 0,
          mon: 1,
          tue: 2,
          wed: 3,
          thu: 4,
          fri: 5,
          sat: 6,
        };

        Object.entries(dayMap).forEach(([key, dayOfWeek]) => {
          if (hours[key] && hours[key].start && hours[key].end) {
            hoursArray.push({
              dayOfWeek,
              start: hours[key].start,
              end: hours[key].end,
            });
          }
        });

        setWorkingHours(hoursArray);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({
        type: "error",
        text: "Failed to load salon settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkingHours = async () => {
    // Working hours are loaded from settings now, so this is not needed
    // but keeping it to avoid errors if called
  };

  // Open weekly schedule edit modal
  const openWeeklyEditModal = (dayOfWeek) => {
    setEditingDayOfWeek(dayOfWeek);
    const existingHours =
      workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek) || [];

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
    if (editingDayOfWeek === null) return;

    try {
      // Remove existing hours for this day
      const otherDaysHours = workingHours.filter(
        (wh) => wh.dayOfWeek !== editingDayOfWeek
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

      // Convert to the format expected by backend (mon, tue, etc.)
      const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const workingHoursObject = {};

      dayMap.forEach((key, index) => {
        const dayHours = updatedWorkingHours.filter(
          (h) => h.dayOfWeek === index
        );
        if (dayHours.length > 0) {
          // For now, just use the first time slot (backend format only supports one slot per day)
          workingHoursObject[key] = {
            start: dayHours[0].start,
            end: dayHours[0].end,
          };
        } else {
          workingHoursObject[key] = null;
        }
      });

      await api.patch("/settings", {
        workingHours: workingHoursObject,
      });

      // Update local state
      setWorkingHours(updatedWorkingHours);

      toast.success("Salon hours updated successfully");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to update salon hours:", error);
      toast.error(
        error.response?.data?.error || "Failed to update salon hours"
      );
    }
  };

  // Clear weekly schedule for a day
  const clearWeeklySchedule = async () => {
    if (editingDayOfWeek === null) return;

    try {
      // Remove all hours for this day
      const updatedWorkingHours = workingHours.filter(
        (wh) => wh.dayOfWeek !== editingDayOfWeek
      );

      // Convert to backend format
      const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const workingHoursObject = {};

      dayMap.forEach((key, index) => {
        const dayHours = updatedWorkingHours.filter(
          (h) => h.dayOfWeek === index
        );
        if (dayHours.length > 0) {
          workingHoursObject[key] = {
            start: dayHours[0].start,
            end: dayHours[0].end,
          };
        } else {
          workingHoursObject[key] = null;
        }
      });

      await api.patch("/settings", {
        workingHours: workingHoursObject,
      });

      // Update local state
      setWorkingHours(updatedWorkingHours);

      toast.success("Salon hours cleared for this day");
      setEditWeeklyModalOpen(false);
    } catch (error) {
      console.error("Failed to clear salon hours:", error);
      toast.error(error.response?.data?.error || "Failed to clear salon hours");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Upload image if a new one was selected
      let heroImageData = formData.heroImage;

      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const imageResponse = await api.post(
          "/settings/upload-hero",
          imageFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        heroImageData = imageResponse.data.heroImage;
      }

      // 2. Update settings
      await api.patch("/settings", {
        salonName: formData.salonName,
        salonDescription: formData.salonDescription,
        salonAddress: formData.salonAddress,
        salonPhone: formData.salonPhone,
        salonEmail: formData.salonEmail,
        heroImage: heroImageData,
      });

      setMessage({
        type: "success",
        text: "Salon settings saved successfully!",
      });

      // Reload settings to get the updated data
      await loadSettings();
      setImageFile(null);

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-wide mb-2">
          Business Settings
        </h1>
        <p className="text-gray-600 font-light leading-relaxed">
          Manage your business information, description, and hero image.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-6">
          {/* Salon Information Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Business Information</span>
            </h2>

            <div className="space-y-4">
              {/* Salon Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.salonName}
                  onChange={(e) => handleChange("salonName", e.target.value)}
                  placeholder="e.g., Your Business Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.salonDescription}
                  onChange={(e) =>
                    handleChange("salonDescription", e.target.value)
                  }
                  placeholder="e.g., Specialising in Hair Extensions, Cellulite Treatments, Brow & Lash - luxury beauty rituals."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This description appears on the booking page and salon details
                  page.
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.salonAddress}
                  onChange={(e) => handleChange("salonAddress", e.target.value)}
                  placeholder="e.g., 123 Main Street, London, SW1A 1AA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.salonPhone}
                    onChange={(e) => handleChange("salonPhone", e.target.value)}
                    placeholder="e.g., +44 20 1234 5678"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.salonEmail}
                    onChange={(e) => handleChange("salonEmail", e.target.value)}
                    placeholder="e.g., info@salon.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Salon Working Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Business Working Hours</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Set the default operating hours for your business. These hours are
              displayed to customers on the website.
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
                  workingHours.filter((wh) => wh.dayOfWeek === dayOfWeek) || [];

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

          {/* Hero Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Hero Image</span>
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload a banner image for your business. This appears at the top
                of the booking page. Recommended size: 1200x400px
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Hero preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Upload Button */}
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    {imageFile
                      ? "Change Image"
                      : imagePreview
                      ? "Replace Image"
                      : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ New image selected: {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button onClick={loadSettings} variant="outline" disabled={saving}>
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              variant="brand"
            >
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* Edit Weekly Schedule Modal */}
      <Modal
        open={editWeeklyModalOpen}
        onClose={() => setEditWeeklyModalOpen(false)}
        variant="dashboard"
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
              } Hours`
            : "Edit Hours"
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Business Hours:</strong> These hours are displayed to
              customers on your website.
            </p>
          </div>

          {weeklyDayHours.map((slot, index) => (
            <div
              key={index}
              className="flex items-end gap-3 pb-3 border-b last:border-b-0"
            >
              <FormField
                label={`Time Slot ${index + 1}`}
                htmlFor={`salon-start-${index}`}
                className="flex-1"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    id={`salon-start-${index}`}
                    className="border rounded px-3 py-2 w-full"
                    value={slot.start}
                    onChange={(e) =>
                      updateWeeklyTimeSlot(index, "start", e.target.value)
                    }
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    id={`salon-end-${index}`}
                    className="border rounded px-3 py-2 w-full"
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
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addWeeklyTimeSlot}
            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-brand-600 border border-brand-300 rounded hover:bg-brand-50"
          >
            + Add Another Time Slot
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={clearWeeklySchedule}
              className="px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded text-xs sm:text-sm order-2 sm:order-1"
            >
              Clear Hours
            </button>
            <div className="flex gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={() => setEditWeeklyModalOpen(false)}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={saveWeeklySchedule}
                className="flex-1 sm:flex-initial text-xs sm:text-sm py-2"
              >
                Save Hours
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
