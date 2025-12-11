import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Info, Settings, Image as ImageIcon, Layers } from "lucide-react";
import { useImageUpload } from "../shared/hooks/useImageUpload";
import { useTenantSettings } from "../shared/hooks/useTenantSettings";
import { api } from "../shared/lib/apiClient";
import FormField from "../shared/components/forms/FormField";
import ConfirmDeleteModal from "../shared/components/forms/ConfirmDeleteModal";
import Button from "../shared/components/ui/Button";
import { useLanguage } from "../shared/contexts/LanguageContext";
import { t } from "../locales/adminTranslations";

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const errorCount = Object.keys(errors).filter(
    (key) => key !== "submit"
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      {errorCount > 0 && (
        <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0"
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
              <h3 className="text-base font-bold text-red-900">
                {t("pleaseFixErrors", language)} {errorCount}{" "}
                {errorCount !== 1
                  ? t("errors", language)
                  : t("error", language)}
                :
              </h3>
              <ul className="mt-3 text-sm text-red-700 list-disc list-inside space-y-2">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="bg-white rounded-2xl shadow-lg py-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100 px-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("basicInformation", language)}
            </h3>
          </div>

          <div className="px-6 space-y-6">
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors resize-none"
              />
            </FormField>

            {/* Primary Specialist */}
            <FormField
              label={t("primaryBeautician", language)}
              error={errors.primaryBeauticianId}
              required
              htmlFor="primaryBeauticianId"
              hint={t("primaryBeauticianHint", language)}
            >
              <select
                id="primaryBeauticianId"
                value={formData.primaryBeauticianId}
                onChange={(e) =>
                  handleChange("primaryBeauticianId", e.target.value)
                }
                disabled={!isSuperAdmin}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none bg-white cursor-pointer ${
                  errors.primaryBeauticianId
                    ? "border-red-500"
                    : "border-gray-300"
                } ${!isSuperAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                  paddingRight: "2.5rem",
                }}
                aria-invalid={!!errors.primaryBeauticianId}
              >
                <option value="">{t("selectBeautician", language)}</option>
                {specialists.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {!isSuperAdmin && !admin?.specialistId && (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  ⚠️ Your admin account is not linked to a specialist. Please
                  contact your administrator to link your account before
                  creating services.
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
                  : t("serviceImageHint", language)
              }
            >
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 file:cursor-pointer"
              />

              {/* Upload Progress Bar */}
              {isUploadingImage && progress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {progress}% uploaded
                  </p>
                </div>
              )}

              {/* Image Preview */}
              {formData.image && !isUploadingImage && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={formData.image.url}
                    alt={formData.image.alt || "Service image"}
                    className="w-48 h-32 object-cover rounded-xl shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      toast(
                        (t) => (
                          <span className="flex items-center gap-3">
                            <span>Remove this image?</span>
                            <button
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  image: null,
                                }));
                                toast.dismiss(t.id);
                                toast.success("Image removed");
                              }}
                            >
                              Remove
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                              onClick={() => toast.dismiss(t.id)}
                            >
                              Cancel
                            </button>
                          </span>
                        ),
                        { duration: 6000 }
                      );
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-lg"
                  >
                    ×
                  </button>
                </div>
              )}
            </FormField>

            {/* Active Status */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => handleChange("active", e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
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
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="priceVaries"
                  checked={formData.priceVaries}
                  onChange={(e) =>
                    handleChange("priceVaries", e.target.checked)
                  }
                  className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
                />
                <label
                  htmlFor="priceVaries"
                  className="text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  Price Varies
                </label>
              </div>
              <p className="text-xs text-gray-600 ml-8">
                Check this if the service price varies (will show "Up to"
                instead of "From")
              </p>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white rounded-2xl shadow-lg py-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-gray-100 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("serviceVariants", language)}
                </h3>
                {errors.variants && (
                  <p className="text-red-500 text-sm mt-1">{errors.variants}</p>
                )}
              </div>
            </div>
            <Button
              type="button"
              onClick={addVariant}
              variant="brand"
              size="sm"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              + {t("addVariant", language)}
            </Button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="p-5 border-2 border-gray-200 rounded-xl space-y-4 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-base">
                    {t("variantName", language)} {index + 1}
                  </h4>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg transition-colors"
                    >
                      {t("remove", language)}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
                      value={variant.durationMin}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "durationMin",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
                      type="text"
                      id={`variant-${index}-price`}
                      inputMode="decimal"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
                      type="text"
                      id={`variant-${index}-promo-price`}
                      inputMode="decimal"
                      value={variant.promoPrice || ""}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "promoPrice",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
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
                      value={variant.bufferBeforeMin}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "bufferBeforeMin",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
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
                      value={variant.bufferAfterMin}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "bufferAfterMin",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      min="0"
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          {errors.variants && (
            <p className="text-red-500 text-sm">{errors.variants}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6">
          <div>
            {isEditMode && onDelete && (
              <Button
                type="button"
                onClick={handleDeleteClick}
                disabled={isSubmitting}
                variant="danger"
                className="w-full sm:w-auto"
              >
                {t("deleteService", language)}
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {t("cancel", language)}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              loading={isSubmitting}
              variant="brand"
              className="w-full sm:w-auto"
            >
              {isEditMode
                ? t("saveService", language)
                : t("createService", language)}
            </Button>
          </div>
        </div>

        {errors.submit && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
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
                <h3 className="text-sm font-bold text-red-900 mb-1">
                  Error saving service
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
        itemType="service"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
