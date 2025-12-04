import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { StripeConnectAPI } from "../components/connect/connect.api";

export default function ReauthOnboarding() {
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRetryOnboarding = async () => {
    try {
      if (!admin?.beauticianId || !admin?.email) {
        setError("Admin credentials not found. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);

      // Create a new onboarding link
      const result = await StripeConnectAPI.createOnboardingLink(
        admin.beauticianId,
        admin.email
      );

      // Redirect to Stripe onboarding
      window.location.href = result.url;
    } catch (err) {
      console.error("Failed to create onboarding link:", err);
      setError(err.message || "Failed to create onboarding link");
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/admin/settings");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-orange-100 p-3">
            <svg
              className="w-16 h-16 text-orange-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Continue Stripe Setup
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Your Stripe onboarding session has expired or needs to be refreshed.
          Click the button below to continue where you left off.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Why am I seeing this?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your onboarding link may have expired</li>
            <li>• You closed the window before finishing</li>
            <li>• Additional information is required</li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2 text-red-800">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-sm">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetryOnboarding}
            disabled={loading}
            className="w-full bg-brand-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Link...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Continue Onboarding</span>
              </>
            )}
          </button>

          <button
            onClick={handleGoBack}
            disabled={loading}
            className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel & Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Need help?{" "}
            <a
              href="mailto:support@yoursalon.com"
              className="text-brand-600 hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
