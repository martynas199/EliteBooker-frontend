import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../shared/lib/apiClient";
import UnsavedChangesModal from "../../shared/components/forms/UnsavedChangesModal";
import toast from "react-hot-toast";

const defaultConsentTemplateForm = {
  name: "",
  description: "",
  sections: [],
  requiredFor: {
    services: [],
    frequency: "until_changed",
  },
  disclaimers: [],
  risks: [],
};

const toSnapshot = (data) => JSON.stringify(data);

const SECTION_TYPES = [
  { value: "header", label: "Header", description: "Large heading text" },
  { value: "paragraph", label: "Paragraph", description: "Body text content" },
  { value: "list", label: "List", description: "Bulleted or numbered list" },
  {
    value: "declaration",
    label: "Declaration",
    description: "Highlighted important statement",
  },
  { value: "checkbox", label: "Checkbox", description: "Checkbox with label" },
  {
    value: "signature",
    label: "Signature",
    description: "Digital signature field",
  },
];

const FREQUENCY_OPTIONS = [
  { value: "first_visit", label: "First Visit Only" },
  { value: "every_visit", label: "Every Visit" },
  { value: "until_changed", label: "Until Changed" },
];

export default function ConsentTemplateBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;
  const prebuiltTemplate = location.state?.template;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [formData, setFormData] = useState(defaultConsentTemplateForm);
  const [savedSnapshot, setSavedSnapshot] = useState(
    toSnapshot(defaultConsentTemplateForm),
  );

  useEffect(() => {
    fetchServices();
    if (isEditing) {
      fetchTemplate();
    } else if (prebuiltTemplate) {
      // Load pre-built template data and filter out invalid sections
      const validSections = (prebuiltTemplate.sections || []).filter(
        (section) => section.type,
      );

      const prebuiltData = {
        name: prebuiltTemplate.name || "",
        description: prebuiltTemplate.description || "",
        sections: validSections,
        requiredFor: {
          services: [],
          frequency: "until_changed",
        },
        disclaimers: prebuiltTemplate.disclaimers || [],
        risks: prebuiltTemplate.risks || [],
      };
      setFormData(prebuiltData);
      setSavedSnapshot(toSnapshot(prebuiltData));
    }
  }, [id]);

  const hasUnsavedChanges = toSnapshot(formData) !== savedSnapshot;

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/consent-templates/${id}`);
      const template = response.data.data;

      // Filter out any sections without a valid type
      const validSections = (template.sections || []).filter(
        (section) => section.type,
      );

      const loadedData = {
        name: template.name,
        description: template.description || "",
        sections: validSections,
        requiredFor: {
          services: template.requiredFor.services.map((s) => s._id || s),
          frequency: template.requiredFor.frequency,
        },
        disclaimers: template.disclaimers || [],
        risks: template.risks || [],
      };
      setFormData(loadedData);
      setSavedSnapshot(toSnapshot(loadedData));

      // Alert user if invalid sections were removed
      if (template.sections.length !== validSections.length) {
        toast(
          `Removed ${
            template.sections.length - validSections.length
          } invalid section(s) that had no type.`,
        );
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
      navigate("/admin/consent-templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Filter out any invalid sections before saving
    const validSections = formData.sections.filter((section) => section.type);

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (validSections.length === 0) {
      toast.error("Please add at least one valid section");
      return;
    }

    // Validate all sections have required fields
    for (let i = 0; i < validSections.length; i++) {
      const section = validSections[i];
      if (!section.content || !section.content.trim()) {
        toast.error(
          `Section ${i + 1} (${
            section.type
          }) is missing content. Please fill it in or remove it.`,
        );
        return;
      }
    }

    const hasSignature = validSections.some((s) => s.type === "signature");
    if (!hasSignature) {
      toast.error("Template must include at least one signature section");
      return;
    }

    try {
      setSaving(true);

      // Save with only valid sections
      const dataToSave = {
        ...formData,
        sections: validSections,
      };

      if (isEditing) {
        await api.put(`/consent-templates/${id}`, dataToSave);
      } else {
        await api.post("/consent-templates", dataToSave);
      }

      setSavedSnapshot(toSnapshot(dataToSave));
      navigate("/admin/consent-templates");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(error.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const removeInvalidSections = () => {
    const validSections = formData.sections.filter((section) => section.type);
    const removedCount = formData.sections.length - validSections.length;

    if (removedCount > 0) {
      setFormData({ ...formData, sections: validSections });
      toast.success(`Removed ${removedCount} invalid section(s)`);
    } else {
      toast("No invalid sections found");
    }
  };

  const addSection = (type) => {
    const newSection = {
      type,
      content: "",
      order: formData.sections.length,
      required: type === "signature",
      options: type === "list" ? [] : null,
    };

    setFormData({
      ...formData,
      sections: [...formData.sections, newSection],
    });
  };

  const updateSection = (index, updates) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], ...updates };
    setFormData({ ...formData, sections: newSections });
  };

  const removeSection = (index) => {
    const newSections = formData.sections.filter((_, i) => i !== index);
    // Reorder
    newSections.forEach((section, i) => {
      section.order = i;
    });
    setFormData({ ...formData, sections: newSections });
  };

  const moveSection = (index, direction) => {
    const newSections = [...formData.sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];

    // Update order
    newSections.forEach((section, i) => {
      section.order = i;
    });

    setFormData({ ...formData, sections: newSections });
  };

  const handleResetChanges = () => {
    setFormData(JSON.parse(savedSnapshot));
    toast.success("Changes reset");
  };

  const handleBackToTemplates = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
      return;
    }
    navigate("/admin/consent-templates");
  };

  const handleDiscardChanges = () => {
    setShowDiscardModal(false);
    navigate("/admin/consent-templates");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto ${
        hasUnsavedChanges ? "pb-24 sm:pb-8" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBackToTemplates}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Templates
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Consent Template" : "Create Consent Template"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Build a custom consent form for your clients
        </p>

        {hasUnsavedChanges && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You have unsaved changes.
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Medical Consent Form"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Brief description of this consent form"
            />
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Requirements
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required For Services
            </label>
            <select
              multiple
              value={formData.requiredFor.services}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value,
                );
                setFormData({
                  ...formData,
                  requiredFor: { ...formData.requiredFor, services: selected },
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              size={5}
            >
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Hold Ctrl/Cmd to select multiple services
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={formData.requiredFor.frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  requiredFor: {
                    ...formData.requiredFor,
                    frequency: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Form Sections
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Build the consent form your clients will see and sign
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formData.sections.some((s) => !s.type) && (
              <button
                onClick={removeInvalidSections}
                className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Remove Invalid Sections
              </button>
            )}
            <div className="relative group">
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                <PlusIcon className="w-4 h-4" />
                Add Section
              </button>

              {/* Dropdown */}
              <div className="hidden group-hover:block absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {SECTION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => addSection(type.value)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {formData.sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-2">
              No sections added yet. Click "Add Section" to get started.
            </p>
            <p className="text-xs">
              Tip: Start with a Header, add Paragraphs for information, and end
              with a Signature
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div
                key={index}
                className="border-2 border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Move buttons */}
                  <div className="flex flex-col gap-1 pt-1">
                    <button
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move up"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(index, "down")}
                      disabled={index === formData.sections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Move down"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section content */}
                  <div className="flex-1">
                    {/* Section header with type and description */}
                    <div className="mb-3 pb-3 border-b-2 border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-3 py-1.5 text-white text-sm font-semibold rounded ${
                            section.type ? "bg-indigo-600" : "bg-red-600"
                          }`}
                        >
                          {SECTION_TYPES.find((t) => t.value === section.type)
                            ?.label || "INVALID TYPE"}
                        </span>
                        {section.required && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                        {section.type === "header" && (
                          <span>
                            📋 <strong>Header:</strong> Large bold heading that
                            divides your form into sections (e.g., "Medical
                            History", "Treatment Consent")
                          </span>
                        )}
                        {section.type === "paragraph" && (
                          <span>
                            📝 <strong>Paragraph:</strong> Regular text for
                            detailed information, instructions, or explanations
                            that clients need to read
                          </span>
                        )}
                        {section.type === "list" && (
                          <span>
                            📌 <strong>List:</strong> Bullet point list for
                            multiple related items (e.g., risks,
                            contraindications, requirements)
                          </span>
                        )}
                        {section.type === "declaration" && (
                          <span>
                            ⚠️ <strong>Declaration:</strong> Important
                            highlighted statement that stands out (e.g., "I
                            understand and accept the risks")
                          </span>
                        )}
                        {section.type === "checkbox" && (
                          <span>
                            ☑️ <strong>Checkbox:</strong> A statement the client
                            must actively agree to by checking a box
                          </span>
                        )}
                        {section.type === "signature" && (
                          <span>
                            ✍️ <strong>Signature:</strong> A field where the
                            client will digitally sign the form
                          </span>
                        )}
                        {!section.type && (
                          <span className="text-red-600">
                            ❌ <strong>ERROR:</strong> This section is missing a
                            type. Please delete it and add a new section.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit Fields */}
                    <div className="bg-white">
                      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                        Edit Content:
                      </div>
                      {section.type === "list" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            List Title
                          </label>
                          <input
                            type="text"
                            value={section.content}
                            onChange={(e) =>
                              updateSection(index, { content: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                            placeholder="e.g., Potential Risks, Contraindications, Important Notes"
                          />
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            List Items (one per line)
                          </label>
                          <textarea
                            value={(section.options || []).join("\n")}
                            onChange={(e) =>
                              updateSection(index, {
                                options: e.target.value
                                  .split("\n")
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              })
                            }
                            onKeyDown={(e) => {
                              // Allow normal Enter key behavior
                              if (e.key === "Enter") {
                                e.stopPropagation();
                              }
                            }}
                            rows={5}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder={
                              "Allergic reactions\nSkin irritation\nTemporary redness\nBruising\nSwelling"
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {section.type === "header"
                              ? "Heading Text"
                              : section.type === "paragraph"
                              ? "Paragraph Content"
                              : section.type === "declaration"
                              ? "Declaration Statement"
                              : section.type === "checkbox"
                              ? "Checkbox Label"
                              : section.type === "signature"
                              ? "Signature Label"
                              : "Content"}
                          </label>
                          <textarea
                            value={section.content}
                            onChange={(e) =>
                              updateSection(index, { content: e.target.value })
                            }
                            rows={
                              section.type === "header"
                                ? 1
                                : section.type === "checkbox"
                                ? 2
                                : 3
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder={
                              section.type === "header"
                                ? "e.g., Medical History Questionnaire, Consent to Treatment"
                                : section.type === "paragraph"
                                ? "Enter detailed information, instructions, or explanations for the client to read..."
                                : section.type === "declaration"
                                ? "e.g., I understand the nature of the treatment and give my informed consent"
                                : section.type === "checkbox"
                                ? "e.g., I confirm that I have disclosed all relevant medical conditions"
                                : section.type === "signature"
                                ? "e.g., Client Signature, Parent/Guardian Signature"
                                : "Enter content"
                            }
                          />
                        </>
                      )}

                      {section.type === "checkbox" && (
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={section.required}
                            onChange={(e) =>
                              updateSection(index, {
                                required: e.target.checked,
                              })
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            Required
                          </span>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeSection(index)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium"
        >
          {showPreview ? "Hide Preview" : "Preview Form"}
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleResetChanges}
            disabled={!hasUnsavedChanges || saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleBackToTemplates}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-5 h-5" />
                {isEditing ? "Update Template" : "Create Template"}
              </>
            )}
          </button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleResetChanges}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Full Form Preview */}
      {showPreview && (
        <div className="mt-6 bg-white rounded-lg shadow-lg border-2 border-indigo-600 p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Client Preview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                This is how clients will see the consent form
              </p>
            </div>
          </div>

          {/* Template Name as Form Title */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {formData.name || "Untitled Consent Form"}
            </h1>
            {formData.description && (
              <p className="text-gray-600">{formData.description}</p>
            )}
          </div>

          {/* Render all sections as client would see them */}
          <div className="space-y-6">
            {formData.sections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No sections added yet. Add sections to see the preview.</p>
              </div>
            ) : (
              formData.sections.map((section, index) => (
                <div key={index} className="space-y-2">
                  {!section.type && (
                    <div className="bg-red-50 border-2 border-red-600 p-4 rounded">
                      <p className="text-red-800 font-semibold">
                        ❌ Invalid Section (No Type)
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        This section has no type assigned. Please delete it from
                        the form builder.
                      </p>
                    </div>
                  )}
                  {section.type === "header" && (
                    <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">
                      {section.content ||
                        "[Empty Header - Add text in the form builder]"}
                    </h2>
                  )}
                  {section.type === "paragraph" && (
                    <p className="text-gray-700 leading-relaxed">
                      {section.content ||
                        "[Empty Paragraph - Add text in the form builder]"}
                    </p>
                  )}
                  {section.type === "list" && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {section.content || "[List Title]"}
                      </h3>
                      {(section.options || []).length > 0 ? (
                        <ul className="list-disc list-inside space-y-1 pl-4">
                          {section.options.map((item, i) => (
                            <li key={i} className="text-gray-700">
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic pl-4">
                          No list items added yet
                        </p>
                      )}
                    </div>
                  )}
                  {section.type === "declaration" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                      <p className="text-gray-800 italic font-medium">
                        {section.content ||
                          "[Empty Declaration - Add text in the form builder]"}
                      </p>
                    </div>
                  )}
                  {section.type === "checkbox" && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        disabled
                      />
                      <label className="text-gray-800">
                        {section.content ||
                          "[Empty Checkbox - Add text in the form builder]"}
                        {section.required && (
                          <span className="text-red-600 ml-1">*</span>
                        )}
                      </label>
                    </div>
                  )}
                  {section.type === "signature" && (
                    <div className="p-4 bg-gray-50 rounded">
                      <label className="block text-gray-800 font-medium mb-2">
                        {section.content || "Signature"}
                        {section.required && (
                          <span className="text-red-600 ml-1">*</span>
                        )}
                      </label>
                      <div className="border-b-2 border-gray-400 w-full max-w-md h-16 bg-white"></div>
                      <p className="text-xs text-gray-500 mt-2">Sign above</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Close Preview Button */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => setShowPreview(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      <UnsavedChangesModal
        isOpen={showDiscardModal}
        onStay={() => setShowDiscardModal(false)}
        onDiscard={handleDiscardChanges}
        message="You have unsaved changes. If you leave now, your template edits will be lost."
      />
    </div>
  );
}
