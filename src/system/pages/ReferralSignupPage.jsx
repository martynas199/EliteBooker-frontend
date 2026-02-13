import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Gift, TrendingUp, DollarSign, Users, ArrowRight } from "lucide-react";

const benefitItems = [
  {
    icon: Gift,
    title: "Get your unique code",
    description:
      "Receive a personal 6-character referral code to share with businesses.",
  },
  {
    icon: Users,
    title: "Share with businesses",
    description:
      "Refer salons, spas, and beauty professionals that need better booking tools.",
  },
  {
    icon: TrendingUp,
    title: "Track referral progress",
    description:
      "Monitor signups and status changes directly in your referral dashboard.",
  },
  {
    icon: DollarSign,
    title: "Earn rewards",
    description:
      "Qualifying businesses unlock payout rewards once they stay active.",
  },
];

export default function ReferralSignupPage() {
  const navigate = useNavigate();
  const { register } = useClientAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
      );
      navigate("/referral-dashboard");
    } catch (err) {
      console.error("Referral signup error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <SEOHead
        title="Join the Referral Program"
        description="Join the Elite Booker referral program and earn rewards by introducing beauty and wellness businesses."
        canonical="https://www.elitebooker.co.uk/referral-signup"
      />

      <Header />

      <main className="relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -80, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[-9rem] top-16 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -90, 0], y: [0, 70, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-[-2rem] right-[-7rem] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mb-8 max-w-3xl sm:mb-10">
            <span className="inline-flex min-h-10 items-center rounded-full border border-amber-200 bg-amber-100/70 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Referral Program
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Become an Elite Booker referral partner
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Join, get your code, and refer beauty businesses to a premium
              booking platform.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-slate-700/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-slate-50 shadow-xl sm:p-8"
            >
              <h2 className="text-2xl font-bold sm:text-3xl">
                Why join the program
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-100 sm:text-base">
                A simple way to monetize your network in the beauty and wellness
                space.
              </p>

              <div className="mt-6 space-y-4 sm:space-y-5">
                {benefitItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/25 bg-slate-900/35 p-4 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/25 text-white ring-1 ring-white/25">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-slate-100">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/20 bg-slate-900/30 p-4 text-sm leading-relaxed text-slate-50">
                Best suited for influencers, consultants, and anyone connected
                to salons, barbers, or spa businesses.
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl sm:p-8"
            >
              <h2 className="text-2xl font-bold text-slate-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Set up your profile and get instant access to your dashboard.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Jane Smith"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="+44 1234 567890"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Re-enter password"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5" />
                      Join referral program
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/referral-login"
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </motion.section>
          </div>

          <div className="mt-8 text-center text-sm text-slate-600">
            Are you a business owner?{" "}
            <Link
              to="/signup"
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              Create a business account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

