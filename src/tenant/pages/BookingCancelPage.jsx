import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../shared/components/ui/Button";
import StatusBadge from "../../shared/components/ui/StatusBadge";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function CancelPage() {
  const q = new URLSearchParams(useLocation().search);
  const appointmentId = q.get("appointmentId");
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function deleteAppointment() {
      if (!appointmentId) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
        const response = await fetch(
          `${apiUrl}/api/checkout/cancel-appointment/${appointmentId}`,
          {
            method: "DELETE",
          },
        );

        if (!mounted) return;

        if (response.ok) {
          setDeleted(true);
        } else {
          const data = await response.json();
          // If appointment was already paid/confirmed, that's okay - just show cancelled message
          if (data.error?.includes("unpaid")) {
            setDeleted(false); // Already processed
          } else {
            setError(data.error);
          }
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error deleting appointment:", err);
        // Don't show error to user - they cancelled payment anyway
      }
    }

    deleteAppointment();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  return (
    <>
      <SEOHead
        title="Booking Payment Canceled"
        description="Secure booking payment cancellation flow."
        noindex
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <StatusBadge status="cancelled" />
        </div>

        <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">
          Payment Canceled
        </h1>
        <p className="text-gray-700 text-center max-w-md">
          Your payment was canceled.
          {deleted
            ? " The appointment slot has been released."
            : " Your reserved slot may expire if not completed soon."}
        </p>
        {error && (
          <p className="text-red-600 text-center mt-2 text-sm">{error}</p>
        )}
        <Link to=".." className="mt-6 inline-block">
          <Button variant="outline">Return to booking</Button>
        </Link>
      </div>
      </div>
    </>
  );
}
