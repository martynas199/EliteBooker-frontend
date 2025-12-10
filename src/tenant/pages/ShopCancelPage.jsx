import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../../shared/components/ui/Button";

export default function ShopCancelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="mb-6 text-center">
          <div className="w-24 h-24 rounded-full mx-auto bg-yellow-100 flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-yellow-600"
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
          </div>

          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600">
            Your payment was cancelled and no charges were made.
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            What happened?
          </h2>
          <p className="text-gray-600 mb-4">
            You cancelled the payment process before it was completed. Your
            order was not placed and no payment was processed.
          </p>

          {orderId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A pending order (ID: {orderId.slice(-8)})
                may have been created but will be automatically cancelled since
                payment was not completed.
              </p>
            </div>
          )}
        </div>

        {/* Options Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            What would you like to do?
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>
                Your cart items are still saved. You can complete your purchase
                anytime.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>
                If you experienced any issues during checkout, please contact
                our support team.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>
                Continue browsing our products and add more items to your cart.
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="brand"
            size="lg"
            onClick={() => navigate("/product-checkout")}
            className="w-full"
          >
            Try Checkout Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/products")}
            className="w-full"
          >
            Continue Shopping
          </Button>
          <button
            onClick={() => navigate("/salon")}
            className="w-full text-center text-sm text-brand-600 hover:text-brand-700 font-medium py-2"
          >
            Contact Support
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a
              href="mailto:support@yoursalon.com"
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              support@yoursalon.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
