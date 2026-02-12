import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "./seminars.api";

export default function SeminarBookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      navigate("../seminars");
      return;
    }
    // In a real implementation, you'd verify the session with your backend
    // For now, we'll show a generic success message
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-green-600"
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

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-8">
            Thank you for your booking. You will receive a confirmation email
            shortly with all the details.
          </p>

          {/* What's Next */}
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Check your email for the booking confirmation and receipt
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Add the event to your calendar (link in the email)</span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  If this is an online seminar, you'll receive the meeting link
                  24 hours before the event
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-brand-600 mr-2 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  You'll receive a reminder 48 hours before the session
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/my-seminars">
              <button className="w-full sm:w-auto px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
                View My Bookings
              </button>
            </Link>
            <Link to="../seminars">
              <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Browse More Seminars
              </button>
            </Link>
            <Link to="/">
              <button className="w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                Go to Home
              </button>
            </Link>
          </div>
        </div>

        {/* Cancellation Policy Reminder */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Cancellation Policy
          </h2>
          <p className="text-sm text-gray-600 mb-3">
            If your plans change, you can cancel your booking from the "My
            Bookings" page:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>
              • <strong>More than 48 hours before:</strong> 100% refund
            </li>
            <li>
              • <strong>24-48 hours before:</strong> 50% refund
            </li>
            <li>
              • <strong>Less than 24 hours before:</strong> No refund
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
