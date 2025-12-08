import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../shared/lib/apiClient";
import logo from "../assets/logo.svg";
import LandingPage from "../system/pages/LandingPage";
import SalonDetails from "../tenant/pages/SalonDetails";
import TimeSlots from "../tenant/pages/TimeSlotsPage";
import CheckoutPage from "../tenant/pages/CheckoutPage";
import ConfirmationPage from "../tenant/pages/ConfirmationPage";
import SuccessPage from "../tenant/pages/BookingSuccessPage";
import CancelPage from "../tenant/pages/BookingCancelPage";
import FAQPage from "../tenant/pages/FAQPage";
import CartSidebar from "../tenant/components/CartSidebar";
import { toggleCart } from "../tenant/state/cartSlice";
import ProductsPage from "../tenant/pages/ProductsPage";
import ProductDetailPage from "../tenant/pages/ProductDetailPage";
import ProductCheckoutPage from "../tenant/pages/ProductCheckoutPage";
import OrderSuccessPage from "../tenant/pages/OrderSuccessPage";
import ShopSuccessPage from "../tenant/pages/ShopSuccessPage";
import ShopCancelPage from "../tenant/pages/ShopCancelPage";
import LoginPage from "../tenant/pages/LoginPage";
import RegisterPage from "../tenant/pages/RegisterPage";
import AuthSuccessPage from "../tenant/pages/AuthSuccessPage";
import ProfilePage from "../tenant/pages/ProfilePage";
import ProfileEditPage from "../tenant/pages/ProfileEditPage";
import BeauticianSelectionPage from "../tenant/pages/BeauticiansPage";
import ServicesPage from "../tenant/pages/ServicesPage";
import AboutUsPage from "../tenant/pages/AboutUsPage";
import BlogPage from "../tenant/pages/BlogPage";
import BlogPostPage from "../tenant/pages/BlogPostPage";
import TokenDebugPage from "../tenant/pages/TokenDebugPage";
import SalonLandingLuxury from "../tenant/pages/SalonLandingLuxury";
import { useAuth } from "../shared/contexts/AuthContext";
import { useTenant } from "../shared/contexts/TenantContext";

import AdminLayout from "../admin/layouts/AdminLayout";
import LoadingSpinner from "../shared/components/ui/LoadingSpinner";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import TenantApp from "../tenant/layouts/TenantApp";
import AdminLogin from "../admin/pages/Login";
import ForgotPassword from "../admin/pages/ForgotPassword";
import ResetPassword from "../admin/pages/ResetPassword";
import TenantSignup from "../system/pages/SignupPage";
import ScrollToTop from "../shared/components/ScrollToTop";
import CurrencySelector from "../shared/components/CurrencySelector";
import Footer from "../system/components/Footer";
import TenantFooter from "../tenant/components/Footer";

// Lazy load admin pages for better performance (code splitting)
const Dashboard = lazy(() => import("../admin/pages/Dashboard"));
const AdminAppointments = lazy(() => import("../admin/pages/Appointments"));
const AdminOrders = lazy(() => import("../admin/pages/Orders"));
const AdminServices = lazy(() => import("../admin/pages/Services"));
const AdminStaff = lazy(() => import("../admin/pages/Staff"));
const WorkingHoursCalendar = lazy(() =>
  import("../admin/pages/WorkingHoursCalendar")
);
const Settings = lazy(() => import("../admin/pages/Settings"));
const Revenue = lazy(() => import("../admin/pages/Revenue"));
const ProfitAnalytics = lazy(() => import("../admin/pages/ProfitAnalytics"));
const Profile = lazy(() => import("../admin/pages/Profile"));
const CancellationPolicy = lazy(() =>
  import("../admin/pages/CancellationPolicy")
);
const TimeOff = lazy(() => import("../admin/pages/TimeOff"));
const HeroSections = lazy(() => import("../admin/pages/HeroSections"));
const AboutUsManagement = lazy(() =>
  import("../admin/pages/AboutUsManagement")
);
const Products = lazy(() => import("../admin/pages/Products"));
const ProductsHero = lazy(() => import("../admin/pages/ProductsHero"));
const AdminBeauticianLink = lazy(() =>
  import("../admin/pages/AdminBeauticianLink")
);
const StripeConnect = lazy(() => import("../admin/pages/StripeConnect"));
const Subscription = lazy(() => import("../admin/pages/Subscription"));
const OnboardingComplete = lazy(() =>
  import("../admin/pages/OnboardingComplete")
);
const ReauthOnboarding = lazy(() => import("../admin/pages/ReauthOnboarding"));
const ShippingRates = lazy(() => import("../admin/pages/ShippingRates"));
const BlogPosts = lazy(() => import("../admin/pages/BlogPosts"));
const TenantSettings = lazy(() => import("../admin/pages/TenantSettings"));
const BrandingSettings = lazy(() => import("../admin/pages/BrandingSettings"));
const Tenants = lazy(() => import("../admin/pages/Tenants"));

function CustomerLayout() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [salonName, setSalonName] = useState("Beauty Salon");
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on the landing page (no additional path segments)
  const isLandingPage =
    location.pathname.split("/").filter(Boolean).length === 2; // /salon/slug

  useEffect(() => {
    // Use tenant name if available, otherwise fetch from API
    if (tenant?.name) {
      setSalonName(tenant.name);
    } else {
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
    }
  }, [tenant]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-black/40 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Left */}
            <Link
              to=""
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 group"
            >
              {tenant?.branding?.logo?.url ? (
                <img
                  src={tenant.branding.logo.url}
                  alt={salonName}
                  className="h-10 w-auto object-contain brightness-0 invert"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-black font-black text-lg group-hover:scale-110 transition-transform shadow-lg shadow-green-400/30">
                    {salonName?.[0]?.toUpperCase() || "B"}
                  </div>
                  <span className="text-2xl font-black text-white group-hover:text-green-400 transition-colors">
                    {salonName}
                  </span>
                </>
              )}
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden md:flex gap-1">
              <Link
                to=""
                className="px-5 py-2.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
              >
                Services
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-400 group-hover:w-3/4 transition-all duration-300" />
              </Link>
              <Link
                to="about"
                className="px-5 py-2.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
              >
                About Us
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-400 group-hover:w-3/4 transition-all duration-300" />
              </Link>
              <Link
                to="salon"
                className="px-5 py-2.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-400 group-hover:w-3/4 transition-all duration-300" />
              </Link>
              <Link
                to="products"
                className="px-5 py-2.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 relative group"
              >
                Shop
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-green-400 group-hover:w-3/4 transition-all duration-300" />
              </Link>
            </nav>

            {/* Right Actions - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={() => setProfileMenuOpen(true)}
                  onMouseLeave={() => setProfileMenuOpen(false)}
                >
                  <button
                    className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-full transition-all"
                    aria-label="Profile"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-black text-sm font-black ring-2 ring-white/20">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </button>

                  {/* Profile Dropdown */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 z-[100] animate-fade-in">
                      <div className="bg-black/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-br from-green-400/10 to-emerald-500/10">
                          <p className="text-sm font-bold text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
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
                          My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-2.5 text-sm font-black text-black bg-green-400 hover:bg-green-300 rounded-full shadow-lg shadow-green-400/30 hover:shadow-xl hover:shadow-green-400/40 transition-all hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-white/10 animate-slide-down">
              <div className="flex flex-col gap-2">
                <Link
                  to=""
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Services
                </Link>
                <Link
                  to="about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  About Us
                </Link>
                <Link
                  to="salon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Contact
                </Link>
                <Link
                  to="products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Shop
                </Link>
                <div className="border-t border-white/10 my-2"></div>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      Profile ({user.name})
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  Admin
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main
        className={
          isLandingPage ? "" : "max-w-6xl mx-auto px-4 py-8 overflow-x-hidden"
        }
      >
        <Routes>
          <Route index element={<SalonLandingLuxury />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="beauticians" element={<BeauticianSelectionPage />} />
          <Route path="times" element={<TimeSlots />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="confirmation" element={<ConfirmationPage />} />
          <Route path="salon" element={<SalonDetails />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="cancel" element={<CancelPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="product-checkout" element={<ProductCheckoutPage />} />
          <Route path="shop/success" element={<ShopSuccessPage />} />
          <Route path="shop/cancel" element={<ShopCancelPage />} />
          <Route
            path="order-success/:orderNumber"
            element={<OrderSuccessPage />}
          />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="token-debug" element={<TokenDebugPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </main>

      {/* Tenant Footer */}
      <TenantFooter />

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Tenant Signup (public) */}
        <Route path="/signup" element={<TenantSignup />} />

        {/* OAuth Success Page (must be before CustomerLayout catch-all) */}
        <Route path="/auth/success" element={<AuthSuccessPage />} />

        {/* Platform marketing/landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Tenant-specific routes with slug parameter */}
        <Route
          path="/salon/:slug/*"
          element={
            <TenantApp>
              <CustomerLayout />
            </TenantApp>
          }
        />

        {/* Admin Login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Password Reset (public) */}
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="appointments"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminAppointments />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminOrders />
              </Suspense>
            }
          />
          <Route
            path="revenue"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Revenue />
              </Suspense>
            }
          />
          <Route
            path="profit-analytics"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ProfitAnalytics />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminServices />
              </Suspense>
            }
          />
          <Route
            path="staff"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminStaff />
              </Suspense>
            }
          />
          <Route
            path="schedule"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <WorkingHoursCalendar />
              </Suspense>
            }
          />
          <Route
            path="timeoff"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <TimeOff />
              </Suspense>
            }
          />
          <Route
            path="hero-sections"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <HeroSections />
              </Suspense>
            }
          />
          <Route
            path="about-us"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AboutUsManagement />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Products />
              </Suspense>
            }
          />
          <Route
            path="products-hero"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ProductsHero />
              </Suspense>
            }
          />
          <Route
            path="admin-links"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminBeauticianLink />
              </Suspense>
            }
          />
          <Route
            path="stripe-connect"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <StripeConnect />
              </Suspense>
            }
          />
          <Route
            path="subscription"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Subscription />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="settings/onboarding-complete"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <OnboardingComplete />
              </Suspense>
            }
          />
          <Route
            path="settings/reauth"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ReauthOnboarding />
              </Suspense>
            }
          />
          <Route
            path="shipping-rates"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ShippingRates />
              </Suspense>
            }
          />
          <Route
            path="blog-posts"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <BlogPosts />
              </Suspense>
            }
          />
          <Route
            path="tenant-settings"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <TenantSettings />
              </Suspense>
            }
          />
          <Route
            path="branding"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <BrandingSettings />
              </Suspense>
            }
          />
          <Route
            path="tenants"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Tenants />
              </Suspense>
            }
          />
          <Route
            path="cancellation"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <CancellationPolicy />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Profile />
              </Suspense>
            }
          />
        </Route>

        {/* Customer Routes */}
        <Route path="*" element={<CustomerLayout />} />
      </Routes>
    </>
  );
}
