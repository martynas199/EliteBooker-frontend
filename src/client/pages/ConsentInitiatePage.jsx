import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, AlertCircle, ArrowLeft, Check } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";

export default function ConsentInitiatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { client } = useClientAuth();
  const signatureRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [template, setTemplate] = useState(null);
  const [step, setStep] = useState(1); // 1: Review, 2: Sign
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientId, setClientId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    checkboxes: {},
    textInputs: {},
  });

  const { bookingId, serviceId, serviceName, businessName } =
    location.state || {};

  useEffect(() => {
    if (!serviceId) {
      setError(
        "Missing service information. Please try again from your appointments."
      );
      setLoading(false);
      return;
    }
    fetchData();
  }, [serviceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking to get client ID
      if (bookingId) {
        const bookingResponse = await api.get(`/client/bookings`);
        const booking = bookingResponse.data.bookings?.find(
          (b) => b._id === bookingId
        );
        if (booking?.clientId) {
          setClientId(booking.clientId);
        }
      }

      await fetchConsentTemplate();
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load consent form");
      setLoading(false);
    }
  };

  const fetchConsentTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/consent-templates/service/${serviceId}`;
      console.log("🔍 Fetching consent template for service:", serviceId);
      console.log("📍 Full URL:", url);

      // Fetch the active consent template for this service
      const response = await api.get(url);

      console.log("✅ Consent template response:", response.data);

      if (!response.data.data) {
        setError("No consent template found for this service.");
        return;
      }

      setTemplate(response.data.data);

      // Initialize form data
      const checkboxes = {};
      const textInputs = {};
      response.data.data.sections?.forEach((section, sectionIndex) => {
        section.fields?.forEach((field, fieldIndex) => {
          const key = `${sectionIndex}-${fieldIndex}`;
          if (field.type === "checkbox") {
            checkboxes[key] = false;
          } else if (field.type === "text" || field.type === "textarea") {
            textInputs[key] = "";
          }
        });
      });
      setFormData((prev) => ({
        ...prev,
        name: client?.name || "",
        checkboxes,
        textInputs,
      }));
    } catch (error) {
      console.error("❌ Error fetching consent template:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error response:", error.response?.data);
      console.error(
        "Request URL was:",
        `/consent-templates/service/${serviceId}`
      );
      setError(error.response?.data?.message || "Failed to load consent form");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSigning = async () => {
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Validate all required checkboxes are checked
      const allRequiredChecked = template.sections.every(
        (section, sectionIndex) => {
          if (!section.required) return true;
          if (!section.fields || section.fields.length === 0) return true;
          return section.fields.every((field, fieldIndex) => {
            if (field.type !== "checkbox" || !field.required) return true;
            const key = `${sectionIndex}-${fieldIndex}`;
            return formData.checkboxes[key] === true;
          });
        }
      );

      if (!allRequiredChecked) {
        setError("Please check all required boxes");
        return;
      }

      if (!formData.name.trim()) {
        setError("Please enter your full name");
        return;
      }

      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        setError("Please provide your signature");
        return;
      }

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
        setError("Client ID not found. Please try again.");
        return;
      }

      if (!payload.serviceId) {
        setError("Service ID not found. Please try again.");
        return;
      }

      await api.post("/consents/sign", payload);

      setSuccess(true);
    } catch (error) {
      console.error("Error submitting consent:", error);
      setError(
        error.response?.data?.message || "Failed to submit consent form"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (success) {
    return (
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
      </div>
    );
  }

  if (error && step === 1) {
    return (
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
                <p className="text-red-800">{error}</p>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile-optimized header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">
              {step === 2 ? "Back" : "Cancel"}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Progress indicator - Mobile optimized */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xs mx-auto">
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                  step >= 1
                    ? "bg-gray-900 text-white shadow-lg scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 1 ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
                ) : (
                  "1"
                )}
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  step >= 1 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Review
              </span>
            </div>
            <div
              className={`h-1 w-16 sm:w-24 rounded-full transition-all duration-300 ${
                step >= 2 ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 ${
                  step >= 2
                    ? "bg-gray-900 text-white shadow-lg scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs sm:text-sm font-medium ${
                  step >= 2 ? "text-gray-900" : "text-gray-400"
                }`}
              >
                Sign
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Review */}
        {step === 1 && template && (
          <div className="space-y-5 animate-fadeIn">
            {/* Hero card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-gray-900">
                    {template.name}
                  </h1>
                  {template.description && (
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment details card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📅</span>
                </div>
                Your Appointment
              </h2>
              <div className="space-y-3">
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                    Service
                  </dt>
                  <dd className="text-base sm:text-lg font-semibold text-gray-900">
                    {serviceName}
                  </dd>
                </div>
                {businessName && (
                  <div>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                      Business
                    </dt>
                    <dd className="text-base sm:text-lg font-semibold text-gray-900">
                      {businessName}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Important information */}
            {template.disclaimers && template.disclaimers.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-blue-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <span className="text-lg">ℹ️</span>
                  </div>
                  Important Information
                </h3>
                <ul className="space-y-3">
                  {template.disclaimers.map((disclaimer, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm sm:text-base text-gray-700 leading-relaxed"
                    >
                      <span className="text-blue-500 flex-shrink-0 mt-1">
                        •
                      </span>
                      <span>{disclaimer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {template.risks && template.risks.length > 0 && (
              <div className="bg-red-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-red-200 shadow-lg">
                <h3 className="text-base sm:text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">⚠️</span>
                  </div>
                  Potential Risks
                </h3>
                <ul className="space-y-2">
                  {template.risks.map((risk, index) => (
                    <li
                      key={index}
                      className="flex gap-3 text-sm sm:text-base text-red-900 leading-relaxed"
                    >
                      <span className="text-red-500 flex-shrink-0 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action button */}
            <div className="pt-4">
              <button
                onClick={handleStartSigning}
                className="w-full inline-flex items-center justify-center px-6 py-3 text-base sm:text-lg font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue to Sign
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Sign */}
        {step === 2 && template && (
          <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-8 animate-fadeIn">
            {/* Header */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-200">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-gray-900">
                Sign Your Consent
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Please complete all required fields below
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-5 animate-shake">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-red-800 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form sections */}
            <div className="space-y-4 sm:space-y-6">
              {template.sections
                ?.filter(
                  (section) => section.fields && section.fields.length > 0
                )
                .map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-gray-200"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                      {section.title}
                      {section.required && (
                        <span className="text-red-500 ml-1.5">*</span>
                      )}
                    </h3>

                    <div className="space-y-4">
                      {section.fields?.map((field, fieldIndex) => {
                        const key = `${sectionIndex}-${fieldIndex}`;

                        if (field.type === "checkbox") {
                          return (
                            <label
                              key={key}
                              className="flex items-start gap-3 sm:gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors touch-manipulation group"
                            >
                              <input
                                type="checkbox"
                                checked={formData.checkboxes[key] || false}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    checkboxes: {
                                      ...prev.checkboxes,
                                      [key]: e.target.checked,
                                    },
                                  }))
                                }
                                className="mt-1 h-5 w-5 sm:h-6 sm:w-6 text-gray-900 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 cursor-pointer transition-all"
                              />
                              <span className="text-sm sm:text-base text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </span>
                            </label>
                          );
                        }

                        if (field.type === "text") {
                          return (
                            <div key={key}>
                              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              <input
                                type="text"
                                value={formData.textInputs[key] || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    textInputs: {
                                      ...prev.textInputs,
                                      [key]: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                              />
                            </div>
                          );
                        }

                        if (field.type === "textarea") {
                          return (
                            <div key={key}>
                              <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              <textarea
                                value={formData.textInputs[key] || ""}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    textInputs: {
                                      ...prev.textInputs,
                                      [key]: e.target.value,
                                    },
                                  }))
                                }
                                rows={4}
                                className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                              />
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  </div>
                ))}

              {/* Name input */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-gray-200">
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Signature */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm sm:text-base font-semibold text-gray-700">
                    Signature <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                  >
                    Clear
                  </button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden touch-manipulation">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-40 sm:h-48 touch-action-none",
                    }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
                  Sign above with your finger or mouse
                </p>
              </div>
            </div>

            {/* Fixed bottom bar on mobile */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:shadow-none">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full inline-flex items-center justify-center px-6 py-3 text-base sm:text-lg font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
        )}
      </div>
    </div>
  );
}
