import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "./seminars.api";
import Button from "../../shared/components/ui/Button";
import StatusBadge from "../../shared/components/ui/StatusBadge";
import { useAuth } from "../../shared/contexts/AuthContext";
import { confirmDialog } from "../../shared/lib/confirmDialog";
import TenantAccountLayout from "../components/TenantAccountLayout";

export default function MySeminarsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/my-seminars");
      return;
    }
    loadBookings();
  }, [isAuthenticated]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await SeminarsAPI.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmed = await confirmDialog({
      title: "Cancel booking?",
      message: "Are you sure you want to cancel this booking?",
      confirmLabel: "Cancel booking",
      cancelLabel: "Keep booking",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await SeminarsAPI.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      loadBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isCancellable = (booking) => {
    if (booking.status !== "confirmed") return false;
    if (!booking.sessionInfo?.date) return false;

    const sessionDate = new Date(booking.sessionInfo.date);
    const now = new Date();
    const hoursUntilSession = (sessionDate - now) / (1000 * 60 * 60);

    return hoursUntilSession > 24; // Can cancel if more than 24 hours away
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <TenantAccountLayout
      title="My Seminar Bookings"
      description="View and manage your seminar registrations"
      onBack={() => navigate(-1)}
      maxWidth="max-w-7xl"
    >
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
          <p className="text-gray-500 text-lg mb-4">No seminar bookings yet</p>
          <Link to="../seminars">
            <Button>Browse Seminars</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Image */}
                  {booking.seminarInfo?.images?.main && (
                    <div className="lg:w-48 h-48 flex-shrink-0">
                      <img
                        src={
                          typeof booking.seminarInfo.images.main === "string"
                            ? booking.seminarInfo.images.main
                            : booking.seminarInfo.images.main.url
                        }
                        alt={booking.seminarInfo.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {booking.seminarInfo?.title || "Seminar"}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Booking Reference: {booking.bookingReference}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {/* Date & Time */}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Date & Time
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.sessionInfo?.date
                              ? formatDate(booking.sessionInfo.date)
                              : "N/A"}
                          </p>
                          {booking.sessionInfo && (
                            <p className="text-sm text-gray-600">
                              {booking.sessionInfo.startTime} -{" "}
                              {booking.sessionInfo.endTime}
                            </p>
                          )}
                        </div>

                        {/* Location */}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Location
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.seminarInfo?.location?.type === "physical"
                              ? "In-Person"
                              : booking.seminarInfo?.location?.type ===
                                "virtual"
                              ? "Online"
                              : "Hybrid"}
                          </p>
                          {booking.seminarInfo?.location?.city && (
                            <p className="text-sm text-gray-600">
                              {booking.seminarInfo.location.city}
                            </p>
                          )}
                        </div>

                        {/* Attendee */}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Attendee
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.attendeeInfo.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.attendeeInfo.email}
                          </p>
                        </div>

                        {/* Payment */}
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Payment
                          </p>
                          <p className="text-base font-semibold text-gray-900">
                            {booking.seminarInfo?.pricing?.currency || "GBP"}{" "}
                            {booking.payment.amount}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {booking.payment.status}
                          </p>
                          {booking.payment.refundAmount > 0 && (
                            <p className="text-sm text-red-600">
                              Refund:{" "}
                              {booking.seminarInfo?.pricing?.currency || "GBP"}{" "}
                              {booking.payment.refundAmount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      {isCancellable(booking) && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === booking._id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}
                      <Link to={`../seminars/${booking.seminarInfo?.slug}`}>
                        <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50">
                          View Seminar Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-700">
          If you have any questions about your booking or need to make changes,
          please contact support or refer to the cancellation policy in your
          confirmation email.
        </p>
      </div>
    </TenantAccountLayout>
  );
}
