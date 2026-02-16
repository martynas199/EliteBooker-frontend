import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Tag,
  Ban,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import toast from "react-hot-toast";
import { confirmDialog } from "../../shared/lib/confirmDialog";
import { promptDialog } from "../../shared/lib/promptDialog";

export default function ClientDetailsPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [tenantClient, setTenantClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [displayName, setDisplayName] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [smsReminders, setSmsReminders] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/clients/${clientId}`);
      setClient(response.data.client);
      setTenantClient(response.data.tenantClient);
      setBookings(response.data.bookings);
      setStats(response.data.stats);

      // Initialize edit form
      setDisplayName(response.data.tenantClient.displayName || "");
      setInternalNotes(response.data.tenantClient.internalNotes || "");
      setTags(response.data.tenantClient.tags || []);
      setSmsReminders(response.data.tenantClient.smsReminders !== false);
      setEmailReminders(response.data.tenantClient.emailReminders !== false);
      setMarketingEmails(response.data.tenantClient.marketingEmails === true);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch(`/admin/clients/${clientId}`, {
        displayName: displayName.trim() || undefined,
        internalNotes: internalNotes.trim() || undefined,
        tags,
        smsReminders,
        emailReminders,
        marketingEmails,
      });
      await fetchClientDetails();
      setEditing(false);
    } catch (error) {
      console.error("Failed to update client:", error);
      toast.error("Failed to update client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBlockClient = async () => {
    const reason = await promptDialog({
      title: "Block client",
      message: "Please provide a reason for blocking this client:",
      placeholder: "Reason for blocking",
      confirmLabel: "Block client",
      cancelLabel: "Cancel",
      required: true,
    });
    if (!reason) return;

    try {
      await api.post(`/admin/clients/${clientId}/block`, { reason });
      await fetchClientDetails();
    } catch (error) {
      console.error("Failed to block client:", error);
      toast.error("Failed to block client. Please try again.");
    }
  };

  const handleUnblockClient = async () => {
    const confirmed = await confirmDialog({
      title: "Unblock client?",
      message: "Are you sure you want to unblock this client?",
      confirmLabel: "Unblock",
      cancelLabel: "Cancel",
      variant: "primary",
    });

    if (!confirmed) return;

    try {
      await api.post(`/admin/clients/${clientId}/unblock`);
      await fetchClientDetails();
    } catch (error) {
      console.error("Failed to unblock client:", error);
      toast.error("Failed to unblock client. Please try again.");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          styles[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!client || !tenantClient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Client not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/admin/clients")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Clients
        </button>

        {/* Client Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
                {client.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {tenantClient.displayName || client.name || "Unknown"}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since {formatDate(client.memberSince)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {tenantClient.isBlocked ? (
                <Button variant="primary" onClick={handleUnblockClient}>
                  <CheckCircle className="h-5 w-5" />
                  Unblock Client
                </Button>
              ) : (
                <Button variant="danger" onClick={handleBlockClient}>
                  <Ban className="h-5 w-5" />
                  Block Client
                </Button>
              )}
            </div>
          </div>

          {tenantClient.isBlocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Blocked:</strong> {tenantClient.blockReason}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Blocked on {formatDate(tenantClient.blockedAt)}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.totalSpent || 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalVisits || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Average Spend</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.averageSpend || 0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Last Visit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(stats?.lastVisit)}
              </p>
            </div>
          </div>

          {/* Edit Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Business-Specific Information
              </h2>
              {!editing && (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <Pencil className="h-5 w-5" />
                  Edit
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name (override)
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={client.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (private)
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    rows={4}
                    placeholder="Add private notes about this client..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <Button variant="secondary" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={smsReminders}
                        onChange={(e) => setSmsReminders(e.target.checked)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        SMS Reminders
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={emailReminders}
                        onChange={(e) => setEmailReminders(e.target.checked)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Email Reminders
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={marketingEmails}
                        onChange={(e) => setMarketingEmails(e.target.checked)}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Marketing Emails
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="brand"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(false);
                      fetchClientDetails();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {tenantClient.displayName && (
                  <div>
                    <p className="text-sm text-gray-600">Display Name</p>
                    <p className="text-gray-900">{tenantClient.displayName}</p>
                  </div>
                )}

                {tenantClient.internalNotes && (
                  <div>
                    <p className="text-sm text-gray-600">Internal Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {tenantClient.internalNotes}
                    </p>
                  </div>
                )}

                {tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tags</p>
                    <div className="flex gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Communication Preferences
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span
                      className={
                        smsReminders ? "text-green-600" : "text-gray-400"
                      }
                    >
                      SMS: {smsReminders ? "On" : "Off"}
                    </span>
                    <span
                      className={
                        emailReminders ? "text-green-600" : "text-gray-400"
                      }
                    >
                      Email: {emailReminders ? "On" : "Off"}
                    </span>
                    <span
                      className={
                        marketingEmails ? "text-green-600" : "text-gray-400"
                      }
                    >
                      Marketing: {marketingEmails ? "On" : "Off"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Booking History ({bookings.length})
          </h2>

          {bookings.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {booking.serviceId?.name || "Service"}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Date & Time</p>
                          <p className="text-gray-900 font-medium">
                            {formatDateTime(booking.start)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Specialist</p>
                          <p className="text-gray-900 font-medium">
                            {booking.specialistId?.name || "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Price</p>
                          <p className="text-gray-900 font-medium">
                            {formatCurrency(booking.price || 0)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-600">Payment</p>
                          <p className="text-gray-900 font-medium">
                            {booking.payment?.status || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
