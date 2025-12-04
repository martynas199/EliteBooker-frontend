import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { StripeConnectAPI } from "../components/connect/connect.api";

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);
  const [status, setStatus] = useState("checking"); // checking, success, error
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      if (!admin?.beauticianId) {
        setError("Beautician ID not found. Please log in again.");
        setStatus("error");
        return;
      }

      // Check the account status
      const result = await StripeConnectAPI.getAccountStatus(
        admin.beauticianId
      );
      setAccountStatus(result);

      if (result.connected) {
        setStatus("success");
      } else {
        // Onboarding not complete yet
        setStatus("incomplete");
      }
    } catch (err) {
      console.error("Failed to check account status:", err);
      setError(err.message || "Failed to verify account status");
      setStatus("error");
    }
  };

  const handleContinue = () => {
    navigate("/admin/settings");
  };

  const handleRetry = () => {
    navigate("/admin/settings");
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Account
          </h2>
          <p className="text-gray-600">
            Please wait while we check your Stripe Connect status...
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            🎉 Stripe Account Connected!
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Your Stripe Connect account has been successfully set up. You can
            now receive payments directly to your bank account.
          </p>

          {/* Account Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Charges Enabled:</span>
              <span className="font-medium text-green-600">
                {accountStatus?.chargesEnabled ? "✓ Yes" : "✗ No"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Payouts Enabled:</span>
              <span className="font-medium text-green-600">
                {accountStatus?.payoutsEnabled ? "✓ Yes" : "✗ No"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Account ID:</span>
              <span className="font-mono text-xs text-gray-900">
                {accountStatus?.stripeAccountId?.substring(0, 20)}...
              </span>
            </div>
          </div>

          {/* What's Next */}
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
              What's Next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Start accepting bookings and product orders</li>
              <li>✓ Payments will be transferred directly to your account</li>
              <li>✓ Platform fee: £0.50 per booking</li>
              <li>✓ Product sales: 100% to you (no platform fee)</li>
            </ul>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full bg-brand-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            Go to Settings
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (status === "incomplete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          {/* Warning Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-yellow-100 p-3">
              <svg
                className="w-16 h-16 text-yellow-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Onboarding Incomplete
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Your Stripe account setup is not yet complete. You may need to
            provide additional information or verify your details.
          </p>

          {/* Requirements */}
          {accountStatus?.requirementsCurrentlyDue &&
            accountStatus.requirementsCurrentlyDue.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Required Information:
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {accountStatus.requirementsCurrentlyDue.map((req, idx) => (
                    <li key={idx}>• {req.replace(/_/g, " ")}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-brand-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Return to Settings
            </button>
            <p className="text-xs text-gray-500 text-center">
              You can complete the onboarding process from the Settings page
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        {/* Error Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="w-16 h-16 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Verification Error
        </h2>
        <p className="text-gray-600 text-center mb-2">
          We encountered an error while verifying your account:
        </p>
        <p className="text-sm text-red-600 text-center mb-6 font-mono bg-red-50 p-3 rounded">
          {error}
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={checkAccountStatus}
            className="w-full bg-brand-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-brand-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={handleRetry}
            className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Return to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
