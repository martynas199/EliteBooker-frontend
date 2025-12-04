import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useImageUpload } from "../shared/hooks/useImageUpload";
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
 * @param {array} props.beauticians - List of beauticians for dropdown
 * @param {function} props.onSave - Callback(serviceData) when form is submitted
 * @param {function} props.onCancel - Callback when user cancels
 * @param {function} props.onDelete - Callback when user deletes (edit mode only)
 * @param {boolean} props.isSuperAdmin - Is user a super admin
 * @param {object} props.admin - Current admin user object
 */
export default function ServiceForm({
  service,
  beauticians,
  onSave,
  onCancel,
  onDelete,
  isSuperAdmin = false,
  admin,
}) {
  const isEditMode = Boolean(service);
  const { language } = useLanguage();
  const {
    uploadImage,
    isUploading: isUploadingImage,
    progress,
  } = useImageUpload();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    primaryBeauticianId: "",
    additionalBeauticianIds: [],
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
    } else if (!isSuperAdmin && admin?.beauticianId) {
      // For non-super admins creating a new service, pre-select their beautician ID
      console.log(
        "Auto-filling beautician for non-super admin:",
        admin.beauticianId
      );
      setFormData((prev) => ({
        ...prev,
        primaryBeauticianId: String(admin.beauticianId),
      }));
    }
  }, [service, isSuperAdmin, admin]);

  // Debug log to check admin object
  useEffect(() => {
    console.log("ServiceForm - Admin object:", admin);
    console.log("ServiceForm - isSuperAdmin:", isSuperAdmin);
    console.log("ServiceForm - Beauticians available:", beauticians.length);
  }, [admin, isSuperAdmin, beauticians]);

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
      newErrors.primaryBeauticianId = "Please select a primary beautician";
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
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode
          ? t("editService", language)
          : t("createNewService", language)}
      </h2>

      {errorCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
              <h3 className="text-sm font-semibold text-red-800">
                {t("pleaseFixErrors", language)} {errorCount}{" "}
                {errorCount !== 1
                  ? t("errors", language)
                  : t("error", language)}
                :
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">
            {t("basicInformation", language)}
          </h3>

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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </FormField>

          {/* Primary Beautician */}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 ${
                errors.primaryBeauticianId
                  ? "border-red-500"
                  : "border-gray-300"
              } ${!isSuperAdmin ? "bg-gray-100 cursor-not-allowed" : ""}`}
              aria-invalid={!!errors.primaryBeauticianId}
            >
              <option value="">{t("selectBeautician", language)}</option>
              {beauticians.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
            {!isSuperAdmin && !admin?.beauticianId && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠️ Your admin account is not linked to a beautician. Please
                contact your administrator to link your account before creating
                services.
              </p>
            )}
            {!isSuperAdmin && admin?.beauticianId && (
              <p className="text-sm text-gray-500 mt-1">
                {t("youCanOnlyCreateForYourself", language)}
              </p>
            )}
          </FormField>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
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
                              setFormData((prev) => ({ ...prev, image: null }));
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => handleChange("active", e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <label htmlFor="active" className="text-sm font-medium">
                {t("activeVisible", language)}
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              {t("activeHint", language)}
            </p>
          </div>

          {/* Price Varies */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="priceVaries"
                checked={formData.priceVaries}
                onChange={(e) => handleChange("priceVaries", e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
              />
              <label htmlFor="priceVaries" className="text-sm font-medium">
                Price Varies
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Check this if the service price varies (will show "Up to" instead
              of "From")
            </p>
          </div>
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-lg font-semibold">
                {t("serviceVariants", language)}
              </h3>
              {errors.variants && (
                <p className="text-red-500 text-sm mt-1">{errors.variants}</p>
              )}
            </div>
            <Button
              type="button"
              onClick={addVariant}
              variant="brand"
              size="sm"
            >
              + {t("addVariant", language)}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-3">
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {t("variantName", language)} {index + 1}
                  </h4>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t("remove", language)}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      className={`w-full px-3 py-2 border rounded-lg ${
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
                      className={`w-full px-3 py-2 border rounded-lg ${
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
                      className={`w-full px-3 py-2 border rounded-lg ${
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
                      className={`w-full px-3 py-2 border rounded-lg ${
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                    />
                  </FormField>

                  <div className="col-span-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        min="0"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.variants && (
            <p className="text-red-500 text-sm">{errors.variants}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t gap-4">
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
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
