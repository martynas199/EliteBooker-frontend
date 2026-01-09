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
  { value: "first_visit_only", label: "First Visit Only" },
  { value: "every_visit", label: "Every Visit" },
  { value: "annually", label: "Annually" },
  { value: "bi_annually", label: "Every 6 Months" },
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sections: [],
    requiredFor: {
      services: [],
      frequency: "first_visit_only",
    },
    disclaimers: [],
    risks: [],
  });

  useEffect(() => {
    fetchServices();
    if (isEditing) {
      fetchTemplate();
    } else if (prebuiltTemplate) {
      // Load pre-built template data
      setFormData({
        name: prebuiltTemplate.name || "",
        description: prebuiltTemplate.description || "",
        sections: prebuiltTemplate.sections || [],
        requiredFor: {
          services: [],
          frequency: "first_visit_only",
        },
        disclaimers: prebuiltTemplate.disclaimers || [],
        risks: prebuiltTemplate.risks || [],
      });
    }
  }, [id]);

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

      setFormData({
        name: template.name,
        description: template.description || "",
        sections: template.sections,
        requiredFor: {
          services: template.requiredFor.services.map((s) => s._id || s),
          frequency: template.requiredFor.frequency,
        },
        disclaimers: template.disclaimers || [],
        risks: template.risks || [],
      });
    } catch (error) {
      console.error("Error fetching template:", error);
      alert("Failed to load template");
      navigate("/admin/consent-templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      alert("Please enter a template name");
      return;
    }

    if (formData.sections.length === 0) {
      alert("Please add at least one section");
      return;
    }

    const hasSignature = formData.sections.some((s) => s.type === "signature");
    if (!hasSignature) {
      alert("Template must include at least one signature section");
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await api.put(`/consent-templates/${id}`, formData);
      } else {
        await api.post("/consent-templates", formData);
      }

      navigate("/admin/consent-templates");
    } catch (error) {
      console.error("Error saving template:", error);
      alert(error.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/consent-templates")}
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
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                  (option) => option.value
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Form Sections</h2>
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

        {formData.sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No sections added yet. Click "Add Section" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.sections.map((section, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Move buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(index, "down")}
                      disabled={index === formData.sections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded">
                        {
                          SECTION_TYPES.find((t) => t.value === section.type)
                            ?.label
                        }
                      </span>
                      {section.required && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                          Required
                        </span>
                      )}
                    </div>

                    {section.type === "list" ? (
                      <div>
                        <input
                          type="text"
                          value={section.content}
                          onChange={(e) =>
                            updateSection(index, { content: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                          placeholder="List title"
                        />
                        <textarea
                          value={(section.options || []).join("\n")}
                          onChange={(e) =>
                            updateSection(index, {
                              options: e.target.value
                                .split("\n")
                                .filter(Boolean),
                            })
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter list items (one per line)"
                        />
                      </div>
                    ) : (
                      <textarea
                        value={section.content}
                        onChange={(e) =>
                          updateSection(index, { content: e.target.value })
                        }
                        rows={section.type === "header" ? 1 : 3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder={`Enter ${section.type} content`}
                      />
                    )}

                    {section.type === "checkbox" && (
                      <label className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          checked={section.required}
                          onChange={(e) =>
                            updateSection(index, { required: e.target.checked })
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    )}
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
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={() => navigate("/admin/consent-templates")}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
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
  );
}
