import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../../shared/components/ui/PageTransition";
import Card from "../../shared/components/ui/Card";
import MenuDropdown from "../../shared/components/ui/MenuDropdown";
import ProfileMenu from "../../shared/components/ui/ProfileMenu";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import { motion, useScroll, useTransform } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import eliteLogo from "../../assets/elite.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [activePlan, setActivePlan] = useState("monthly");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);

  // Debug: Log client data when it changes
  useEffect(() => {
    if (client) {
      console.log("[LandingPage] Client data:", client);
      console.log("[LandingPage] Client avatar:", client.avatar);
    }
  }, [client]);

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

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            stroke="url(#grad1)"
            strokeWidth="2"
          />
          <path
            d="M16 2v4M8 2v4M3 10h18"
            stroke="url(#grad1)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="8" cy="14" r="1.5" fill="url(#grad1)" />
          <circle cx="12" cy="14" r="1.5" fill="url(#grad1)" />
          <circle cx="16" cy="14" r="1.5" fill="url(#grad1)" />
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "24/7 Online Booking",
      description:
        "Let clients book appointments anytime, anywhere. Smart calendar prevents double bookings and shows real-time availability.",
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="2"
            stroke="url(#grad2)"
            strokeWidth="2"
          />
          <path d="M2 10h20" stroke="url(#grad2)" strokeWidth="2" />
          <circle cx="6" cy="15" r="1" fill="url(#grad2)" />
          <path
            d="M10 15h8"
            stroke="url(#grad2)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Secure Payments",
      description:
        "Accept deposits, full payments, or pay-at-salon. Powered by Stripe with instant payouts to your bank account.",
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            stroke="url(#grad3)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke="url(#grad3)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="18" cy="6" r="3" fill="url(#grad3)" />
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Automated Reminders",
      description:
        "Reduce no-shows by up to 70%. Automatic email reminders sent to clients before their appointments.",
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
            stroke="url(#grad4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="9" cy="7" r="4" stroke="url(#grad4)" strokeWidth="2" />
          <path
            d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            stroke="url(#grad4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#c026d3" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Staff Management",
      description:
        "Manage your team's schedules, services, and availability. Track individual performance and earnings.",
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <rect
            x="5"
            y="2"
            width="14"
            height="20"
            rx="2"
            stroke="url(#grad5)"
            strokeWidth="2"
          />
          <path
            d="M9 18h6"
            stroke="url(#grad5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="12" cy="7" r="2" stroke="url(#grad5)" strokeWidth="2" />
          <path
            d="M9 12h6M9 15h6"
            stroke="url(#grad5)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Mobile-Friendly",
      description:
        "Beautiful experience on any device. Clients can book from their phone, tablet, or computer.",
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 3v18h18"
            stroke="url(#grad6)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 16l4-4 3 3 6-6"
            stroke="url(#grad6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="16" r="2" fill="url(#grad6)" />
          <circle cx="11" cy="12" r="2" fill="url(#grad6)" />
          <circle cx="14" cy="15" r="2" fill="url(#grad6)" />
          <circle cx="20" cy="9" r="2" fill="url(#grad6)" />
          <defs>
            <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      ),
      title: "Business Insights",
      description:
        "See your revenue, popular services, and busiest times. Make data-driven decisions to grow your business.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Our no-shows dropped by 65% in the first month. The automated reminders are a game-changer for our business.",
      author: "Sarah Thompson",
      role: "Owner, Bella Beauty Salon",
      rating: 5,
    },
    {
      quote:
        "Clients love booking online at 2am. We've gained 30% more appointments since switching to this system.",
      author: "Marcus Chen",
      role: "Manager, Serenity Spa",
      rating: 5,
    },
    {
      quote:
        "The payment system saves us hours every week. Everything is automated and money goes straight to our bank.",
      author: "Emma Rodriguez",
      role: "Owner, Elite Hair Studio",
      rating: 5,
    },
  ];

  const stats = [
    { value: "10,000+", label: "Appointments Booked" },
    { value: "500+", label: "Happy Businesses" },
    { value: "70%", label: "Fewer No-Shows" },
    { value: "24/7", label: "Online Booking" },
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for getting started",
      features: [
        "Unlimited staff members",
        "Unlimited bookings",
        "Online payments",
        "Email confirmations",
        "Mobile-friendly booking page",
        "Customer management",
        "Email support",
      ],
      cta: "Start Free",
      popular: false,
      learnMore: true,
    },
    {
      name: "Professional",
      price: { monthly: 9.99, annual: 8.33 },
      description: "For growing salons and spas",
      features: [
        "Everything in Basic",
        "No booking fees",
        "Advanced analytics",
        "Automated reminders",
        "Custom branding",
        "Staff earnings tracking",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
      learnMore: false,
    },
    {
      name: "Enterprise",
      price: { monthly: 49.99, annual: 41.66 },
      description: "For multi-location businesses",
      features: [
        "Everything in Professional",
        "Multiple locations",
        "E-commerce store",
        "Advanced reporting",
        "Dedicated account manager",
        "Training & onboarding",
        "24/7 phone support",
      ],
      cta: "Start Free Trial",
      popular: false,
      learnMore: false,
    },
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Online Booking System for Salons & Spas | Accept Appointments 24/7"
        description="Complete booking solution for beauty businesses. Take appointments online, accept payments, send reminders, and manage your team. Reduce no-shows by 70%. Start free trial."
        keywords="salon booking system, spa software, online appointment scheduling, beauty salon software, appointment booking, payment processing, booking app"
      />

      <PageTransition 
        className="overflow-x-hidden bg-white"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {/* Navigation Header */}
        <header
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-4">
                <img
                  src={eliteLogo}
                  alt="Elite Logo"
                  className="h-20 sm:h-28 w-auto"
                />
              </div>

              {/* Search Bar - Center */}
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
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
                          className="w-full h-full object-cover"
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
                  className="p-2 text-gray-600 hover:text-violet-600 transition-colors"
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
                          className="w-full h-full object-cover"
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

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to
                <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Run Your Business Smoothly
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed specifically for beauty and wellness
                businesses
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-violet-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-violet-50/30 group">
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section
          id="demo"
          className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  See It In Action
                </h2>
                <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
                  Watch how easy it is to manage appointments, accept payments,
                  and grow your business. Everything you need in one beautiful
                  dashboard.
                </p>
                <ul className="space-y-4">
                  {[
                    "Setup in under 10 minutes",
                    "No credit card required",
                    "It's always free",
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-2xl">✓</span>
                      <span className="text-lg">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/qhlbHP2Q5uY?autoplay=1&mute=1&loop=1&playlist=qhlbHP2Q5uY&controls=1&rel=0"
                    title="Platform Demo"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by Business Owners
              </h2>
              <p className="text-xl text-gray-600">
                Join hundreds of successful businesses already using our
                platform
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full p-8 hover:shadow-xl transition-all">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-2xl">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="border-t pt-4">
                      <p className="font-bold text-gray-900">
                        {testimonial.author}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Choose the plan that fits your business. Upgrade or downgrade
                anytime.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm">
                <button
                  onClick={() => setActivePlan("monthly")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activePlan === "monthly"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePlan("annual")}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activePlan === "annual"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Annual
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <Card
                    className={`h-full p-8 ${
                      plan.popular
                        ? "border-2 border-indigo-500 shadow-xl"
                        : "border border-gray-200"
                    }`}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6 h-12">
                      {plan.description}
                    </p>
                    <div className="mb-6">
                      {plan.price[activePlan] === 0 ? (
                        <span className="text-5xl font-bold text-gray-900">
                          Free
                        </span>
                      ) : (
                        <>
                          <span className="text-5xl font-bold text-gray-900">
                            £{plan.price[activePlan]}
                          </span>
                          <span className="text-gray-600 ml-2">/month</span>
                        </>
                      )}
                      {activePlan === "annual" && plan.price.annual > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Billed £{(plan.price.annual * 12).toFixed(2)} annually
                        </p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/signup")}
                      className={`w-full py-3 rounded-xl font-semibold mb-4 transition-all ${
                        plan.popular
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.cta}
                    </motion.button>
                    {plan.learnMore && (
                      <button
                        onClick={() => setShowFeeModal(true)}
                        className="w-full py-2 mb-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
                      >
                        Learn more about fees
                      </button>
                    )}
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span
                            className={`text-gray-700 ${
                              feature.includes("£0.50") ? "text-sm" : ""
                            }`}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-gray-200 mb-10 leading-relaxed">
                Join 500+ salons and spas already using our platform to manage
                appointments, accept payments, and delight their clients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/contact")}
                  className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:border-white/60 transition-all"
                >
                  Schedule a Demo
                </motion.button>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                Join now - it's free! No credit card required • Setup in minutes
              </p>
            </motion.div>
          </div>
        </section>
      </PageTransition>

      {/* Booking Fee Modal */}
      {showFeeModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setShowFeeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Booking Fee Details
                </h3>
                <p className="text-xs text-gray-600">
                  Fair and transparent pricing
                </p>
              </div>
              <button
                onClick={() => setShowFeeModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 -mt-1"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3 mb-3">
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    £
                  </div>
                  <div className="pt-0.5">
                    <p className="font-bold text-gray-900 text-sm leading-none mb-0.5">
                      £0.50 per booking
                    </p>
                    <p className="text-xs text-gray-600 leading-none">
                      Simple pay-as-you-go
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Paid by the customer
                    </p>
                    <p className="text-xs text-gray-600">
                      The £0.50 fee is paid by the customer when they book
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      No hidden costs
                    </p>
                    <p className="text-xs text-gray-600">
                      You keep 100% of your service price
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-0.5">✓</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Only pay when you get bookings
                    </p>
                    <p className="text-xs text-gray-600">
                      No monthly fees or setup costs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-700 mb-1">
                  <strong>Example:</strong> Customer books £50 haircut → Pays
                  £50.50 total (£50 service + £0.50 booking fee)
                </p>
                <p className="text-xs text-gray-600">
                  * You receive £50 minus{" "}
                  <a
                    href="https://stripe.com/gb/pricing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Stripe processing fees
                  </a>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFeeModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                Close
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowFeeModal(false);
                  navigate("/signup");
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gift Card Modal */}
      <GiftCardModal
        isOpen={showGiftCardModal}
        onClose={() => setShowGiftCardModal(false)}
        onSuccess={(giftCard) => {
          console.log("Gift card created:", giftCard);
        }}
      />
    </>
  );
}
