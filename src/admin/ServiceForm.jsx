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
        durationMin: "",
        price: "",
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
                  durationMin: "",
                  price: "",
                  promoPrice: null,
                  bufferBeforeMin: 0,
                  bufferAfterMin: 0,
                },
              ],
      });
    } else if (!isSuperAdmin && admin?.specialistId) {
      // For non-super admins creating a new service, pre-select their specialist ID
      console.log(
        "Auto-filling specialist for non-super admin:",
        admin.specialistId,
      );
      setFormData((prev) => ({
        ...prev,
        primaryBeauticianId: String(admin.specialistId),
      }));
    }
  }, [service, isSuperAdmin, admin]);

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
          durationMin: "",
          price: "",
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
      // Convert empty strings to proper numbers before submission
      const submissionData = {
        ...formData,
        variants: formData.variants.map((v) => ({
          ...v,
          durationMin:
            typeof v.durationMin === "string"
              ? parseInt(v.durationMin)
              : v.durationMin,
          price: typeof v.price === "string" ? parseFloat(v.price) : v.price,
        })),
      };
      await onSave(submissionData);
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
    (key) => key !== "submit",
  ).length;
  const requiredChecks = [
    Boolean(formData.name.trim()),
    Boolean(formData.category.trim()),
    Boolean(formData.primaryBeauticianId),
    formData.variants.every(
      (variant) =>
        variant.name.trim() &&
        Number(variant.durationMin) > 0 &&
        Number(variant.price) > 0,
    ),
  ];
  const completedRequiredCount = requiredChecks.filter(Boolean).length;
  const requiredTotalCount = requiredChecks.length;

  const inputClass = (hasError = false) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  const cardClass =
    "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5";

  return (
    <>
      {errorCount > 0 && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
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

      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Form Progress
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {completedRequiredCount}/{requiredTotalCount} required sections complete
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              completedRequiredCount === requiredTotalCount
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {completedRequiredCount === requiredTotalCount
              ? "Ready to save"
              : "Needs attention"}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-24 sm:space-y-5 sm:pb-0">
        {/* Basic Info Section */}
        <div className={cardClass}>
          <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
            <div className="rounded-xl bg-slate-900 p-2 text-white shadow-sm">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Service Details</h3>
              <p className="text-xs text-gray-500">
                Add core information your clients will see first.
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
              className={inputClass(!!errors.name)}
              style={{ fontSize: "16px" }}
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
              className={inputClass(!!errors.category)}
              style={{ fontSize: "16px" }}
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
                  className="w-full resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 pr-12 text-sm text-gray-900 shadow-sm transition-all focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                  style={{ fontSize: "16px" }}
                />
                <button
                  type="button"
                  onClick={handleGenerateAIDescription}
                  disabled={
                    isGeneratingAI ||
                    !formData.name ||
                    formData.name.trim().length <= 3
                  }
                  className="group absolute bottom-3 right-3 rounded-lg border border-gray-300 bg-white p-2 shadow-sm transition-all duration-200 hover:border-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    isAIGenerated
                      ? "Regenerate AI description"
                      : "Generate AI description"
                  }
                >
                  {isGeneratingAI ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-900 border-t-transparent" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-gray-900 transition-transform group-hover:scale-110" />
                  )}
                </button>
              </div>
              {isAIGenerated && (
                <p className="flex items-center gap-1 text-xs text-green-700">
                  <Sparkles className="h-3 w-3" />
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
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm ${
                errors.primaryBeauticianId ? "border-red-500" : ""
              } ${!isSuperAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {!isSuperAdmin && !admin?.specialistId && (
              <p className="sr-only">
                ⚠️ Your admin account is not linked to a specialist. Please
                contact your administrator to link your account before creating
                services.
              </p>
            )}
            {!isSuperAdmin && !admin?.specialistId && (
              <p className="mt-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                Your admin account is not linked to a specialist. Contact your administrator before creating services.
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
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                  {locations.map((location) => (
                    <label
                      key={location._id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-white p-2.5 shadow-sm transition-colors hover:border-gray-200 hover:bg-gray-100"
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
                                (id) => id !== location._id,
                              ),
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

          <div className="mb-2 mt-1 flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Media & Visibility</h4>
              <p className="text-xs text-gray-500">
                Upload a clean thumbnail and control listing behavior.
              </p>
            </div>
          </div>

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
                    className="h-52 w-full rounded-xl border-2 border-gray-200 object-cover"
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
                  className={`flex h-56 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors sm:h-52 ${
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

          <div className="mb-2 mt-1 flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Service Settings</h4>
              <p className="text-xs text-gray-500">
                Configure status, pricing behavior, and slot mode.
              </p>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3.5 sm:p-4">
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
          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3.5 sm:p-4">
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
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-3.5 sm:p-4">
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
                className="mt-0.5 h-6 w-6 flex-shrink-0 cursor-pointer rounded text-gray-900 focus:ring-gray-500"
              />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="useFixedSlots"
                  className="sr-only"
                >
                  🕐 Use Fixed Time Slots
                </label>
                <span className="block cursor-pointer text-sm font-semibold text-gray-900">
                  Use Fixed Time Slots
                </span>
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
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 shadow-sm sm:flex-1 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20"
                    style={{ fontSize: "16px" }}
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
                    className="w-full rounded-xl border border-gray-900 bg-gray-900 px-6 py-2.5 text-white transition-colors hover:bg-black sm:w-auto"
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
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm"
                        >
                          <span className="font-mono text-sm font-semibold text-gray-900 sm:text-base">
                            {time}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              handleChange(
                                "fixedTimeSlots",
                                formData.fixedTimeSlots.filter(
                                  (t) => t !== time,
                                ),
                              );
                              toast.success("Removed");
                            }}
                            className="inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium text-transparent transition-colors hover:bg-red-50 sm:text-sm"
                          >
                            <svg
                              className="h-4 w-4 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span className="sr-only">Remove</span>
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
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
                  <p className="sr-only">
                    💡 Quick Presets:
                  </p>
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    Quick presets:
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
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
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
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium transition-colors hover:bg-gray-100"
                    >
                      Morning+Afternoon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange("fixedTimeSlots", []);
                        toast.success("Cleared");
                      }}
                      className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Variants Section */}
        <div className={cardClass}>
          <div className="border-b border-gray-100 pb-3">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                size="md"
                className="flex w-full items-center justify-center gap-1.5 sm:w-auto"
              >
                <span className="text-sm leading-none">+</span>
                <span>{t("addVariant", language)}</span>
              </Button>
            </div>
            <p className="sr-only">
              Create different versions of this service with unique durations
              and prices. For example: "Quick Trim (15 min, £20)" and "Full Cut
              & Style (45 min, £45)".
            </p>
            <p className="text-xs text-gray-600">
              Create different versions of this service with unique durations and prices. Example: "Quick Trim (15 min, £20)" and "Full Cut & Style (45 min, £45)".
            </p>
          </div>

          {/* Variant Cards */}
          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-gray-200 bg-white p-3.5 sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="font-bold text-gray-900 text-sm">
                  {t("variantName", language)} {index + 1}
                </h4>
                {formData.variants.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVariant(index)}
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t("remove", language)}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                    className={inputClass(!!errors[`variant_${index}_name`])}
                    style={{ fontSize: "16px" }}
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
                    value={variant.durationMin === 0 ? "" : variant.durationMin}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "durationMin",
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                    className={inputClass(!!errors[`variant_${index}_duration`])}
                    style={{ fontSize: "16px" }}
                    min="1"
                    placeholder="e.g., 30"
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
                    value={variant.price === 0 ? "" : variant.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleVariantChange(
                        index,
                        "price",
                        value === "" ? "" : parseFloat(value),
                      );
                    }}
                    className={inputClass(!!errors[`variant_${index}_price`])}
                    style={{ fontSize: "16px" }}
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
                        value === "" ? null : parseFloat(value),
                      );
                    }}
                    className={inputClass(!!errors[`variant_${index}_promoPrice`])}
                    style={{ fontSize: "16px" }}
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
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className={inputClass(false)}
                    style={{ fontSize: "16px" }}
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
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className={inputClass(false)}
                    style={{ fontSize: "16px" }}
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
        <div className="sticky bottom-0 z-20 -mx-1 border-t border-gray-200 bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-3 shadow-[0_-6px_16px_rgba(15,23,42,0.08)] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-3 sm:shadow-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {isEditMode && onDelete && (
              <Button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                variant="danger"
                size="md"
                className="w-full sm:mr-auto sm:w-auto"
              >
                Delete
              </Button>
            )}

            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
            >
              {t("cancel", language)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              loading={isSubmitting}
              variant="brand"
              size="md"
              className="w-full sm:w-auto"
            >
              {isEditMode
                ? t("saveService", language)
                : t("createService", language)}
            </Button>
          </div>
        </div>

        {errors.submit && (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
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
