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
  const [rightImageFile, setRightImageFile] = useState(null);
  const [centerImagePreview, setCenterImagePreview] = useState(null);
  const [rightImagePreview, setRightImagePreview] = useState(null);

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
      ctaText: "Shop all",
      ctaLink: "#services",
      active: true,
      order: sections.length,
      tenantId: tenantId,
    });
    setShowForm(true);
    setCenterImageFile(null);
    setRightImageFile(null);
    setCenterImagePreview(null);
    setRightImagePreview(null);
  };

  const handleEdit = (section) => {
    setEditingSection({ ...section });
    setShowForm(true);
    setCenterImageFile(null);
    setRightImageFile(null);
    setCenterImagePreview(section.centerImage?.url || null);
    setRightImagePreview(section.rightImage?.url || null);
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

  const handleRightImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRightImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setRightImagePreview(reader.result);
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

      // Upload images if selected
      if (centerImageFile) {
        await HeroSectionsAPI.uploadCenterImage(
          savedSection._id,
          centerImageFile
        );
      }
      if (rightImageFile) {
        await HeroSectionsAPI.uploadRightImage(
          savedSection._id,
          rightImageFile
        );
      }

      await loadSections();
      setShowForm(false);
      setEditingSection(null);
      setCenterImageFile(null);
      setRightImageFile(null);
      setCenterImagePreview(null);
      setRightImagePreview(null);
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
    setRightImageFile(null);
    setCenterImagePreview(null);
    setRightImagePreview(null);
  };

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {editingSection._id ? "Edit Hero Section" : "Create Hero Section"}
          </h1>
          <p className="text-gray-600">
            Manage the luxury showcase section on the services page
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Left Section - Text Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Left Section - Text Content
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
              </div>
            </div>

            {/* Center Section - Image */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Center Section - Beautician Image
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Center Image
                </label>
                {centerImagePreview && (
                  <div className="mb-3">
                    <img
                      src={centerImagePreview}
                      alt="Center preview"
                      className="w-48 h-60 object-cover rounded-lg border"
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

            {/* Right Section - Image 2 */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Right Section - Image 2
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Right Image
                </label>
                {rightImagePreview && (
                  <div className="mb-3">
                    <img
                      src={rightImagePreview}
                      alt="Right preview"
                      className="w-64 h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRightImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 800x600px landscape image
                </p>
              </div>
            </div>

            {/* Display Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={editingSection.active || false}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active (show on services page)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={editingSection.order || 0}
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-32"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              {editingSection._id && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(editingSection._id)}
                  disabled={saving}
                >
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="brand" loading={saving}>
                {editingSection._id ? "Update" : "Create"}
              </Button>
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
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Hero Sections</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage luxury showcase sections on the services page
          </p>
        </div>
        <Button
          variant="brand"
          onClick={handleCreate}
          className="w-full sm:w-auto"
        >
          + Add Hero Section
        </Button>
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
              className="p-4 sm:p-6 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Preview Images */}
                <div className="flex gap-3 justify-center sm:justify-start">
                  {section.centerImage?.url && (
                    <img
                      src={section.centerImage.url}
                      alt="Center"
                      className="w-20 h-24 sm:w-24 sm:h-32 object-cover rounded-lg border flex-shrink-0"
                    />
                  )}
                  {section.rightImage?.url && (
                    <img
                      src={section.rightImage.url}
                      alt="Right image"
                      className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg border flex-shrink-0"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 break-words">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 break-words">
                        {section.subtitle}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {section.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        Order: {section.order}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-medium">CTA:</span>{" "}
                      {section.ctaText || "No CTA"}
                    </div>
                    <div>
                      <span className="font-medium">Images:</span>{" "}
                      {section.centerImage?.url ? "✓" : "✗"} Center,{" "}
                      {section.rightImage?.url ? "✓" : "✗"} Right
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(section)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(section._id)}
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
