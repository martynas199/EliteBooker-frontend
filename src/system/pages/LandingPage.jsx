import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import MenuDropdown from "../../shared/components/ui/MenuDropdown";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import DemoRequestModal from "../../shared/components/modals/DemoRequestModal";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import OrganizationSchema from "../../shared/components/Schema/OrganizationSchema";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { useInViewOnce } from "../../shared/hooks/useInViewOnce";
import { stats } from "./landing/landingData";
import eliteLogo from "../../assets/elite.png";

// Lazy load below-the-fold sections
const FeaturesSection = lazy(() => import("./landing/FeaturesSection"));
const DemoSection = lazy(() => import("./landing/DemoSection"));
const TestimonialsSection = lazy(() => import("./landing/TestimonialsSection"));
const PricingSection = lazy(() => import("./landing/PricingSection"));
const FinalCtaSection = lazy(() => import("./landing/FinalCtaSection"));
const BookingFeeModal = lazy(() => import("./landing/BookingFeeModal"));

// Lightweight loading fallback
const SectionFallback = () => (
  <div className="py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
  </div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  // IntersectionObserver hooks for lazy rendering sections
  const featuresObserver = useInViewOnce({ rootMargin: "200px" });
  const demoObserver = useInViewOnce({ rootMargin: "200px" });
  const testimonialsObserver = useInViewOnce({ rootMargin: "200px" });
  const pricingObserver = useInViewOnce({ rootMargin: "200px" });
  const ctaObserver = useInViewOnce({ rootMargin: "200px" });

  // Handle login - check if already authenticated
  const handleLogin = () => {
    if (isAuthenticated) {
      // Already logged in, go to profile
      navigate("/client/profile");
    } else {
      // Not logged in, go to login page
      navigate("/client/login");
    }
  };

  // Menu dropdown configuration - changes based on auth status
  const customerLinks = isAuthenticated
    ? [
        // When logged in, show profile-related menu items
        {
          label: client?.name || "My Profile",
          onClick: () => navigate("/client/profile"),
          primary: true,
        },
        {
          label: "My Bookings",
          onClick: () => navigate("/client/profile"),
        },
        {
          label: "Settings",
          onClick: () => navigate("/client/profile"),
        },
        {
          label: "Log out",
          onClick: async () => {
            await logout();
            setShowMenuDropdown(false);
            window.location.replace("/");
          },
        },
      ]
    : [
        {
          label: "Log in or sign up",
          onClick: handleLogin,
          primary: true,
        },
        {
          label: "Find a business",
          href: "/search",
        },
        {
          label: "Help and support",
          href: "/help",
        },
      ];

  const businessLinks = [
    {
      label: "List your business",
      href: "/signup",
    },
    {
      label: "Business log in",
      href: "/admin/login",
    },
    {
      label: "Join referral program",
      href: "/join-referral-program",
    },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Elite Booker - UK's Leading Booking System for Beauty & Wellness"
        description="Zero commission booking system for UK salons, spas & beauty professionals. Online scheduling, SMS reminders, deposits & POS. From £29/month. Trusted by 500+ UK businesses."
        keywords="online booking system UK, salon booking software UK, appointment scheduling UK, beauty booking app, zero commission booking, salon management software"
      />

      {/* Organization Schema */}
      <OrganizationSchema />

      <div className="bg-white">
        {/* Navigation Header - with safe area for iPhone notch */}
        <header
          className="sticky z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
          style={{
            top: "env(safe-area-inset-top, 0px)",
            paddingTop: "env(safe-area-inset-top, 0px)",
          }}
        >
          <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <img
                  src={eliteLogo}
                  alt="Elite Logo"
                  width="140"
                  height="80"
                  className="h-20 sm:h-28 w-auto"
                  loading="eager"
                  fetchpriority="high"
                />
              </div>

              {/* Center Navigation - Desktop */}
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                {/* Industries Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowIndustriesDropdown(true)}
                  onMouseLeave={() => setShowIndustriesDropdown(false)}
                >
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                    Industries
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showIndustriesDropdown && (
                    <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                      <button
                        onClick={() => navigate("/industries/lash-technicians")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Lash Technicians
                      </button>
                      <button
                        onClick={() => navigate("/industries/hair-salons")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Hair Salons
                      </button>
                      <button
                        onClick={() => navigate("/industries/barbers")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Barbers
                      </button>
                    </div>
                  )}
                </div>

                {/* Compare Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowCompareDropdown(true)}
                  onMouseLeave={() => setShowCompareDropdown(false)}
                >
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                    Compare
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showCompareDropdown && (
                    <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                      <button
                        onClick={() => navigate("/compare/vs-fresha")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        vs Fresha
                      </button>
                      <button
                        onClick={() => navigate("/compare/vs-treatwell")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        vs Treatwell
                      </button>
                    </div>
                  )}
                </div>

                {/* Features Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowFeaturesDropdown(true)}
                  onMouseLeave={() => setShowFeaturesDropdown(false)}
                >
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1">
                    Features
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showFeaturesDropdown && (
                    <div className="absolute left-0 top-full mt-0 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-56 z-50">
                      <button
                        onClick={() => navigate("/features/sms-reminders")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        SMS Reminders
                      </button>
                      <button
                        onClick={() => navigate("/features/no-show-protection")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        No-Show Protection
                      </button>
                      <button
                        onClick={() => navigate("/features/calendar-sync")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Calendar Sync
                      </button>
                      <button
                        onClick={() => navigate("/features/online-booking")}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        Online Booking
                      </button>
                    </div>
                  )}
                </div>

                {/* Pricing Link */}
                <button
                  onClick={() => navigate("/pricing")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hover:bg-gray-50 rounded-lg transition-all"
                >
                  Pricing
                </button>
              </nav>

              {/* Right Actions - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {!isAuthenticated && (
                  /* Not logged in - show log in and list business buttons */
                  <>
                    <button
                      onClick={() => navigate("/signup")}
                      className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-full text-gray-900 hover:border-gray-400 transition-all"
                    >
                      List your business
                    </button>
                  </>
                )}

                {/* Menu Button - shows user avatar when logged in, or Menu button when not */}
                <div className="relative">
                  {isAuthenticated ? (
                    /* Logged in - show profile picture as menu button */
                    <button
                      onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold hover:shadow-lg transition-all overflow-hidden"
                      title={client?.name || "Account"}
                    >
                      {client?.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client?.name || "User"}
                          width="40"
                          height="40"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {client?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </button>
                  ) : (
                    /* Not logged in - show Menu button */
                    <button
                      onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full text-gray-900 hover:border-gray-400 transition-all"
                    >
                      Menu
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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Menu Dropdown - shows ProfileMenu when logged in, MenuDropdown when not */}
                  {isAuthenticated ? (
                    /* Logged in - show profile menu dropdown */
                    showMenuDropdown && (
                      <>
                        <div
                          className="fixed inset-0 z-[998]"
                          onClick={() => setShowMenuDropdown(false)}
                        />
                        <div
                          className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[999]"
                          style={{ minWidth: "320px" }}
                        >
                          <ProfileMenu
                            client={client}
                            onLogout={logout}
                            variant="dropdown"
                            onItemClick={() => setShowMenuDropdown(false)}
                            onGiftCardClick={() => {
                              setShowMenuDropdown(false);
                              setShowGiftCardModal(true);
                            }}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    /* Not logged in - show regular menu dropdown */
                    <MenuDropdown
                      isOpen={showMenuDropdown}
                      onClose={() => setShowMenuDropdown(false)}
                      customerLinks={customerLinks}
                      businessLinks={businessLinks}
                      position="right"
                    />
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-3 relative">
                {/* Search Button - Mobile */}
                <button
                  onClick={() => navigate("/search")}
                  className="hidden p-2 text-gray-600 hover:text-violet-600 transition-colors"
                  aria-label="Search"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>

                {isAuthenticated ? (
                  /* Logged in - only show avatar */
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(
                          "[Mobile Menu] Avatar clicked, navigating to menu",
                        );
                        navigate("/menu");
                      }}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-semibold hover:shadow-lg transition-all overflow-hidden"
                      title={client?.name || "Account"}
                    >
                      {client?.avatar ? (
                        <img
                          src={client.avatar}
                          alt={client?.name || "User"}
                          width="36"
                          height="36"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm">
                          {client?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </button>
                  </>
                ) : (
                  /* Not logged in - show hamburger menu */
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-gray-600 hover:text-violet-600 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <svg
                        className="w-6 h-6"
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
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div
            initial={false}
            animate={
              mobileMenuOpen
                ? { height: "auto", opacity: 1 }
                : { height: 0, opacity: 0 }
            }
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            <nav className="px-4 py-4 space-y-3">
              {/* Page sections */}
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-violet-600 font-medium transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-violet-600 font-medium transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-600 hover:text-violet-600 font-medium transition-colors"
              >
                Testimonials
              </a>

              {/* Customer Links Section */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  For Customers
                </p>
                {customerLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (link.onClick) {
                        link.onClick();
                      } else if (link.href) {
                        navigate(link.href);
                      }
                    }}
                    className={`w-full text-left py-2 font-medium transition-colors ${
                      link.primary
                        ? "text-violet-600 hover:text-violet-700"
                        : "text-gray-600 hover:text-violet-600"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Business Links Section */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  For Businesses
                </p>
                {businessLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(link.href);
                    }}
                    className="w-full text-left py-2 text-gray-600 hover:text-violet-600 font-medium transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        </header>

        {/* Hero Section - Ultra Modern */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Gradient Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Animated Gradient Orbs */}
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, 100, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 sm:pt-20">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-center lg:text-left"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 mb-6"
                >
                  <svg
                    className="w-4 h-4 text-emerald-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-emerald-700">
                    Trusted by 500+ UK Salons & Spas
                  </span>
                </motion.div>

                {/* Main Headline - Problem/Solution */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                  <span className="block text-gray-900">Stop Losing</span>
                  <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    20% Commission
                  </span>
                  <span className="block text-gray-900">to Fresha</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Keep 100% of your earnings. Elite Booker is the UK's only{" "}
                  <span className="text-emerald-600 font-bold">
                    commission-free
                  </span>{" "}
                  booking software.
                </p>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center text-xs font-bold text-violet-700">
                        SJ
                      </div>
                      <div className="w-8 h-8 rounded-full bg-fuchsia-200 border-2 border-white flex items-center justify-center text-xs font-bold text-fuchsia-700">
                        MC
                      </div>
                      <div className="w-8 h-8 rounded-full bg-cyan-200 border-2 border-white flex items-center justify-center text-xs font-bold text-cyan-700">
                        LA
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-lg">★★★★★</span>
                      <span className="text-sm font-semibold text-gray-900">
                        4.9
                      </span>
                      <span className="text-sm text-gray-600">
                        (247 reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Value Prop */}
                <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  <span className="font-semibold text-gray-900">
                    Save £2,500-£12,000/year
                  </span>{" "}
                  vs marketplace platforms. Start with our{" "}
                  <span className="font-semibold text-gray-900">
                    free forever plan
                  </span>
                  , upgrade when you're ready.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/signup")}
                    className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">Start Free Forever</span>
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const element =
                        document.getElementById("pricing-section");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-md hover:shadow-lg"
                  >
                    See Pricing →
                  </motion.button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-3 text-sm text-gray-600 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">No credit card required</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Cancel anytime</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Content - Comparison Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex-1 max-w-lg"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Save Thousands
                    </h3>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                      vs Fresha
                    </span>
                  </div>

                  {/* Fresha */}
                  <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900">Fresha</span>
                      <span className="text-red-600 font-bold">You Lose</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subscription</span>
                        <span className="font-semibold text-gray-900">
                          £179/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">20% Commission</span>
                        <span className="font-semibold text-red-600">
                          £2,400/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Extra Fees</span>
                        <span className="font-semibold text-gray-900">
                          £300/year
                        </span>
                      </div>
                      <div className="border-t-2 border-red-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold">Total Cost</span>
                        <span className="font-bold text-red-600 text-lg">
                          £2,879/year
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Elite Booker */}
                  <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-400">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900">
                        Elite Booker
                      </span>
                      <span className="text-emerald-600 font-bold">
                        You Keep
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free Plan</span>
                        <span className="font-semibold text-emerald-600">
                          £0/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission</span>
                        <span className="font-semibold text-emerald-600">
                          £0 Forever
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Pro Plan (optional)
                        </span>
                        <span className="font-semibold text-gray-900">
                          £120/year
                        </span>
                      </div>
                      <div className="border-t-2 border-emerald-400 pt-2 mt-2 flex justify-between">
                        <span className="font-bold">Total Cost</span>
                        <span className="font-bold text-emerald-600 text-lg">
                          £0-£120/year
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl text-white text-center">
                    <p className="text-sm font-semibold mb-1">YOU SAVE</p>
                    <p className="text-4xl font-extrabold">£2,759+</p>
                    <p className="text-sm text-emerald-100 mt-1">
                      per year vs Fresha
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Based on £12,000 annual revenue.{" "}
                    <button
                      onClick={() => navigate("/compare/vs-fresha")}
                      className="text-violet-600 hover:underline font-semibold"
                    >
                      See full comparison →
                    </button>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section - Quick Wins */}
        <section className="py-16 px-4 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  value: "£0",
                  label: "Commission Forever",
                  color: "text-emerald-600",
                },
                {
                  value: "70%",
                  label: "Fewer No-Shows",
                  color: "text-violet-600",
                },
                {
                  value: "24/7",
                  label: "Online Booking",
                  color: "text-fuchsia-600",
                },
                {
                  value: "500+",
                  label: "UK Businesses",
                  color: "text-cyan-600",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`text-4xl md:text-5xl font-extrabold ${stat.color} mb-2`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section - Pain Points */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Tired of Losing Money to
                <br />
                <span className="text-red-600">Marketplace Platforms?</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Fresha and Treatwell take 20-30% of every booking. That's
                thousands of pounds you'll never see.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: "💸",
                  problem: "20% Commission Fees",
                  description:
                    "Fresha takes £20 from every £100 booking. On £50k revenue, you lose £10,000.",
                  solution:
                    "Elite Booker: £0 commission. Keep 100% of your earnings.",
                },
                {
                  icon: "😤",
                  problem: "Marketplace Competition",
                  description:
                    "Your clients see competitors' ads on your booking page. You're losing bookings.",
                  solution:
                    "Elite Booker: Your own branded booking page. No competitor ads. Ever.",
                },
                {
                  icon: "🚫",
                  problem: "28% No-Show Rate",
                  description:
                    "Ghost bookings cost UK salons £500-£2,000/month in lost revenue.",
                  solution:
                    "Elite Booker: SMS reminders reduce no-shows by 70%. Deposit protection available.",
                },
                {
                  icon: "📱",
                  problem: "Clients Can't Find You",
                  description:
                    "Paper diaries and phone calls = lost bookings at 2am when clients actually book.",
                  solution:
                    "Elite Booker: 24/7 online booking. Accept appointments while you sleep.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.problem}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {item.description}
                  </p>
                  <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <svg
                      className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm font-semibold text-emerald-800">
                      {item.solution}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/signup")}
                className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Start Saving Money Today →
              </button>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-12 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center text-white">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl font-extrabold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-medium text-violet-100">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <div ref={featuresObserver.ref}>
          {featuresObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <FeaturesSection />
            </Suspense>
          )}
        </div>

        {/* Demo Section */}
        <div ref={demoObserver.ref}>
          {demoObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <DemoSection
                onGiftCardClick={() => setShowGiftCardModal(true)}
                onDemoClick={() => setShowDemoModal(true)}
              />
            </Suspense>
          )}
        </div>

        {/* Testimonials Section */}
        <div ref={testimonialsObserver.ref}>
          {testimonialsObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <TestimonialsSection />
            </Suspense>
          )}
        </div>

        {/* Pricing Section */}
        <div ref={pricingObserver.ref} id="pricing-section">
          {pricingObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <PricingSection setShowFeeModal={setShowFeeModal} />
            </Suspense>
          )}
        </div>

        {/* Final CTA Section */}
        <div ref={ctaObserver.ref}>
          {ctaObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <FinalCtaSection />
            </Suspense>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Company */}
              <div>
                <img
                  src={eliteLogo}
                  alt="Elite Booker"
                  className="h-16 mb-4 brightness-0 invert"
                />
                <p className="text-sm text-gray-400">
                  The UK's only commission-free booking software for salons,
                  spas & wellness businesses.
                </p>
              </div>

              {/* Product */}
              <div>
                <h3 className="font-bold text-white mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => navigate("/features/sms-reminders")}
                      className="hover:text-white transition"
                    >
                      SMS Reminders
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/features/online-booking")}
                      className="hover:text-white transition"
                    >
                      Online Booking
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/features/no-show-protection")}
                      className="hover:text-white transition"
                    >
                      No-Show Protection
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/pricing")}
                      className="hover:text-white transition"
                    >
                      Pricing
                    </button>
                  </li>
                </ul>
              </div>

              {/* Compare */}
              <div>
                <h3 className="font-bold text-white mb-4">Compare</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => navigate("/compare/vs-fresha")}
                      className="hover:text-white transition"
                    >
                      vs Fresha
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/compare/vs-treatwell")}
                      className="hover:text-white transition"
                    >
                      vs Treatwell
                    </button>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="font-bold text-white mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button
                      onClick={() => navigate("/help")}
                      className="hover:text-white transition"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/signup")}
                      className="hover:text-white transition"
                    >
                      Sign Up
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate("/admin/login")}
                      className="hover:text-white transition"
                    >
                      Business Login
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
              <p>© 2026 Elite Booker. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        {showGiftCardModal && (
          <Suspense fallback={null}>
            <GiftCardModal onClose={() => setShowGiftCardModal(false)} />
          </Suspense>
        )}

        {showDemoModal && (
          <Suspense fallback={null}>
            <DemoRequestModal onClose={() => setShowDemoModal(false)} />
          </Suspense>
        )}

        {showFeeModal && (
          <Suspense fallback={null}>
            <BookingFeeModal onClose={() => setShowFeeModal(false)} />
          </Suspense>
        )}
      </div>

      <OrganizationSchema />
    </>
  );
}
