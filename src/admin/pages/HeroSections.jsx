import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { HeroSectionsAPI } from "../components/heroSections/heroSections.api";
import Button from "../../shared/components/ui/Button";
import Input from "../../shared/components/ui/Input";
import AdminPageShell, {
  AdminSectionCard,
} from "../components/AdminPageShell";

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
    if (!window.confirm("Are you sure you want to delete this hero section?")) {
      return;
    }

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
      <AdminPageShell
        title={
          editingSection._id ? "Edit Landing Page Hero" : "Create Landing Page Hero"
        }
        description="Manage the hero section content shown on your public landing page."
        maxWidth="md"
        action={
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Back to list
          </Button>
        }
      >
        <AdminSectionCard>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Hero Content</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  value={editingSection.title || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  placeholder="Refined Luxury Awaits"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Subtitle
                </label>
                <textarea
                  rows="4"
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      subtitle: e.target.value,
                    })
                  }
                  placeholder="Where heritage meets artistry..."
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 transition-all duration-200 focus:border-black focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSection.showCta ?? true}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        showCta: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Display CTA Button
                  </span>
                </label>
                <p className="ml-6 mt-1 text-xs text-gray-500">
                  Show a call-to-action button in the hero section.
                </p>
              </div>
              {editingSection.showCta !== false && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">
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

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Hero Background Image
              </h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Background Image
                </label>
                {centerImagePreview && (
                  <img
                    src={centerImagePreview}
                    alt="Center preview"
                    className="mb-3 h-60 w-full max-w-md rounded-xl border border-gray-200 object-cover sm:h-80"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCenterImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recommended: 800x1000px portrait image.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Display Settings
              </h3>
              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSection.active !== false}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <p className="ml-6 mt-1 text-xs text-gray-500">
                  Show this hero section on your landing page.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="h-2 flex-1 cursor-pointer accent-black"
                  />
                  <span className="min-w-12 text-sm text-gray-600">
                    {Math.round((editingSection.overlayOpacity || 0.3) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
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
                    className="h-11 w-20 cursor-pointer rounded-xl border border-gray-300"
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
                    className="w-36"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                variant="brand"
                loading={saving}
                className="w-full sm:order-last sm:w-auto"
              >
                {editingSection._id ? "Update Hero Section" : "Create Hero Section"}
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
                  className="w-full sm:order-first sm:w-auto"
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Landing Page Hero"
      description="Manage the hero section content shown on your public landing page."
      maxWidth="lg"
      action={
        sections.length === 0 ? (
          <Button variant="brand" onClick={handleCreate} className="w-full sm:w-auto">
            Add Hero Section
          </Button>
        ) : null
      }
    >
      {loading ? (
        <AdminSectionCard className="flex items-center justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-b-black" />
        </AdminSectionCard>
      ) : sections.length === 0 ? (
        <AdminSectionCard className="py-12 text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-16 w-16"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No hero sections yet
          </h3>
          <p className="mb-5 text-sm text-gray-600 sm:text-base">
            Create your first hero section and publish it to the landing page.
          </p>
          <Button variant="brand" onClick={handleCreate}>
            Create Hero Section
          </Button>
        </AdminSectionCard>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {sections.map((section) => (
            <AdminSectionCard
              key={section._id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  {section.centerImage?.url ? (
                    <img
                      src={section.centerImage.url}
                      alt="Hero preview"
                      className="h-40 w-full rounded-xl border border-gray-200 object-cover sm:h-52 lg:h-64"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-500 sm:h-52 lg:h-64">
                      No image uploaded
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="mb-4 sm:mb-6">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 sm:text-xl">
                        {section.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          section.active === false
                            ? "bg-gray-100 text-gray-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {section.active === false ? "Inactive" : "Active"}
                      </span>
                    </div>
                    <p className="line-clamp-3 break-words text-sm text-gray-600 sm:text-base">
                      {section.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(section)}
                      className="w-full sm:w-auto"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(section._id)}
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </AdminSectionCard>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
