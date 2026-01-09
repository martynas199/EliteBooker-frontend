import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Info,
  Settings,
  Image as ImageIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import { useImageUpload } from "../shared/hooks/useImageUpload";
import { useTenantSettings } from "../shared/hooks/useTenantSettings";
import { api } from "../shared/lib/apiClient";
import FormField from "../shared/components/forms/FormField";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import Button from "../shared/components/ui/Button";
import { useLanguage } from "../shared/contexts/LanguageContext";
import { t } from "../locales/adminTranslations";
import {
  SelectDrawer,
  SelectButton,
} from "../shared/components/ui/SelectDrawer";

/**
 * ServiceForm - Create or Edit a service
 *
 * @param {object} props
 * @param {object|null} props.service - Existing service for edit mode, null for create mode
 * @param {array} props.specialists - List of specialists for dropdown
 * @param {function} props.onSave - Callback(serviceData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 * @param {boolean} props.isSuperAdmin - Is user a super admin
 * @param {object} props.admin - Current admin user object
 */
export default function ServiceForm({
  service,
  specialists,
  onSave,
  onCancel,
  onDelete,
  isSuperAdmin = false,
  admin,
}) {
  const isEditMode = Boolean(service);
  const { language } = useLanguage();
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
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    primaryBeauticianId: "",
    additionalBeauticianIds: [],
    availableAt: [], // Location IDs where service is available
    active: true,
    priceVaries: false,
    image: null,
    useFixedSlots: false,
    fixedTimeSlots: [],
    variants: [
      {
        name: "Standard",
        durationMin: 30,
        price: 0,
        promoPrice: null,
        bufferBeforeMin: 0,
        bufferAfterMin: 0,
      },
    ],
  });

  const [newTimeSlot, setNewTimeSlot] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI description generation state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // Drawer state for mobile specialist selection
  const [showSpecialistDrawer, setShowSpecialistDrawer] = useState(false);

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

  // Load existing service data in edit mode
  useEffect(() => {
    if (service) {
      // Helper to extract ID from populated object or string
      const extractId = (value) => {
        if (!value) return "";
        // If populated (object with _id), return _id, otherwise return the value itself
        return typeof value === "object" && value._id
          ? String(value._id)
          : String(value);
      };

      setFormData({
        name: service.name || "",
        category: service.category || "",
        description: service.description || "",
        primaryBeauticianId: extractId(service.primaryBeauticianId),
        additionalBeauticianIds: service.additionalBeauticianIds
          ? service.additionalBeauticianIds.map(extractId)
          : [],
        availableAt: service.availableAt
          ? service.availableAt.map(extractId)
          : [],
        active: service.active !== undefined ? service.active : true,
        priceVaries: service.priceVaries || false,
        image: service.image || null,
        useFixedSlots:
          Array.isArray(service.fixedTimeSlots) &&
          service.fixedTimeSlots.length > 0,
        fixedTimeSlots: service.fixedTimeSlots || [],
        variants:
          service.variants && service.variants.length > 0
            ? service.variants
            : [
                {
                  name: "Standard",
                  durationMin: 30,
                  price: 0,
                  bufferBeforeMin: 0,
                  bufferAfterMin: 0,
                },
              ],
      });
    } else if (!isSuperAdmin && admin?.specialistId) {
      // For non-super admins creating a new service, pre-select their specialist ID
      console.log(
        "Auto-filling specialist for non-super admin:",
        admin.specialistId
      );
      setFormData((prev) => ({
        ...prev,
        primaryBeauticianId: String(admin.specialistId),
      }));
    }
  }, [service, isSuperAdmin, admin]);

  // Debug log to check admin object
  useEffect(() => {
    console.log("ServiceForm - Admin object:", admin);
    console.log("ServiceForm - isSuperAdmin:", isSuperAdmin);
    console.log("ServiceForm - Specialists available:", specialists.length);
  }, [admin, isSuperAdmin, specialists]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: "",
          durationMin: 30,
          price: 0,
          promoPrice: null,
          bufferBeforeMin: 0,
          bufferAfterMin: 0,
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("Variant removed");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedImage = await uploadImage(file, { alt: formData.name });
      setFormData((prev) => ({ ...prev, image: uploadedImage }));
      setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err.message }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter a service name";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Please enter a category";
    }

    if (!formData.primaryBeauticianId) {
      newErrors.primaryBeauticianId = "Please select a primary specialist";
    }

    if (formData.variants.length === 0) {
      newErrors.variants =
        "Please add at least one service variant with pricing";
    }

    formData.variants.forEach((v, i) => {
      if (!v.name.trim()) {
        newErrors[`variant_${i}_name`] = "Please enter a name for this variant";
      }
      if (!v.durationMin || v.durationMin <= 0) {
        newErrors[`variant_${i}_duration`] =
          "Duration must be at least 1 minute";
      }
      if (
        v.price === undefined ||
        v.price === null ||
        v.price === "" ||
        isNaN(v.price) ||
        v.price <= 0
      ) {
        newErrors[`variant_${i}_price`] =
          "Please enter a valid price greater than £0";
      }
      // Validate promoPrice if provided
      if (
        v.promoPrice !== null &&
        v.promoPrice !== undefined &&
        v.promoPrice !== ""
      ) {
        if (isNaN(v.promoPrice) || v.promoPrice <= 0) {
          newErrors[`variant_${i}_promoPrice`] =
            "Promo price must be greater than £0";
        } else if (v.promoPrice >= v.price) {
          newErrors[`variant_${i}_promoPrice`] =
            "Promo price must be less than regular price";
        }
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
      await onSave(formData);
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
    if (!onDelete) {
      toast.error("Delete permission denied");
      return;
    }
    setIsSubmitting(true);
    try {
      await onDelete();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
      setIsSubmitting(false);
    }
  };

  // Generate AI description
  const handleGenerateAIDescription = async () => {
    if (!formData.name.trim() || formData.name.trim().length <= 3) {
      toast.error("Please enter a service name first (at least 4 characters)");
      return;
    }

    setIsGeneratingAI(true);
    setIsAIGenerated(false);

    try {
      const response = await api.post("/services/generate-description", {
        serviceTitle: formData.name,
        businessType: "beauty",
        serviceCategory: formData.category || undefined,
        serviceDuration: formData.variants[0]?.durationMin || undefined,
        country: "UK",
      });

      if (response.data.success) {
        handleChange("description", response.data.data.description);
        setIsAIGenerated(true);
        toast.success("AI description generated successfully!");

        // Show info if fallback was used
        if (response.data.data.source === "fallback") {
          toast(response.data.data.warning, { icon: "⚠️" });
        }
      } else {
        toast.error(response.data.message || "Failed to generate description");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to generate AI description. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const errorCount = Object.keys(errors).filter(
    (key) => key !== "submit"
  ).length;

  return (
    <>
      {errorCount > 0 && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
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
              <h3 className="text-sm font-bold text-red-900">
                {t("pleaseFixErrors", language)} {errorCount}{" "}
                {errorCount !== 1
                  ? t("errors", language)
                  : t("error", language)}
                :
              </h3>
              <ul className="mt-1.5 text-xs text-red-700 list-disc list-inside space-y-1">
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

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Basic Info Section */}
        <div className="space-y-3">
          {/* Name */}
          <FormField
            label={t("serviceName", language)}
            error={errors.name}
            required
            htmlFor="name"
            hint={t("serviceNameHint", language)}
          >
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              aria-invalid={!!errors.name}
            />
          </FormField>

          {/* Category */}
          <FormField
            label={t("category", language)}
            error={errors.category}
            required
            htmlFor="category"
            hint={t("categoryHint", language)}
          >
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Hair, Nails, Spa"
              aria-invalid={!!errors.category}
            />
          </FormField>

          {/* Description */}
          <FormField
            label={t("description", language)}
            htmlFor="description"
            hint={t("descriptionHint", language)}
          >
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    handleChange("description", e.target.value);
                    setIsAIGenerated(false); // Clear AI flag when manually edited
                  }}
                  rows={4}
                  className="w-full px-3 py-2 pr-12 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={
                    isGeneratingAI ||
                    !formData.name ||
                    formData.name.trim().length <= 3
                  }
                  className="absolute bottom-3 right-3 p-2 bg-white border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  title={
                    isAIGenerated
                      ? "Regenerate AI description"
                      : "Generate AI description"
                  }
                >
                  {isGeneratingAI ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
              {isAIGenerated && (
                <p className="text-xs text-purple-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI-generated, editable
                </p>
              )}
            </div>
          </FormField>

          {/* Primary Specialist */}
          <FormField
            label={t("primaryBeautician", language)}
            error={errors.primaryBeauticianId}
            required
            htmlFor="primaryBeauticianId"
            hint={t("primaryBeauticianHint", language)}
          >
            <SelectButton
              id="primaryBeauticianId"
              value={formData.primaryBeauticianId}
              placeholder={t("selectBeautician", language)}
              options={specialists.map((b) => ({
                value: b._id,
                label: b.name,
              }))}
              onClick={() => isSuperAdmin && setShowSpecialistDrawer(true)}
              disabled={!isSuperAdmin}
              className={`w-full px-3 py-2 text-sm rounded-lg ${
                errors.primaryBeauticianId ? "border-red-500" : ""
              } ${!isSuperAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {!isSuperAdmin && !admin?.specialistId && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠️ Your admin account is not linked to a specialist. Please
                contact your administrator to link your account before creating
                services.
              </p>
            )}
            {!isSuperAdmin && admin?.specialistId && (
              <p className="text-sm text-gray-500 mt-1">
                {t("youCanOnlyCreateForYourself", language)}
              </p>
            )}
          </FormField>

          {/* Locations Multi-Select (only if multi-location is enabled) */}
          {isMultiLocationEnabled && (
            <FormField
              label="Available at Locations"
              htmlFor="availableAt"
              hint="Select which locations offer this service. Leave empty for all locations."
            >
              {loadingLocations ? (
                <p className="text-sm text-gray-500">Loading locations...</p>
              ) : locations.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No locations available. Create locations first in the
                  Locations page.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {locations.map((location) => (
                    <label
                      key={location._id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.availableAt.includes(location._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange("availableAt", [
                              ...formData.availableAt,
                              location._id,
                            ]);
                          } else {
                            handleChange(
                              "availableAt",
                              formData.availableAt.filter(
                                (id) => id !== location._id
                              )
                            );
                          }
                        }}
                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                      />
                      <span className="text-sm flex items-center gap-2">
                        {location.name}
                        {location.isPrimary && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {formData.availableAt.length === 0 && locations.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No locations selected - service will be available at all
                  locations
                </p>
              )}
            </FormField>
          )}

          {/* Image Upload */}
          <FormField
            label={t("serviceImage", language)}
            error={errors.image}
            htmlFor="image"
            hint={
              isUploadingImage
                ? t("uploading", language)
                : "Recommended: 800x600px, max 2MB. JPG, PNG or WebP format."
            }
          >
            <div className="space-y-3">
              {/* Image Preview or Upload Area */}
              {formData.image && !isUploadingImage ? (
                <div className="relative">
                  <img
                    src={formData.image.url}
                    alt={formData.image.alt || "Service image"}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        image: null,
                      }));
                      toast.success("Image removed");
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-white text-red-600 text-xs font-semibold rounded-lg shadow-md hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image"
                  className={`flex flex-col items-center justify-center w-full h-56 sm:h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isUploadingImage
                      ? "border-brand-400 bg-brand-50"
                      : "border-gray-300 hover:border-brand-400 bg-gray-50 hover:bg-brand-50"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <svg
                      className={`w-10 h-10 mb-3 ${
                        isUploadingImage ? "text-brand-500" : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {isUploadingImage ? (
                      <>
                        <p className="mb-2 text-sm font-semibold text-brand-600">
                          Uploading... {progress}%
                        </p>
                        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-1 text-sm font-semibold text-gray-700">
                          Click to upload service image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or WebP (MAX. 2MB)
                        </p>
                      </>
                    )}
                  </div>
                </label>
              )}

              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
                className="hidden"
              />
            </div>
          </FormField>

          {/* Active Status */}
          <div className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="w-6 h-6 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
              <label
                htmlFor="active"
                className="text-sm font-semibold text-gray-900 cursor-pointer"
              >
                {t("activeVisible", language)}
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-8">
              {t("activeHint", language)}
            </p>
          </div>

          {/* Price Varies */}
          <div className="flex flex-col gap-2 p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="priceVaries"
                checked={formData.priceVaries}
                onChange={(e) => handleChange("priceVaries", e.target.checked)}
                className="w-6 h-6 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
              <label
                htmlFor="priceVaries"
                className="text-sm font-semibold text-gray-900 cursor-pointer"
              >
                Price Varies
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-8">
              Check this if the service price varies (will show "Up to" instead
              of "From")
            </p>
          </div>

          {/* Fixed Time Slots */}
          <div className="flex flex-col gap-3 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="useFixedSlots"
                checked={formData.useFixedSlots}
                onChange={(e) => {
                  handleChange("useFixedSlots", e.target.checked);
                  if (!e.target.checked) {
                    handleChange("fixedTimeSlots", []);
                  }
                }}
                className="w-6 h-6 text-purple-600 rounded focus:ring-purple-500 cursor-pointer flex-shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="useFixedSlots"
                  className="text-sm font-semibold text-gray-900 cursor-pointer block"
                >
                  🕐 Use Fixed Time Slots
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Set specific times for appointments
                  <span className="hidden sm:inline">
                    {" "}
                    instead of automatic slot generation
                  </span>
                </p>
              </div>
            </div>

            {formData.useFixedSlots && (
              <div className="space-y-3 mt-1">
                {/* Add Time Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="time"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full sm:flex-1 px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base"
                    placeholder="09:15"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const time = newTimeSlot.trim();
                      if (!time) {
                        toast.error("Please enter a time");
                        return;
                      }
                      if (formData.fixedTimeSlots.includes(time)) {
                        toast.error("This time is already added");
                        return;
                      }
                      const updated = [...formData.fixedTimeSlots, time].sort();
                      handleChange("fixedTimeSlots", updated);
                      setNewTimeSlot("");
                      toast.success("Time added");
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors active:scale-95"
                  >
                    Add Time
                  </button>
                </div>

                {/* Configured Times List */}
                {formData.fixedTimeSlots.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                      {formData.fixedTimeSlots.length} time
                      {formData.fixedTimeSlots.length !== 1 ? "s" : ""}{" "}
                      configured:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.fixedTimeSlots.map((time) => (
                        <div
                          key={time}
                          className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-purple-200 shadow-sm"
                        >
                          <span className="font-mono text-sm sm:text-base font-semibold text-purple-900">
                            {time}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange(
                                "fixedTimeSlots",
                                formData.fixedTimeSlots.filter(
                                  (t) => t !== time
                                )
                              );
                              toast.success("Removed");
                            }}
                            className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors active:scale-95"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 italic py-2">
                    Add your first time slot above
                  </p>
                )}

                {/* Quick Presets */}
                <div className="p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">
                    💡 Quick Presets:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("fixedTimeSlots", [
                          "09:00",
                          "12:00",
                          "15:00",
                          "18:00",
                        ]);
                        toast.success("Preset applied");
                      }}
                      className="text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors active:scale-95 font-medium"
                    >
                      Every 3hrs (9-6)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("fixedTimeSlots", [
                          "10:00",
                          "14:00",
                          "16:00",
                        ]);
                        toast.success("Preset applied");
                      }}
                      className="text-xs px-3 py-2 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors active:scale-95 font-medium"
                    >
                      Morning+Afternoon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("fixedTimeSlots", []);
                        toast.success("Cleared");
                      }}
                      className="text-xs px-3 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors active:scale-95 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-3">
          <div className="pb-2 border-b border-gray-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {t("serviceVariants", language)}
                  </h3>
                  {errors.variants && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {errors.variants}
                    </p>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={addVariant}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:border-brand-400"
              >
                <span className="text-sm leading-none">＋</span>
                <span>{t("addVariant", language)}</span>
              </Button>
            </div>
            <p className="text-xs text-gray-600">
              Create different versions of this service with unique durations
              and prices. For example: "Quick Trim (15 min, £20)" and "Full Cut
              & Style (45 min, £45)".
            </p>
          </div>

          {/* Variant Cards */}
          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="p-3 border border-gray-200 rounded-lg space-y-3 bg-gradient-to-br from-gray-50 to-white"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">
                  {t("variantName", language)} {index + 1}
                </h4>
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg transition-colors"
                  >
                    {t("remove", language)}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label={t("variantName", language)}
                  error={errors[`variant_${index}_name`]}
                  required
                  htmlFor={`variant-${index}-name`}
                  hint={t("variantNameHint", language)}
                >
                  <input
                    type="text"
                    id={`variant-${index}-name`}
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(index, "name", e.target.value)
                    }
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                      errors[`variant_${index}_name`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., Standard"
                  />
                </FormField>

                <FormField
                  label={t("duration", language)}
                  error={errors[`variant_${index}_duration`]}
                  required
                  htmlFor={`variant-${index}-duration`}
                  hint={t("durationHint", language)}
                >
                  <input
                    type="number"
                    id={`variant-${index}-duration`}
                    inputMode="numeric"
                    value={variant.durationMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "durationMin",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                      errors[`variant_${index}_duration`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    min="1"
                  />
                </FormField>

                <FormField
                  label={t("price", language)}
                  error={errors[`variant_${index}_price`]}
                  required
                  htmlFor={`variant-${index}-price`}
                  hint={t("priceHint", language)}
                >
                  <input
                    type="number"
                    id={`variant-${index}-price`}
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleVariantChange(
                        index,
                        "price",
                        value === "" ? 0 : parseFloat(value)
                      );
                    }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                      errors[`variant_${index}_price`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField
                  label="Promo Price (Optional)"
                  error={errors[`variant_${index}_promoPrice`]}
                  htmlFor={`variant-${index}-promo-price`}
                  hint="Special promotional price - if set, this service will display 'Special offer' label"
                >
                  <input
                    type="number"
                    id={`variant-${index}-promo-price`}
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={variant.promoPrice || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleVariantChange(
                        index,
                        "promoPrice",
                        value === "" ? null : parseFloat(value)
                      );
                    }}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
                      errors[`variant_${index}_promoPrice`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </FormField>

                <FormField
                  label={t("bufferBefore", language)}
                  htmlFor={`variant-${index}-buffer-before`}
                  hint={t("bufferBeforeHint", language)}
                >
                  <input
                    type="number"
                    id={`variant-${index}-buffer-before`}
                    inputMode="numeric"
                    value={variant.bufferBeforeMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "bufferBeforeMin",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    min="0"
                  />
                </FormField>

                <FormField
                  label={t("bufferAfter", language)}
                  htmlFor={`variant-${index}-buffer-after`}
                  hint={t("bufferAfterHint", language)}
                >
                  <input
                    type="number"
                    id={`variant-${index}-buffer-after`}
                    inputMode="numeric"
                    value={variant.bufferAfterMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "bufferAfterMin",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    min="0"
                  />
                </FormField>
              </div>
            </div>
          ))}

          {errors.variants && (
            <p className="text-red-500 text-xs mt-1">{errors.variants}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            {t("cancel", language)}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            loading={isSubmitting}
            variant="brand"
            size="sm"
            className="text-xs"
          >
            {isEditMode
              ? t("saveService", language)
              : t("createService", language)}
          </Button>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
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
                <h3 className="text-xs font-bold text-red-900 mb-0.5">
                  Error saving service
                </h3>
                <p className="text-xs text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Specialist Selection Drawer */}
      <SelectDrawer
        open={showSpecialistDrawer}
        onClose={() => setShowSpecialistDrawer(false)}
        title={t("selectBeautician", language) || "Select Specialist"}
        options={specialists.map((b) => ({
          value: b._id,
          label: b.name,
        }))}
        value={formData.primaryBeauticianId}
        onChange={(value) => handleChange("primaryBeauticianId", value)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        itemName={formData.name}
        itemType="service"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isSubmitting}
      />
    </>
  );
}
