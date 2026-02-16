import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../shared/lib/apiClient";
import EmptyStateCard from "../../shared/components/ui/EmptyStateCard";
import TabNav from "../../shared/components/ui/TabNav";
import toast from "react-hot-toast";
import { confirmDialog } from "../../shared/lib/confirmDialog";

export default function ConsentTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [statusFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await api.get("/consent-templates", { params });
      setTemplates(response.data.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (templateId) => {
    const confirmed = await confirmDialog({
      title: "Publish template?",
      message:
        "Are you sure you want to publish this template? Published templates cannot be edited.",
      confirmLabel: "Publish",
      cancelLabel: "Cancel",
      variant: "primary",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.post(`/consent-templates/${templateId}/publish`);
      fetchTemplates();
    } catch (error) {
      console.error("Error publishing template:", error);
      toast.error(
        error.response?.data?.message || "Failed to publish template",
      );
    }
  };

  const handleArchive = async (templateId) => {
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
      await api.post(`/consent-templates/${templateId}/archive`);
      fetchTemplates();
    } catch (error) {
      console.error("Error archiving template:", error);
      toast.error(
        error.response?.data?.message || "Failed to archive template",
      );
    }
  };

  const handleDelete = async (templateId) => {
    const confirmed = await confirmDialog({
      title: "Delete template?",
      message:
        "Are you sure you want to delete this template? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/consent-templates/${templateId}`);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error(error.response?.data?.message || "Failed to delete template");
    }
  };

  const handleNewVersion = async (templateId) => {
    try {
      const response = await api.post(
        `/consent-templates/${templateId}/new-version`,
      );
      navigate(`/admin/consent-templates/${response.data.data._id}/edit`);
    } catch (error) {
      console.error("Error creating new version:", error);
      toast.error(
        error.response?.data?.message || "Failed to create new version",
      );
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: ClockIcon,
        text: "Draft",
      },
      published: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircleIcon,
        text: "Published",
      },
      archived: {
        color: "bg-red-100 text-red-800",
        icon: ArchiveBoxIcon,
        text: "Archived",
      },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const filteredTemplates = templates;
  const statusTabs = [
    { key: "all", label: "All Templates" },
    { key: "draft", label: "Drafts" },
    { key: "published", label: "Published" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Consent Forms
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage consent form templates for your services
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Start from Template</span>
            </button>
            <button
              onClick={() => navigate("/admin/consent-templates/new")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create from Scratch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <TabNav
          tabs={statusTabs}
          activeKey={statusFilter}
          onChange={setStatusFilter}
          accent="indigo"
          showCounts={false}
        />
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <EmptyStateCard
          title="No templates found"
          description="Get started by creating your first consent form template."
          icon={<DocumentTextIcon className="h-8 w-8 text-gray-500" />}
          primaryAction={{
            label: "Create Template",
            onClick: () => navigate("/admin/consent-templates/new"),
            icon: <PlusIcon className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      {template.version > 1 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          v{template.version}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                </div>

                {/* Description */}
                {template.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div>
                    <span className="font-medium">
                      {template.sections?.length || 0}
                    </span>{" "}
                    sections
                  </div>
                  {template.requiredFor?.services?.length > 0 && (
                    <div>
                      <span className="font-medium">
                        {template.requiredFor.services.length}
                      </span>{" "}
                      services
                    </div>
                  )}
                </div>

                {/* Frequency */}
                {template.requiredFor?.frequency && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-600">
                      Required:{" "}
                      {template.requiredFor.frequency.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                  {template.status === "draft" && (
                    <>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/consent-templates/${template._id}/edit`,
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handlePublish(template._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Publish
                      </button>
                      <button
                        onClick={() => handleDelete(template._id)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {template.status === "published" && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/admin/consent-templates/${template._id}`)
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleNewVersion(template._id)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-lg hover:bg-indigo-50"
                      >
                        New Version
                      </button>
                      <button
                        onClick={() => handleArchive(template._id)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {template.status === "archived" && (
                    <button
                      onClick={() =>
                        navigate(`/admin/consent-templates/${template._id}`)
                      }
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-built Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowTemplateModal(false)}
            ></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Choose a Template to Start With
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a pre-built template and customize it for your needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {/* Massage Therapy Template */}
                <button
                  onClick={() => {
                    navigate("/admin/consent-templates/new", {
                      state: {
                        template: {
                          name: "Massage Therapy Consent",
                          description:
                            "Standard consent form for massage therapy services",
                          sections: [
                            {
                              type: "header",
                              content: "Massage Therapy Consent Form",
                              order: 0,
                              required: false,
                            },
                            {
                              type: "paragraph",
                              content:
                                "Massage therapy is not a substitute for medical care or treatment. Please inform your therapist of any medical conditions, injuries, or medications you are currently taking. You may experience temporary soreness after deep tissue work.",
                              order: 1,
                              required: false,
                            },
                            {
                              type: "list",
                              content: "Potential Risks and Side Effects",
                              order: 2,
                              required: false,
                              options: [
                                "Temporary muscle soreness",
                                "Minor bruising in some cases",
                                "Rare allergic reactions to oils or lotions",
                                "Temporary redness at treatment sites",
                              ],
                            },
                            {
                              type: "declaration",
                              content:
                                "I understand that massage therapy is provided for stress reduction, relaxation, and relief of muscular tension. If I experience any pain or discomfort during the session, I will immediately inform my therapist.",
                              order: 3,
                              required: false,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I consent to receive massage therapy and understand the benefits and risks involved",
                              order: 4,
                              required: true,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I have disclosed all relevant medical conditions, injuries, and medications to my therapist",
                              order: 5,
                              required: true,
                            },
                            {
                              type: "signature",
                              content: "Client Signature",
                              order: 6,
                              required: true,
                            },
                          ],
                        },
                      },
                    });
                    setShowTemplateModal(false);
                  }}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <DocumentTextIcon className="w-8 h-8 text-indigo-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Massage Therapy
                  </h4>
                  <p className="text-sm text-gray-600">
                    Standard consent for massage services with medical
                    disclosure
                  </p>
                </button>

                {/* Prenatal/Pregnancy Template */}
                <button
                  onClick={() => {
                    navigate("/admin/consent-templates/new", {
                      state: {
                        template: {
                          name: "Prenatal Treatment Consent",
                          description:
                            "Specialized consent form for pregnancy-related treatments",
                          sections: [
                            {
                              type: "header",
                              content: "Prenatal Treatment Consent Form",
                              order: 0,
                              required: false,
                            },
                            {
                              type: "paragraph",
                              content:
                                "Specialized training is required for prenatal treatments. Please consult with your healthcare provider before booking. Certain treatments may not be suitable during pregnancy, especially in the first trimester.",
                              order: 1,
                              required: false,
                            },
                            {
                              type: "list",
                              content: "Important Considerations",
                              order: 2,
                              required: false,
                              options: [
                                "Contraindicated in high-risk pregnancies",
                                "May cause temporary discomfort",
                                "Not recommended in first trimester without doctor approval",
                                "Requires healthcare provider clearance",
                              ],
                            },
                            {
                              type: "header",
                              content: "Pregnancy Information",
                              order: 3,
                              required: false,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I confirm that I am currently pregnant and have disclosed my due date and any pregnancy complications",
                              order: 4,
                              required: true,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I have received approval from my healthcare provider to receive this treatment during pregnancy",
                              order: 5,
                              required: true,
                            },
                            {
                              type: "declaration",
                              content:
                                "I understand the risks and benefits of prenatal treatment and consent to receive this service. I will inform my therapist immediately if I experience any discomfort.",
                              order: 6,
                              required: false,
                            },
                            {
                              type: "signature",
                              content: "Client Signature",
                              order: 7,
                              required: true,
                            },
                          ],
                        },
                      },
                    });
                    setShowTemplateModal(false);
                  }}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <DocumentTextIcon className="w-8 h-8 text-pink-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Prenatal Treatment
                  </h4>
                  <p className="text-sm text-gray-600">
                    Specialized consent for pregnancy-related services
                  </p>
                </button>

                {/* Beauty/Spa Services Template */}
                <button
                  onClick={() => {
                    navigate("/admin/consent-templates/new", {
                      state: {
                        template: {
                          name: "Beauty & Spa Services Consent",
                          description:
                            "General consent for facials, waxing, and spa treatments",
                          sections: [
                            {
                              type: "header",
                              content: "Beauty & Spa Services Consent",
                              order: 0,
                              required: false,
                            },
                            {
                              type: "paragraph",
                              content:
                                "Results may vary depending on your skin type and condition. Please inform us of any allergies, sensitivities, or skin conditions before your treatment. Avoid sun exposure after certain treatments as advised by your aesthetician.",
                              order: 1,
                              required: false,
                            },
                            {
                              type: "list",
                              content: "Possible Side Effects",
                              order: 2,
                              required: false,
                              options: [
                                "Temporary redness or irritation",
                                "Allergic reactions to products",
                                "Skin sensitivity following treatment",
                                "Minor swelling or tenderness",
                              ],
                            },
                            {
                              type: "header",
                              content: "Skin & Allergy Information",
                              order: 3,
                              required: false,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I have disclosed any skin conditions, allergies, sensitivities, or medications I am currently taking",
                              order: 4,
                              required: true,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I consent to receive the selected beauty or spa treatment and understand the potential risks and benefits",
                              order: 5,
                              required: true,
                            },
                            {
                              type: "signature",
                              content: "Client Signature",
                              order: 6,
                              required: true,
                            },
                          ],
                        },
                      },
                    });
                    setShowTemplateModal(false);
                  }}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Beauty & Spa Services
                  </h4>
                  <p className="text-sm text-gray-600">
                    General consent for facials, waxing, and spa treatments
                  </p>
                </button>

                {/* Fitness/Personal Training Template */}
                <button
                  onClick={() => {
                    navigate("/admin/consent-templates/new", {
                      state: {
                        template: {
                          name: "Fitness Training Consent & Waiver",
                          description:
                            "Consent and liability waiver for fitness and personal training sessions",
                          sections: [
                            {
                              type: "header",
                              content:
                                "Fitness Training Consent & Liability Waiver",
                              order: 0,
                              required: false,
                            },
                            {
                              type: "paragraph",
                              content:
                                "Physical exercise involves inherent risks. You should consult your physician before beginning any fitness program. Stop immediately if you experience pain, discomfort, dizziness, or shortness of breath.",
                              order: 1,
                              required: false,
                            },
                            {
                              type: "list",
                              content: "Potential Risks",
                              order: 2,
                              required: false,
                              options: [
                                "Muscle strain or injury",
                                "Cardiovascular complications (if pre-existing conditions)",
                                "Dehydration or fatigue",
                                "Joint or ligament injury",
                              ],
                            },
                            {
                              type: "header",
                              content: "Health & Fitness Declaration",
                              order: 3,
                              required: false,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I confirm that I am in good health and physically able to participate in exercise and fitness activities",
                              order: 4,
                              required: true,
                            },
                            {
                              type: "checkbox",
                              content:
                                "I have disclosed any medical conditions, injuries, or physical limitations that may affect my ability to exercise safely",
                              order: 5,
                              required: true,
                            },
                            {
                              type: "declaration",
                              content:
                                "I understand the risks of physical exercise and assume full responsibility for my participation. I release the trainer and facility from any liability for injuries that may occur during training.",
                              order: 6,
                              required: false,
                            },
                            {
                              type: "signature",
                              content: "Client Signature",
                              order: 7,
                              required: true,
                            },
                          ],
                        },
                      },
                    });
                    setShowTemplateModal(false);
                  }}
                  className="text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <DocumentTextIcon className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Fitness & Training
                  </h4>
                  <p className="text-sm text-gray-600">
                    Consent and waiver for fitness and personal training
                  </p>
                </button>
              </div>

              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
