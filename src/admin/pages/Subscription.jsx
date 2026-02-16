import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { api } from "../../shared/lib/apiClient";
import toast from "react-hot-toast";
import Button from "../../shared/components/ui/Button";
import { confirmDialog } from "../../shared/lib/confirmDialog";

export default function Subscription() {
  const admin = useSelector(selectAdmin);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setLoadingInvoices(true);

      // Fetch subscription and invoices in parallel for better performance
      const [subscriptionRes, invoicesRes] = await Promise.all([
        api.get("/subscriptions/status"),
        api.get("/subscriptions/invoices").catch(() => ({ data: [] })), // Fail gracefully if invoices endpoint fails
      ]);

      setSubscription(subscriptionRes.data);

      // Only set invoices if subscription exists
      if (subscriptionRes.data) {
        setInvoices(invoicesRes.data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to load subscription status");
      }
    } finally {
      setLoading(false);
      setLoadingInvoices(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await api.post("/subscriptions/create-checkout");

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to create subscription checkout"
      );
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = await confirmDialog({
      title: "Cancel subscription?",
      message:
        "Are you sure you want to cancel your subscription? You will lose access to the e-commerce store at the end of the billing period.",
      confirmLabel: "Cancel subscription",
      cancelLabel: "Keep subscription",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);
      await api.post("/subscriptions/cancel");
      toast.success("Subscription cancelled successfully");
      await fetchSubscription();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to cancel subscription"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      await api.post("/subscriptions/reactivate");
      toast.success("Subscription reactivated successfully");
      await fetchSubscription();
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to reactivate subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "past_due":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "canceled":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      case "trialing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          E-Commerce Subscription
        </h1>
        <p className="text-gray-600">
          Manage your monthly subscription to access the online store features
        </p>
      </div>

      {/* Subscription Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        {subscription ? (
          <div className="p-6">
            {/* Current Status */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Current Status
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-medium border rounded-full ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {subscription.status === "canceled"
                      ? "Cancelled"
                      : subscription.status}
                  </span>
                  {subscription.cancel_at_period_end && (
                    <span className="text-sm text-gray-500">
                      (Ends {formatDate(subscription.current_period_end)})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-brand-600">£19</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Billing Period</div>
                <div className="font-medium text-gray-900">
                  {formatDate(subscription.current_period_start)} -{" "}
                  {formatDate(subscription.current_period_end)}
                </div>
              </div>

              {subscription.trial_end && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Trial Ends</div>
                  <div className="font-medium text-blue-900">
                    {formatDate(subscription.trial_end)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {subscription.status === "active" &&
                !subscription.cancel_at_period_end && (
                  <Button
                    variant="danger"
                    onClick={handleCancelSubscription}
                    loading={cancelLoading}
                  >
                    Cancel Subscription
                  </Button>
                )}

              {subscription.cancel_at_period_end && (
                <Button
                  variant="brand"
                  onClick={handleReactivate}
                  loading={loading}
                >
                  Reactivate Subscription
                </Button>
              )}

              {(subscription.status === "past_due" ||
                subscription.status === "canceled") && (
                <Button
                  variant="brand"
                  onClick={handleSubscribe}
                  loading={loading}
                >
                  Renew Subscription
                </Button>
              )}
            </div>

            {subscription.cancel_at_period_end && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-900">
                      Subscription Scheduled for Cancellation
                    </h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your subscription will remain active until{" "}
                      {formatDate(subscription.current_period_end)}. After this
                      date, you will lose access to the e-commerce store
                      features.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              Subscribe to enable the e-commerce store and start selling
              products online
            </p>
            <Button variant="brand" size="lg" onClick={handleSubscribe}>
              Subscribe for £19/month
            </Button>
          </div>
        )}
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What's Included
        </h3>
        <div className="space-y-3">
          {[
            "Online product catalog and listings",
            "Shopping cart and checkout system",
            "Order management dashboard",
            "Stripe payment integration",
            "Customer order tracking",
            "Inventory management",
            "Revenue analytics and reports",
            "Mobile-responsive store design",
          ].map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices/Receipts Card */}
      {subscription && invoices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment History & Receipts
          </h3>

          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.number ||
                          `Invoice ${invoice.id.substring(0, 8)}`}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.status === "open"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(invoice.created)} • £
                      {invoice.amount_paid.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </a>
                    )}
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
