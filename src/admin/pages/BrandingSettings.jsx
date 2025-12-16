import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import api from "../../shared/lib/api";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

export default function BrandingSettings() {
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    primaryColor: "#3B82F6",
    secondaryColor: "#2563EB",
    accentColor: "#06B6D4",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",
    heroTitle: "",
    heroSubtitle: "",
  });

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const fetchBrandingSettings = async () => {
    try {
      setLoading(true);

      if (!admin?.tenantId) {
        setError("No tenant ID found. Please log in again.");
        return;
      }

      const response = await api.get(`/tenants/${admin.tenantId}`);
      const data = response.data;
      setTenant(data);

      setFormData({
        primaryColor: data.branding?.colors?.primary || "#3B82F6",
        secondaryColor: data.branding?.colors?.secondary || "#2563EB",
        accentColor: data.branding?.colors?.accent || "#06B6D4",
        logoUrl: data.branding?.logo?.url || "",
        faviconUrl: data.branding?.favicon?.url || "",
        heroImageUrl: data.branding?.heroImages?.[0]?.url || "",
        heroTitle: data.branding?.heroImages?.[0]?.title || "",
        heroSubtitle: data.branding?.heroImages?.[0]?.subtitle || "",
      });
    } catch (err) {
      console.error("Failed to load branding settings:", err);
      setError(err.response?.data?.error || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!admin?.tenantId) {
        setError("No tenant ID found. Please log in again.");
        return;
      }

      // Build hero images array
      const heroImages = [];
      if (formData.heroImageUrl) {
        heroImages.push({
          url: formData.heroImageUrl,
          title: formData.heroTitle || "",
          subtitle: formData.heroSubtitle || "",
          alt: formData.heroTitle || "Hero image",
        });
      }

      await api.put(`/tenants/${admin.tenantId}`, {
        branding: {
          colors: {
            primary: formData.primaryColor,
            secondary: formData.secondaryColor,
            accent: formData.accentColor,
          },
          logo: formData.logoUrl
            ? {
                url: formData.logoUrl,
                alt: tenant?.businessInfo?.name || "Logo",
              }
            : undefined,
          favicon: formData.faviconUrl
            ? {
                url: formData.faviconUrl,
              }
            : undefined,
          heroImages: heroImages.length > 0 ? heroImages : undefined,
        },
      });

      setSuccess(
        "Branding settings saved successfully! Refresh the page to see changes."
      );
      fetchBrandingSettings(); // Refresh data
    } catch (err) {
      console.error("Failed to save branding settings:", err);
      setError(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetToDefaults = () => {
    setFormData({
      primaryColor: "#3B82F6",
      secondaryColor: "#2563EB",
      accentColor: "#06B6D4",
      logoUrl: "",
      faviconUrl: "",
      heroImageUrl: "",
      heroTitle: "",
      heroSubtitle: "",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-gray-600 mt-2">
          Customize your salon's colors, logo, and hero section
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Brand Colors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Brand Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryColor: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                />
              </div>
              <div
                className="mt-3 h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleChange}
                  className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      secondaryColor: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                />
              </div>
              <div
                className="mt-3 h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: formData.secondaryColor }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleChange}
                  className="h-12 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      accentColor: e.target.value,
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                />
              </div>
              <div
                className="mt-3 h-12 rounded-lg border border-gray-200"
                style={{ backgroundColor: formData.accentColor }}
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Reset to default colors
            </button>
          </div>
        </div>

        {/* Logo & Favicon */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Logo & Favicon
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <input
                type="url"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {formData.logoUrl && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="h-16 object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <p
                    className="text-sm text-red-600"
                    style={{ display: "none" }}
                  >
                    Failed to load image. Please check the URL.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Favicon URL
              </label>
              <input
                type="url"
                name="faviconUrl"
                value={formData.faviconUrl}
                onChange={handleChange}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Square image recommended (e.g., 32x32 or 64x64 pixels)
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Image URL
              </label>
              <input
                type="url"
                name="heroImageUrl"
                value={formData.heroImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/hero.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {formData.heroImageUrl && (
                <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero preview"
                    className="w-full h-64 sm:h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <p
                    className="text-sm text-red-600"
                    style={{ display: "none" }}
                  >
                    Failed to load image. Please check the URL.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title
              </label>
              <input
                type="text"
                name="heroTitle"
                value={formData.heroTitle}
                onChange={handleChange}
                placeholder="Welcome to our salon"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Subtitle
              </label>
              <textarea
                name="heroSubtitle"
                value={formData.heroSubtitle}
                onChange={handleChange}
                placeholder="Experience luxury beauty services"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={fetchBrandingSettings}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? "Saving..." : "Save Branding"}
          </button>
        </div>
      </form>
    </div>
  );
}
