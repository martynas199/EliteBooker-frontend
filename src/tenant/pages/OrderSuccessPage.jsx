import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { OrdersAPI } from "./orders.api";
import Button from "../../shared/components/ui/Button";
import { formatCurrency } from "../../shared/utils/currency";
import { useAuth } from "../../shared/contexts/AuthContext";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state?.order && orderNumber) {
      loadOrder();
    } else if (location.state?.order) {
      console.log("Order from state:", location.state.order);
      console.log("Order currency from state:", location.state.order.currency);
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrdersAPI.getByOrderNumber(orderNumber);
      console.log("Loaded order data:", data);
      console.log("Order currency:", data.currency);
      setOrder(data);
    } catch (err) {
      console.error("Error loading order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOrder();
  };

  if (loading) {
    return renderWithSeo(
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>,
    );
  }

  if (error || !order) {
    return renderWithSeo(
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center">
          <svg
            className="w-20 h-20 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find this order"}
          </p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </div>,
    );
  }

  // Determine where the back button should go
  const handleBack = () => {
    // Check if user came from profile page
    const fromProfile =
      location.state?.fromProfile || document.referrer.includes("/profile");

    if (isAuthenticated && fromProfile) {
      // Logged-in user viewing from profile - go back to profile
      navigate("/profile");
    } else if (isAuthenticated) {
      // Logged-in user just completed checkout - go to profile to see orders
      navigate("/profile");
    } else {
      // Guest user - go to home page
      navigate("/");
    }
  };

  return renderWithSeo(
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="font-medium">
          {isAuthenticated ? "Back to Profile" : "Back to Home"}
        </span>
      </button>

      {/* Success Icon */}
      <div className="text-center mb-8">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#76540E" }}
        >
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We've received it successfully.
        </p>
      </div>

      {/* Order Number */}
      <div className="rounded-xl p-4 sm:p-6 mb-6 text-center">
        <p className="text-sm text-gray-600 mb-1">Order Number</p>
        <p
          className="text-xl sm:text-2xl font-bold tracking-wider break-all"
          style={{ color: "#76540E" }}
        >
          {order.orderNumber}
        </p>
        <p className="text-sm text-gray-500 mt-2 break-words">
          A confirmation email has been sent to{" "}
          <span className="font-medium break-all">
            {order.shippingAddress.email}
          </span>
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 overflow-hidden">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>

        {/* Items */}
        <div className="space-y-4 mb-6">
          {order.items.map((item, index) => (
            <div key={index} className="flex gap-3 sm:gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {item.size && (
                  <p className="text-sm text-gray-500">Size: {item.size}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Qty: {item.quantity} ×{" "}
                  {formatCurrency(item.price, order.currency)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(item.price * item.quantity, order.currency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              {formatCurrency(order.subtotal, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {order.shipping === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                formatCurrency(order.shipping, order.currency)
              )}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-xl font-bold" style={{ color: "#76540E" }}>
                {formatCurrency(order.total, order.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Shipping Address
        </h2>
        <div className="text-gray-600 space-y-1">
          <p className="font-medium text-gray-900">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p>{order.shippingAddress.address}</p>
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.country}</p>
          <p className="pt-2">
            <span className="text-gray-500">Email:</span>{" "}
            {order.shippingAddress.email}
          </p>
          <p>
            <span className="text-gray-500">Phone:</span>{" "}
            {order.shippingAddress.phone}
          </p>
        </div>
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="bg-blue-50 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Order Notes
          </h3>
          <p className="text-sm text-blue-800">{order.notes}</p>
        </div>
      )}

      {/* Order Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 disabled:opacity-50"
            title="Refresh order status"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              order.orderStatus === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : order.orderStatus === "processing"
                ? "bg-blue-100 text-blue-800"
                : order.orderStatus === "shipped"
                ? "bg-purple-100 text-purple-800"
                : order.orderStatus === "delivered"
                ? "bg-green-100 text-green-800"
                : order.orderStatus === "cancelled"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Current Status:{" "}
            {order.orderStatus.charAt(0).toUpperCase() +
              order.orderStatus.slice(1)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-600"
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
            </div>
            <div>
              <p className="font-medium text-gray-900">Order Placed</p>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {["processing", "shipped", "delivered"].includes(
            order.orderStatus
          ) && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  order.orderStatus === "processing"
                    ? "bg-blue-100"
                    : "bg-green-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    order.orderStatus === "processing"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Processing</p>
                <p className="text-sm text-gray-500">
                  We're preparing your order
                </p>
              </div>
            </div>
          )}

          {["shipped", "delivered"].includes(order.orderStatus) && (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  order.orderStatus === "shipped"
                    ? "bg-purple-100"
                    : "bg-green-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${
                    order.orderStatus === "shipped"
                      ? "text-purple-600"
                      : "text-green-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipped</p>
                {order.trackingNumber && (
                  <p className="text-sm text-gray-600 font-medium">
                    Tracking: {order.trackingNumber}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Your order is on the way
                </p>
              </div>
            </div>
          )}

          {order.orderStatus === "delivered" && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
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
              </div>
              <div>
                <p className="font-medium text-gray-900">Delivered</p>
                <p className="text-sm text-gray-500">
                  Your order has been delivered
                </p>
              </div>
            </div>
          )}

          {order.orderStatus === "cancelled" && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
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
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Cancelled</p>
                <p className="text-sm text-gray-500">
                  This order has been cancelled
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          What happens next?
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              You'll receive an order confirmation email at{" "}
              <strong>{order.shippingAddress.email}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              We'll send you a shipping notification with tracking information
              when your order ships
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Your order typically ships within 1-2 business days and arrives in
              3-5 business days
            </span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="brand"
          size="lg"
          onClick={() => navigate("/")}
          className="flex-1"
        >
          Continue Shopping
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.print()}
          className="flex-1"
        >
          Print Order
        </Button>
      </div>

      {/* Help Section */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Need help? Contact us at{" "}
          <a
            href="mailto:support@yoursalon.com"
            className="text-brand-600 hover:text-brand-700 font-medium"
          >
            support@yoursalon.com
          </a>
        </p>
      </div>
    </div>,
  );
}
  const renderWithSeo = (content) => (
    <>
      <SEOHead
        title="Order Confirmation"
        description="Secure order confirmation flow."
        noindex
      />
      {content}
    </>
  );
