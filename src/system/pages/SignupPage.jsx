/**
 * Tenant Signup Page
 *
 * Allows new salons to register and create their account
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function TenantSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Business info
    businessName: "",
    email: "",
    phone: "",
    // Address
    street: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    // Admin account
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPasswordConfirm: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.businessName || !formData.email) {
      setError("Please fill in all required fields");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !formData.adminName ||
      !formData.adminEmail ||
      !formData.adminPassword
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.adminPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Clear any existing auth cookies before signup to prevent conflicts
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log("[Signup] Cleared existing auth cookies");

      const response = await api.post("/tenants/create", {
        businessName: formData.businessName,
        name: formData.businessName, // Use businessName for both
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
      });

      if (response.data.success) {
        console.log("[Signup] Success response:", response.data);
        console.log("[Signup] Token:", response.data.token);
        console.log("[Signup] Tenant:", response.data.tenant);
        console.log("[Signup] Admin:", response.data.admin);

        // Token is stored in httpOnly cookie by backend
        console.log("[Signup] Login successful, cookie should be set");

        // Wait a moment to ensure cookie is properly set before redirecting
        // Then use window.location for full page reload
        console.log("[Signup] Waiting for cookie to be set...");
        setTimeout(() => {
          console.log(
            "[Signup] Redirecting to /admin with full page reload..."
          );
          window.location.href = "/admin";
        }, 500);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(100,100,120,0.15),rgba(0,0,0,0))]" />

      {/* Gradient orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Business Account
          </h1>
          <p className="text-gray-300">
            Join our platform and start managing your business online
          </p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div
              className={`h-2 w-16 rounded ${
                step >= 1 ? "bg-brand-400" : "bg-white/20"
              }`}
            />
            <div
              className={`h-2 w-16 rounded ${
                step >= 2 ? "bg-brand-400" : "bg-white/20"
              }`}
            />
          </div>
          <p className="text-sm text-gray-300 mt-2">Step {step} of 2</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Business Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Business Information
              </h2>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Luxury Beauty Salon"
                  required
                />
                <p className="text-sm text-gray-300 mt-1">
                  This will be displayed to your customers
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@yoursalon.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+44 1234 567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 High Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="London"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                    Country
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ireland">Ireland</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Create Admin Account
              </h2>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@yoursalon.com"
                  required
                />
                <p className="text-sm text-gray-300 mt-1">
                  You'll use this to log in
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white drop-shadow-lg mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="adminPasswordConfirm"
                  value={formData.adminPasswordConfirm}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  🎉 What happens next?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ 14-day free trial (no credit card required)</li>
                  <li>✅ Full access to all features</li>
                  <li>✅ Add your team and services</li>
                  <li>✅ Start accepting online bookings</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <a
            href="/admin/login"
            className="text-brand-400 hover:text-brand-300 underline transition-colors"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
