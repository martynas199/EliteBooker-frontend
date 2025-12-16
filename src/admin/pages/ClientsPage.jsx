import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  TrendingUp,
  Star,
  AlertTriangle,
  Sparkles,
  CheckCircle,
  Info,
  X,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Modal from "../../shared/components/ui/Modal";
import {
  SelectDrawer,
  SelectButton,
} from "../../shared/components/ui/SelectDrawer";

export default function ClientsPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("totalSpend");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [segments, setSegments] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Drawer state
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [showSortDrawer, setShowSortDrawer] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchClients();
  }, [searchTerm, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("limit", limit);
      params.append("skip", page * limit);

      const response = await api.get(`/admin/clients?${params.toString()}`);
      setClients(response.data.clients);
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const response = await api.get("/admin/clients/segments/all");
      setSegments(response.data.segments);
    } catch (error) {
      console.error("Failed to fetch segments:", error);
    }
  };

  const fetchClientDetails = async (clientId) => {
    try {
      setLoadingDetails(true);
      const response = await api.get(`/admin/clients/${clientId}`);
      setClientDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClientClick = async (client) => {
    console.log("Client clicked:", client);
    setSelectedClient(client);
    setShowModal(true);
    console.log("Modal should be open, showModal:", true);
    await fetchClientDetails(client.id);
  };

  const closeModal = () => {
    console.log("Closing modal");
    setShowModal(false);
    setSelectedClient(null);
    setClientDetails(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    const now = new Date();
    const visitDate = new Date(date);
    const diffInMs = now - visitDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Handle future dates (appointments scheduled for later)
    if (diffInMs < 0) {
      const futureDays = Math.abs(diffInDays);
      if (futureDays === 0) return "Today";
      if (futureDays === 1) return "Tomorrow";
      return `In ${futureDays} days`;
    }

    // Handle past dates
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      blocked: "bg-red-100 text-red-800 border-red-200",
      vip: "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          styles[status] || styles.active
        }`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset to first page on search
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-black" />
            Clients
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your client relationships and view their booking history
          </p>
        </div>

        {/* Segments Overview */}
        {segments && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">VIP Clients</p>
                  <p className="text-xs text-gray-500">
                    £500+ spent, 10+ visits
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {segments.vip?.count || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">At Risk</p>
                  <p className="text-xs text-gray-500">
                    90+ days inactive, 3+ visits
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {segments.atRisk?.count || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">New Clients</p>
                  <p className="text-xs text-gray-500">1 visit or less</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {segments.new?.count || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600 mb-0.5">Active</p>
                  <p className="text-xs text-gray-500">
                    Visited in last 90 days
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {segments.active?.count || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <SelectButton
                value={statusFilter}
                placeholder="Filter by status"
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "VIP", value: "vip" },
                  { label: "Blocked", value: "blocked" },
                ]}
                onClick={() => setShowStatusDrawer(true)}
              />
              <SelectDrawer
                open={showStatusDrawer}
                onClose={() => setShowStatusDrawer(false)}
                title="Filter by Status"
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "VIP", value: "vip" },
                  { label: "Blocked", value: "blocked" },
                ]}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(0);
                  setShowStatusDrawer(false);
                }}
              />
            </div>

            {/* Sort */}
            <div>
              <SelectButton
                value={sortBy}
                placeholder="Sort clients"
                options={[
                  { label: "Sort by: Spending", value: "totalSpend" },
                  { label: "Sort by: Visits", value: "totalVisits" },
                  { label: "Sort by: Last Visit", value: "lastVisit" },
                  { label: "Sort by: First Visit", value: "firstVisit" },
                ]}
                onClick={() => setShowSortDrawer(true)}
              />
              <SelectDrawer
                open={showSortDrawer}
                onClose={() => setShowSortDrawer(false)}
                title="Sort Clients"
                options={[
                  { label: "Sort by: Spending", value: "totalSpend" },
                  { label: "Sort by: Visits", value: "totalVisits" },
                  { label: "Sort by: Last Visit", value: "lastVisit" },
                  { label: "Sort by: First Visit", value: "firstVisit" },
                ]}
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setPage(0);
                  setShowSortDrawer(false);
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {clients.length} of {total} clients
            </span>
            <button
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              className="text-black hover:underline"
            >
              {sortOrder === "desc" ? "Highest first" : "Lowest first"}
            </button>
          </div>
        </div>

        {/* Client List */}
        {loading && page === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No clients found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Clients will appear here after their first booking"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer relative"
              >
                {/* Status badge - positioned in top right corner */}
                <div className="absolute top-4 right-4">
                  {getStatusBadge(client.status)}
                </div>

                <div className="pr-20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {client.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {client.email || "No email"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {formatCurrency(client.totalSpend || 0)}
                      </span>
                      <span className="text-gray-600">total spent</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">
                        {client.totalVisits || 0}
                      </span>
                      <span className="text-gray-600">visits</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {client.lastVisit &&
                        new Date(client.lastVisit) > new Date()
                          ? "Next visit:"
                          : "Last visit:"}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatDate(client.lastVisit)}
                      </span>
                    </div>
                  </div>

                  {client.tags && client.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {client.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {console.log(
        "Rendering modal, showModal:",
        showModal,
        "selectedClient:",
        selectedClient
      )}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={selectedClient?.name || "Client Details"}
      >
        {console.log(
          "Inside Modal children, loadingDetails:",
          loadingDetails,
          "clientDetails:",
          clientDetails
        )}
        {loadingDetails ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : clientDetails ? (
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Contact Information
              </h3>
              <div className="space-y-2">
                {clientDetails.client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{clientDetails.client.email}</span>
                  </div>
                )}
                {clientDetails.client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{clientDetails.client.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Member since{" "}
                    {new Date(
                      clientDetails.client.memberSince
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(clientDetails.relationship?.totalSpend || 0)}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Visits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clientDetails.relationship?.totalVisits || 0}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Average Spend</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    clientDetails.relationship?.averageSpend || 0
                  )}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Last Visit</p>
                <p className="text-lg font-bold text-gray-900">
                  {clientDetails.relationship?.lastVisit
                    ? new Date(
                        clientDetails.relationship.lastVisit
                      ).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Tags */}
            {clientDetails.relationship?.tags &&
              clientDetails.relationship.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {clientDetails.relationship.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Internal Notes */}
            {clientDetails.relationship?.internalNotes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Internal Notes
                </h3>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                  {clientDetails.relationship.internalNotes}
                </p>
              </div>
            )}

            {/* Recent Bookings */}
            {clientDetails.bookings && clientDetails.bookings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Recent Bookings
                </h3>
                <div className="space-y-2">
                  {clientDetails.bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {booking.serviceId?.name ||
                            booking.service?.name ||
                            "Service"}
                        </p>
                        {(booking.specialistId?.name ||
                          booking.specialist?.name) && (
                          <p className="text-gray-500 text-xs mt-0.5">
                            with{" "}
                            {booking.specialistId?.name ||
                              booking.specialist?.name}
                          </p>
                        )}
                        <p className="text-gray-600 text-xs mt-1">
                          {new Date(booking.start).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(booking.price || 0)}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${
                            booking.status === "confirmed"
                              ? "text-green-600"
                              : booking.status === "cancelled"
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
