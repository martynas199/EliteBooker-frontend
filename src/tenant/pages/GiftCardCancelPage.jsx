import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../../shared/components/ui/Button";
import { cancelGiftCardCheckout } from "../../shared/api/giftCards.api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function GiftCardCancelPage() {
  const query = useQuery();
  const { slug } = useParams();
  const giftCardId = query.get("giftCardId");
  const sessionId = query.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | cancelled | paid | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    const runCancel = async () => {
      if (!giftCardId && !sessionId) {
        setStatus("cancelled");
        setMessage("Your gift card checkout was canceled.");
        return;
      }

      try {
        const result = await cancelGiftCardCheckout({
          giftCardId,
          sessionId,
        });
        if (!active) return;

        if (result?.status === "sent" || result?.status === "redeemed") {
          setStatus("paid");
          setMessage("This payment has already completed successfully.");
        } else {
          setStatus("cancelled");
          setMessage(
            result?.message ||
              "Your gift card purchase was canceled and no payment was taken.",
          );
        }
      } catch (error) {
        if (!active) return;
        if (error?.response?.status === 409) {
          setStatus("paid");
          setMessage("This payment has already completed successfully.");
          return;
        }

        setStatus("error");
        setMessage(
          error?.response?.data?.error ||
            "Unable to finalize cancellation right now.",
        );
      }
    };

    runCancel();
    return () => {
      active = false;
    };
  }, [giftCardId, sessionId]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          !
        </div>
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Finalizing cancellation...
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we update your gift card checkout status.
            </p>
          </>
        )}

        {status === "cancelled" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment cancelled
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === "paid" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment already completed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Could not cancel checkout
            </h1>
            <p className="text-red-600 mb-6">{message}</p>
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to={`/salon/${slug}`}>
            <Button className="w-full">
              {status === "paid" ? "Back to Salon" : "Try Again"}
            </Button>
          </Link>
          <Link to={`/salon/${slug}/profile`}>
            <Button className="w-full" variant="outline">
              Go to Profile
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
