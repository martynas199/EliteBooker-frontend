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

// Icon components for cleaner, more professional look
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    home: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    dashboard: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    calendar: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    package: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    chart: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    trending: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    sparkles: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    users: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    clock: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    umbrella: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
    ),
    star: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ),
    info: (
      <svg
        className={className}
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
    ),
    shopping: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    image: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    document: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    settings: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    creditCard: (
      <svg
        className={className}
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
    ),
    diamond: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 2l3 6H9l3-6zM8 8H5l7 14 7-14h-3"
        />
      </svg>
    ),
    link: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    ),
  };
  return icons[name] || icons.dashboard;
};

const items = [
  {
    to: "/",
    labelKey: "backToHome",
    label: "Back to Home",
    iconName: "home",
    external: true,
  },
  { dividerKey: "core", divider: "Core" },
  {
    to: "/admin",
    labelKey: "dashboard",
    label: "Dashboard",
    iconName: "dashboard",
  },
  {
    to: "/admin/appointments",
    labelKey: "appointments",
    label: "Appointments",
    iconName: "calendar",
  },
  {
    to: "/admin/orders",
    labelKey: "orders",
    label: "Orders",
    iconName: "package",
    superAdminOnly: true,
  },
  {
    to: "/admin/revenue",
    labelKey: "revenueAnalytics",
    label: "Revenue Analytics",
    iconName: "chart",
    superAdminOnly: true,
  },
  {
    to: "/admin/profit-analytics",
    labelKey: "profitAnalytics",
    label: "Profit Analytics",
    iconName: "trending",
    superAdminOnly: true,
  },
  { dividerKey: "bookingSetup", divider: "Booking Setup" },
  {
    to: "/admin/services",
    labelKey: "services",
    label: "Services",
    iconName: "sparkles",
  },
  {
    to: "/admin/staff",
    labelKey: "staff",
    label: "Staff",
    iconName: "users",
    superAdminOnly: true,
  },
  {
    to: "/admin/schedule",
    labelKey: "mySchedule",
    label: "My Schedule",
    iconName: "clock",
  },
  {
    to: "/admin/timeoff",
    labelKey: "timeOff",
    label: "Time Off",
    iconName: "umbrella",
  },
  { dividerKey: "websiteContent", divider: "Website Content" },
  {
    to: "/admin/hero-sections",
    labelKey: "heroSections",
    label: "Hero Sections",
    iconName: "star",
    superAdminOnly: true,
  },
  {
    to: "/admin/about-us",
    labelKey: "aboutUsPage",
    label: "About Us Page",
    iconName: "info",
    superAdminOnly: true,
  },
  {
    to: "/admin/products",
    labelKey: "products",
    label: "Products",
    iconName: "shopping",
    superAdminOnly: true,
  },
  {
    to: "/admin/products-hero",
    labelKey: "productsHeroImage",
    label: "Products Hero Image",
    iconName: "image",
    superAdminOnly: true,
  },
  {
    to: "/admin/blog-posts",
    labelKey: "blogPosts",
    label: "Blog Posts",
    iconName: "document",
  },
  {
    to: "/admin/cancellation",
    labelKey: "cancellationPolicy",
    label: "Cancellation Policy",
    iconName: "document",
  },
  { dividerKey: "settings", divider: "Configuration" },
  {
    to: "/admin/settings",
    labelKey: "salonSettings",
    label: "Salon Settings",
    iconName: "settings",
    superAdminOnly: true,
  },
  {
    to: "/admin/stripe-connect",
    labelKey: "stripeConnect",
    label: "Stripe Connect",
    iconName: "creditCard",
  },
  {
    to: "/admin/subscription",
    labelKey: "ecommerceSubscription",
    label: "E-Commerce Subscription",
    iconName: "diamond",
    superAdminOnly: true,
  },
  {
    to: "/admin/admin-links",
    labelKey: "adminLinks",
    label: "Admin Links",
    iconName: "link",
    superAdminOnly: true,
  },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
  const { language, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [salonName, setSalonName] = useState("Beauty Salon");

  // Memoize role check for performance
  const isSuperAdmin = useMemo(
    () => admin?.role === "super_admin",
    [admin?.role]
  );

  // Check if user is salon owner (salon-admin or super_admin)
  const isSalonOwner = useMemo(
    () => admin?.role === "salon-admin" || admin?.role === "super_admin",
    [admin?.role]
  );

  // Filter menu items based on role (memoized for performance)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Always show dividers and external links
      if (item.divider || item.external) return true;

      // If item requires super_admin, show to salon owners (salon-admin or super_admin)
      if (item.superAdminOnly) {
        return isSalonOwner;
      }

      // Show all other items to everyone
      return true;
    });
  }, [isSalonOwner]);

  // Debug logging for menu filtering
  useEffect(() => {
    console.log("[MENU DEBUG] Admin object:", admin);
    console.log("[MENU DEBUG] Admin role:", admin?.role);
    console.log("[MENU DEBUG] Is Super Admin:", isSuperAdmin);
    console.log("[MENU DEBUG] Is Salon Owner:", isSalonOwner);
    console.log("[MENU DEBUG] Total items:", items.length);
    console.log("[MENU DEBUG] Filtered items:", filteredItems.length);
    console.log(
      "[MENU DEBUG] Filtered menu items:",
      filteredItems.filter((item) => !item.divider).map((item) => item.label)
    );
  }, [admin, isSuperAdmin, isSalonOwner, filteredItems]);

  useEffect(() => {
    api
      .get("/salon")
      .then((r) => {
        if (r.data?.name) {
          setSalonName(r.data.name);
        }
      })
      .catch(() => {
        // Keep default name if fetch fails
      });
  }, []);

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
                            : t("beautician", language)}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar tenant={{ name: admin?.name || "Elite Booker" }} />
        </div>

        {/* Mobile Sidebar - Same component with overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <div
          className={`
            fixed lg:hidden top-0 left-0 h-screen z-50
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar tenant={{ name: admin?.name || "Elite Booker" }} />
        </div>

        {/* Main Content */}
        <section className="p-4 lg:p-10 pb-20 lg:pb-10 min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50/50 via-blue-50/10 to-purple-50/10 relative">
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
