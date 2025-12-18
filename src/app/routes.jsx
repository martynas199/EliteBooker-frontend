import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../shared/lib/apiClient";
import logo from "../assets/logo.svg";
import LandingPage from "../system/pages/LandingPage";
import BusinessesLandingPage from "../system/pages/BusinessesLandingPage";
import SearchPage from "../system/pages/SearchPage";
import HelpPage from "../system/pages/HelpPage";
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
import ClientProfilePage from "../tenant/pages/ClientProfilePage";
import ClientAppointmentsPage from "../tenant/pages/ClientAppointmentsPage";
import ClientLoginPage from "../client/pages/LoginPage";
import ClientRegisterPage from "../client/pages/RegisterPage";
import MenuPage from "../system/pages/MenuPage";
import BeauticianSelectionPage from "../tenant/pages/BeauticiansPage";
import ServicesPage from "../tenant/pages/ServicesPage";
import AboutUsPage from "../tenant/pages/AboutUsPage";
import BlogPage from "../tenant/pages/BlogPage";
import BlogPostPage from "../tenant/pages/BlogPostPage";
import TokenDebugPage from "../tenant/pages/TokenDebugPage";
import SalonLandingLuxury from "../tenant/pages/SalonLandingLuxury";
import SeminarsPage from "../tenant/pages/SeminarsPage";
import SeminarDetailPage from "../tenant/pages/SeminarDetailPage";
import SeminarBookingPage from "../tenant/pages/SeminarBookingPage";
import SeminarBookingSuccessPage from "../tenant/pages/SeminarBookingSuccessPage";
import MySeminarsPage from "../tenant/pages/MySeminarsPage";
import { useAuth } from "../shared/contexts/AuthContext";
import { useTenant } from "../shared/contexts/TenantContext";
import { useTenantSettings } from "../shared/hooks/useTenantSettings";
import { SettingsProvider } from "../shared/contexts/SettingsContext";

import AdminLayout from "../admin/layouts/AdminLayout";
import LoadingSpinner from "../shared/components/ui/LoadingSpinner";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import TenantApp from "../tenant/layouts/TenantApp";
import AdminLogin from "../admin/pages/Login";
import ForgotPassword from "../admin/pages/ForgotPassword";
import ResetPassword from "../admin/pages/ResetPassword";
import TenantSignup from "../system/pages/SignupPage";
import SignupSuccessPage from "../system/pages/SignupSuccessPage";
import ScrollToTop from "../shared/components/ScrollToTop";
import CurrencySelector from "../shared/components/CurrencySelector";
import Footer from "../system/components/Footer";
import TenantFooter from "../tenant/components/Footer";
import Navigation from "../tenant/components/Navigation";

// Lazy load admin pages for better performance (code splitting)
const Dashboard = lazy(() => import("../admin/pages/Dashboard"));
const AdminAppointments = lazy(() => import("../admin/pages/Appointments"));
const AdminOrders = lazy(() => import("../admin/pages/Orders"));
const AdminServices = lazy(() => import("../admin/pages/Services"));
const AdminLocations = lazy(() => import("../admin/pages/Locations"));
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
const BrandingSettings = lazy(() => import("../admin/pages/BrandingSettings"));
const Tenants = lazy(() => import("../admin/pages/Tenants"));
const PlatformFeatures = lazy(() => import("../admin/pages/PlatformFeatures"));
const Clients = lazy(() => import("../admin/pages/ClientsPage"));
const ClientDetails = lazy(() => import("../admin/pages/ClientDetailsPage"));
const TakePaymentPage = lazy(() => import("../tenant/pages/TakePaymentPage"));
const Seminars = lazy(() => import("../admin/pages/Seminars"));
const SeminarForm = lazy(() => import("../admin/pages/SeminarForm"));
const SeminarAttendees = lazy(() => import("../admin/pages/SeminarAttendees"));

function CustomerLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on the landing page (no additional path segments)
  const isLandingPage =
    location.pathname.split("/").filter(Boolean).length === 2; // /salon/slug

  return (
    <SettingsProvider>
      <div className="min-h-screen overflow-x-hidden">
        <Navigation />
        <main
          className={
            isLandingPage ? "" : "max-w-6xl mx-auto px-4 py-8 overflow-x-hidden"
          }
        >
          <Routes>
            <Route index element={<SalonLandingLuxury />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="specialists" element={<BeauticianSelectionPage />} />
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
            <Route path="seminars" element={<SeminarsPage />} />
            <Route path="seminars/:slug" element={<SeminarDetailPage />} />
            <Route
              path="seminars/:slug/book"
              element={<SeminarBookingPage />}
            />
            <Route
              path="seminars/booking-success"
              element={<SeminarBookingSuccessPage />}
            />
            <Route path="my-seminars" element={<MySeminarsPage />} />
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
    </SettingsProvider>
  );
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Tenant Signup (public) */}
        <Route path="/signup" element={<TenantSignup />} />
        <Route path="/signup/success" element={<SignupSuccessPage />} />

        {/* OAuth Success Page (must be before CustomerLayout catch-all) */}
        <Route path="/auth/success" element={<AuthSuccessPage />} />

        {/* Global Client Auth (cross-business) */}
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/client/register" element={<ClientRegisterPage />} />
        <Route path="/client/profile" element={<ClientProfilePage />} />
        <Route
          path="/client/appointments"
          element={<ClientAppointmentsPage />}
        />

        {/* Mobile Menu */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Search Page */}
        <Route path="/search" element={<SearchPage />} />

        {/* Browse Businesses */}
        <Route path="/business" element={<LandingPage />} />

        {/* Platform marketing/landing page - Main route until search is fully developed */}
        <Route path="/" element={<LandingPage />} />

        {/* Help & Support */}
        <Route path="/help" element={<HelpPage />} />

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
            path="locations"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <AdminLocations />
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
            path="clients"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Clients />
              </Suspense>
            }
          />
          <Route
            path="clients/:clientId"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <ClientDetails />
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
            path="platform-features"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <PlatformFeatures />
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
          <Route
            path="take-payment"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <TakePaymentPage />
              </Suspense>
            }
          />
          <Route
            path="seminars"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <Seminars />
              </Suspense>
            }
          />
          <Route
            path="seminars/create"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <SeminarForm />
              </Suspense>
            }
          />
          <Route
            path="seminars/:id/edit"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <SeminarForm />
              </Suspense>
            }
          />
          <Route
            path="seminars/:id/attendees"
            element={
              <Suspense fallback={<LoadingSpinner center size="lg" />}>
                <SeminarAttendees />
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
