import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useImageUpload } from "../hooks/useImageUpload";
import FormField from "../components/forms/FormField";
import ConfirmDeleteModal from "../components/forms/ConfirmDeleteModal";
import Button from "../components/ui/Button";

/**
 * StaffForm - Create or Edit a beautician/staff member
 *
 * @param {object} props
 * @param {object|null} props.staff - Existing staff for edit mode, null for create mode
 * @param {function} props.onSave - Callback(staffData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 */
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
    color: "#3B82F6",
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
        color: staff.color || "#3B82F6",
        image: staff.image || null,
        workingHours: staff.workingHours || [],
      });
    }
  }, [staff]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
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
      setErrors((prev) => ({ ...prev, image: null }));
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

    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = "Please enter a valid hex color (e.g., #3B82F6)";
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
    (key) => key !== "submit"
  ).length;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 overflow-hidden">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 break-words">
        {isEditMode ? "Edit Staff Member" : "Add New Staff Member"}
      </h2>

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

          {/* Name */}
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

          {/* Email */}
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

          {/* Phone */}
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

          {/* Color */}
          <FormField
            label="Calendar Color"
            error={errors.color}
            htmlFor="color"
          >
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="color"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                  errors.color ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="#3B82F6"
              />
            </div>
          </FormField>

          {/* Image Upload */}
          <FormField
            label="Profile Photo"
            error={errors.image}
            htmlFor="image"
            hint={isUploadingImage ? "Uploading..." : undefined}
          >
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image.url}
                  alt={formData.image.alt || "Profile photo"}
                  className="w-32 h-32 object-cover rounded-full"
                />
              </div>
            )}
          </FormField>

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
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Schedule {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeWorkingHours(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Day of Week
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={wh.start ?? "09:00"}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "start", e.target.value)
                      }
                      style={{ minWidth: 0 }}
                      className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
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
                    <label className="block text-sm font-medium mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={wh.end ?? "17:00"}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "end", e.target.value)
                      }
                      style={{ minWidth: 0 }}
                      className={`w-full max-w-full px-2 py-2 border rounded-lg text-sm ${
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
                {errors[`workingHours_${index}_range`] && (
                  <p className="text-red-500 text-xs mt-2">
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
