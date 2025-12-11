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
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

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
    const diffInDays = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));

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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">VIP Clients</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {segments.vip?.count || 0}
                  </p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {segments.atRisk?.count || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New Clients</p>
                  <p className="text-2xl font-bold text-green-600">
                    {segments.new?.count || 0}
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {segments.active?.count || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
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
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="vip">VIP</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="totalSpend">Sort by: Spending</option>
              <option value="totalVisits">Sort by: Visits</option>
              <option value="lastVisit">Sort by: Last Visit</option>
              <option value="firstVisit">Sort by: First Visit</option>
            </select>
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
                key={client._id}
                onClick={() =>
                  navigate(`/admin/clients/${client.clientId._id}`)
                }
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold">
                        {client.clientId?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {client.displayName ||
                            client.clientId?.name ||
                            "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {client.clientId?.email || "No email"}
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
                        <span className="text-gray-600">Last visit:</span>
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

                  <div className="ml-4">{getStatusBadge(client.status)}</div>
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
    </div>
  );
}
