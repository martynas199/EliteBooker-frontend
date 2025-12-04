import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";

export default function ShopSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("orderId");

    if (!sessionId || !orderId) {
      setStatus("error");
      setError("Missing payment information");
      return;
    }

    confirmPayment(sessionId, orderId);
  }, [searchParams]);

  const confirmPayment = async (sessionId, orderId) => {
    try {
      setStatus("processing");
      const result = await api.post(`/orders/${orderId}/confirm`, {
        sessionId,
      });

      if (result.success && result.order) {
        setOrder(result.order);
        setStatus("success");

        // Redirect to order success page after a short delay
        setTimeout(() => {
          navigate(`/order-success/${result.order.orderNumber}`, {
            state: { order: result.order },
          });
        }, 2000);
      } else {
        setStatus("error");
        setError("Payment confirmation failed");
      }
    } catch (err) {
      console.error("Error confirming payment:", err);
      setStatus("error");
      setError(err.response?.data?.error || "Failed to confirm payment");
    }
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <div className="mb-6">
            <div className="relative inline-flex">
              <div className="w-24 h-24 border-8 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-brand-600"
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
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Processing Your Payment
          </h2>
          <p className="text-gray-600 mb-4">
            Please wait while we confirm your payment...
          </p>
          <p className="text-sm text-gray-500">
            Do not close this window or press the back button
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center px-4">
          <div className="mb-6">
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center animate-scale-in"
              style={{ backgroundColor: "#76540E" }}
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Your order has been confirmed. Redirecting to order details...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-brand-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-brand-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-brand-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full mx-auto bg-red-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
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
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Payment Confirmation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "We couldn't confirm your payment. Please contact support if you've been charged."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Return to Home
            </button>
            <button
              onClick={() => navigate("/salon")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
