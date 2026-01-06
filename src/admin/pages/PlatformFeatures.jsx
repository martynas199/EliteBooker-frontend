import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { useTenantSettings } from "../../shared/hooks/useTenantSettings";
import { Check, X, Crown } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../shared/lib/apiClient";

// Toggle Switch Component
const Toggle = ({ enabled, onChange, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${enabled ? "bg-black" : "bg-gray-200"}
      `}
    >
      <motion.span
        layout
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
          transition-transform duration-200 ease-in-out
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
};

// Feature Row Component
const FeatureRow = ({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
  disabledReason,
}) => {
  return (
    <div className="flex items-start justify-between py-3 sm:py-5 border-b border-gray-200 last:border-b-0">
      <div className="flex-1 pr-3 sm:pr-8">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
          <h3 className="text-xs sm:text-sm font-medium text-gray-900">
            {title}
          </h3>
          {disabled && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
              <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Disabled
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
        {disabled && disabledReason && (
          <p className="mt-0.5 sm:mt-1 text-xs text-amber-600">
            {disabledReason}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
};

export default function FeaturesPage() {
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);
  const [searchParams] = useSearchParams();
  const {
    featureFlags,
    updateFeatureFlag,
    loadSettings,
    smsGatewayConnected,
    ecommerceEnabled,
    loading,
  } = useTenantSettings();

  const [localFlags, setLocalFlags] = useState({
    smsConfirmations: featureFlags?.smsConfirmations === true,
    smsReminders: featureFlags?.smsReminders === true,
    onlinePayments: featureFlags?.onlinePayments === true,
    ecommerce: ecommerceEnabled === true,
    emailNotifications: featureFlags?.emailNotifications === true,
    multiLocation: featureFlags?.multiLocation === true,
    seminars: featureFlags?.seminars === true,
    payOnTap: featureFlags?.payOnTap === true,
  });

  // Subscription state
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [processingNoFee, setProcessingNoFee] = useState(false);
  const [processingSms, setProcessingSms] = useState(false);
  const [featureStatus, setFeatureStatus] = useState(null);
  const specialistId = admin?.specialistId;
  const hasProcessedParams = useRef(false);

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Check for subscription success/cancel params
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const type = searchParams.get("type");

    if (
      (success === "true" || canceled === "true") &&
      !hasProcessedParams.current
    ) {
      hasProcessedParams.current = true;

      if (success === "true") {
        // Navigate first to clear params
        navigate("/admin/platform-features", { replace: true });

        // Reload settings and show toast
        loadSettings();
        fetchFeatureStatus();

        // Show appropriate message based on subscription type
        if (type === "sms") {
          toast.success(
            "SMS Confirmations activated! Your clients will now receive SMS notifications."
          );
        } else {
          toast.success(
            "Subscription activated! The booking fee has been removed for all your clients."
          );
        }
      } else if (canceled === "true") {
        navigate("/admin/platform-features", { replace: true });
        toast.error("Subscription canceled. You can try again anytime.");
      }
    }
  }, [searchParams, navigate]);

  // Load subscription status
  useEffect(() => {
    if (specialistId) {
      fetchFeatureStatus();
    } else {
      setSubscriptionLoading(false);
    }
  }, [specialistId]);

  const fetchFeatureStatus = async () => {
    try {
      setSubscriptionLoading(true);
      const statusRes = await api.get(`/features/${specialistId}`);
      setFeatureStatus(statusRes.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    console.log("handleSubscribe - specialistId:", specialistId);
    console.log("handleSubscribe - admin:", admin);
    console.log("handleSubscribe - admin.specialistId:", admin?.specialistId);
    console.log("handleSubscribe - admin._id:", admin?._id);

    if (!specialistId) {
      toast.error(
        "No specialist linked to your account. Please link your account to a specialist in Admin Management first."
      );
      return;
    }
    try {
      setProcessingNoFee(true);
      console.log(
        "Making API call to:",
        `/features/${specialistId}/subscribe-no-fee`
      );
      const res = await api.post(`/features/${specialistId}/subscribe-no-fee`);
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.error || "Failed to start subscription"
      );
      setProcessingNoFee(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!specialistId) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You'll continue to have access until the end of your billing period."
      )
    ) {
      return;
    }

    try {
      setProcessingNoFee(true);
      await api.post(`/features/${specialistId}/cancel-no-fee`);

      // Optimistically update the state
      setFeatureStatus((prev) => ({
        ...prev,
        noFeeBookings: {
          ...prev?.noFeeBookings,
          status: "canceled",
          enabled: false,
        },
      }));

      toast.success(
        "Subscription cancelled. It will remain active until the end of your billing period."
      );

      // Small delay to let backend update, then fetch fresh data
      setTimeout(async () => {
        await Promise.all([fetchFeatureStatus(), loadSettings()]);
        setProcessingNoFee(false);
      }, 500);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel subscription"
      );
      setProcessingNoFee(false);
    }
  };

  const handleSmsSubscribe = async () => {
    if (!specialistId) {
      toast.error(
        "No specialist linked to your account. Please link your account to a specialist in Admin Management first."
      );
      return;
    }
    try {
      setProcessingSms(true);
      const res = await api.post(`/features/${specialistId}/subscribe-sms`);
      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating SMS subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to start SMS subscription"
      );
      setProcessingSms(false);
    }
  };

  const handleCancelSmsSubscription = async () => {
    if (!specialistId) return;
    if (
      !window.confirm(
        "Are you sure you want to cancel your SMS subscription? You'll continue to have access until the end of your billing period."
      )
    ) {
      return;
    }

    try {
      setProcessingSms(true);
      await api.post(`/features/${specialistId}/cancel-sms`);

      // Optimistically update the state
      setFeatureStatus((prev) => ({
        ...prev,
        smsConfirmations: {
          ...prev?.smsConfirmations,
          status: "canceled",
          enabled: false,
        },
      }));

      toast.success(
        "SMS subscription cancelled. It will remain active until the end of your billing period."
      );

      // Small delay to let backend update, then fetch fresh data
      setTimeout(async () => {
        await Promise.all([fetchFeatureStatus(), loadSettings()]);
        setProcessingSms(false);
      }, 500);
    } catch (error) {
      console.error("Error cancelling SMS subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel SMS subscription"
      );
      setProcessingSms(false);
    }
  };

  // Sync local state when featureFlags change
  useEffect(() => {
    setLocalFlags({
      smsConfirmations: featureFlags?.smsConfirmations === true,
      smsReminders: featureFlags?.smsReminders === true,
      onlinePayments: featureFlags?.onlinePayments === true,
      ecommerce: ecommerceEnabled === true,
      emailNotifications: featureFlags?.emailNotifications === true,
      multiLocation: featureFlags?.multiLocation === true,
      payOnTap: featureFlags?.payOnTap === true,
    });
  }, [featureFlags, ecommerceEnabled]);

  const handleToggle = async (feature) => {
    const newValue = !localFlags[feature];

    // Feature display names
    const featureNames = {
      smsConfirmations: "SMS Confirmations",
      smsReminders: "SMS Reminders",
      onlinePayments: "Online Payments",
      ecommerce: "E-commerce",
      emailNotifications: "Email Notifications",
      multiLocation: "Multi-Location Support",
      payOnTap: "Tap to Pay",
    };

    // Optimistically update local state
    setLocalFlags((prev) => ({
      ...prev,
      [feature]: newValue,
    }));

    // Call API to persist change
    try {
      await updateFeatureFlag(feature, newValue);
      toast.success(
        `${featureNames[feature] || feature} ${
          newValue ? "enabled" : "disabled"
        } successfully`
      );
    } catch (error) {
      console.error(`❌ Failed to update ${feature}:`, error);
      toast.error("Failed to update feature setting");
      // Revert on error
      setLocalFlags((prev) => ({
        ...prev,
        [feature]: !newValue,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  const isActive =
    featureStatus?.noFeeBookings?.enabled &&
    featureStatus?.noFeeBookings?.status === "active";
  const isCanceled = featureStatus?.noFeeBookings?.status === "canceled";
  const periodEnd = featureStatus?.noFeeBookings?.currentPeriodEnd;
  const hasExpired = periodEnd && new Date(periodEnd) <= new Date();
  const isFullyCanceled = isCanceled && hasExpired;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
            Features & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage premium subscriptions and configure platform features for
            your business.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Premium Subscription Section */}
        {specialistId && !subscriptionLoading && (
          <div className="bg-gradient-to-br from-white via-brand-50/20 to-purple-50/20 rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Premium: No Fee Bookings
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Remove the £1.00 booking fee for all your clients
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {/* Status Banner */}
              {isActive && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-900 font-semibold mb-1 text-xs sm:text-sm">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Active Subscription</span>
                  </div>
                  <p className="text-xs text-green-800">
                    Your clients can book without paying the £1.00 booking fee!
                  </p>
                  {periodEnd && (
                    <p className="text-xs text-green-700 mt-1">
                      Next billing:{" "}
                      {new Date(periodEnd).toLocaleDateString("en-GB")}
                    </p>
                  )}
                </div>
              )}

              {isCanceled && !hasExpired && (
                <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 font-semibold mb-1 text-sm">
                    <X className="w-4 h-4" />
                    <span>Subscription Canceling</span>
                  </div>
                  <p className="text-xs text-orange-700">
                    Ends on {new Date(periodEnd).toLocaleDateString("en-GB")}
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">
                  Benefits:
                </h3>
                <ul className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>No £1.00 booking fee for clients</span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>Increase bookings by removing barriers</span>
                  </li>
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <span>Better client experience</span>
                  </li>
                </ul>
              </div>

              {/* Pricing & Action */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-200">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    £9.99
                    <span className="text-xs sm:text-sm text-gray-600 font-normal">
                      /month
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Cancel anytime</p>
                </div>
                <div>
                  {!isActive && !isCanceled && (
                    <button
                      onClick={handleSubscribe}
                      disabled={processingNoFee}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all disabled:opacity-50"
                    >
                      {processingNoFee ? "Processing..." : "Subscribe Now"}
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={processingNoFee}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-200 border border-gray-300 transition-all disabled:opacity-50"
                    >
                      {processingNoFee ? "Processing..." : "Cancel"}
                    </button>
                  )}

                  {isFullyCanceled && (
                    <button
                      onClick={handleSubscribe}
                      disabled={processingNoFee}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-600/40 transition-all disabled:opacity-50"
                    >
                      {processingNoFee ? "Processing..." : "Resubscribe"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Confirmations Premium Section */}
        {specialistId && !subscriptionLoading && (
          <div className="bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/20 rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Premium: SMS Confirmations
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-white/90">
                Send automatic SMS confirmations to clients when they book
              </p>
            </div>

            <div className="p-4 sm:p-6">
              {/* Status Banner */}
              {featureStatus?.smsConfirmations?.enabled &&
                featureStatus?.smsConfirmations?.status === "active" && (
                  <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-900 font-semibold mb-1 text-xs sm:text-sm">
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Active Subscription</span>
                    </div>
                    <p className="text-xs text-green-800">
                      Your clients will receive SMS confirmations when they
                      book!
                    </p>
                    {featureStatus?.smsConfirmations?.currentPeriodEnd && (
                      <p className="text-xs text-green-700 mt-1">
                        Next billing:{" "}
                        {new Date(
                          featureStatus.smsConfirmations.currentPeriodEnd
                        ).toLocaleDateString("en-GB")}
                      </p>
                    )}
                  </div>
                )}

              {featureStatus?.smsConfirmations?.status === "canceled" &&
                !(
                  featureStatus?.smsConfirmations?.currentPeriodEnd &&
                  new Date(featureStatus.smsConfirmations.currentPeriodEnd) <=
                    new Date()
                ) && (
                  <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold mb-1 text-xs sm:text-sm">
                      <span>Subscription Ending</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      Your subscription is canceled but active until{" "}
                      {new Date(
                        featureStatus.smsConfirmations.currentPeriodEnd
                      ).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                )}

              {/* Benefits List */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Instant SMS confirmations when clients book</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Reduce no-shows with automated reminders</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Professional client communication</span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    £3.99
                    <span className="text-xs sm:text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Billed monthly</p>
                </div>

                <div className="flex gap-2">
                  {!featureStatus?.smsConfirmations?.enabled && (
                    <button
                      onClick={handleSmsSubscribe}
                      disabled={processingSms}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all disabled:opacity-50"
                    >
                      {processingSms ? "Processing..." : "Subscribe Now"}
                    </button>
                  )}

                  {featureStatus?.smsConfirmations?.enabled &&
                    featureStatus?.smsConfirmations?.status === "active" && (
                      <button
                        onClick={handleCancelSmsSubscription}
                        disabled={processingSms}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-200 border border-gray-300 transition-all disabled:opacity-50"
                      >
                        {processingSms ? "Processing..." : "Cancel"}
                      </button>
                    )}

                  {featureStatus?.smsConfirmations?.status === "canceled" &&
                    featureStatus?.smsConfirmations?.currentPeriodEnd &&
                    new Date(featureStatus.smsConfirmations.currentPeriodEnd) <=
                      new Date() && (
                      <button
                        onClick={handleSmsSubscribe}
                        disabled={processingSms}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all disabled:opacity-50"
                      >
                        {processingSms ? "Processing..." : "Resubscribe"}
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Features Section */}
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Platform Features
          </h2>
          <div className="bg-white rounded-xl sm:rounded-lg border border-gray-200">
            <div className="p-4 sm:p-6">
              {/* SMS Confirmations */}
              <FeatureRow
                title="SMS Confirmations"
                description="Send SMS messages when appointments are created or modified."
                enabled={localFlags.smsConfirmations}
                onChange={() => handleToggle("smsConfirmations")}
                disabled={
                  !(
                    featureStatus?.smsConfirmations?.enabled &&
                    featureStatus?.smsConfirmations?.status === "active"
                  )
                }
                disabledReason={
                  !(
                    featureStatus?.smsConfirmations?.enabled &&
                    featureStatus?.smsConfirmations?.status === "active"
                  )
                    ? "Subscribe to Premium: SMS Confirmations to enable this feature."
                    : null
                }
              />

              {/* SMS Reminders */}
              <FeatureRow
                title="SMS Reminders"
                description="Automatically send SMS reminders 12 hours before scheduled appointments."
                enabled={localFlags.smsReminders}
                onChange={() => handleToggle("smsReminders")}
                disabled={
                  !(
                    featureStatus?.smsConfirmations?.enabled &&
                    featureStatus?.smsConfirmations?.status === "active"
                  )
                }
                disabledReason={
                  !(
                    featureStatus?.smsConfirmations?.enabled &&
                    featureStatus?.smsConfirmations?.status === "active"
                  )
                    ? "Subscribe to Premium: SMS Confirmations to enable this feature."
                    : null
                }
              />

              {/* Online Payments */}
              <FeatureRow
                title="Online Payments"
                description="Allow clients to pay deposits and booking fees online via Stripe."
                enabled={localFlags.onlinePayments}
                onChange={() => handleToggle("onlinePayments")}
              />

              {/* E-commerce Module */}
              <FeatureRow
                title="E-commerce Module"
                description="Enable online product sales, inventory management, and store features. When enabled, the Store section will appear in your admin sidebar."
                enabled={localFlags.ecommerce}
                onChange={() => handleToggle("ecommerce")}
              />

              {/* Email Notifications */}
              <FeatureRow
                title="Email Notifications"
                description="Send email confirmations, reminders, and updates to clients and staff."
                enabled={localFlags.emailNotifications}
                onChange={() => handleToggle("emailNotifications")}
              />

              {/* Multi-Location Support */}
              <FeatureRow
                title="Multi-Location Support"
                description="Enable multiple business locations. Services and specialists can be assigned to specific locations, and clients can choose their preferred location when booking."
                enabled={localFlags.multiLocation}
                onChange={() => handleToggle("multiLocation")}
              />

              {/* Seminars & Masterclasses */}
              <FeatureRow
                title="Seminars & Masterclasses"
                description="Enable seminars and masterclasses booking system. When enabled, the Seminars section will appear in your admin sidebar and client-facing website."
                enabled={localFlags.seminars}
                onChange={() => handleToggle("seminars")}
                disabled={true}
                disabledReason="Coming soon! This feature is currently in development."
              />

              {/* Pay on Tap */}
              <FeatureRow
                title="Pay on Tap"
                description="Enable the Take Payment feature to manually process payments through Stripe terminal. When enabled, the Take Payment link will appear in your admin sidebar."
                enabled={localFlags.payOnTap}
                onChange={() => handleToggle("payOnTap")}
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <Check className="w-3 h-3 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Real-time Updates
                </h4>
                <p className="text-xs text-gray-600">
                  All feature changes are applied immediately. Your admin
                  sidebar and available functionality will update automatically
                  without requiring a page refresh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
