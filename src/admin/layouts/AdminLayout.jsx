import { useState, useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAdmin, clearAuth } from "../../shared/state/authSlice";
import { useAdminLogout } from "../../shared/hooks/useAuthQueries";
import { api } from "../../shared/lib/apiClient";
import toast from "react-hot-toast";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { t } from "../../locales/adminTranslations";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);



  const isSuperAdmin = useMemo(
    () => admin?.role === "super_admin",
    [admin?.role]
  );

  const logoutMutation = useAdminLogout();

  const handleLogout = async () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // Clear auth state and redirect
        dispatch(clearAuth());
        toast.success("Logged out successfully");
        navigate("/admin/login");
      },
      onError: (error) => {
        // Even on error, clear auth and redirect
        dispatch(clearAuth());
        toast.error("Logout failed, but you've been signed out locally");
        navigate("/admin/login");
      },
    });
  };

  // Get admin initials for avatar
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-lg px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          <div>
            <div className="font-bold text-lg">Elite Booker</div>
            <div className="text-xs text-blue-100">
              {t("adminPortal", language)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/30 transition-colors shadow-md"
            aria-label="Toggle language"
          >
            {language}
          </button>

          {/* User Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md hover:bg-white/30 transition-colors"
              aria-label="User menu"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {userDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />

                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-64 sm:w-64 min-w-[16rem] bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {getInitials(admin?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {admin?.name || "Admin User"}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {isSuperAdmin
                            ? t("superAdmin", language)
                            : t("specialist", language)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* My Profile Link */}
                  <Link
                    to="/admin/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
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
                    {t("myProfile", language)}
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("logout", language)}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            tenant={{ name: admin?.name || "Elite Booker" }}
            admin={admin}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Sidebar with Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-white z-50 lg:hidden"
            style={{ 
              display: "flex", 
              flexDirection: "column",
              touchAction: "none"
            }}
            data-mobile-menu
          >
            {/* Mobile Menu Header */}
            <div 
              className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between"
              style={{ flexShrink: 0 }}
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation - Scrollable Area */}
            <div 
              style={{ 
                flex: "1",
                overflow: "auto",
                touchAction: "pan-y",
                WebkitOverflowScrolling: "touch"
              }}
              className="px-6 py-6"
            >
                <Sidebar
                  tenant={{ name: admin?.name || "Elite Booker" }}
                  admin={admin}
                  onLogout={handleLogout}
                  onClose={() => setMobileMenuOpen(false)}
                  isMobile={true}
                />

                {/* Mobile Menu Footer */}
                <div className="border-t border-gray-200 pt-4 mt-8">
                  <Link
                    to="/admin/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors mb-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getInitials(admin?.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        Account Settings
                      </div>
                      <div className="text-xs text-gray-500">
                        Manage your profile
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <section className="p-0 pb-52 lg:pb-10 min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50/50 via-blue-50/10 to-purple-50/10 relative">
          {/* Subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            }}
          ></div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
