/**
 * Referral Dashboard
 *
 * Dashboard for referral partners to view their code, stats, and referred businesses
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../shared/lib/apiClient";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { motion } from "framer-motion";
import eliteLogo from "../../assets/elite.png";
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
} from "lucide-react";

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

  console.log(
    "[ReferralDashboard MOUNT] Current pathname:",
    window.location.pathname,
  );
  console.log("[ReferralDashboard MOUNT] authLoading:", authLoading);
  console.log("[ReferralDashboard MOUNT] isAuthenticated:", isAuthenticated);
  console.log("[ReferralDashboard MOUNT] client:", client);

  useEffect(() => {
    console.log("[ReferralDashboard] useEffect triggered");
    console.log("[ReferralDashboard] authLoading:", authLoading);
    console.log("[ReferralDashboard] isAuthenticated:", isAuthenticated);
    console.log("[ReferralDashboard] client:", client);
    console.log(
      "[ReferralDashboard] Token in localStorage:",
      localStorage.getItem("clientToken") ? "YES" : "NO",
    );

    // Wait for auth to finish loading before checking authentication
    if (authLoading) {
      console.log("[ReferralDashboard] Still loading auth, waiting...");
      return;
    }

    if (!isAuthenticated) {
      console.log(
        "[ReferralDashboard] Not authenticated, redirecting to login...",
      );
      navigate("/client/login");
      return;
    }

    console.log("[ReferralDashboard] Authenticated! Fetching referral data...");
    fetchReferralData();
  }, [authLoading, isAuthenticated, navigate]);

  const fetchReferralData = async () => {
    console.log("[ReferralDashboard] fetchReferralData called");
    try {
      setLoading(true);

      // Try to get existing referral code
      try {
        console.log("[ReferralDashboard] Fetching referral code...");
        const codeResponse = await api.get("/referrals/my-code");
        console.log(
          "[ReferralDashboard] Referral code response:",
          codeResponse.data,
        );
        setReferralCode(codeResponse.data.data.code);
      } catch (err) {
        // If no code exists (404), that's okay - we'll show generate button
        if (err.response?.status !== 404) {
          console.error("Error fetching referral code:", err);
        }
      }

      // Try to get stats (might fail if no code yet)
      try {
        const statsResponse = await api.get("/referrals/stats");
        console.log("[ReferralDashboard] Stats response:", statsResponse.data);
        if (statsResponse.data.success && statsResponse.data.data?.totalStats) {
          setStats(statsResponse.data.data.totalStats);
        }
      } catch (err) {
        console.log("No stats available yet", err);
      }

      // Try to get dashboard data with referrals list
      try {
        const dashboardResponse = await api.get("/referrals/dashboard");
        console.log(
          "[ReferralDashboard] Dashboard response:",
          dashboardResponse.data,
        );
        if (
          dashboardResponse.data.success &&
          dashboardResponse.data.data.referrals
        ) {
          setReferrals(dashboardResponse.data.data.referrals);
        }
      } catch (err) {
        console.log("No referrals list available yet");
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <img src={eliteLogo} alt="Elite Booker" className="h-8" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {client?.name || client?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Referral Dashboard! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Share your referral code with businesses and earn rewards
          </p>
        </motion.div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          {referralCode ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Your Referral Code
                  </h2>
                  <p className="text-gray-600">
                    Share this code with beauty & wellness businesses
                  </p>
                </div>
                <Gift className="w-12 h-12 text-emerald-600" />
              </div>

              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 text-center mb-6">
                <div className="text-white text-6xl font-bold tracking-widest mb-4">
                  {referralCode}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={copyCode}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all flex items-center gap-2"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                  <button
                    onClick={copyReferralLink}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all flex items-center gap-2 border border-white/40"
                  >
                    <Share2 className="w-5 h-5" />
                    Copy Signup Link
                  </button>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  <strong>Your referral link:</strong>
                  <br />
                  <code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
                    {window.location.origin}/signup?ref={referralCode}
                  </code>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generate Your Referral Code
              </h3>
              <p className="text-gray-600 mb-6">
                Get your unique code to start referring businesses
              </p>
              <button
                onClick={generateReferralCode}
                disabled={generatingCode}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {generatingCode ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Generate My Code
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                {stats.totalReferrals}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Referrals</h3>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">
                {stats.activeReferrals}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Active Businesses</h3>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">
                {stats.pendingReferrals}
              </span>
            </div>
            <h3 className="text-gray-600 font-medium">Pending Signups</h3>
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How to Earn Rewards
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Share Your Code
              </h3>
              <p className="text-sm text-gray-600">
                Give your code to salons, spas, and beauty professionals
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-sm text-gray-600">
                Business creates an account using your referral code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-emerald-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get paid after they stay active for 30 days with at least 1
                appointment
              </p>
            </div>
          </div>
        </motion.div>

        {/* Referred Businesses */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 mt-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Referred Businesses
            </h2>

            {/* Status Legend */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900 mb-2">
                    Status Guide:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">Pending:</span>
                      <span>
                        Waiting for business to stay active for 30 days and
                        complete at least 1 appointment
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Active:</span>
                      <span>Business met the criteria - reward earned!</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">Churned:</span>
                      <span>
                        Business canceled subscription or became inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Business Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Signup Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr
                      key={referral.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {referral.businessName || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {referral.businessEmail || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(referral.signupDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 relative">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              referral.status === "active"
                                ? "bg-green-100 text-green-700"
                                : referral.status === "pending"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {referral.status === "active" && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {referral.status === "pending" && (
                              <Clock className="w-4 h-4" />
                            )}
                            {referral.status === "churned" && (
                              <XCircle className="w-4 h-4" />
                            )}
                            {referral.status.charAt(0).toUpperCase() +
                              referral.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
