import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../shared/lib/apiClient";
import Button from "../../shared/components/ui/Button";
import { AlertCircle, Info, Save } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import AdminPageShell, { AdminSectionCard } from "../components/AdminPageShell";

const defaultPolicyForm = {
  freeCancelHours: 24,
  noRefundHours: 2,
  rescheduleAllowedHours: 2,
  graceMinutes: 15,
  partialRefundPercent: 50,
  appliesTo: "auto",
};

const normalizePolicyForm = (data) => ({
  freeCancelHours: Number(
    data?.freeCancelHours ?? defaultPolicyForm.freeCancelHours,
  ),
  noRefundHours: Number(data?.noRefundHours ?? defaultPolicyForm.noRefundHours),
  rescheduleAllowedHours: Number(
    data?.rescheduleAllowedHours ?? defaultPolicyForm.rescheduleAllowedHours,
  ),
  graceMinutes: Number(data?.graceMinutes ?? defaultPolicyForm.graceMinutes),
  partialRefundPercent: Number(
    data?.partialRefundPercent ?? defaultPolicyForm.partialRefundPercent,
  ),
  appliesTo: data?.appliesTo || defaultPolicyForm.appliesTo,
});

export default function BookingPoliciesPage() {
  const queryClient = useQueryClient();

  // Fetch salon-wide policy
  const { data: salonPolicy, isLoading } = useQuery({
    queryKey: ["cancellationPolicy", "salon"],
    queryFn: async () => {
      const response = await api.get("/cancellation-policy/salon");
      return response.data;
    },
  });

  const [formData, setFormData] = useState(defaultPolicyForm);
  const [savedSnapshot, setSavedSnapshot] = useState(defaultPolicyForm);

  useEffect(() => {
    if (salonPolicy) {
      const normalizedPolicy = normalizePolicyForm({
        freeCancelHours: salonPolicy.freeCancelHours || 24,
        noRefundHours: salonPolicy.noRefundHours || 2,
        rescheduleAllowedHours: salonPolicy.rescheduleAllowedHours || 2,
        graceMinutes: salonPolicy.graceMinutes || 15,
        partialRefundPercent: salonPolicy.partialRefund?.percent || 50,
        appliesTo: salonPolicy.appliesTo || "auto",
      });
      setFormData(normalizedPolicy);
      setSavedSnapshot(normalizedPolicy);
    }
  }, [salonPolicy]);

  const hasUnsavedChanges =
    JSON.stringify(normalizePolicyForm(formData)) !==
    JSON.stringify(normalizePolicyForm(savedSnapshot));

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const savePolicyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put("/cancellation-policy/salon", {
        freeCancelHours: Number(data.freeCancelHours),
        noRefundHours: Number(data.noRefundHours),
        rescheduleAllowedHours: Number(data.rescheduleAllowedHours),
        graceMinutes: Number(data.graceMinutes),
        partialRefund: {
          percent: Number(data.partialRefundPercent),
        },
        appliesTo: data.appliesTo,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["cancellationPolicy"]);
      setSavedSnapshot(normalizePolicyForm(variables));
      toast.success("Policy settings saved successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || "Failed to save policy settings",
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    savePolicyMutation.mutate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(savedSnapshot);
    toast.success("Changes reset");
  };

  if (isLoading) {
    return (
      <AdminPageShell
        title="Booking & Cancellation Policies"
        description="Configure cancellation windows, refund policies, and rescheduling rules for your business."
        maxWidth="lg"
      >
        <AdminSectionCard>
          <LoadingSpinner center message="Loading policy settings..." />
        </AdminSectionCard>
      </AdminPageShell>
    );
  }

  const getRefundAmount = (hours) => {
    if (hours >= formData.freeCancelHours) return "100%";
    if (hours <= formData.noRefundHours) return "0%";
    return `${formData.partialRefundPercent}%`;
  };

  const numberInputClass =
    "w-full min-h-11 px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  const optionCardClass = (isActive) =>
    `flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
      isActive
        ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-200"
        : "border-gray-300 hover:bg-gray-50"
    }`;

  const hasWindowConflict =
    Number(formData.noRefundHours) >= Number(formData.freeCancelHours);

  return (
    <AdminPageShell
      title="Booking & Cancellation Policies"
      description="Configure cancellation windows, refund policies, and rescheduling rules for your business."
      maxWidth="lg"
      contentClassName={`space-y-6 ${hasUnsavedChanges ? "pb-24 sm:pb-0" : ""}`}
    >
      {hasUnsavedChanges && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You have unsaved changes.
        </div>
      )}

      {/* Visual Summary Card */}
      <AdminSectionCard padding="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-6 h-6 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white">
            <Info className="w-3 h-3 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-gray-900">
              Current Policy Overview
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              How these settings affect your customers
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="text-lg sm:text-2xl">✅</span>
              <h3 className="font-semibold text-xs sm:text-base text-green-900">
                Free Cancellation
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-green-800 mb-1 sm:mb-2">
              {formData.freeCancelHours}+ hours before appointment
            </p>
            <p className="text-lg sm:text-2xl font-bold text-green-900">
              100% Refund
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="text-lg sm:text-2xl">⚠️</span>
              <h3 className="font-semibold text-xs sm:text-base text-yellow-900">
                Partial Refund
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-yellow-800 mb-1 sm:mb-2">
              {formData.noRefundHours}-{formData.freeCancelHours} hours before
            </p>
            <p className="text-lg sm:text-2xl font-bold text-yellow-900">
              {formData.partialRefundPercent}% Refund
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="text-lg sm:text-2xl">❌</span>
              <h3 className="font-semibold text-xs sm:text-base text-red-900">
                No Refund
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-red-800 mb-1 sm:mb-2">
              Within {formData.noRefundHours} hours
            </p>
            <p className="text-lg sm:text-2xl font-bold text-red-900">
              0% Refund
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <span className="text-lg sm:text-2xl">⚡</span>
              <h3 className="font-semibold text-xs sm:text-base text-blue-900">
                Grace Period
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 mb-1 sm:mb-2">
              Within {formData.graceMinutes} min of booking
            </p>
            <p className="text-lg sm:text-2xl font-bold text-blue-900">
              100% Refund
            </p>
          </div>
        </div>
      </AdminSectionCard>

      <AdminSectionCard padding="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Live refund preview
          </h2>
          <span className="text-xs sm:text-sm text-gray-500">
            Based on your current settings
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[48, 12, 1].map((hours) => (
            <div
              key={hours}
              className="rounded-xl border border-gray-200 bg-gray-50 p-3"
            >
              <p className="text-xs text-gray-600">
                Cancellation {hours}h before
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                Refund: {getRefundAmount(hours)}
              </p>
            </div>
          ))}
        </div>
      </AdminSectionCard>

      {/* Settings Form */}
      <form id="booking-policy-form" onSubmit={handleSubmit}>
        <AdminSectionCard padding="p-4 sm:p-6">
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                Policy Settings
              </h2>
            </div>

            {hasWindowConflict && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                The “No Refund Window” should be less than the “Free
                Cancellation Period” to avoid overlapping ranges.
              </div>
            )}

            {/* Refund Windows */}
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Refund Windows
              </h3>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Free Cancellation Period (hours before appointment)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.freeCancelHours}
                  onChange={(e) =>
                    handleChange("freeCancelHours", e.target.value)
                  }
                  className={numberInputClass}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Customers get a 100% refund if they cancel at least this many
                  hours before their appointment
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  No Refund Window (hours before appointment)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.noRefundHours}
                  onChange={(e) =>
                    handleChange("noRefundHours", e.target.value)
                  }
                  className={numberInputClass}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  No refund is given if cancelled within this window
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Partial Refund Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.partialRefundPercent}
                  onChange={(e) =>
                    handleChange("partialRefundPercent", e.target.value)
                  }
                  className={numberInputClass}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Customers receive this percentage as a refund when cancelling
                  between the two windows above
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Grace Period (minutes after booking)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.graceMinutes}
                  onChange={(e) => handleChange("graceMinutes", e.target.value)}
                  className={numberInputClass}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Customers can cancel within this time after booking and always
                  get a full refund
                </p>
              </div>
            </div>

            {/* Rescheduling Rules */}
            <div className="space-y-2 sm:space-y-4 pt-3 sm:pt-6 border-t border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Rescheduling Rules
              </h3>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Minimum Hours to Reschedule
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rescheduleAllowedHours}
                  onChange={(e) =>
                    handleChange("rescheduleAllowedHours", e.target.value)
                  }
                  className={numberInputClass}
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Customers cannot reschedule appointments that are within this
                  many hours
                </p>
              </div>
            </div>

            {/* Refund Application */}
            <div className="space-y-2 sm:space-y-4 pt-3 sm:pt-6 border-t border-gray-200">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Refund Application
              </h3>

              <div className="space-y-2 sm:space-y-3">
                <label
                  className={optionCardClass(formData.appliesTo === "auto")}
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="auto"
                    checked={formData.appliesTo === "auto"}
                    onChange={(e) => handleChange("appliesTo", e.target.value)}
                    className="w-4 h-4 text-brand-600"
                  />
                  <div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">
                      Smart (Recommended)
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Automatically refunds what customer paid - full payment if
                      paid in full, deposit if paid deposit only
                    </div>
                  </div>
                </label>

                <label
                  className={optionCardClass(
                    formData.appliesTo === "deposit_only",
                  )}
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="deposit_only"
                    checked={formData.appliesTo === "deposit_only"}
                    onChange={(e) => handleChange("appliesTo", e.target.value)}
                    className="w-4 h-4 text-brand-600"
                  />
                  <div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">
                      Deposit Only
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Always refund only the deposit amount, even if customer
                      paid in full
                    </div>
                  </div>
                </label>

                <label
                  className={optionCardClass(formData.appliesTo === "full")}
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="full"
                    checked={formData.appliesTo === "full"}
                    onChange={(e) => handleChange("appliesTo", e.target.value)}
                    className="w-4 h-4 text-brand-600"
                  />
                  <div>
                    <div className="text-sm sm:text-base font-medium text-gray-900">
                      Full Payment
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Always refund the full service price (use for full
                      prepayment only bookings)
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4 flex gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-blue-800">
                <p className="font-medium mb-1">
                  How these settings work together:
                </p>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                  <li>
                    The grace period always overrides other settings immediately
                    after booking
                  </li>
                  <li>
                    Rescheduling is blocked within the minimum hours window, but
                    customers can still cancel
                  </li>
                  <li>
                    Refund windows apply to both online cancellations and admin
                    cancellations
                  </li>
                  <li>
                    These are default settings - you can override them per
                    specialist in their profile
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2 sm:pt-4">
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges || savePolicyMutation.isPending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={!hasUnsavedChanges || savePolicyMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savePolicyMutation.isPending
                    ? "Saving..."
                    : "Save Policy Settings"}
                </Button>
              </div>
            </div>
          </div>
        </AdminSectionCard>
      </form>

      {hasUnsavedChanges && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={savePolicyMutation.isPending}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="booking-policy-form"
              disabled={savePolicyMutation.isPending}
              className="flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {savePolicyMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}
