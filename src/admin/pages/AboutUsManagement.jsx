import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import {
  useAboutUsAdmin,
  useUpdateAboutUs,
  useDeleteAboutUsImage,
} from "../../shared/hooks/useAboutUsQueries";

export default function AboutUsManagement() {
  const [formData, setFormData] = useState({
    quote: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  const admin = useSelector(selectAdmin);

  // Check if user is super admin
  const isSuperAdmin = admin?.role === "super_admin";

  // React Query hooks
  const {
    data: aboutUs,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useAboutUsAdmin(isSuperAdmin);

  const updateMutation = useUpdateAboutUs();
  const deleteImageMutation = useDeleteAboutUsImage();

  // Update form data when aboutUs data changes
  useEffect(() => {
    if (aboutUs) {
      setFormData({
        quote: aboutUs.quote || "",
        description: aboutUs.description || "",
      });
      setImagePreview(aboutUs.image?.url || null);
    }
  }, [aboutUs]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      setKeepExistingImage(false);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setKeepExistingImage(false);

    // Reset file input
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quote.trim()) {
      toast.error("Quote is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (!imagePreview && !imageFile) {
      toast.error("Please upload an image or keep the existing one");
      return;
    }

    // Normalize description: ensure proper paragraph separation
    const normalizedDescription = formData.description
      .trim()
      .split(/\n\s*\n/) // Split on any double line breaks
      .map((p) => p.replace(/\s+/g, " ").trim()) // Normalize whitespace within paragraphs
      .filter((p) => p.length > 0)
      .join("\n\n"); // Rejoin with consistent double newlines

    const submitData = new FormData();
    submitData.append("quote", formData.quote.trim());
    submitData.append("description", normalizedDescription);

    if (imageFile) {
      submitData.append("image", imageFile);
    } else if (keepExistingImage && aboutUs?.image) {
      submitData.append("keepExistingImage", "true");
    }

    // Use React Query mutation
    updateMutation.mutate(submitData, {
      onSuccess: (data) => {
        toast.success("About Us content updated successfully!");

        // Reset form state
        setImageFile(null);
        setKeepExistingImage(true);

        // Reset file input
        const fileInput = document.getElementById("image-upload");
        if (fileInput) fileInput.value = "";

        console.log("[ABOUT-US-ADMIN] ✓ About Us content saved successfully");
      },
      onError: (error) => {
        console.error("[ABOUT-US-ADMIN] ✗ Error saving About Us:", error);
        toast.error(error.message || "Failed to save About Us content");
      },
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            Only super administrators can manage the About Us page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <LoadingSpinner />
          <span className="text-gray-600">Loading About Us management...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border border-red-200">
        <div className="text-center">
          <div className="text-red-600 mb-2">Failed to load About Us data</div>
          <p className="text-sm text-gray-600 mb-4">{error?.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Background Refresh Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed top-4 right-4 z-50 bg-brand-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Refreshing data...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-100 rounded-lg">
            <svg
              className="w-6 h-6 text-brand-600"
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
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              About Us Management
            </h1>
            <p className="text-gray-600">
              Manage the About Us page content and imagery
            </p>
          </div>
        </div>

        {aboutUs?.lastUpdatedBy && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p>
              <span className="font-medium">Last updated:</span>{" "}
              {new Date(aboutUs.updatedAt).toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {aboutUs.lastUpdatedBy && (
                <span className="ml-2">
                  by{" "}
                  <span className="font-medium">
                    {aboutUs.lastUpdatedBy.name}
                  </span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6"
      >
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Hero Image *
          </label>

          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative inline-block w-full">
                <img
                  src={imagePreview}
                  alt="About Us preview"
                  className="w-full max-w-full sm:max-w-md h-64 sm:h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 sm:-top-2 sm:-right-2 p-2 sm:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <svg
                    className="w-5 h-5 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={() => document.getElementById("image-upload").click()}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("image-upload").click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-brand-400 transition-colors"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-600 font-medium">
                Click to upload an image
              </p>
              <p className="text-gray-500 text-sm mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Quote */}
        <div>
          <label
            htmlFor="quote"
            className="block text-sm font-semibold text-gray-900 mb-3"
          >
            Inspirational Quote *
          </label>
          <textarea
            id="quote"
            rows={3}
            value={formData.quote}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, quote: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
            placeholder="Enter a powerful quote that represents your brand..."
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-500 text-sm">
              This will appear as a highlighted quote on the About Us page
            </p>
            <span className="text-sm text-gray-500">
              {formData.quote.length}/500
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-900 mb-3"
          >
            About Us Description *
          </label>
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">
              💡 Formatting Tip: Separate paragraphs with blank lines (press
              Enter twice).
            </p>
            <p className="text-xs text-blue-700">
              ✨ You can paste text from AI generators - we'll automatically
              format it correctly!
            </p>
          </div>
          <textarea
            id="description"
            rows={12}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none font-mono"
            placeholder="Tell your story... What makes your salon special? What's your mission and vision?

Press Enter twice between paragraphs for better formatting.

Example:
This is the first paragraph.

This is the second paragraph."
            maxLength={5000}
            style={{ whiteSpace: "pre-wrap" }}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-500 text-sm">
              Share your salon's story, values, and what makes you unique. Use
              blank lines between paragraphs.
            </p>
            <span className="text-sm text-gray-500">
              {formData.description.length}/5000
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData({ quote: "", description: "" });
              removeImage();
            }}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors order-2 sm:order-1"
            disabled={updateMutation.isPending}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={
              updateMutation.isPending ||
              !formData.quote.trim() ||
              !formData.description.trim()
            }
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-lg hover:from-[#2563EB] hover:to-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            {updateMutation.isPending ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Update About Us
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
