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
  RefreshCw,
  FileText,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import RescheduleModal from "../../shared/components/modals/RescheduleModal";

export default function ClientAppointmentsPage() {
  const navigate = useNavigate();
  const { client, logout } = useClientAuth();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [rescheduleMinHours, setRescheduleMinHours] = useState(2); // Default 2 hours
  const [consentRequirements, setConsentRequirements] = useState({}); // Map of serviceId -> requires consent

  useEffect(() => {
    fetchBookings();
    fetchReschedulePolicy();
  }, []);

  // Re-check consent requirements when client is available
  useEffect(() => {
    if (client?.id && bookings.length > 0) {
      checkConsentRequirements(bookings);
    }
  }, [client?.id, bookings.length]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/client/bookings", {
        params: { limit: 100 },
      });
      // Sort bookings by date, soonest first
      const sortedBookings = (response.data.bookings || []).sort((a, b) => {
        return new Date(a.start) - new Date(b.start);
      });

      // Get clientId from the first booking if available
      const clientIdFromBooking = sortedBookings[0]?.clientId;

      // Check which services require consent
      await checkConsentRequirements(sortedBookings, clientIdFromBooking);
      setBookings(sortedBookings);
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

  const fetchReschedulePolicy = async () => {
    try {
      // Fetch salon-wide cancellation policy
      const response = await api.get("/cancellation-policy/salon");
      if (response.data?.rescheduleAllowedHours) {
        setRescheduleMinHours(response.data.rescheduleAllowedHours);
      }
    } catch (error) {
      console.error("Failed to fetch reschedule policy:", error);
      // Keep default of 2 hours if fetch fails
    }
  };

  const checkConsentRequirements = async (bookings, clientId = null) => {
    try {
      // Get unique service IDs and related tenant IDs
      const serviceTenantPairs = Array.from(
        bookings.reduce((acc, booking) => {
          const serviceId = booking.serviceId?._id;
          const tenantId = booking.tenantId?._id || booking.tenantId;

          if (!serviceId) {
            return acc;
          }

          if (!acc.has(serviceId)) {
            acc.set(serviceId, tenantId || null);
          }

          return acc;
        }, new Map())
      );

      // Use clientId from parameter, or from client context, or from first booking
      const effectiveClientId = clientId || client?.id || bookings[0]?.clientId;

      if (serviceTenantPairs.length === 0) return;
      if (!effectiveClientId) return;

      // Check each service for consent requirements
      const requirements = {};
      await Promise.all(
        serviceTenantPairs.map(async ([serviceId, tenantId]) => {
          try {
            const params = {
              clientId: effectiveClientId,
            };

            if (tenantId) {
              params.tenantId = tenantId;
            }

            const response = await api.get(
              `/consent-templates/check-required/${serviceId}`,
              {
                params,
              }
            );
            const data = response.data.data;
            requirements[serviceId] = {
              required: data?.required || false,
              signed: !data?.required || false, // If not required, consider it "complete"
            };
          } catch (error) {
            console.error(
              `Failed to check consent for service ${serviceId}:`,
              error
            );
            requirements[serviceId] = { required: false, signed: false };
          }
        })
      );

      setConsentRequirements(requirements);
    } catch (error) {
      console.error("Failed to check consent requirements:", error);
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

  const handleRescheduleClick = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    // Refresh bookings
    fetchBookings();
  };

  // Check if booking can be rescheduled based on time constraints
  const canReschedule = (booking) => {
    const now = new Date();
    const appointmentStart = new Date(booking.start);
    const hoursUntilAppointment = (appointmentStart - now) / (1000 * 60 * 60);

    return hoursUntilAppointment >= rescheduleMinHours;
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
        bg: "bg-green-50",
        text: "text-green-900",
        border: "border-green-200",
        icon: CheckCircle,
        label: "Confirmed",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-900",
        border: "border-amber-200",
        icon: Clock,
        label: "Pending",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-900",
        border: "border-red-200",
        icon: XCircle,
        label: "Cancelled",
      },
      completed: {
        bg: "bg-blue-50",
        text: "text-blue-900",
        border: "border-blue-200",
        icon: CheckCircle,
        label: "Completed",
      },
    };

    const style = styles[status] || {
      bg: "bg-gray-50",
      text: "text-gray-900",
      border: "border-gray-200",
      icon: AlertCircle,
      label: status,
    };
    const Icon = style.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${style.bg} ${style.text} ${style.border}`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
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
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-8 sm:p-12 text-center shadow-lg">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                No appointments found
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {filter === "all"
                  ? "You haven't made any bookings yet"
                  : `No ${filter} appointments`}
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-6 py-3 text-base font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Find a Business
              </button>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredBookings.map((booking) => {
                const isUpcoming =
                  new Date(booking.start) > new Date() &&
                  booking.status !== "cancelled";
                const needsConsent =
                  booking.serviceId?._id &&
                  consentRequirements[booking.serviceId._id]?.required &&
                  !consentRequirements[booking.serviceId._id]?.signed;

                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Status indicator bar */}
                    <div
                      className={`h-1 ${
                        booking.status === "confirmed"
                          ? "bg-green-500"
                          : booking.status === "pending"
                          ? "bg-amber-500"
                          : booking.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    />

                    <div className="p-5 sm:p-6">
                      {/* Top section - Service name, badges, and price */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                            {booking.serviceId?.name || "Service"}
                          </h3>

                          {/* Status badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(booking.status)}

                            {needsConsent && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white border border-gray-900">
                                <FileText className="h-3.5 w-3.5" />
                                Consent Required
                              </span>
                            )}

                            {booking.serviceId?._id &&
                              consentRequirements[booking.serviceId._id]
                                ?.signed && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-900 border border-green-200">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Consent Signed
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0">
                          <div
                            className="inline-flex flex-col items-end justify-center bg-gray-100 rounded-lg px-3 border border-gray-200"
                            style={{ paddingTop: "6px", paddingBottom: "6px" }}
                          >
                            <p
                              className="font-bold text-gray-900"
                              style={{
                                fontSize: "20px",
                                lineHeight: "1.2",
                                margin: 0,
                              }}
                            >
                              {formatPrice(
                                booking.price || booking.serviceId?.price || 0
                              )}
                            </p>
                            {booking.serviceId?.duration && (
                              <p
                                className="text-xs font-medium text-gray-600"
                                style={{
                                  lineHeight: "1.2",
                                  margin: 0,
                                  marginTop: "2px",
                                }}
                              >
                                {booking.serviceId.duration} min
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="space-y-3 mb-5">
                        {/* Business */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Store className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              Business
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {booking.tenantId?.name || "Business"}
                            </p>
                          </div>
                        </div>

                        {/* Specialist */}
                        {booking.specialistId && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Specialist
                              </p>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {booking.specialistId.name}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Date
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(booking.start)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-500 mb-0.5">
                                Time
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatTime(booking.start)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      {booking.contactInfo &&
                        (booking.contactInfo.phone ||
                          booking.contactInfo.email) && (
                          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-3">
                              {booking.contactInfo.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="font-medium text-gray-900">
                                    {booking.contactInfo.phone}
                                  </span>
                                </div>
                              )}
                              {booking.contactInfo.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="font-medium text-gray-900 truncate">
                                    {booking.contactInfo.email}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Notes */}
                      {booking.notes && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-bold text-blue-900">
                              Note:
                            </span>{" "}
                            {booking.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions - Mobile optimized buttons */}
                      <div className="border-t-2 border-gray-100 pt-4 mt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {booking.tenantId?.slug && (
                            <button
                              onClick={() =>
                                navigate(`/salon/${booking.tenantId.slug}`)
                              }
                              className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-violet-700 bg-violet-50 border-2 border-violet-200 rounded-xl hover:bg-violet-100 hover:border-violet-300 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                            >
                              <Store className="h-4 w-4 mr-2" />
                              View Business
                            </button>
                          )}

                          {booking.status === "confirmed" &&
                            isUpcoming &&
                            canReschedule(booking) && (
                              <button
                                onClick={() => handleRescheduleClick(booking)}
                                className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md touch-manipulation"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reschedule
                              </button>
                            )}

                          {needsConsent && (
                            <button
                              onClick={() =>
                                navigate("/appointments/consent", {
                                  state: {
                                    bookingId: booking._id,
                                    serviceId: booking.serviceId._id,
                                    serviceName: booking.serviceId.name,
                                    businessName: booking.tenantId?.name,
                                    tenantId:
                                      booking.tenantId?._id || booking.tenantId,
                                  },
                                })
                              }
                              className="inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 touch-manipulation sm:col-span-2"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Sign Consent Form
                            </button>
                          )}
                        </div>

                        {/* Show message if appointment is too close to reschedule */}
                        {booking.status === "confirmed" &&
                          isUpcoming &&
                          !canReschedule(booking) && (
                            <div className="mt-3 flex items-start gap-3 text-sm bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 shadow-sm">
                              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-white" />
                              </div>
                              <p className="text-amber-900 font-medium leading-relaxed">
                                This appointment cannot be rescheduled online
                                because it is less than {rescheduleMinHours}{" "}
                                hours away.
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {}}
      />

      {/* Reschedule Modal */}
      {selectedBooking && (
        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
}
