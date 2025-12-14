import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Store,
  Phone,
  Mail,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";

export default function ClientAppointmentsPage() {
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showGiftCardModal, setShowGiftCardModal] = useState(false); // all, upcoming, past, cancelled
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/client/bookings", {
        params: { limit: 100 },
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setError(error.message || "Failed to load appointments");
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.replace("/");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: CheckCircle,
        label: "Confirmed",
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-200",
        icon: Clock,
        label: "Pending",
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: XCircle,
        label: "Cancelled",
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: CheckCircle,
        label: "Completed",
      },
    };

    const style = styles[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
      icon: AlertCircle,
      label: status,
    };
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text} ${style.border}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {style.label}
      </span>
    );
  };

  const filterBookings = () => {
    const now = new Date();
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.start);

      switch (filter) {
        case "upcoming":
          return bookingDate >= now && booking.status !== "cancelled";
        case "past":
          return bookingDate < now || booking.status === "completed";
        case "cancelled":
          return booking.status === "cancelled";
        default:
          return true;
      }
    });
  };

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Menu - Hidden on mobile */}
      <div className="hidden md:block">
        <ProfileMenu
          client={client}
          onLogout={handleLogout}
          variant="sidebar"
          onGiftCardClick={() => setShowGiftCardModal(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mobile Header with Back Button */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
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
            </button>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-600 mt-1">View and manage your bookings</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-6">
              {[
                { key: "all", label: "All" },
                { key: "upcoming", label: "Upcoming" },
                { key: "past", label: "Past" },
                { key: "cancelled", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    filter === tab.key
                      ? "border-violet-600 text-violet-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
              <Button
                variant="secondary"
                onClick={fetchBookings}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No appointments found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "You haven't made any bookings yet"
                  : `No ${filter} appointments`}
              </p>
              <Button onClick={() => navigate("/")}>Find a Business</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.serviceId?.name || "Service"}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Business Info */}
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Store className="h-4 w-4" />
                        <span className="text-sm">
                          {booking.tenantId?.name || "Business"}
                        </span>
                      </div>

                      {/* Specialist Info */}
                      {booking.specialistId && (
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm">
                            {booking.specialistId.name}
                          </span>
                        </div>
                      )}

                      {/* Date and Time */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {formatDate(booking.start)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {formatTime(booking.start)} -{" "}
                            {formatTime(booking.end)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPrice(
                          booking.totalPrice || booking.serviceId?.price || 0
                        )}
                      </p>
                      {booking.serviceId?.duration && (
                        <p className="text-sm text-gray-600">
                          {booking.serviceId.duration} min
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {booking.contactInfo && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        {booking.contactInfo.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{booking.contactInfo.phone}</span>
                          </div>
                        )}
                        {booking.contactInfo.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{booking.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {booking.notes && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span>{" "}
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-gray-100 pt-4 mt-4 flex gap-3">
                    {booking.tenantId?.slug && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(`/salon/${booking.tenantId.slug}`)
                        }
                      >
                        View Business
                      </Button>
                    )}
                    {booking.status === "confirmed" &&
                      new Date(booking.start) > new Date() && (
                        <Button variant="secondary">Reschedule</Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {
          console.log("Gift card created:", giftCard);
        }}
      />
    </div>
  );
}
