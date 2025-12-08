import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTenantSettings } from "../../shared/hooks/useTenantSettings";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="flex items-start justify-between py-5 border-b border-gray-200 last:border-b-0">
      <div className="flex-1 pr-8">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {disabled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
              <X className="w-3 h-3" />
              Disabled
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        {disabled && disabledReason && (
          <p className="mt-1 text-xs text-amber-600">{disabledReason}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
};

export default function FeaturesPage() {
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
  });

  // Load settings from API on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync local state when featureFlags change
  useEffect(() => {
    setLocalFlags({
      smsConfirmations: featureFlags?.smsConfirmations === true,
      smsReminders: featureFlags?.smsReminders === true,
      onlinePayments: featureFlags?.onlinePayments === true,
      ecommerce: ecommerceEnabled === true,
      emailNotifications: featureFlags?.emailNotifications === true,
    });
  }, [featureFlags, ecommerceEnabled]);

  const handleToggle = async (feature) => {
    const newValue = !localFlags[feature];

    // Optimistically update local state
    setLocalFlags((prev) => ({
      ...prev,
      [feature]: newValue,
    }));

    // Call API to persist change
    try {
      await updateFeatureFlag(feature, newValue);
      toast.success(
        `${feature} ${newValue ? "enabled" : "disabled"} successfully`
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Platform Features
          </h1>
          <p className="text-sm text-gray-500">
            Configure which features are enabled for your business. Changes take
            effect immediately.
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            {/* SMS Confirmations */}
            <FeatureRow
              title="SMS Confirmations"
              description="Send SMS messages when appointments are created or modified."
              enabled={localFlags.smsConfirmations}
              onChange={() => handleToggle("smsConfirmations")}
              disabled={!smsGatewayConnected}
              disabledReason={
                !smsGatewayConnected
                  ? "SMS gateway not configured. Contact support to enable."
                  : null
              }
            />

            {/* SMS Reminders */}
            <FeatureRow
              title="SMS Reminders"
              description="Automatically send SMS reminders 12 hours before scheduled appointments."
              enabled={localFlags.smsReminders}
              onChange={() => handleToggle("smsReminders")}
              disabled={!smsGatewayConnected}
              disabledReason={
                !smsGatewayConnected
                  ? "SMS gateway not configured. Contact support to enable."
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
                All feature changes are applied immediately. Your admin sidebar
                and available functionality will update automatically without
                requiring a page refresh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
