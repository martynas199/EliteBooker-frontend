import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../../shared/lib/apiClient";
import { selectAdmin, updateAdmin } from "../../shared/state/authSlice";
import Button from "../../shared/components/ui/Button";
import Card from "../../shared/components/ui/Card";
import FormField from "../../shared/components/forms/FormField";
import WorkingHoursForm from "../../shared/components/forms/WorkingHoursForm";
import toast from "react-hot-toast";

export default function Profile() {
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Working hours state
  const [specialist, setSpecialist] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [savingWorkingHours, setSavingWorkingHours] = useState(false);

  // Payment settings state
  const [inSalonPayment, setInSalonPayment] = useState(false);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");

      // Fetch specialist data if admin has specialistId (legacy field name)
      if (admin.specialistId) {
        fetchSpecialistData();
      }
    }
  }, [admin]);

  const fetchSpecialistData = async () => {
    try {
      const response = await api.get(`/specialists/${admin.specialistId}`);
      setSpecialist(response.data);
      setWorkingHours(response.data.workingHours || []);
      setInSalonPayment(response.data.inSalonPayment || false);
    } catch (err) {
      console.error("Failed to fetch specialist data:", err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await api.patch("/auth/me", {
        name,
        email,
      });

      if (response.data.success && response.data.admin) {
        // Update Redux store with new admin data
        dispatch(updateAdmin(response.data.admin));
        setProfileSuccess("Profile updated successfully!");

        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Profile update error:", err);

      // Extract error message with details
      let errorMessage = "Failed to update profile. Please try again.";

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;

        // Add details if available
        if (err.response.data.details) {
          // Parse MongoDB duplicate key error for user-friendly message
          if (err.response.data.details.includes("E11000 duplicate key")) {
            if (err.response.data.details.includes("email")) {
              errorMessage =
                "This email address is already in use by another account.";
            } else if (err.response.data.details.includes("phone")) {
              errorMessage =
                "This phone number is already in use by another account.";
            }
          }
        }
      }

      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        setPasswordSuccess("Password changed successfully!");

        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Clear success message after 3 seconds
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Password change error:", err);
      setPasswordError(
        err.response?.data?.error ||
          "Failed to change password. Please try again.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      setSavingWorkingHours(true);
      const loadingToast = toast.loading("Saving working hours...");

      await api.patch("/specialists/me/working-hours", {
        workingHours,
      });

      toast.dismiss(loadingToast);
      toast.success("Working hours updated successfully");

      // Refresh specialist data
      if (admin.specialistId) {
        await fetchSpecialistData();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update working hours",
      );
    } finally {
      setSavingWorkingHours(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      setSavingPaymentSettings(true);
      const loadingToast = toast.loading("Saving payment settings...");

      await api.patch(`/specialists/${admin.specialistId}`, {
        inSalonPayment,
      });

      toast.dismiss(loadingToast);
      toast.success("Payment settings updated successfully");

      // Refresh specialist data
      if (admin.specialistId) {
        await fetchSpecialistData();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to update payment settings",
      );
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <div className="flex items-center gap-6 p-6">
          <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-3xl shadow-sm">
            {getInitials(admin?.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {admin?.name || "Admin User"}
            </h2>
            <p className="text-gray-600 mb-1">{admin?.email}</p>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
                {admin?.role || "administrator"}
              </span>
              {admin?.active !== undefined && (
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                    admin.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      admin.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {admin.active ? "Active" : "Inactive"}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Information Form */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h3>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700">{profileSuccess}</p>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-sm text-red-700">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <FormField label="Full Name" htmlFor="name" required>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                disabled={profileLoading}
              />
            </FormField>

            <FormField label="Email Address" htmlFor="email" required>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
                disabled={profileLoading}
              />
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                loading={profileLoading}
                disabled={profileLoading}
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setName(admin?.name || "");
                  setEmail(admin?.email || "");
                  setProfileError("");
                  setProfileSuccess("");
                }}
                disabled={profileLoading}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Change Password
            </h3>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Password Requirements:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>At least 8 characters long</li>
                <li>Different from your current password</li>
                <li>Consider using a mix of letters, numbers, and symbols</li>
              </ul>
            </div>
          </div>

          {passwordSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="text-sm text-green-700">{passwordSuccess}</p>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <FormField
              label="Current Password"
              htmlFor="currentPassword"
              required
            >
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                  autoComplete="current-password"
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>

            <FormField label="New Password" htmlFor="newPassword" required>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </FormField>

            <FormField
              label="Confirm New Password"
              htmlFor="confirmPassword"
              required
            >
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  required
                  autoComplete="new-password"
                  minLength={8}
                  disabled={passwordLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </FormField>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                variant="brand"
                loading={passwordLoading}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                  setPasswordSuccess("");
                }}
                disabled={passwordLoading}
              >
                Clear
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Payment Settings - Only for specialists */}
      {specialist && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg
                className="w-6 h-6 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">
                Payment Settings
              </h3>
            </div>

            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Configure how you want to receive payments from clients.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={inSalonPayment}
                  onChange={(e) => setInSalonPayment(e.target.checked)}
                  className="mt-1 w-5 h-5 text-brand-600 border-gray-300 rounded focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    Accept Payment in Salon
                  </div>
                  <div className="text-sm text-gray-600">
                    When enabled, clients will only pay a booking fee online (no
                    deposit required). You'll collect the full service payment
                    in person at your salon.
                  </div>
                </div>
              </label>

              {inSalonPayment && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How it works:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Clients pay only the booking fee online</li>
                        <li>No deposit or service payment through Stripe</li>
                        <li>Collect full payment in-salon after service</li>
                        <li>
                          The "Pay Deposit" button won't be shown to clients
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button
                variant="brand"
                onClick={handleSavePaymentSettings}
                loading={savingPaymentSettings}
                disabled={savingPaymentSettings}
              >
                {savingPaymentSettings ? "Saving..." : "Save Payment Settings"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Account Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg
              className="w-6 h-6 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900">
              Account Information
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Account ID</p>
                <p className="text-sm text-gray-500 font-mono">
                  {admin?._id || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Role</p>
                <p className="text-sm text-gray-500 capitalize">
                  {admin?.role || "administrator"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </p>
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg ${
                    admin?.active
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      admin?.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  {admin?.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {admin?.lastLogin && (
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Last Login
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(admin.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
