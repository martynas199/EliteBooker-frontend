import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  Gift,
  Copy,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Share2,
  LogOut,
  Loader,
  XCircle,
  Info,
  Building2,
} from "lucide-react";

const getStatusMeta = (status) => {
  if (status === "active") {
    return {
      label: "Active",
      badgeClass: "bg-slate-100 text-slate-700",
      icon: CheckCircle,
    };
  }

  if (status === "pending") {
    return {
      label: "Pending",
      badgeClass: "bg-amber-100 text-amber-700",
      icon: Clock,
    };
  }

  return {
    label: "Churned",
    badgeClass: "bg-slate-100 text-slate-700",
    icon: XCircle,
  };
};

const statCards = [
  {
    key: "totalReferrals",
    title: "Total Referrals",
    icon: Users,
    iconClass: "text-slate-700",
  },
  {
    key: "activeReferrals",
    title: "Active Businesses",
    icon: TrendingUp,
    iconClass: "text-emerald-600",
  },
  {
    key: "pendingReferrals",
    title: "Pending Signups",
    icon: Clock,
    iconClass: "text-amber-600",
  },
];

const journeySteps = [
  {
    number: 1,
    title: "Share Your Code",
    description: "Send your code to salons, spas, and beauty professionals.",
  },
  {
    number: 2,
    title: "They Sign Up",
    description: "Businesses create an account using your referral code.",
  },
  {
    number: 3,
    title: "Earn Rewards",
    description:
      "Rewards unlock once they stay active for 30 days with at least one appointment.",
  },
];

export default function ReferralDashboard() {
  const navigate = useNavigate();
  const {
    client,
    logout,
    isAuthenticated,
    loading: authLoading,
  } = useClientAuth();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
  });
  const [copied, setCopied] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);

      try {
        const codeResponse = await api.get("/referrals/my-code");
        setReferralCode(codeResponse.data.data.code);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching referral code:", err);
        }
      }

      try {
        const statsResponse = await api.get("/referrals/stats");
        if (statsResponse.data.success && statsResponse.data.data?.totalStats) {
          setStats(statsResponse.data.data.totalStats);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }

      try {
        const dashboardResponse = await api.get("/referrals/dashboard");
        if (
          dashboardResponse.data.success &&
          dashboardResponse.data.data.referrals
        ) {
          setReferrals(dashboardResponse.data.data.referrals);
        }
      } catch (err) {
        console.error("Error fetching referrals list:", err);
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/referral-login");
      return;
    }

    fetchReferralData();
  }, [authLoading, isAuthenticated, navigate, fetchReferralData]);

  const generateReferralCode = async () => {
    try {
      setGeneratingCode(true);
      const response = await api.post("/referrals/generate");
      setReferralCode(response.data.data.code);
    } catch (err) {
      console.error("Error generating referral code:", err);
      alert("Failed to generate referral code. Please try again.");
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
        <SEOHead
          title="Referral Dashboard"
          description="Track referral code activity and rewards in your Elite Booker dashboard."
          canonical="https://www.elitebooker.co.uk/referral-dashboard"
          noindex
        />

        <Header />
        <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg">
            <Loader className="mx-auto h-8 w-8 animate-spin text-slate-700" />
            <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <SEOHead
        title="Referral Dashboard"
        description="Track referral code activity and rewards in your Elite Booker dashboard."
        canonical="https://www.elitebooker.co.uk/referral-dashboard"
        noindex
      />

      <Header />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Referral Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Welcome back{client?.name ? `, ${client.name}` : ""}
              </h1>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Share your code with businesses and monitor your referral
                rewards in one view.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8"
        >
          {referralCode ? (
            <>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Your referral code
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Share this with beauty and wellness businesses.
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Gift className="h-6 w-6" />
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-center text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Code
                </p>
                <p className="mt-2 break-all text-4xl font-bold tracking-[0.2em] sm:text-5xl">
                  {referralCode}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    {copied ? "Copied" : "Copy code"}
                  </button>
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    <Share2 className="h-5 w-5" />
                    Copy signup link
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Referral link
                </p>
                <code className="mt-2 block overflow-x-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 sm:text-sm">
                  {referralLink}
                </code>
              </div>
            </>
          ) : (
            <div className="py-4 text-center sm:py-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Gift className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                Generate your referral code
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Create your unique code to start referring businesses.
              </p>
              <button
                onClick={generateReferralCode}
                disabled={generatingCode}
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-6 text-sm font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingCode ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Gift className="h-5 w-5" />
                    Generate my code
                  </>
                )}
              </button>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.key}
                className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-7 w-7 ${card.iconClass}`} />
                  <span className="text-3xl font-bold text-slate-900">
                    {stats[card.key]}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">
                  {card.title}
                </p>
              </article>
            );
          })}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.11 }}
          className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journeySteps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {step.number}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </motion.section>

        {referrals.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900">
              Referred businesses
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-700" />
                <div className="space-y-2">
                  <p className="font-semibold text-slate-900">Status guide</p>
                  <p>
                    <span className="font-semibold">Pending:</span> waiting for
                    30 days of active use and at least one appointment.
                  </p>
                  <p>
                    <span className="font-semibold">Active:</span> requirements
                    met, reward eligible.
                  </p>
                  <p>
                    <span className="font-semibold">Churned:</span> business is
                    no longer active.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 md:hidden">
              {referrals.map((referral) => {
                const status = referral.status || "pending";
                const statusMeta = getStatusMeta(status);
                const StatusIcon = statusMeta.icon;

                return (
                  <article
                    key={referral.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {referral.businessName || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {referral.businessEmail || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Signed up: {formatDate(referral.signupDate)}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Business Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Signup Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => {
                    const status = referral.status || "pending";
                    const statusMeta = getStatusMeta(status);
                    const StatusIcon = statusMeta.icon;

                    return (
                      <tr
                        key={referral.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            {referral.businessName || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {referral.businessEmail || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {formatDate(referral.signupDate)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusMeta.badgeClass}`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {statusMeta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}

