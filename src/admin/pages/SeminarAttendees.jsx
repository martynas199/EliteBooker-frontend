import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { SeminarsAPI } from "../../tenant/pages/seminars.api";
import Button from "../../shared/components/ui/Button";

export default function SeminarAttendees() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seminar, setSeminar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [seminarData, bookingsResponse] = await Promise.all([
        SeminarsAPI.get(id),
        SeminarsAPI.getBookings(id),
      ]);
      setSeminar(seminarData);
      setBookings(bookingsResponse.bookings || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load attendees");
      navigate("/admin/seminars");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSession =
      selectedSession === "all" || booking.sessionId === selectedSession;
    const matchesSearch =
      !searchTerm ||
      booking.attendeeInfo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.attendeeInfo.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSession && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      "Booking Reference",
      "Name",
      "Email",
      "Phone",
      "Session Date",
      "Session Time",
      "Status",
      "Payment Status",
      "Amount",
      "Booked At",
    ];

    const rows = filteredBookings.map((booking) => {
      const session = seminar.sessions.find((s) => s._id === booking.sessionId);
      return [
        booking.bookingReference,
        booking.attendeeInfo.name,
        booking.attendeeInfo.email,
        booking.attendeeInfo.phone || "",
        session ? new Date(session.date).toLocaleDateString() : "",
        session ? `${session.startTime} - ${session.endTime}` : "",
        booking.status,
        booking.payment.status,
        `${seminar.pricing.currency} ${booking.payment.amount}`,
        new Date(booking.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${seminar.title.replace(/\s+/g, "_")}_attendees_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      attended: "bg-blue-100 text-blue-700",
      "no-show": "bg-gray-100 text-gray-700",
    };
    return badges[status] || badges.confirmed;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      refunded: "bg-gray-100 text-gray-700",
      failed: "bg-red-100 text-red-700",
    };
    return badges[status] || badges.pending;
  };

  const getSessionStats = (sessionId) => {
    const sessionBookings = bookings.filter(
      (b) => b.sessionId === sessionId && b.status === "confirmed"
    );
    const session = seminar.sessions.find((s) => s._id === sessionId);
    return {
      confirmed: sessionBookings.length,
      max: session?.maxAttendees || 0,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-3 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <Link
            to="/admin/seminars"
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm mb-1 inline-block"
          >
            ← Back to Seminars
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            {seminar?.title} - Attendees
          </h1>
          <p className="text-gray-600 mt-0.5 text-xs sm:text-sm">
            Manage bookings and attendee information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial text-xs py-1.5 px-2.5 sm:py-2 sm:px-3"
          >
            Export
          </Button>
          <Link
            to={`/admin/seminars/${id}/edit`}
            className="flex-1 sm:flex-initial"
          >
            <Button
              variant="secondary"
              className="w-full text-xs py-1.5 px-2.5 sm:py-2 sm:px-3"
            >
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-[10px] sm:text-sm text-gray-600 leading-tight">
            Total
          </p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">
            {bookings.length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-[10px] sm:text-sm text-gray-600 leading-tight">
            Confirmed
          </p>
          <p className="text-xl sm:text-3xl font-bold text-green-600 mt-0.5 sm:mt-2">
            {bookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-[10px] sm:text-sm text-gray-600 leading-tight">
            Cancelled
          </p>
          <p className="text-xl sm:text-3xl font-bold text-red-600 mt-0.5 sm:mt-2">
            {bookings.filter((b) => b.status === "cancelled").length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-[10px] sm:text-sm text-gray-600 leading-tight">
            Revenue
          </p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-2">
            {seminar.pricing.currency}{" "}
            {bookings
              .filter((b) => b.payment.status === "paid")
              .reduce((sum, b) => sum + b.payment.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Session Overview */}
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
          Session Overview
        </h2>
        <div className="space-y-2.5 sm:space-y-4">
          {seminar.sessions.map((session) => {
            const stats = getSessionStats(session._id);
            const percentage = (stats.confirmed / stats.max) * 100;
            return (
              <div
                key={session._id}
                className="border-b border-gray-200 pb-2.5 last:border-0 last:pb-0"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                  <div>
                    <p className="text-xs sm:text-base font-medium text-gray-900 leading-tight">
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] sm:text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {stats.confirmed} / {stats.max} attendees
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {percentage.toFixed(0)}% full
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div
                    className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4">
          <div>
            <label className="block text-[11px] sm:text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-[11px] sm:text-sm font-medium text-gray-700 mb-1">
              Filter by Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="all">All Sessions</option>
              {seminar.sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {new Date(session.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  - {session.startTime}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <p className="text-gray-500 text-sm sm:text-lg">No bookings found</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden space-y-2.5">
            {filteredBookings.map((booking) => {
              const session = seminar.sessions.find(
                (s) => s._id === booking.sessionId
              );
              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-3"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                        {booking.attendeeInfo.name}
                      </p>
                      <p className="text-[11px] text-gray-600 truncate">
                        {booking.attendeeInfo.email}
                      </p>
                      {booking.attendeeInfo.phone && (
                        <p className="text-[10px] text-gray-500">
                          {booking.attendeeInfo.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 ml-2 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${getStatusBadge(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${getPaymentBadge(
                          booking.payment.status
                        )}`}
                      >
                        {booking.payment.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-600">Ref:</span>
                      <span className="font-medium text-gray-900">
                        {booking.bookingReference}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-600">Session:</span>
                      <span className="font-medium text-gray-900 text-right leading-tight">
                        {session ? (
                          <>
                            {new Date(session.date).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                            <br />
                            {session.startTime} - {session.endTime}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {seminar.pricing.currency} {booking.payment.amount}
                      </span>
                    </div>
                    {booking.payment.refundAmount > 0 && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600">Refund:</span>
                        <span className="font-medium text-red-600">
                          {seminar.pricing.currency}{" "}
                          {booking.payment.refundAmount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => {
                    const session = seminar.sessions.find(
                      (s) => s._id === booking.sessionId
                    );
                    return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.bookingReference}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.attendeeInfo.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.attendeeInfo.email}
                            </p>
                            {booking.attendeeInfo.phone && (
                              <p className="text-xs text-gray-400">
                                {booking.attendeeInfo.phone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session ? (
                            <>
                              {new Date(session.date).toLocaleDateString()}
                              <br />
                              <span className="text-xs">
                                {session.startTime} - {session.endTime}
                              </span>
                            </>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadge(
                              booking.payment.status
                            )}`}
                          >
                            {booking.payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {seminar.pricing.currency} {booking.payment.amount}
                          {booking.payment.refundAmount > 0 && (
                            <div className="text-xs text-gray-500">
                              Refund: {seminar.pricing.currency}{" "}
                              {booking.payment.refundAmount}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
