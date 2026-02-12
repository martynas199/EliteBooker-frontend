import { useEffect, useState } from "react";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import toast from "react-hot-toast";
import AdminPageShell from "../components/AdminPageShell";

export default function ProductsHero() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePosition, setImagePosition] = useState("center");
  const [imageZoom, setImageZoom] = useState(100);
  const [savingPosition, setSavingPosition] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings");
      setSettings(response.data);
      setImagePreview(response.data?.productsHeroImage?.url || null);
      setImagePosition(response.data?.productsHeroImage?.position || "center");
      setImageZoom(response.data?.productsHeroImage?.zoom || 100);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await api.post(
        "/settings/upload-products-hero",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSettings(response.data);
      setImageFile(null);
      toast.success("Products hero image uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error(error.response?.data?.error || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setImageFile(null);
    setImagePreview(settings?.productsHeroImage?.url || null);
  };

  const handlePositionChange = async (newPosition) => {
    if (!settings?.productsHeroImage?.url) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setSavingPosition(true);
      const response = await api.patch("/settings/products-hero-position", {
        position: newPosition,
      });

      setSettings(response.data);
      setImagePosition(newPosition);
      toast.success("Image position updated!");
    } catch (error) {
      console.error("Failed to update position:", error);
      toast.error(error.response?.data?.error || "Failed to update position");
    } finally {
      setSavingPosition(false);
    }
  };

  const handleZoomChange = async (newZoom) => {
    if (!settings?.productsHeroImage?.url) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setSavingPosition(true);
      const response = await api.patch("/settings/products-hero-position", {
        zoom: newZoom,
      });

      setSettings(response.data);
      setImageZoom(newZoom);
      toast.success("Image zoom updated!");
    } catch (error) {
      console.error("Failed to update zoom:", error);
      toast.error(error.response?.data?.error || "Failed to update zoom");
    } finally {
      setSavingPosition(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <AdminPageShell
      title="Products Hero Image"
      description="Upload a background image for the Products page hero section. Recommended size: 1920x600px or larger."
      maxWidth="md"
    >

      <Card className="p-6">
        <div className="space-y-6">
          {/* Current Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image Preview
            </label>
            {imagePreview ? (
              <div className="relative">
                <div
                  className="w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden"
                  style={{
                    backgroundImage: `url(${imagePreview})`,
                    backgroundSize: `${imageZoom}%`,
                    backgroundPosition: imagePosition,
                    backgroundRepeat: "no-repeat",
                  }}
                />
                {imageFile && (
                  <button
                    onClick={handleRemovePreview}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                    aria-label="Remove preview"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <p className="mt-2 text-sm text-gray-600">
                    No image uploaded
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Image Position Controls */}
          {imagePreview && !imageFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Image Position
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePositionChange("top")}
                  disabled={savingPosition}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    imagePosition === "top"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-300 hover:border-brand-300 text-gray-700"
                  } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">Top</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePositionChange("center")}
                  disabled={savingPosition}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    imagePosition === "center"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-300 hover:border-brand-300 text-gray-700"
                  } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 8h16M4 16h16"
                      />
                    </svg>
                    <span className="text-sm font-medium">Center</span>
                  </div>
                </button>
                <button
                  onClick={() => handlePositionChange("bottom")}
                  disabled={savingPosition}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    imagePosition === "bottom"
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-300 hover:border-brand-300 text-gray-700"
                  } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <svg
                      className="w-6 h-6 mb-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span className="text-sm font-medium">Bottom</span>
                  </div>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Choose which part of the image to display in the hero section
              </p>
            </div>
          )}

          {/* Image Zoom Controls */}
          {imagePreview && !imageFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Image Zoom - {imageZoom}%
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="80"
                  max="150"
                  step="10"
                  value={imageZoom}
                  onChange={(e) => setImageZoom(Number(e.target.value))}
                  onMouseUp={(e) => handleZoomChange(Number(e.target.value))}
                  onTouchEnd={(e) => handleZoomChange(Number(e.target.value))}
                  disabled={savingPosition}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleZoomChange(80)}
                    disabled={savingPosition}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all ${
                      imageZoom === 80
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-gray-300 hover:border-brand-300 text-gray-700"
                    } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    80%
                  </button>
                  <button
                    onClick={() => handleZoomChange(100)}
                    disabled={savingPosition}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all ${
                      imageZoom === 100
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-gray-300 hover:border-brand-300 text-gray-700"
                    } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    100%
                  </button>
                  <button
                    onClick={() => handleZoomChange(120)}
                    disabled={savingPosition}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all ${
                      imageZoom === 120
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-gray-300 hover:border-brand-300 text-gray-700"
                    } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    120%
                  </button>
                  <button
                    onClick={() => handleZoomChange(150)}
                    disabled={savingPosition}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg transition-all ${
                      imageZoom === 150
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                        : "border-gray-300 hover:border-brand-300 text-gray-700"
                    } ${savingPosition ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    150%
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Adjust the zoom level - lower values show more of the image,
                higher values zoom in
              </p>
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 transition-colors bg-gray-50 hover:bg-gray-100">
                  <svg
                    className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0"
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
                  <span className="text-sm text-gray-600 truncate">
                    {imageFile ? imageFile.name : "Choose an image file"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={!imageFile || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
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
                  Upload Image
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Image Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>
                    Use high-quality images that represent your products well
                  </li>
                  <li>Recommended dimensions: 1920x600px or wider</li>
                  <li>
                    The image will be used as a background with text overlay
                  </li>
                  <li>Ensure good contrast between the image and white text</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AdminPageShell>
  );
}
