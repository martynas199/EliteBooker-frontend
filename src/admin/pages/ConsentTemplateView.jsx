import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../shared/lib/apiClient";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import toast from "react-hot-toast";
import { confirmDialog } from "../../shared/lib/confirmDialog";

export default function ConsentTemplateView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/consent-templates/${id}`);
      setTemplate(response.data.data);
    } catch (error) {
      console.error("Error fetching template:", error);
      setError(error.response?.data?.message || "Failed to load template");
    } finally {
      setLoading(false);
    }
  };

  const handleNewVersion = async () => {
    try {
      const response = await api.post(`/consent-templates/${id}/new-version`);
      navigate(`/admin/consent-templates/${response.data.data._id}/edit`);
    } catch (error) {
      console.error("Error creating new version:", error);
      toast.error("Failed to create new version");
    }
  };

  const handleArchive = async () => {
    const confirmed = await confirmDialog({
      title: "Archive template?",
      message: "Are you sure you want to archive this template?",
      confirmLabel: "Archive",
      cancelLabel: "Cancel",
      variant: "primary",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.post(`/consent-templates/${id}/archive`);
      toast.success("Template archived successfully");
      navigate("/admin/consent-templates");
    } catch (error) {
      console.error("Error archiving template:", error);
      toast.error("Failed to archive template");
    }
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      first_visit: "First Visit Only",
      first_visit_only: "First Visit Only",
      every_visit: "Every Visit",
      annually: "Annually",
      bi_annually: "Every 6 Months",
      until_changed: "Until Changed",
    };
    return labels[frequency] || frequency;
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800 border-gray-300",
      published: "bg-green-100 text-green-800 border-green-300",
      archived: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-lg border ${
          styles[status] || styles.draft
        }`}
      >
        {status === "published" && <CheckCircleIcon className="w-4 h-4" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Template not found"}</p>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/consent-templates")}
            className="mt-4"
          >
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/consent-templates")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Templates
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {template.name}
              </h1>
              {getStatusBadge(template.status)}
            </div>
            {template.description && (
              <p className="text-gray-600">{template.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Version {template.version}</span>
              {template.publishedAt && (
                <span>
                  Published{" "}
                  {new Date(template.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {template.status === "draft" && (
              <Button
                variant="primary"
                onClick={() =>
                  navigate(`/admin/consent-templates/${template._id}/edit`)
                }
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}

            {template.status === "published" && (
              <>
                <Button variant="secondary" onClick={handleNewVersion}>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  New Version
                </Button>
                <Button variant="secondary" onClick={handleArchive}>
                  <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Template Details */}
      <div className="space-y-6">
        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required For Services
              </label>
              {template.requiredFor.services.length > 0 ? (
                <div className="space-y-2">
                  {template.requiredFor.services.map((service) => (
                    <div
                      key={service._id}
                      className="px-3 py-2 bg-gray-50 rounded-lg text-sm"
                    >
                      {service.name}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No services selected</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg">
                {getFrequencyLabel(template.requiredFor.frequency)}
              </div>

              {template.validityPeriodDays && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Period
                  </label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    {template.validityPeriodDays} days
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        {template.disclaimers && template.disclaimers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Disclaimers
            </h2>
            <ul className="space-y-2">
              {template.disclaimers.map((disclaimer, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-gray-700 text-sm leading-relaxed"
                >
                  <span className="text-blue-500 flex-shrink-0">•</span>
                  <span>{disclaimer}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {template.risks && template.risks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-amber-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Potential Risks
            </h2>
            <ul className="space-y-2">
              {template.risks.map((risk, index) => (
                <li
                  key={index}
                  className="flex gap-3 text-gray-700 text-sm leading-relaxed"
                >
                  <span className="text-amber-500 flex-shrink-0">⚠</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Form Sections
          </h2>

          <div className="space-y-4">
            {template.sections && template.sections.length > 0 ? (
              template.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                          {section.type}
                        </span>
                        {section.required && (
                          <span className="px-2 py-1 bg-red-100 rounded text-xs font-medium text-red-700">
                            Required
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Order: {section.order}
                      </span>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No sections defined</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
