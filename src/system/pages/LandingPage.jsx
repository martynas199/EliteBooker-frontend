import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import MenuDropdown from "../../shared/components/ui/MenuDropdown";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import DemoRequestModal from "../../shared/components/modals/DemoRequestModal";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
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
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="#1 Appointment Booking Software for Salons & Spas | Free Trial"
        description="Elite Booker is the leading appointment booking software trusted by 500+ salons & spas worldwide. Automate bookings 24/7, reduce no-shows by 70%, accept online payments, manage staff schedules. Start your free trial today - no credit card required. See why businesses rank us #1 for ease of use and customer support."
        keywords="appointment booking software, salon booking system, spa scheduling software, online appointment scheduler, beauty booking app, salon management software, appointment scheduling system, booking software for salons, spa management software, beauty business software, online booking platform, salon software, appointment app, scheduling software, booking management system, free booking software, best salon software, appointment reminder system"
        schema={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Elite Booker",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web, iOS, Android",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "GBP",
            priceValidUntil: "2026-12-31",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "523",
            bestRating: "5",
            worstRating: "1",
          },
          description:
            "Elite Booker is the #1 appointment booking software for salons, spas, and beauty businesses. Automate online bookings 24/7, reduce no-shows by 70%, accept payments, manage staff schedules, and grow your business.",
          screenshot: "https://www.elitebooker.com/screenshots/dashboard.jpg",
          softwareVersion: "2.0",
          releaseNotes:
            "Improved scheduling engine, enhanced mobile app, advanced analytics",
          softwareRequirements:
            "Modern web browser (Chrome, Firefox, Safari, Edge)",
          permissions:
            "Internet access required for real-time booking synchronization",
          keywords:
            "appointment booking, salon software, spa scheduling, beauty business management, online booking system",
          author: {
            "@type": "Organization",
            name: "Elite Booker Ltd",
            url: "https://www.elitebooker.com",
          },
          provider: {
            "@type": "Organization",
            name: "Elite Booker Ltd",
            url: "https://www.elitebooker.com",
            logo: "https://www.elitebooker.com/logo.png",
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+44-800-123-4567",
              contactType: "Customer Support",
              areaServed: "GB",
              availableLanguage: ["English"],
            },
          },
          featureList: [
            "24/7 Online Booking",
            "Automated SMS & Email Reminders",
            "Online Payment Processing",
            "Staff Schedule Management",
            "Customer Management System",
            "Business Analytics & Reporting",
            "Mobile App (iOS & Android)",
            "Multi-Location Support",
            "Gift Card Management",
            "Product Sales Integration",
          ],
        }}
      />

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

              {/* Search Bar - Center */}
              <div className="hidden flex-1 max-w-2xl mx-8">
                <button
                  onClick={() => navigate("/search")}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-full transition-all text-left"
                >
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-gray-500 font-medium">
                    Search for salons, spas, or treatments...
                  </span>
                </button>
              </div>

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
                          "[Mobile Menu] Avatar clicked, navigating to menu"
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 border border-violet-200 mb-8"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                  <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Trusted by 500+ Businesses
                  </span>
                </motion.div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                  <span className="block text-gray-900">Bookings</span>
                  <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  The complete booking solution for salons, spas, and wellness
                  businesses. Accept appointments 24/7, take payments online,
                  and grow your revenue.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/signup")}
                    className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Get Started Free
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
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      document
                        .getElementById("demo")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg border-2 border-gray-200 hover:border-violet-300 hover:bg-gray-50 transition-all shadow-lg"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      Watch Demo
                    </span>
                  </motion.button>
                </div>

                <p className="mt-6 text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No credit card
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Always free
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No hidden fees
                  </span>
                </p>
              </motion.div>

              {/* Right - Dashboard Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 relative"
              >
                {/* Floating Cards */}
                <div className="relative w-full max-w-2xl mx-auto pt-12">
                  {/* Main Dashboard Card */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                            B
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              Elite Booker
                            </div>
                            <div className="text-xs text-gray-500">
                              Dashboard
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-2xl font-bold text-violet-600">
                            247
                          </div>
                          <div className="text-xs text-gray-600">Bookings</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-2xl font-bold text-fuchsia-600">
                            $12.4k
                          </div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="text-2xl font-bold text-cyan-600">
                            4.9★
                          </div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100"></div>
                            <div>
                              <div className="text-sm font-medium">
                                Sarah Johnson
                              </div>
                              <div className="text-xs text-gray-500">
                                Haircut & Style
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Confirmed
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-fuchsia-100"></div>
                            <div>
                              <div className="text-sm font-medium">
                                Mike Chen
                              </div>
                              <div className="text-xs text-gray-500">
                                Massage Therapy
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Pending
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Notification Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
                    transition={{ delay: 0.5, duration: 3, repeat: Infinity }}
                    className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-[200px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          New Booking!
                        </div>
                        <div className="text-xs text-gray-500">
                          Emma booked a facial
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating Stats Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, y: [0, 5, 0] }}
                    transition={{ delay: 0.7, duration: 3, repeat: Infinity }}
                    className="absolute -bottom-20 -left-6 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 max-w-[200px]"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      No-show rate
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ↓ 68%
                    </div>
                    <div className="text-xs text-gray-600">vs. last month</div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Lazy-loaded Features Section */}
        <div ref={featuresObserver.ref}>
          {featuresObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <FeaturesSection />
            </Suspense>
          )}
        </div>

        {/* Lazy-loaded Demo Section */}
        <div ref={demoObserver.ref}>
          {demoObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <DemoSection />
            </Suspense>
          )}
        </div>

        {/* Lazy-loaded Testimonials Section */}
        <div ref={testimonialsObserver.ref}>
          {testimonialsObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <TestimonialsSection />
            </Suspense>
          )}
        </div>

        {/* Lazy-loaded Pricing Section */}
        <div ref={pricingObserver.ref}>
          {pricingObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <PricingSection onShowFeeModal={() => setShowFeeModal(true)} />
            </Suspense>
          )}
        </div>

        {/* Lazy-loaded Final CTA Section */}
        <div ref={ctaObserver.ref}>
          {ctaObserver.inView && (
            <Suspense fallback={<SectionFallback />}>
              <FinalCtaSection onShowDemoModal={() => setShowDemoModal(true)} />
            </Suspense>
          )}
        </div>
      </div>

      {/* Lazy-loaded Booking Fee Modal */}
      {showFeeModal && (
        <Suspense fallback={null}>
          <BookingFeeModal
            isOpen={showFeeModal}
            onClose={() => setShowFeeModal(false)}
          />
        </Suspense>
      )}

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {}}
      />

      {/* Demo Request Modal */}
      <DemoRequestModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </>
  );
}
