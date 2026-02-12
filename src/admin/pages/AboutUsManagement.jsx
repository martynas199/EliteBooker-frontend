import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import toast from "react-hot-toast";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import AdminPageShell, {
  AdminSectionCard,
} from "../components/AdminPageShell";
import {
  useAboutUsAdmin,
  useUpdateAboutUs,
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
      onSuccess: () => {
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
      <AdminPageShell
        title="About Us Page"
        description="Manage the public About Us section and hero content."
        maxWidth="md"
      >
        <AdminSectionCard className="py-12 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            Only super administrators can manage the About Us page.
          </p>
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  if (isLoading) {
    return (
      <AdminPageShell
        title="About Us Page"
        description="Manage the public About Us section and hero content."
        maxWidth="md"
      >
        <AdminSectionCard>
          <div className="flex items-center gap-3">
            <LoadingSpinner />
            <span className="text-gray-600">Loading About Us management...</span>
          </div>
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  if (isError) {
    return (
      <AdminPageShell
        title="About Us Page"
        description="Manage the public About Us section and hero content."
        maxWidth="md"
      >
        <AdminSectionCard className="border-red-200">
          <div className="text-center">
            <div className="mb-2 text-red-600">Failed to load About Us data</div>
            <p className="mb-4 text-sm text-gray-600">{error?.message}</p>
            <Button variant="danger" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="About Us Page"
      description="Manage the content and hero media displayed on your public About Us page."
      maxWidth="md"
      contentClassName="space-y-6"
    >
      {/* Background Refresh Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed right-4 top-4 z-50 rounded-lg bg-gray-900 px-4 py-2 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            <span className="text-sm">Refreshing data...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <AdminSectionCard>
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <svg
              className="h-6 w-6 text-gray-700"
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
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Content Summary
            </h2>
            <p className="text-sm text-gray-600">
              Update the quote, story copy, and hero image used on the public About Us page.
            </p>
          </div>
        </div>

        {aboutUs?.lastUpdatedBy && (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
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
                  by <span className="font-medium">{aboutUs.lastUpdatedBy.name}</span>
                </span>
              )}
            </p>
          </div>
        )}
      </AdminSectionCard>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <AdminSectionCard className="space-y-6">
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
                  className="h-64 w-full max-w-full rounded-xl border border-gray-200 object-cover sm:h-48 sm:max-w-md"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600 sm:-right-2 sm:-top-2 sm:p-1"
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
                className="inline-flex h-10 items-center rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("image-upload").click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-500"
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
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
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
              Formatting tip: separate paragraphs with blank lines.
            </p>
            <p className="text-xs text-blue-700">
              You can paste generated text and the editor will normalize the spacing.
            </p>
          </div>
          <textarea
            id="description"
            rows={12}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 font-mono focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
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
        <div className="flex flex-col justify-end gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:gap-4">
          <Button
            type="button"
            onClick={() => {
              setFormData({ quote: "", description: "" });
              removeImage();
            }}
            variant="outline"
            className="order-2 w-full sm:order-1 sm:w-auto"
            disabled={updateMutation.isPending}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={
              updateMutation.isPending ||
              !formData.quote.trim() ||
              !formData.description.trim()
            }
            loading={updateMutation.isPending}
            className="order-1 w-full sm:order-2 sm:w-auto"
          >
            Update About Us
          </Button>
        </div>
        </AdminSectionCard>
      </form>
    </AdminPageShell>
  );
}
