import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, AlertCircle, ArrowLeft, Check } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function ConsentInitiatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = useClientAuth();
  const signatureRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);
  const [template, setTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientId, setClientId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    checkboxes: {},
  });

  const [fieldErrors, setFieldErrors] = useState({
    checkboxes: {},
    name: null,
    signature: null,
  });

  const { bookingId, serviceId, serviceName, businessName, tenantId } =
    location.state || {};

  useEffect(() => {
    if (!serviceId) {
      setLoadingError(
        "Missing service information. Please try again from your appointments.",
      );
      setLoading(false);
      return;
    }
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingError(null);
      let resolvedTenantId = tenantId || null;

      // Fetch booking to get client ID
      if (bookingId) {
        const bookingResponse = await api.get(`/client/bookings`);
        const booking = bookingResponse.data.bookings?.find(
          (b) => b._id === bookingId,
        );
        if (booking?.clientId) {
          setClientId(booking.clientId);
        }
        if (booking?.tenantId) {
          resolvedTenantId = booking.tenantId?._id || booking.tenantId;
        }
      }

      await fetchConsentTemplate(resolvedTenantId);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoadingError("Failed to load consent form");
      setLoading(false);
    }
  };

  const fetchConsentTemplate = async (targetTenantId = null) => {
    try {
      setLoading(true);
      setLoadingError(null);

      const url = `/consent-templates/service/${serviceId}`;
      console.log("🔍 Fetching consent template for service:", serviceId);
      console.log("📍 Full URL:", url);

      // Fetch the active consent template for this service
      const params = {};
      if (targetTenantId) {
        params.tenantId = targetTenantId;
      }

      const response = await api.get(url, {
        params,
      });

      console.log("✅ Consent template response:", response.data);
      if (!response.data.data) {
        setLoadingError("No consent form found for this service");
        return;
      }

      setTemplate(response.data.data);

      // Initialize form data for checkboxes
      const checkboxes = {};
      response.data.data.sections?.forEach((section, index) => {
        if (section.type === "checkbox") {
          checkboxes[index] = false;
        }
      });

      setFormData((prev) => ({
        ...prev,
        name: client?.name || "",
        checkboxes,
      }));
    } catch (error) {
      console.error("❌ Error fetching consent template:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error response:", error.response?.data);
      console.error(
        "Request URL was:",
        `/consent-templates/service/${serviceId}`,
      );
      setLoadingError(
        error.response?.data?.message || "Failed to load consent form",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Safety check
      if (!template || !template.sections) {
        setLoadingError("Form data not loaded properly. Please try again.");
        return;
      }

      // Clear previous field errors
      const newFieldErrors = {
        checkboxes: {},
        name: null,
        signature: null,
      };

      let hasErrors = false;

      // Validate all required checkboxes are checked
      template.sections.forEach((section, index) => {
        if (section.type === "checkbox" && section.required) {
          if (!formData.checkboxes[index]) {
            newFieldErrors.checkboxes[index] = "This field is required";
            hasErrors = true;
          }
        }
      });

      if (!formData.name.trim()) {
        newFieldErrors.name = "Please enter your full name";
        hasErrors = true;
      }

      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        newFieldErrors.signature = "Please provide your signature";
        hasErrors = true;
      }

      if (hasErrors) {
        setFieldErrors(newFieldErrors);
        // Scroll to first error
        setTimeout(() => {
          const firstError = document.querySelector(".border-red-500");
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
        return;
      }

      // Clear field errors on successful validation
      setFieldErrors({
        checkboxes: {},
        name: null,
        signature: null,
      });

      const signatureData = signatureRef.current.toDataURL();

      const payload = {
        consentTemplateId: template._id,
        clientId: clientId || client?.id,
        serviceId: serviceId,
        appointmentId: bookingId,
        signedByName: formData.name,
        signatureData,
        formResponses: {
          checkboxes: formData.checkboxes,
          textInputs: formData.textInputs,
        },
      };

      console.log("📤 Submitting consent payload:", payload);

      if (!payload.clientId) {
        setLoadingError("Client ID not found. Please try again.");
        return;
      }

      if (!payload.serviceId) {
        setLoadingError("Service ID not found. Please try again.");
        return;
      }

      await api.post("/consents/sign", payload);

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting consent:", error);
      setLoadingError(
        error.response?.data?.message || "Failed to submit consent form",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const renderWithSeo = (content) => (
    <>
      <SEOHead
        title="Consent Form"
        description="Secure consent form workflow."
        noindex
      />
      {content}
    </>
  );

  if (loading) {
    return renderWithSeo(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>,
    );
  }

  if (success) {
    return renderWithSeo(
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            All Set!
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed">
            Your consent form has been signed and securely saved.
          </p>
          <button
            onClick={() => navigate("/client/appointments")}
            className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Back to Appointments
          </button>
        </div>
      </div>,
    );
  }

  if (loadingError) {
    return renderWithSeo(
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Appointments
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Unable to Load Consent Form
                </h3>
                <p className="text-red-800">{loadingError}</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  className="mt-4"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>,
    );
  }

  return renderWithSeo(
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Main Form Container - looks like a document */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          {/* Form Header */}
          <div className="border-b border-gray-200 px-6 sm:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {template?.name}
            </h1>
            {template?.description && (
              <p className="text-gray-600">{template.description}</p>
            )}
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {/* Render all sections as a continuous form */}
            {template?.sections?.map((section, index) => {
              if (section.type === "header") {
                return (
                  <h2
                    key={index}
                    className="text-xl font-bold text-gray-900 mt-8 mb-4 first:mt-0"
                  >
                    {section.content}
                  </h2>
                );
              }

              if (section.type === "paragraph") {
                return (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                );
              }

              if (section.type === "list") {
                return (
                  <div key={index} className="my-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {section.content}
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      {(section.options || []).map((item, i) => (
                        <li key={i} className="text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (section.type === "declaration") {
                return (
                  <div
                    key={index}
                    className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4"
                  >
                    <p className="text-gray-800 italic font-medium">
                      {section.content}
                    </p>
                  </div>
                );
              }

              if (section.type === "checkbox") {
                const hasError = fieldErrors.checkboxes[index];
                return (
                  <div key={index}>
                    <label className="flex items-start gap-3 py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.checkboxes[index] || false}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            checkboxes: {
                              ...prev.checkboxes,
                              [index]: e.target.checked,
                            },
                          }));
                          // Clear error when user checks the box
                          if (e.target.checked && hasError) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              checkboxes: {
                                ...prev.checkboxes,
                                [index]: null,
                              },
                            }));
                          }
                        }}
                        className={`mt-1 h-5 w-5 text-gray-900 rounded focus:ring-2 focus:ring-gray-500 ${
                          hasError
                            ? "border-red-500 border-2"
                            : "border-gray-300"
                        }`}
                      />
                      <span className="text-gray-700 leading-relaxed">
                        {section.content}
                        {section.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    </label>
                    {hasError && (
                      <p className="text-red-600 text-sm mt-1 ml-8 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {hasError}
                      </p>
                    )}
                  </div>
                );
              }

              if (section.type === "signature") {
                return (
                  <div
                    key={index}
                    className="border-t border-gray-200 pt-6 mt-8"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {section.content}
                      {section.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                            // Clear error when user types
                            if (e.target.value.trim() && fieldErrors.name) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                name: null,
                              }));
                            }
                          }}
                          className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-gray-500 ${
                            fieldErrors.name
                              ? "border-2 border-red-500"
                              : "border border-gray-300 focus:border-gray-500"
                          }`}
                          placeholder="Enter your full name"
                        />
                        {fieldErrors.name && (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Signature <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Clear Signature
                          </button>
                        </div>
                        <div
                          className={`border-2 rounded-lg bg-gray-50 ${
                            fieldErrors.signature
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <SignatureCanvas
                            ref={signatureRef}
                            canvasProps={{
                              className: "w-full h-40",
                            }}
                            onEnd={() => {
                              // Clear error when user signs
                              if (
                                fieldErrors.signature &&
                                signatureRef.current &&
                                !signatureRef.current.isEmpty()
                              ) {
                                setFieldErrors((prev) => ({
                                  ...prev,
                                  signature: null,
                                }));
                              }
                            }}
                          />
                        </div>
                        {fieldErrors.signature ? (
                          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {fieldErrors.signature}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-2">
                            Sign above with your finger or mouse
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Form Footer - Submit Button */}
          <div className="border-t border-gray-200 px-6 sm:px-8 py-6 bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>Submitting...
                </>
              ) : (
                "Submit Consent Form"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
  );
}
