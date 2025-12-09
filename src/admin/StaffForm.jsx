import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useImageUpload } from "../shared/hooks/useImageUpload";
import FormField from "../shared/components/forms/FormField";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import Button from "../shared/components/ui/Button";

/**
 * StaffForm - Create or Edit a specialist/staff member
 *
 * @param {object} props
 * @param {object|null} props.staff - Existing staff for edit mode, null for create mode
 * @param {function} props.onSave - Callback(staffData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 */
// Generate random color for staff member
const generateRandomColor = () => {
  const colors = [
    "#3B82F6", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#F59E0B", // Amber
    "#10B981", // Emerald
    "#06B6D4", // Cyan
    "#EF4444", // Red
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#6366F1", // Indigo
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default function StaffForm({ staff, onSave, onCancel, onDelete }) {
  const isEditMode = Boolean(staff);
  const {
    uploadImage,
    isUploading: isUploadingImage,
    progress,
  } = useImageUpload();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialties: [],
    active: true,
    inSalonPayment: false,
    color: generateRandomColor(),
    image: null,
    workingHours: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Load existing staff data in edit mode
  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        bio: staff.bio || "",
        specialties: staff.specialties || [],
        active: staff.active !== undefined ? staff.active : true,
        inSalonPayment: staff.inSalonPayment || false,
        color: staff.color || generateRandomColor(),
        image: staff.image || null,
        workingHours: staff.workingHours || [],
      });
    }
  }, [staff]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    try {
      const uploadedImage = await uploadImage(file, { alt: formData.name });
      setFormData((prev) => ({ ...prev, image: uploadedImage }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message }));
    }
  };

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return;

    if (formData.specialties.includes(newSpecialty.trim())) {
      toast.error("This specialty is already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialty.trim()],
    }));
    setNewSpecialty("");
    toast.success("Specialty added");
  };

  const removeSpecialty = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const addWorkingHours = () => {
    setFormData((prev) => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { dayOfWeek: 1, start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeWorkingHours = (index) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index),
    }));
  };

  const handleWorkingHoursChange = (index, field, value) => {
    const newWorkingHours = [...formData.workingHours];
    newWorkingHours[index] = { ...newWorkingHours[index], [field]: value };
    setFormData((prev) => ({ ...prev, workingHours: newWorkingHours }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a staff member name";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate working hours
    formData.workingHours.forEach((wh, i) => {
      // Skip null/undefined entries
      if (!wh) return;

      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(wh.start || "")) {
        newErrors[`workingHours_${i}_start`] =
          "Please enter start time in HH:mm format (e.g., 09:00)";
      }
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(wh.end || "")) {
        newErrors[`workingHours_${i}_end`] =
          "Please enter end time in HH:mm format (e.g., 17:00)";
      }
      if ((wh.start || "") >= (wh.end || "")) {
        newErrors[`workingHours_${i}_range`] =
          "End time must be after start time";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out null/undefined working hours entries before saving
      const cleanedData = {
        ...formData,
        workingHours: formData.workingHours.filter((wh) => wh != null),
      };
      await onSave(cleanedData);
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
      setIsSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).filter(
    (key) => key !== "submit" && errors[key] != null
  ).length;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 overflow-hidden">
      {errorCount > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg overflow-hidden">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800">
                Please fix the following {errorCount} error
                {errorCount !== 1 ? "s" : ""}:
              </h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                {Object.entries(errors)
                  .filter(([key]) => key !== "submit")
                  .map(([key, message]) => (
                    <li key={key}>{message}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 overflow-x-hidden"
      >
        {/* Basic Info Section */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold border-b pb-2">
            Basic Information
          </h3>

          {/* Name and Email - 2 columns on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              label="Full Name"
              error={errors.name}
              required
              htmlFor="name"
            >
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField label="Email" error={errors.email} htmlFor="email">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="staff@example.com"
                aria-invalid={!!errors.email}
              />
            </FormField>
          </div>

          {/* Phone - Full width on mobile, half on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <FormField label="Phone Number" htmlFor="phone">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                placeholder="+44 20 1234 5678"
              />
            </FormField>
          </div>

          {/* Bio */}
          <FormField label="Bio / Description" htmlFor="bio">
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="Tell us about this staff member..."
            />
          </FormField>

          {/* Image Upload */}
          <FormField label="Profile Photo" error={errors.image} htmlFor="image">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Preview */}
              <div className="relative group">
                {formData.image ? (
                  <div className="relative">
                    <img
                      src={formData.image.url}
                      alt={formData.image.alt || "Profile photo"}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full border-4 border-gray-200 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1 w-full">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span>Uploading...</span>
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span>
                        {formData.image ? "Change Photo" : "Upload Photo"}
                      </span>
                    </>
                  )}
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG or WEBP (max 5MB)
                </p>
              </div>
            </div>
          </FormField>
        </div>

        {/* Specialties Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Specialties</h3>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSpecialty())
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              placeholder="e.g., Haircuts, Coloring, Styling"
            />
            <Button
              type="button"
              onClick={addSpecialty}
              variant="brand"
              className="w-full sm:w-auto"
            >
              Add
            </Button>
          </div>

          {formData.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    className="text-brand-600 hover:text-brand-800"
                    aria-label={`Remove ${specialty}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Settings</h3>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange("active", e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active (can accept bookings)
            </label>
          </div>

          {/* In-Salon Payment */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="inSalonPayment"
                checked={formData.inSalonPayment}
                onChange={(e) =>
                  handleChange("inSalonPayment", e.target.checked)
                }
                className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <div className="flex-1">
                <label
                  htmlFor="inSalonPayment"
                  className="text-sm font-medium cursor-pointer"
                >
                  Accept Payment in Salon
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  When enabled, clients will only pay a booking fee online (no
                  deposit required). Full service payment will be collected
                  in-salon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-200 my-6"></div>

        {/* Working Hours Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold">Working Hours</h3>
            <Button
              type="button"
              onClick={addWorkingHours}
              variant="brand"
              size="sm"
            >
              + Add Hours
            </Button>
          </div>

          {formData.workingHours.length === 0 && (
            <p className="text-gray-500 text-sm">
              No working hours set. Add hours to specify availability.
            </p>
          )}

          {formData.workingHours.map((wh, index) => {
            // Safety check for null/undefined entries
            if (!wh) return null;

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-3 items-start sm:items-end p-3 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Day
                    </label>
                    <select
                      value={wh.dayOfWeek ?? 1}
                      onChange={(e) =>
                        handleWorkingHoursChange(
                          index,
                          "dayOfWeek",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Start
                    </label>
                    <input
                      type="time"
                      value={wh.start ?? "09:00"}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "start", e.target.value)
                      }
                      style={{ minWidth: 0 }}
                      className={`w-full px-2 py-2 border rounded-lg text-sm ${
                        errors[`workingHours_${index}_start`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`workingHours_${index}_start`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`workingHours_${index}_start`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      End
                    </label>
                    <input
                      type="time"
                      value={wh.end ?? "17:00"}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "end", e.target.value)
                      }
                      style={{ minWidth: 0 }}
                      className={`w-full px-2 py-2 border rounded-lg text-sm ${
                        errors[`workingHours_${index}_end`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`workingHours_${index}_end`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`workingHours_${index}_end`]}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeWorkingHours(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  title="Remove schedule"
                >
                  Remove
                </button>

                {errors[`workingHours_${index}_range`] && (
                  <p className="text-red-500 text-xs mt-1 w-full">
                    {errors[`workingHours_${index}_range`]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t gap-4">
          <div>
            {isEditMode && (
              <Button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                variant="danger"
                className="w-full sm:w-auto"
              >
                Delete Staff Member
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              loading={isSubmitting}
              variant="brand"
              className="w-full sm:w-auto"
            >
              {isEditMode ? "Update Staff" : "Add Staff"}
            </Button>
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Error saving staff member
                </h3>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        itemName={formData.name}
        itemType="staff member"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
