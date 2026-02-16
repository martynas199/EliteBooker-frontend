import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import SignatureCanvas from "react-signature-canvas";
import { api } from "../../shared/lib/apiClient";
import toast from "react-hot-toast";

export default function ConsentSigningPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const signatureRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [alreadySigned, setAlreadySigned] = useState(false);

  const [consentData, setConsentData] = useState(null);
  const [formData, setFormData] = useState({
    signedByName: "",
    checkboxes: {},
    signatureData: null,
  });

  useEffect(() => {
    loadConsent();
  }, [token]);

  const loadConsent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/public/consent-link/${token}`);

      if (response.data.alreadySigned) {
        setAlreadySigned(true);
      } else {
        setConsentData(response.data.data);

        // Initialize checkbox states
        const checkboxStates = {};
        response.data.data.template.sections.forEach((section, index) => {
          if (section.type === "checkbox") {
            checkboxStates[index] = false;
          }
        });
        setFormData((prev) => ({ ...prev, checkboxes: checkboxStates }));
      }
    } catch (error) {
      console.error("Error loading consent:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load consent form. The link may be expired or invalid.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setFormData((prev) => ({ ...prev, signatureData: null }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current?.isEmpty()) {
      toast.error("Please provide your signature");
      return;
    }

    const signatureData = signatureRef.current.toDataURL();
    setFormData((prev) => ({ ...prev, signatureData }));
    setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.signedByName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    // Check required checkboxes
    const requiredCheckboxes = consentData.template.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => section.type === "checkbox" && section.required);

    for (const { index } of requiredCheckboxes) {
      if (!formData.checkboxes[index]) {
        toast.error("Please check all required checkboxes");
        return;
      }
    }

    if (!formData.signatureData) {
      toast.error("Please provide your signature");
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/public/consent-link/${token}/sign`, {
        signedByName: formData.signedByName,
        signatureData: formData.signatureData,
      });

      // Move to success step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Error signing consent:", error);
      toast.error(
        error.response?.data?.message || "Failed to sign consent form",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderSection = (section, index) => {
    switch (section.type) {
      case "header":
        return (
          <h2 key={index} className="text-xl font-bold text-gray-900 mb-4">
            {section.content}
          </h2>
        );

      case "paragraph":
        return (
          <p key={index} className="text-gray-700 mb-4 leading-relaxed">
            {section.content}
          </p>
        );

      case "list":
        return (
          <div key={index} className="mb-4">
            {section.content && (
              <p className="font-semibold text-gray-900 mb-2">
                {section.content}
              </p>
            )}
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {(section.options || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        );

      case "declaration":
        return (
          <div
            key={index}
            className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
          >
            <p className="font-semibold text-gray-900">{section.content}</p>
          </div>
        );

      case "checkbox":
        return (
          <label
            key={index}
            className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg mb-4 cursor-pointer hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={formData.checkboxes[index] || false}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  checkboxes: { ...prev.checkboxes, [index]: e.target.checked },
                }))
              }
              className="mt-1 w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-gray-700 flex-1">
              {section.content}
              {section.required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        );

      case "signature":
        return null; // Handled separately in signature step

      default:
        return null;
    }
  };

  const nonSignatureSections =
    consentData?.template.sections.filter((s) => s.type !== "signature") || [];
  const hasSignatureSection = consentData?.template.sections.some(
    (s) => s.type === "signature",
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading consent form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Form
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Signed
          </h1>
          <p className="text-gray-600 mb-6">
            You have already signed this consent form. A copy has been sent to
            your email.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Step 0: Personal Information
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-6">
              <h1 className="text-2xl font-bold">
                {consentData.template.name}
              </h1>
              <p className="text-indigo-100 mt-1">
                Step 1 of 3: Personal Information
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.signedByName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      signedByName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will appear on your signed consent form
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Client:</strong> {consentData.client.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {consentData.client.email}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setCurrentStep(1)}
                disabled={!formData.signedByName.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Review Consent Form
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-6">
              <h1 className="text-2xl font-bold">
                {consentData.template.name}
              </h1>
              <p className="text-indigo-100 mt-1">
                Step 2 of 3: Review & Agree
              </p>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {nonSignatureSections.map((section, index) =>
                renderSection(section, index),
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(0)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Continue to Signature
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Signature
  if (currentStep === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-6">
              <h1 className="text-2xl font-bold">
                {consentData.template.name}
              </h1>
              <p className="text-indigo-100 mt-1">Step 3 of 3: Sign</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please sign below with your finger or mouse *
                </label>
                <div className="border-2 border-gray-300 rounded-lg bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-48 touch-none",
                      style: { touchAction: "none" },
                    }}
                    backgroundColor="white"
                  />
                </div>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleClearSignature}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Declaration:</strong> By signing this form, I confirm
                  that:
                </p>
                <ul className="text-sm text-yellow-800 list-disc list-inside mt-2 space-y-1">
                  <li>I have read and understood this consent form</li>
                  <li>All information provided is accurate and complete</li>
                  <li>I agree to the terms outlined in this document</li>
                  <li>My signature is provided voluntarily</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !signatureRef.current ||
                  signatureRef.current?.isEmpty()
                }
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Submit Signature
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your consent form has been successfully signed and submitted.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-green-800">
            <strong>What happens next:</strong>
          </p>
          <ul className="text-sm text-green-800 list-disc list-inside mt-2 space-y-1">
            <li>A copy has been sent to your email</li>
            <li>Your consent is securely stored</li>
            <li>You can proceed with your appointment</li>
          </ul>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
