/**
 * Tenant Signup Page
 *
 * Allows new salons to register and create their account
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import { motion } from "framer-motion";
import eliteLogo from "../../assets/elite.png";

export default function TenantSignup() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState(null);
  const [validatingReferral, setValidatingReferral] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "United Kingdom",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPasswordConfirm: "",
  });

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      const normalizedCode = refCode.toUpperCase().trim();
      setReferralCode(normalizedCode);
      validateReferralCode(normalizedCode);
    }
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateReferralCode = async (code) => {
    if (!code || code.length !== 6) {
      setReferralValid(null);
      return;
    }

    setValidatingReferral(true);
    try {
      const response = await api.post(`/referrals/validate/${code}`);
      setReferralValid(response.data.valid === true);
    } catch {
      setReferralValid(false);
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleReferralCodeChange = (event) => {
    const code = event.target.value.toUpperCase().trim();
    setReferralCode(code);

    if (code.length === 6) {
      validateReferralCode(code);
      return;
    }

    setReferralValid(null);
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
    if (!formData.adminName || !formData.adminEmail || !formData.adminPassword) {
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
    setStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      const response = await api.post("/tenants/create", {
        businessName: formData.businessName,
        name: formData.businessName,
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
        ...(referralCode && referralValid && { referralCode }),
      });

      if (response.data.success) {
        setTimeout(() => {
          window.location.href = "/signup/success";
        }, 500);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";
  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200";
  const sectionCardClass =
    "rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-sm sm:p-5";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f7f3ec] via-[#f6f2ea] to-[#f2ece2]">
      <motion.div
        animate={{ x: [0, 80, 0], y: [0, -80, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[-8rem] top-16 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -100, 0], y: [0, 80, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-8 right-[-8rem] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <div
        className="relative flex min-h-screen items-start justify-center px-4 py-10 sm:items-center sm:py-14"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 2rem)",
          paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white/92 p-4 shadow-2xl backdrop-blur sm:p-8 lg:p-10"
        >
          <div className="mb-8 text-center sm:mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="mb-5 flex justify-center"
            >
              <img src={eliteLogo} alt="Elite Booker" className="h-12 w-auto sm:h-16" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-700 bg-clip-text text-2xl font-bold text-transparent sm:text-4xl"
            >
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mx-auto max-w-xl text-sm text-slate-600 sm:text-base"
            >
              Join beauty businesses building a premium booking experience with
              full revenue control.
            </motion.p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-700 sm:text-xs">
              <span className="rounded-full border border-amber-100 bg-white px-3 py-1">
                No credit card required
              </span>
              <span className="rounded-full border border-amber-100 bg-white px-3 py-1">
                Setup in minutes
              </span>
              <span className="rounded-full border border-amber-100 bg-white px-3 py-1">
                Cancel anytime
              </span>
            </div>

            <div className="mt-7 flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="flex items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
                    step >= 1
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  1
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:inline ${
                    step >= 1 ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  Business
                </span>
              </div>
              <div
                className={`h-1 w-12 rounded sm:w-16 ${
                  step >= 2 ? "bg-slate-900" : "bg-slate-200"
                }`}
              />
              <div className="flex items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
                    step >= 2
                      ? "bg-slate-900 text-white shadow-lg"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  2
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:inline ${
                    step >= 2 ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  Account
                </span>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
            >
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 sm:space-y-6"
              >
                <h2 className="mb-1 text-2xl font-bold text-slate-950">
                  Tell us about your business
                </h2>
                <p className="text-sm text-slate-600">
                  We use this to generate your branded booking workspace.
                </p>

                <div className={sectionCardClass}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Business Details
                  </h3>
                  <div>
                    <label className={labelClass}>Business Name *</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Luxury Beauty Salon"
                      required
                    />
                    <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                      This name appears on your booking page.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Business Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="info@yoursalon.com"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="+44 1234 567890"
                      />
                    </div>
                  </div>
                </div>

                <div className={sectionCardClass}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Business Location
                  </h3>
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="123 High Street"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="London"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="SW1A 1AA"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Country</label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Ireland">Ireland</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-4 font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700"
                >
                  Continue
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 sm:space-y-6"
              >
                <h2 className="mb-1 text-2xl font-bold text-slate-950">
                  Create your admin account
                </h2>
                <p className="text-sm text-slate-600">
                  This account will be the first admin profile for your business.
                </p>

                <div className={sectionCardClass}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Admin Details
                  </h3>
                  <div>
                    <label className={labelClass}>Your Name *</label>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                <div className="mt-4">
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="john@yoursalon.com"
                    required
                  />
                  <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                    You will use this email to log in.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Password *</label>
                    <input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Minimum 8 characters"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Confirm Password *</label>
                    <input
                      type="password"
                      name="adminPasswordConfirm"
                      value={formData.adminPasswordConfirm}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
                </div>

                <div className={sectionCardClass}>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Referral (Optional)
                  </h3>
                  <div>
                    <label className={labelClass}>Referral Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={handleReferralCodeChange}
                        maxLength={6}
                        className={`${inputClass} pr-10 uppercase ${
                          referralValid === true
                            ? "border-emerald-500 bg-emerald-50"
                            : referralValid === false
                              ? "border-red-500 bg-red-50"
                              : ""
                        }`}
                        placeholder="ABC234"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {validatingReferral ? (
                          <svg className="h-5 w-5 animate-spin text-slate-400" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : referralValid === true ? (
                          <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : referralValid === false ? (
                          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                      {referralValid === true
                        ? "Valid referral code"
                        : referralValid === false
                          ? "Invalid referral code"
                          : "Enter a 6-character code if someone referred you"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
                  <h3 className="mb-3 text-base font-bold text-slate-900">What happens next</h3>
                  <ul className="space-y-2.5 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>Start free with no credit card required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>Get immediate access to booking features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>Add team members and services in minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>Start accepting online bookings right away</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="order-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 py-4 font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:flex-1"
                  >
                    {loading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="order-2 w-full rounded-xl border border-slate-200 bg-slate-100 py-4 font-semibold text-slate-700 transition-colors hover:bg-slate-200 sm:order-1 sm:flex-1"
                  >
                    Back
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-center text-sm text-slate-600"
          >
            Already have an account?{" "}
            <a
              href="/admin/login"
              className="font-semibold text-slate-900 underline transition-colors hover:text-slate-700"
            >
              Log in
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

