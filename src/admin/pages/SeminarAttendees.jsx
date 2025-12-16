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
      const [seminarData, bookingsData] = await Promise.all([
        SeminarsAPI.get(id),
        SeminarsAPI.getBookings(id),
      ]);
      setSeminar(seminarData);
      setBookings(bookingsData);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link
            to="/admin/seminars"
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
          >
            ← Back to Seminars
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {seminar?.title} - Attendees
          </h1>
          <p className="text-gray-600 mt-1">
            Manage bookings and attendee information
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportToCSV}>
            Export to CSV
          </Button>
          <Link to={`/admin/seminars/${id}/edit`}>
            <Button variant="secondary">Edit Seminar</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {bookings.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {bookings.filter((b) => b.status === "confirmed").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {bookings.filter((b) => b.status === "cancelled").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {seminar.pricing.currency}{" "}
            {bookings
              .filter((b) => b.payment.status === "paid")
              .reduce((sum, b) => sum + b.payment.amount, 0)
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Session Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Session Overview
        </h2>
        <div className="space-y-3">
          {seminar.sessions.map((session) => {
            const stats = getSessionStats(session._id);
            const percentage = (stats.confirmed / stats.max) * 100;
            return (
              <div key={session._id} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {stats.confirmed} / {stats.max} attendees
                    </p>
                    <p className="text-xs text-gray-500">
                      {percentage.toFixed(0)}% full
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or booking reference..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sessions</option>
              {seminar.sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {new Date(session.date).toLocaleDateString()} -{" "}
                  {session.startTime}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
      )}
    </div>
  );
}
