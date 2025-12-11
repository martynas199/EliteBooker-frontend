import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Download,
  Trash2,
  Pencil,
  Store,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import Button from "../../shared/components/ui/Button";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useClientAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get the business slug from URL state if available
  const fromBusiness = location.state?.fromBusiness;
  const [businessName, setBusinessName] = useState(null);

  // Edit form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [preferredCurrency, setPreferredCurrency] = useState("GBP");

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch business name if we have a slug
  useEffect(() => {
    if (fromBusiness) {
      console.log("Fetching business name for slug:", fromBusiness);
      api
        .get(`/tenants/slug/${fromBusiness}`)
        .then((res) => {
          console.log("Business data:", res.data);
          setBusinessName(res.data.tenant?.name || res.data.name);
        })
        .catch((err) => console.error("Failed to fetch business name:", err));
    }
  }, [fromBusiness]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Profile] Fetching profile data...");
      
      const response = await api.get("/client/profile", {
        timeout: 10000, // 10 second timeout for mobile
      });
      
      console.log("[Profile] Response:", response.data);

      // Check if we have the expected data structure
      if (!response.data?.profile) {
        console.error("[Profile] Invalid data structure:", response.data);
        throw new Error("Invalid profile data received");
      }

      setProfile(response.data.profile);

      // Initialize edit form with safe defaults
      const clientProfile = response.data.profile?.profile || {};
      setName(clientProfile?.name || "");
      setPhone(clientProfile?.phone || "");
      setPreferredLanguage(clientProfile?.preferredLanguage || "en");
      setPreferredCurrency(clientProfile?.preferredCurrency || "GBP");

      console.log("[Profile] Profile loaded successfully");
    } catch (error) {
      console.error("[Profile] Failed to fetch:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to load profile";
      setError(errorMessage);

      // If unauthorized, redirect to home
      if (error.response?.status === 401) {
        console.log("[Profile] Unauthorized - redirecting to home");
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch("/client/profile", {
        name: name.trim(),
        phone: phone.trim(),
        preferredLanguage,
        preferredCurrency,
      });
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get("/client/export");
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `my-data-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmEmail = prompt(
      "To delete your account, please enter your email address:"
    );
    if (!confirmEmail) return;

    if (confirmEmail !== profile?.client?.email) {
      alert("Email does not match. Account deletion cancelled.");
      return;
    }

    if (
      !confirm(
        "Are you absolutely sure? This will permanently delete all your data and cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete("/client/account", {
        data: { confirmEmail },
      });
      alert("Your account has been deleted. You will now be logged out.");
      // Clear token and redirect
      localStorage.removeItem("clientToken");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const handleLogout = async () => {
    console.log("[Profile] Logout button clicked");
    try {
      await logout();
      console.log("[Profile] Logout successful, forcing full app reload...");
      // Clear any session/local storage
      sessionStorage.clear();
      // Force a complete page reload to reset all React state
      window.location.replace("/");
    } catch (error) {
      console.error("[Profile] Logout failed:", error);
      // Force reload anyway
      sessionStorage.clear();
      window.location.replace("/");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
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
      confirmed: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
        icon: CheckCircle,
      },
      pending: {
        bg: "bg-amber-100",
        text: "text-amber-800",
        border: "border-amber-200",
        icon: Clock,
      },
      cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
        icon: XCircle,
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        border: "border-blue-200",
        icon: CheckCircle,
      },
    };

    const style = styles[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200",
    };
    const Icon = style.icon || CheckCircle;

    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}
      >
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile?.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error || "Unable to load profile"}
          </p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Menu - Hidden on mobile */}
      <div className="hidden md:block">
        <ProfileMenu
          client={profile?.profile}
          onLogout={handleLogout}
          variant="sidebar"
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
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                {profile?.profile?.avatar ? (
                  <img
                    src={profile.profile.avatar}
                    alt={profile?.profile?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {profile?.profile?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.profile?.name}
              </h1>
              <p className="text-gray-600 text-sm mt-1">Personal profile</p>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:block mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your account information
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
                  {profile?.profile?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.profile?.name}
                  </h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile?.profile?.email}
                    </div>
                    {profile?.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {profile?.profile?.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member since {formatDate(profile.profile.memberSince)}
                    </div>
                  </div>
                </div>
              </div>

              {!editing && (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <Pencil className="h-5 w-5" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.profile.totalBookings || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Businesses Visited</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.businesses?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(profile.profile.memberSince)}
                </p>
              </div>
            </div>

            {/* Edit Form */}
            {editing && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Edit Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Language
                      </label>
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Currency
                      </label>
                      <select
                        value={preferredCurrency}
                        onChange={(e) => setPreferredCurrency(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="GBP">GBP (£)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
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
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Businesses */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Businesses ({profile.businesses.length})
            </h2>

            {profile.businesses.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                You haven't booked with any businesses yet
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.businesses.map((business, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Store className="h-8 w-8 text-gray-900" />
                      <h3 className="font-semibold text-gray-900">
                        {business?.tenant?.name || "Unknown Business"}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Spent:</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(business?.stats?.totalSpent || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visits:</span>
                        <span className="font-medium text-gray-900">
                          {business?.stats?.totalVisits || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Visit:</span>
                        <span className="font-medium text-gray-900">
                          {business?.stats?.lastVisit
                            ? formatDate(business.stats.lastVisit)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GDPR Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Data & Privacy
            </h2>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={handleExportData}>
                <Download className="h-5 w-5" />
                Export My Data
              </Button>
              <Button variant="danger" onClick={handleDeleteAccount}>
                <Trash2 className="h-5 w-5" />
                Delete Account
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Export all your data in JSON format, or permanently delete your
              account and all associated data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
