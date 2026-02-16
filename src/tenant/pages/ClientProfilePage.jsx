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
import StatusBadge from "../../shared/components/ui/StatusBadge";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import toast from "react-hot-toast";
import { confirmDialog } from "../../shared/lib/confirmDialog";
import { promptDialog } from "../../shared/lib/promptDialog";
import TenantAccountLayout from "../components/TenantAccountLayout";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useClientAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Get the business slug from URL state if available
  const fromBusiness = location.state?.fromBusiness;
  const fromSystem = location.state?.from === "/client/profile"; // Came from system login
  const [businessName, setBusinessName] = useState(null);
  const [lastBusinessPath, setLastBusinessPath] = useState(null);

  // Edit form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  const [preferredCurrency, setPreferredCurrency] = useState("GBP");
  const [seminars, setSeminars] = useState([]);
  const [seminarsLoading, setSeminarsLoading] = useState(true);

  // Handle back button - go to system landing if came from system routes
  const handleBack = () => {
    if (lastBusinessPath) {
      navigate(lastBusinessPath);
      return;
    }

    if (fromSystem || window.history.length <= 2) {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSeminars();
  }, []);

  useEffect(() => {
    const storedPath = sessionStorage.getItem("clientAuthRedirectPath");
    const statePath = location.state?.from;
    const candidatePath = statePath || storedPath;

    if (candidatePath && candidatePath.startsWith("/salon/")) {
      setLastBusinessPath(candidatePath);
    }
  }, [location.state]);

  // Fetch business name if we have a slug
  useEffect(() => {
    const slugFromPath =
      lastBusinessPath?.match(/^\/salon\/([^/?#]+)/)?.[1] || null;
    const slugToLoad = fromBusiness || slugFromPath;

    if (slugToLoad) {
      api
        .get(`/tenants/slug/${slugToLoad}`)
        .then((res) => {
          setBusinessName(res.data.tenant?.name || res.data.name);
        })
        .catch((err) => console.error("Failed to fetch business name:", err));
    }
  }, [fromBusiness, lastBusinessPath]);

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

  const fetchSeminars = async () => {
    try {
      setSeminarsLoading(true);
      const response = await api.get("/seminars/bookings/my-bookings");
      setSeminars(response.data || []);
    } catch (error) {
      console.error("Failed to fetch seminars:", error);
      setSeminars([]);
    } finally {
      setSeminarsLoading(false);
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
      toast.error("Failed to update profile. Please try again.");
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
      toast.error("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmEmail = await promptDialog({
      title: "Confirm account deletion",
      message: "To delete your account, please enter your email address:",
      placeholder: "your-email@example.com",
      confirmLabel: "Continue",
      cancelLabel: "Cancel",
      required: true,
    });
    if (!confirmEmail) return;

    if (confirmEmail !== profile?.client?.email) {
      toast.error("Email does not match. Account deletion cancelled.");
      return;
    }

    const confirmed = await confirmDialog({
      title: "Delete account?",
      message:
        "Are you absolutely sure? This will permanently delete all your data and cannot be undone.",
      confirmLabel: "Delete account",
      cancelLabel: "Keep account",
      variant: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete("/client/account", {
        data: { confirmEmail },
      });
      toast.success(
        "Your account has been deleted. You will now be logged out.",
      );
      // Clear token and redirect
      localStorage.removeItem("clientToken");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
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
    <>
      <TenantAccountLayout
        sidebar={
          <ProfileMenu
            client={profile?.profile}
            onLogout={handleLogout}
            variant="sidebar"
            onGiftCardClick={() => setShowGiftCardModal(true)}
          />
        }
        title="Profile"
        description="Manage your account information"
        onBack={handleBack}
      >
        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
                {profile?.profile?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.profile?.name}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 flex-wrap">
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
              <div className="flex items-center gap-2">
                {lastBusinessPath && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(lastBusinessPath)}
                  >
                    <Store className="h-5 w-5" />
                    Back to {businessName || "Business"}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <Pencil className="h-5 w-5" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden mb-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="break-all">{profile?.profile?.email}</span>
              </div>
              {profile?.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{profile?.profile?.phone}</span>
                </div>
              )}
            </div>

            {!editing && (
              <div className="mt-4 flex flex-col gap-2">
                {lastBusinessPath && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(lastBusinessPath)}
                    className="w-full"
                  >
                    <Store className="h-5 w-5" />
                    Back to {businessName || "Business"}
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => setEditing(true)}
                  className="w-full"
                >
                  <Pencil className="h-5 w-5" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Total Bookings
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {profile.profile.totalBookings || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Businesses Visited
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {profile.businesses?.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Member Since
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {formatDate(profile.profile.memberSince)}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    variant="brand"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditing(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* My Seminars */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            My Seminars & Masterclasses ({seminars.length})
          </h2>

          {seminarsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : seminars.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                You haven't registered for any seminars yet
              </p>
              <Button
                variant="brand"
                onClick={() => navigate("../../seminars")}
                className="mx-auto"
              >
                Browse Seminars
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {seminars.map((booking) => (
                <div
                  key={booking._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Seminar Image */}
                    {booking.seminarInfo?.images?.main && (
                      <div className="w-full sm:w-24 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={
                            typeof booking.seminarInfo.images.main === "string"
                              ? booking.seminarInfo.images.main
                              : booking.seminarInfo.images.main.url
                          }
                          alt={booking.seminarInfo.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Seminar Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-base text-gray-900">
                          {booking.seminarInfo?.title || "Seminar"}
                        </h3>
                        <StatusBadge
                          status={booking.status}
                          className="flex-shrink-0"
                        />
                      </div>

                      {/* Session Info */}
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.sessionInfo?.date
                              ? new Date(
                                  booking.sessionInfo.date,
                                ).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Date TBA"}
                          </span>
                        </div>
                        {booking.sessionInfo?.startTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {booking.sessionInfo.startTime} -{" "}
                              {booking.sessionInfo.endTime}
                            </span>
                          </div>
                        )}
                        {booking.attendeeInfo?.name && (
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4" />
                            <span>{booking.attendeeInfo.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Amount Paid */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">
                          Amount Paid:
                        </span>
                        <span className="text-base font-semibold text-gray-900">
                          {formatCurrency(booking.amount / 100)}
                        </span>
                      </div>

                      {/* Actions */}
                      {booking.status === "confirmed" && (
                        <div className="mt-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `../../seminars/${booking.seminarInfo?.slug}`,
                              )
                            }
                            className="w-full sm:w-auto"
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Businesses */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            My Businesses ({profile.businesses.length})
          </h2>

          {profile.businesses.length === 0 ? (
            <p className="text-center text-gray-600 py-8 text-sm sm:text-base">
              You haven't booked with any businesses yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {profile.businesses.map((business, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Store className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                      {business?.tenant?.name || "Unknown Business"}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(business?.stats?.totalSpent || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600">Visits:</span>
                      <span className="font-medium text-gray-900">
                        {business?.stats?.totalVisits || 0}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Data & Privacy
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="secondary"
              onClick={handleExportData}
              className="w-full sm:w-auto"
            >
              <Download className="h-5 w-5" />
              Export My Data
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-3">
            Export all your data in JSON format, or permanently delete your
            account and all associated data.
          </p>
        </div>
      </TenantAccountLayout>

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {}}
      />
    </>
  );
}
