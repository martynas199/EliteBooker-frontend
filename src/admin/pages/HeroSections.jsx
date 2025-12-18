import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { HeroSectionsAPI } from "../components/heroSections/heroSections.api";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import Input from "../../shared/components/ui/Input";

export default function HeroSections() {
  const admin = useSelector(selectAdmin);
  const tenantId = admin?.tenantId;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [centerImageFile, setCenterImageFile] = useState(null);
  const [centerImagePreview, setCenterImagePreview] = useState(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await HeroSectionsAPI.list();
      setSections(data);
    } catch (error) {
      console.error("Failed to load hero sections:", error);
      alert("Failed to load hero sections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSection({
      title: "Refined Luxury Awaits",
      subtitle:
        "Where heritage meets artistry, our hair extensions, beauty products and services embodies the essence of timeless elegance.",
      showCta: true,
      ctaText: "Shop all",
      ctaLink: "#services",
      order: sections.length,
      overlayOpacity: 0.3,
      overlayColor: "#000000",
      tenantId: tenantId,
    });
    setShowForm(true);
    setCenterImageFile(null);
    setCenterImagePreview(null);
  };

  const handleEdit = (section) => {
    setEditingSection({ ...section });
    setShowForm(true);
    setCenterImageFile(null);
    setCenterImagePreview(section.centerImage?.url || null);
  };

  const handleCenterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCenterImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCenterImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Create or update section
      let savedSection;
      if (editingSection._id) {
        savedSection = await HeroSectionsAPI.update(
          editingSection._id,
          editingSection
        );
      } else {
        savedSection = await HeroSectionsAPI.create(editingSection);
      }

      // Upload image if selected
      if (centerImageFile) {
        await HeroSectionsAPI.uploadCenterImage(
          savedSection._id,
          centerImageFile
        );
      }

      await loadSections();
      setShowForm(false);
      setEditingSection(null);
      setCenterImageFile(null);
      setCenterImagePreview(null);
    } catch (error) {
      console.error("Failed to save hero section:", error);
      alert("Failed to save hero section: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this hero section?")) return;

    try {
      await HeroSectionsAPI.delete(id);
      await loadSections();
      if (editingSection?._id === id) {
        setShowForm(false);
        setEditingSection(null);
      }
    } catch (error) {
      console.error("Failed to delete hero section:", error);
      alert("Failed to delete hero section: " + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSection(null);
    setCenterImageFile(null);
    setCenterImagePreview(null);
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {editingSection._id
              ? "Edit Landing Page Hero"
              : "Create Landing Page Hero"}
          </h1>
          <p className="text-gray-600">
            Manage the hero section content on your landing page
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Hero Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Hero Content
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <Input
                    value={editingSection.title || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        title: e.target.value,
                      })
                    }
                    placeholder="Refined Luxury Awaits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    rows="3"
                    value={editingSection.subtitle || ""}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        subtitle: e.target.value,
                      })
                    }
                    placeholder="Where heritage meets artistry..."
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSection.showCta ?? true}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          showCta: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Display CTA Button
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Show a call-to-action button in the hero section
                  </p>
                </div>

                {editingSection.showCta !== false && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Button Text
                      </label>
                      <Input
                        value={editingSection.ctaText || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            ctaText: e.target.value,
                          })
                        }
                        placeholder="Shop all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CTA Link
                      </label>
                      <Input
                        value={editingSection.ctaLink || ""}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            ctaLink: e.target.value,
                          })
                        }
                        placeholder="#services"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Background Image */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Hero Background Image
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                {centerImagePreview && (
                  <div className="mb-3">
                    <img
                      src={centerImagePreview}
                      alt="Center preview"
                      className="w-full max-w-md h-60 sm:h-80 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCenterImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 800x1000px portrait image
                </p>
              </div>
            </div>

            {/* Display Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSection.active !== false}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Show this hero section on your landing page
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Opacity
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={editingSection.overlayOpacity || 0.3}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          overlayOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 min-w-12">
                      {Math.round((editingSection.overlayOpacity || 0.3) * 100)}
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Controls the darkness of the overlay on the hero image
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingSection.overlayColor || "#000000"}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          overlayColor: e.target.value,
                        })
                      }
                      className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={editingSection.overlayColor || "#000000"}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          overlayColor: e.target.value,
                        })
                      }
                      className="w-32"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the color of the overlay (default: black)
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t sm:justify-end">
              <Button
                type="submit"
                variant="brand"
                loading={saving}
                className="w-full sm:w-auto sm:order-last"
              >
                {editingSection._id ? "Update" : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              {editingSection._id && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(editingSection._id)}
                  disabled={saving}
                  className="w-full sm:w-auto sm:order-first"
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            Landing Page Hero
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage the hero section content on your landing page
          </p>
        </div>
        {sections.length === 0 && (
          <Button
            variant="brand"
            onClick={handleCreate}
            className="w-full sm:w-auto"
          >
            + Add Hero Section
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      ) : sections.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hero sections yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first luxury showcase section
          </p>
          <Button variant="brand" onClick={handleCreate}>
            Create Hero Section
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {sections.map((section) => (
            <Card
              key={section._id}
              className="p-4 sm:p-8 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                {/* Preview Images */}
                <div className="flex gap-3 sm:gap-4 justify-start flex-wrap sm:flex-col sm:flex-shrink-0">
                  {section.centerImage?.url && (
                    <img
                      src={section.centerImage.url}
                      alt="Center"
                      className="w-full sm:w-48 h-32 sm:h-64 object-cover rounded-lg border shadow-sm"
                    />
                  )}
                  {section.rightImage?.url && (
                    <img
                      src={section.rightImage.url}
                      alt="Right image"
                      className="w-full sm:w-48 h-24 sm:h-40 object-cover rounded-lg border shadow-sm"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-2xl font-bold text-gray-900 break-words">
                        {section.title}
                      </h3>
                      {section.active !== false && (
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium bg-green-100 text-green-800 flex-shrink-0">
                          Active
                        </span>
                      )}
                      {section.active === false && (
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 flex-shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 line-clamp-2 break-words">
                      {section.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(section)}
                      className="w-full sm:w-auto sm:px-6"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(section._id)}
                      className="w-full sm:w-auto sm:px-6"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
