import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Gift, Loader, ArrowRight } from "lucide-react";

export default function ReferralLoginPage() {
  const navigate = useNavigate();
  const { login } = useClientAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/referral-dashboard");
    } catch (err) {
      console.error("Referral login error:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <Header />

      <main className="relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, -70, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[-8rem] top-10 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -70, 0], y: [0, 80, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-[-3rem] right-[-6rem] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <span className="inline-flex min-h-10 items-center rounded-full border border-amber-200 bg-amber-100/70 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              Referral Partner Access
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Sign in to your referral dashboard
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Track your referral code, business signups, and reward progress in
              one place.
            </p>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-xl sm:p-8"
          >
            <div className="mb-6 flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Welcome back
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  Use the same email and password you registered with.
                </p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="you@example.com"
                  required
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
                  placeholder="Enter your password"
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
                    <Loader className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/join-referral-program"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Join the referral program
                </Link>
              </p>
            </form>
          </motion.section>

          <p className="mt-8 text-center text-sm text-slate-600">
            Are you a business owner?{" "}
            <Link
              to="/signup"
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
            >
              Create a business account
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

