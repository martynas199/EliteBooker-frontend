import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectAdmin } from "../../shared/state/authSlice";
import { useAuth } from "../../shared/contexts/AuthContext";
import api from "../../shared/lib/api";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";

export default function TenantSettings() {
  const admin = useSelector(selectAdmin);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "UK",
    // Scheduling settings
    slotDuration: 30,
    bufferTime: 0,
    advanceBookingDays: 30,
    cancellationHours: 24,
    // Payment settings
    platformFeePerBooking: 50,
    platformFeePerProduct: 50,
    currency: "GBP",
  });

  useEffect(() => {
    fetchTenantSettings();
  }, []);

  const fetchTenantSettings = async () => {
    try {
      setLoading(true);

      if (!admin?.tenantId) {
        setError("No tenant ID found. Please log in again.");
        return;
      }

      const response = await api.get(`/tenants/${admin.tenantId}`);
      const data = response.data;
      setTenant(data);

      setFormData({
        businessName: data.businessInfo?.name || "",
        email: data.businessInfo?.email || "",
        phone: data.businessInfo?.phone || "",
        address: data.businessInfo?.address || "",
        city: data.businessInfo?.city || "",
        postalCode: data.businessInfo?.postalCode || "",
        country: data.businessInfo?.country || "UK",
        slotDuration: data.schedulingSettings?.slotDuration || 30,
        bufferTime: data.schedulingSettings?.bufferTime || 0,
        advanceBookingDays: data.schedulingSettings?.advanceBookingDays || 30,
        cancellationHours: data.schedulingSettings?.cancellationHours || 24,
        platformFeePerBooking:
          data.paymentSettings?.platformFeePerBooking || 50,
        platformFeePerProduct:
          data.paymentSettings?.platformFeePerProduct || 50,
        currency: data.paymentSettings?.currency || "GBP",
      });
    } catch (err) {
      console.error("Failed to load tenant settings:", err);
      setError(err.response?.data?.error || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!admin?.tenantId) {
        setError("No tenant ID found. Please log in again.");
        return;
      }

      const tenantId = admin.tenantId;
      await api.put(`/tenants/${tenantId}`, {
        businessInfo: {
          name: formData.businessName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        schedulingSettings: {
          slotDuration: parseInt(formData.slotDuration),
          bufferTime: parseInt(formData.bufferTime),
          advanceBookingDays: parseInt(formData.advanceBookingDays),
          cancellationHours: parseInt(formData.cancellationHours),
        },
        paymentSettings: {
          platformFeePerBooking: parseInt(formData.platformFeePerBooking),
          platformFeePerProduct: parseInt(formData.platformFeePerProduct),
          currency: formData.currency,
        },
      });

      setSuccess("Settings saved successfully!");
      fetchTenantSettings(); // Refresh data
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err.response?.data?.error || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Salon Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your salon's business information, scheduling, and payment
          settings
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Business Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Scheduling Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Scheduling Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot Duration (minutes)
              </label>
              <input
                type="number"
                name="slotDuration"
                value={formData.slotDuration}
                onChange={handleChange}
                min="15"
                max="120"
                step="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buffer Time (minutes)
              </label>
              <input
                type="number"
                name="bufferTime"
                value={formData.bufferTime}
                onChange={handleChange}
                min="0"
                max="60"
                step="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Booking Days
              </label>
              <input
                type="number"
                name="advanceBookingDays"
                value={formData.advanceBookingDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancellation Hours
              </label>
              <input
                type="number"
                name="cancellationHours"
                value={formData.cancellationHours}
                onChange={handleChange}
                min="0"
                max="168"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Fee per Booking (pence)
              </label>
              <input
                type="number"
                name="platformFeePerBooking"
                value={formData.platformFeePerBooking}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: £{(formData.platformFeePerBooking / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Fee per Product (pence)
              </label>
              <input
                type="number"
                name="platformFeePerProduct"
                value={formData.platformFeePerProduct}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: £{(formData.platformFeePerProduct / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 focus:ring-4 focus:ring-brand-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
