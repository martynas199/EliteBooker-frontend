import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  User,
  Image as ImageIcon,
  MapPin,
  Settings,
  Clock,
} from "lucide-react";
import { useImageUpload } from "../shared/hooks/useImageUpload";
import { useTenantSettings } from "../shared/hooks/useTenantSettings";
import { api } from "../shared/lib/apiClient";
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

const createDefaultStaffFormData = () => ({
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
  locationIds: [],
  primaryLocationId: "",
});

const cloneFormData = (value) => JSON.parse(JSON.stringify(value));

const buildDraftSnapshot = (value) =>
  JSON.stringify({
    name: value.name || "",
    email: value.email || "",
    phone: value.phone || "",
    bio: value.bio || "",
    specialties: value.specialties || [],
    active: Boolean(value.active),
    inSalonPayment: Boolean(value.inSalonPayment),
    color: value.color || "",
    image:
      value.image?.secure_url ||
      value.image?.url ||
      value.image?.public_id ||
      (typeof value.image === "string" ? value.image : null),
    workingHours: (value.workingHours || []).map((item) => ({
      dayOfWeek: item?.dayOfWeek ?? 1,
      start: item?.start || "09:00",
      end: item?.end || "17:00",
    })),
    locationIds: value.locationIds || [],
    primaryLocationId: value.primaryLocationId || "",
  });

export default function StaffForm({
  staff,
  onSave,
  onCancel,
  onDelete,
  onDirtyChange,
}) {
  const isEditMode = Boolean(staff);
  const { featureFlags } = useTenantSettings();
  const {
    uploadImage,
    isUploading: isUploadingImage,
    progress,
  } = useImageUpload();

  // Multi-location support
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const isMultiLocationEnabled = featureFlags?.multiLocation === true;

  // Form state
  const [formData, setFormData] = useState(createDefaultStaffFormData);
  const [savedFormData, setSavedFormData] = useState(() =>
    cloneFormData(createDefaultStaffFormData())
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState("");

  // Scroll to top when component mounts (especially useful when editing)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Load locations if multi-location is enabled
  useEffect(() => {
    if (isMultiLocationEnabled) {
      fetchLocations();
    }
  }, [isMultiLocationEnabled]);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await api.get("/locations");
      setLocations(response.data || []);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoadingLocations(false);
    }
  };

  // Load existing staff data in edit mode
  useEffect(() => {
    if (staff) {
      // Extract location IDs - handle both populated and unpopulated
      const extractedLocationIds = staff.locationIds
        ? staff.locationIds.map((loc) =>
            typeof loc === "string" ? loc : loc._id
          )
        : [];

      const extractedPrimaryLocationId = staff.primaryLocationId
        ? typeof staff.primaryLocationId === "string"
          ? staff.primaryLocationId
          : staff.primaryLocationId._id
        : "";

      const initialFormData = {
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
        locationIds: extractedLocationIds,
        primaryLocationId: extractedPrimaryLocationId,
      };

      setFormData(initialFormData);
      setSavedFormData(cloneFormData(initialFormData));
      return;
    }

    const initialFormData = createDefaultStaffFormData();
    setFormData(initialFormData);
    setSavedFormData(cloneFormData(initialFormData));
  }, [staff]);

  const hasUnsavedChanges = useMemo(
    () => buildDraftSnapshot(formData) !== buildDraftSnapshot(savedFormData),
    [formData, savedFormData]
  );

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleResetChanges = () => {
    setFormData(cloneFormData(savedFormData));
    setErrors({});
  };

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

      const startTime = wh.start || "09:00";
      const endTime = wh.end || "17:00";

      // Validate start time format
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
        newErrors[`workingHours_${i}_start`] =
          "Please enter start time in HH:mm format (e.g., 09:00)";
      }

      // Validate end time format
      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTime)) {
        newErrors[`workingHours_${i}_end`] =
          "Please enter end time in HH:mm format (e.g., 17:00)";
      }

      // Validate time range
      if (startTime >= endTime) {
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
      // Filter out null/undefined working hours entries and ensure all fields are present
      const cleanedData = {
        ...formData,
        workingHours: formData.workingHours
          .filter((wh) => wh != null)
          .map((wh) => ({
            dayOfWeek: wh.dayOfWeek ?? 1,
            start: wh.start || "09:00",
            end: wh.end || "17:00",
          })),
      };

      console.log(
        "Submitting staff data:",
        JSON.stringify(cleanedData, null, 2)
      );
      await onSave(cleanedData);
      setSavedFormData(cloneFormData(cleanedData));
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

  const inputClass = (hasError = false) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  const sectionClass =
    "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5";

  return (
    <div className="mx-auto mb-8 max-w-5xl rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      {errorCount > 0 && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm sm:mb-6">
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
        className="space-y-4 overflow-x-hidden pb-24 sm:space-y-6 sm:pb-0"
      >
        {hasUnsavedChanges && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You have unsaved changes.
          </div>
        )}

        {/* Basic Info Section */}
        <div className={sectionClass}>
          <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-sm">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              <p className="text-xs text-gray-600">
                Add profile details and a clear introduction.
              </p>
            </div>
          </div>

          <div className="space-y-4">

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
                className={inputClass(!!errors.name)}
                aria-invalid={!!errors.name}
              />
            </FormField>

            <FormField label="Email" error={errors.email} htmlFor="email">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputClass(!!errors.email)}
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
                className={inputClass(false)}
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
              className="w-full resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
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
                <p className="text-xs text-gray-600 mt-2">
                  PNG, JPG or WEBP (max 5MB)
                </p>
              </div>
            </div>
          </FormField>
          </div>
        </div>

        {/* Specialties Section */}
        <div className={sectionClass}>
          <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Specialties</h3>
              <p className="text-xs text-gray-600">
                Add tags clients use to discover this staff member.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSpecialty())
              }
              className={`${inputClass(false)} sm:flex-1`}
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

        {/* Location Assignment Section - Only show if multi-location is enabled */}
        {isMultiLocationEnabled && (
          <div className={sectionClass}>
            <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Location Assignment</h3>
                <p className="text-xs text-gray-600">
                  Control where this staff member appears for booking.
                </p>
              </div>
            </div>

            {loadingLocations ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600"></div>
                <p className="text-sm text-gray-600 mt-2">
                  Loading locations...
                </p>
              </div>
            ) : locations.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No locations found. Please create locations first before
                  assigning staff.
                </p>
              </div>
            ) : (
              <>
                <FormField label="Assigned Locations" required>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Select which locations this staff member works at
                    </p>
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                      {locations.map((location) => (
                        <label
                          key={location._id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white p-2.5 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={formData.locationIds.includes(
                              location._id
                            )}
                            onChange={(e) => {
                              const newLocationIds = e.target.checked
                                ? [...formData.locationIds, location._id]
                                : formData.locationIds.filter(
                                    (id) => id !== location._id
                                  );

                              handleChange("locationIds", newLocationIds);

                              // If unchecking the primary location, clear it
                              if (
                                !e.target.checked &&
                                formData.primaryLocationId === location._id
                              ) {
                                handleChange("primaryLocationId", "");
                              }
                            }}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                          />
                          <span className="flex-1 text-sm font-medium text-gray-900">
                            {location.name}
                            {location.isPrimary && (
                              <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                                Primary
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                    {formData.locationIds.length === 0 && (
                      <p className="text-xs text-amber-700 mt-1">
                        No locations selected. Staff will be available at all
                        locations by default.
                      </p>
                    )}
                  </div>
                </FormField>

                {formData.locationIds.length > 0 && (
                  <FormField label="Primary Location" required>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Select the main location where this staff member is
                        based
                      </p>
                      <select
                        value={formData.primaryLocationId}
                        onChange={(e) =>
                          handleChange("primaryLocationId", e.target.value)
                        }
                        className={inputClass(false)}
                      >
                        <option value="">Select primary location...</option>
                        {locations
                          .filter((loc) =>
                            formData.locationIds.includes(loc._id)
                          )
                          .map((location) => (
                            <option key={location._id} value={location._id}>
                              {location.name}
                              {location.isPrimary ? " (Business Primary)" : ""}
                            </option>
                          ))}
                      </select>
                      {!formData.primaryLocationId &&
                        formData.locationIds.length > 0 && (
                          <p className="text-xs text-amber-700 mt-1">
                            Please select a primary location
                          </p>
                        )}
                    </div>
                  </FormField>
                )}
              </>
            )}
          </div>
        )}

        {/* Settings Section */}
        <div className={sectionClass}>
          <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
              <p className="text-xs text-gray-600">
                Manage visibility and payment behavior.
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange("active", e.target.checked)}
              className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-900">
              Active (can accept bookings)
            </label>
          </div>

          {/* In-Salon Payment */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="inSalonPayment"
                checked={formData.inSalonPayment}
                onChange={(e) =>
                  handleChange("inSalonPayment", e.target.checked)
                }
                className="mt-1 h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
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
        <div className="my-6 border-t border-gray-200"></div>

        {/* Working Hours Section */}
        <div className={sectionClass}>
          <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Working Hours</h3>
                <p className="text-xs text-gray-600">
                  Define availability blocks shown during booking.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={addWorkingHours}
              variant="brand"
              size="md"
              className="w-full sm:w-auto"
            >
              + Add Hours
            </Button>
          </div>

          {formData.workingHours.length === 0 && (
            <p className="text-gray-600 text-sm">
              No working hours set. Add hours to specify availability.
            </p>
          )}

          {formData.workingHours.map((wh, index) => {
            // Safety check for null/undefined entries
            if (!wh) return null;

            return (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5 sm:flex-row sm:items-end"
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
                      className={inputClass(false)}
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
                      className={`w-full rounded-xl border px-2 py-2 text-sm ${
                        errors[`workingHours_${index}_start`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`workingHours_${index}_start`] && (
                      <p className="text-red-600 text-xs mt-1">
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
                      className={`w-full rounded-xl border px-2 py-2 text-sm ${
                        errors[`workingHours_${index}_end`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`workingHours_${index}_end`] && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors[`workingHours_${index}_end`]}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeWorkingHours(index)}
                  className="w-full whitespace-nowrap rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white sm:w-auto"
                  title="Remove schedule"
                >
                  Remove
                </button>

                {errors[`workingHours_${index}_range`] && (
                  <p className="text-red-600 text-xs mt-1 w-full">
                    {errors[`workingHours_${index}_range`]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 z-20 -mx-1 border-t border-gray-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-3 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-3 sm:shadow-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {isEditMode && (
              <Button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                variant="danger"
                size="md"
                className="w-full sm:mr-auto sm:w-auto"
              >
                Delete Staff Member
              </Button>
            )}

            <Button
              type="button"
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges || isSubmitting}
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
            >
              Reset
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage || !hasUnsavedChanges}
              loading={isSubmitting}
              variant="brand"
              size="md"
              className="w-full sm:w-auto"
            >
              {isEditMode ? "Update Staff" : "Add Staff"}
            </Button>
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
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

