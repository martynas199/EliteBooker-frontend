import { useEffect, useState } from "react";
import { StripeConnectAPI } from "./connect.api";
import Button from "../../../shared/components/ui/Button";

export default function StripeConnectSettings({ specialistId, email }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    loadStatus();
  }, [specialistId]);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StripeConnectAPI.getAccountStatus(specialistId);
      console.log("[StripeConnect] Status response:", data);
      console.log("[StripeConnect] Connected:", data.connected);
      console.log("[StripeConnect] Status:", data.status);
      console.log("[StripeConnect] Charges enabled:", data.chargesEnabled);
      console.log("[StripeConnect] Details submitted:", data.detailsSubmitted);
      setStatus(data);
    } catch (err) {
      console.error("Failed to load Stripe status:", err);
      setError("Failed to load connection status");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setError(null);
    try {
      const { url } = await StripeConnectAPI.createOnboardingLink(
        specialistId,
        email
      );
      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (err) {
      console.error("Failed to create onboarding link:", err);
      setError("Failed to start onboarding process");
    }
  };

  const handleViewDashboard = async () => {
    setError(null);
    try {
      const { url } = await StripeConnectAPI.getDashboardLink(specialistId);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Failed to get dashboard link:", err);
      setError("Failed to open Stripe dashboard");
    }
  };

  const handleViewEarnings = async () => {
    setShowEarnings(true);
    try {
      const data = await StripeConnectAPI.getEarnings(specialistId);
      setEarnings(data);
    } catch (err) {
      console.error("Failed to load earnings:", err);
      setError("Failed to load earnings data");
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect your Stripe account? This will remove your payment integration."
      )
    ) {
      return;
    }

    setError(null);
    try {
      await StripeConnectAPI.disconnectAccount(specialistId);
      // Reload status to show disconnected state
      await loadStatus();
    } catch (err) {
      console.error("Failed to disconnect Stripe account:", err);
      setError("Failed to disconnect account");
    }
  };

  const getStatusBadge = () => {
    if (!status) return null;

    const badges = {
      not_connected: {
        color: "bg-gray-100 text-gray-700",
        icon: "⚪",
        text: "Not Connected",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-700",
        icon: "⏳",
        text: "Pending Setup",
      },
      connected: {
        color: "bg-green-100 text-green-700",
        icon: "✓",
        text: "Connected",
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        icon: "✗",
        text: "Rejected",
      },
    };

    const badge = badges[status.status] || badges.not_connected;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-4 text-gray-500">
          Loading Stripe status...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>💳</span>
        <span>Stripe Connect - Payment Settings</span>
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Status Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Connection Status
            </p>
            {getStatusBadge()}
          </div>
          {status?.connected && status?.stripeAccountId && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Account ID</p>
              <p className="text-xs font-mono text-gray-700">
                {status.stripeAccountId.slice(0, 20)}...
              </p>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Connect your Stripe account</strong> to receive payments
            directly for your services and products.
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
            <li>Receive payments directly to your bank account</li>
            <li>Platform fee: £0.50 per completed booking</li>
            <li>100% of product sales go to you</li>
            <li>Automatic payouts (2-day rolling basis)</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {!status?.connected ? (
            <>
              <Button onClick={handleConnect} variant="brand">
                {status?.status === "pending"
                  ? "🔄 Complete Setup"
                  : "🚀 Connect with Stripe"}
              </Button>
              {status?.status === "pending" && (
                <p className="text-sm text-gray-600 flex items-center">
                  You started the onboarding process. Click to complete it.
                </p>
              )}
            </>
          ) : (
            <>
              <Button onClick={handleViewEarnings} variant="brand">
                💰 View Earnings
              </Button>
              <Button onClick={handleViewDashboard} variant="outline">
                📊 Stripe Dashboard
              </Button>
              <Button onClick={loadStatus} variant="outline">
                🔄 Refresh Status
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                🔌 Disconnect
              </Button>
            </>
          )}
        </div>

        {/* Requirements (if any) */}
        {status?.connected === false &&
          status?.requirementsCurrentlyDue?.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ Additional Information Required
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {status.requirementsCurrentlyDue.map((req, idx) => (
                  <li key={idx}>• {req.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
          )}
      </div>

      {/* Earnings Modal */}
      {showEarnings && earnings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Your Earnings</h3>
              <button
                onClick={() => setShowEarnings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-blue-900">
                    £{earnings.totals?.totalEarnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">From Bookings</p>
                  <p className="text-2xl font-bold text-green-900">
                    £{earnings.bookings?.earnings?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {earnings.bookings?.count || 0} bookings
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 mb-1">From Products</p>
                  <p className="text-2xl font-bold text-purple-900">
                    £{earnings.products?.earnings?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {earnings.products?.count || 0} sales
                  </p>
                </div>
              </div>

              {/* Platform Fees */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Platform Fees</span>
                  <span className="text-sm font-medium text-gray-900">
                    -£{earnings.totals?.platformFees?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  £0.50 per completed booking
                </p>
              </div>

              {/* Stripe Info */}
              {earnings.stripe && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Stripe Payout Info
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="font-mono text-xs">
                        {earnings.stripe.accountId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Payouts:</span>
                      <span className="font-medium">
                        £{earnings.stripe.totalPayouts?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    {earnings.stripe.lastPayoutDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Payout:</span>
                        <span>
                          {new Date(
                            earnings.stripe.lastPayoutDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Transactions */}
              {earnings.bookings?.recentBookings?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Recent Bookings
                  </h4>
                  <div className="space-y-2">
                    {earnings.bookings.recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.clientName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          £{booking.price?.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowEarnings(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
