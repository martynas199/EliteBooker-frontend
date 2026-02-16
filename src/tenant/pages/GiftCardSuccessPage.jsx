import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../shared/components/ui/Button";
import { confirmGiftCardCheckout } from "../../shared/api/giftCards.api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function GiftCardSuccessPage() {
  const query = useQuery();
  const { slug } = useParams();
  const sessionId = query.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | success | pending | error
  const [giftCard, setGiftCard] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const confirm = async () => {
      if (!sessionId) {
        setStatus("error");
        setErrorMessage("Missing payment session details.");
        return;
      }

      try {
        const result = await confirmGiftCardCheckout(sessionId);
        if (!active) return;

        if (result?.giftCard) {
          setGiftCard(result.giftCard);
          setStatus("success");
        } else {
          setStatus("pending");
        }
      } catch (error) {
        if (!active) return;
        const apiError = error?.response?.data?.error;
        if (error?.response?.status === 409) {
          setStatus("pending");
          setErrorMessage(apiError || "Payment is still processing.");
          return;
        }

        setStatus("error");
        setErrorMessage(apiError || "Unable to confirm gift card payment.");
      }
    };

    confirm();
    return () => {
      active = false;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg"
      >
        {status === "loading" && (
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Finalizing your gift card...
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              ✓
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gift card sent successfully
              </h1>
              <p className="text-gray-600">
                Your recipient will receive the gift card by email.
              </p>
            </div>

            {giftCard && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Code</span>
                  <span className="font-mono font-semibold text-brand-700">
                    {giftCard.code}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-semibold">£{Number(giftCard.amount || 0).toFixed(2)}</span>
                </div>
                {giftCard.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expires</span>
                    <span className="font-semibold">
                      {new Date(giftCard.expiryDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to={`/salon/${slug}/profile`}>
                <Button className="w-full" variant="outline">
                  View My Gift Cards
                </Button>
              </Link>
              <Link to={`/salon/${slug}`}>
                <Button className="w-full">Back to Salon</Button>
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Payment pending</h1>
            <p className="text-gray-600">
              {errorMessage || "Your payment is being processed. Please refresh shortly."}
            </p>
            <Link to={`/salon/${slug}`}>
              <Button className="w-full">Back to Salon</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">Could not confirm payment</h1>
            <p className="text-red-600">
              {errorMessage || "Something went wrong while confirming your gift card."}
            </p>
            <Link to={`/salon/${slug}`}>
              <Button className="w-full">Back to Salon</Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
