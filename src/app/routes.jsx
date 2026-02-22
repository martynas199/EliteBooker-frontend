import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../shared/lib/apiClient";
import logo from "../assets/logo.svg";

// Lazy load system pages (landing, search, etc.)
const LandingPage = lazy(() => import("../system/pages/LandingPage"));
const LandingPageRebuild = lazy(
  () => import("../system/pages/LandingPageRebuild"),
);
const BusinessesLandingPage = lazy(() =>
  import("../system/pages/BusinessesLandingPage"),
);
const SearchPage = lazy(() => import("../system/pages/SearchPage"));
const HelpPage = lazy(() => import("../system/pages/HelpPage"));
const PrivacyPage = lazy(() => import("../system/pages/PrivacyPage"));
const TermsPage = lazy(() => import("../system/pages/TermsPage"));
const SecurityPage = lazy(() => import("../system/pages/SecurityPage"));
const MenuPage = lazy(() => import("../system/pages/MenuPage"));
const TenantSignup = lazy(() => import("../system/pages/SignupPage"));
const ReferralSignupPage = lazy(() =>
  import("../system/pages/ReferralSignupPage"),
);
const ReferralLoginPage = lazy(() =>
  import("../system/pages/ReferralLoginPage"),
);
const ReferralDashboard = lazy(() =>
  import("../system/pages/ReferralDashboard"),
);
const SignupSuccessPage = lazy(() =>
  import("../system/pages/SignupSuccessPage"),
);
const NotFoundPage = lazy(() => import("../system/pages/NotFoundPage"));

// Industry landing pages
const LashTechnicians = lazy(() =>
  import("../system/pages/industries/LashTechnicians"),
);
const HairSalons = lazy(() => import("../system/pages/industries/HairSalons"));
const Barbers = lazy(() => import("../system/pages/industries/Barbers"));

// Pricing page
const PricingPage = lazy(() => import("../system/pages/PricingPage"));

// Comparison pages
const ComparePage = lazy(() => import("../system/pages/ComparePage"));
const VsFresha = lazy(() => import("../system/pages/compare/VsFresha"));
const VsTreatwell = lazy(() => import("../system/pages/compare/VsTreatwell"));

// Blog pages
const ReduceSalonNoShows = lazy(() =>
  import("../system/pages/blog/ReduceSalonNoShows"),
);

// Feature pages
const FeaturesPage = lazy(() => import("../system/pages/FeaturesPage"));
const SolutionsPage = lazy(() => import("../system/pages/SolutionsPage"));
const SmsReminders = lazy(() =>
  import("../system/pages/features/SmsReminders"),
);
const NoShowProtection = lazy(() =>
  import("../system/pages/features/NoShowProtection"),
);
const CalendarSync = lazy(() =>
  import("../system/pages/features/CalendarSync"),
);
const OnlineBooking = lazy(() =>
  import("../system/pages/features/OnlineBooking"),
);

// Programmatic local solution pages (400+ city/niche combinations)
const LocalSolutionPage = lazy(() =>
  import("../system/pages/solutions/LocalSolutionPage"),
);

// SEO Tools - Product-Led SEO
const RoiCalculator = lazy(() => import("../system/pages/tools/RoiCalculator"));
const DepositPolicyGenerator = lazy(() =>
  import("../system/pages/tools/DepositPolicyGenerator"),
);
const UkMoneyPage = lazy(() => import("../system/pages/uk/UkMoneyPage"));

// Lazy load tenant pages
const SalonDetails = lazy(() => import("../tenant/pages/SalonDetails"));
const TimeSlots = lazy(() => import("../tenant/pages/TimeSlotsPage"));
const CheckoutPage = lazy(() => import("../tenant/pages/CheckoutPage"));
const ConfirmationPage = lazy(() => import("../tenant/pages/ConfirmationPage"));
const SuccessPage = lazy(() => import("../tenant/pages/BookingSuccessPage"));
const CancelPage = lazy(() => import("../tenant/pages/BookingCancelPage"));
const GiftCardSuccessPage = lazy(() =>
  import("../tenant/pages/GiftCardSuccessPage"),
);
const GiftCardCancelPage = lazy(() =>
  import("../tenant/pages/GiftCardCancelPage"),
);
const FAQPage = lazy(() => import("../tenant/pages/FAQPage"));
const ProductsPage = lazy(() => import("../tenant/pages/ProductsPage"));
const ProductDetailPage = lazy(() =>
  import("../tenant/pages/ProductDetailPage"),
);
const ProductCheckoutPage = lazy(() =>
  import("../tenant/pages/ProductCheckoutPage"),
);
const OrderSuccessPage = lazy(() => import("../tenant/pages/OrderSuccessPage"));
const ShopSuccessPage = lazy(() => import("../tenant/pages/ShopSuccessPage"));
const ShopCancelPage = lazy(() => import("../tenant/pages/ShopCancelPage"));
const LoginPage = lazy(() => import("../tenant/pages/LoginPage"));
const RegisterPage = lazy(() => import("../tenant/pages/RegisterPage"));
const AuthSuccessPage = lazy(() => import("../tenant/pages/AuthSuccessPage"));
const ProfilePage = lazy(() => import("../tenant/pages/ProfilePage"));
const ProfileEditPage = lazy(() => import("../tenant/pages/ProfileEditPage"));
const ClientProfilePage = lazy(() =>
  import("../tenant/pages/ClientProfilePage"),
);
const ClientAppointmentsPage = lazy(() =>
  import("../tenant/pages/ClientAppointmentsPage"),
);
const BeauticianSelectionPage = lazy(() =>
  import("../tenant/pages/BeauticiansPage"),
);
const ServicesPage = lazy(() => import("../tenant/pages/ServicesPage"));
const AboutUsPage = lazy(() => import("../tenant/pages/AboutUsPage"));
const BlogPage = lazy(() => import("../tenant/pages/BlogPage"));
const BlogPostPage = lazy(() => import("../tenant/pages/BlogPostPage"));
const TokenDebugPage = lazy(() => import("../tenant/pages/TokenDebugPage"));
const SalonLandingLuxury = lazy(() =>
  import("../tenant/pages/SalonLandingLuxury"),
);
const SeminarsPage = lazy(() => import("../tenant/pages/SeminarsPage"));
const SeminarDetailPage = lazy(() =>
  import("../tenant/pages/SeminarDetailPage"),
);
const SeminarBookingPage = lazy(() =>
  import("../tenant/pages/SeminarBookingPage"),
);
const SeminarBookingSuccessPage = lazy(() =>
  import("../tenant/pages/SeminarBookingSuccessPage"),
);
const MySeminarsPage = lazy(() => import("../tenant/pages/MySeminarsPage"));

// Lazy load client pages
const ClientLoginPage = lazy(() => import("../client/pages/LoginPage"));
const ClientRegisterPage = lazy(() => import("../client/pages/RegisterPage"));

// Lazy load layouts
const AdminLayout = lazy(() => import("../admin/layouts/AdminLayout"));
const TenantApp = lazy(() => import("../tenant/layouts/TenantApp"));

// Lazy load auth pages
const AdminLogin = lazy(() => import("../admin/pages/Login"));
const ForgotPassword = lazy(() => import("../admin/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../admin/pages/ResetPassword"));

// Eagerly load only essential components
import CartSidebar from "../tenant/components/CartSidebar";
import { toggleCart } from "../tenant/state/cartSlice";
import { useAuth } from "../shared/contexts/AuthContext";
import { useTenant } from "../shared/contexts/TenantContext";
import { useTenantSettings } from "../shared/hooks/useTenantSettings";
import { SettingsProvider } from "../shared/contexts/SettingsContext";
import LoadingSpinner from "../shared/components/ui/LoadingSpinner";
import ProtectedRoute from "../shared/components/ProtectedRoute";
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
  import("../admin/pages/WorkingHoursCalendar"),
);
const Settings = lazy(() => import("../admin/pages/Settings"));
const Revenue = lazy(() => import("../admin/pages/Revenue"));
const ProfitAnalytics = lazy(() => import("../admin/pages/ProfitAnalytics"));
const Profile = lazy(() => import("../admin/pages/Profile"));
const BookingPoliciesPage = lazy(() =>
  import("../admin/pages/BookingPoliciesPage"),
);
const TimeOff = lazy(() => import("../admin/pages/TimeOff"));
const HeroSections = lazy(() => import("../admin/pages/HeroSections"));
const AboutUsManagement = lazy(() =>
  import("../admin/pages/AboutUsManagement"),
);
const Products = lazy(() => import("../admin/pages/Products"));
const ProductsHero = lazy(() => import("../admin/pages/ProductsHero"));
const AdminBeauticianLink = lazy(() =>
  import("../admin/pages/AdminBeauticianLink"),
);
const StripeConnect = lazy(() => import("../admin/pages/StripeConnect"));
const Subscription = lazy(() => import("../admin/pages/Subscription"));
const OnboardingComplete = lazy(() =>
  import("../admin/pages/OnboardingComplete"),
);
const ReauthOnboarding = lazy(() => import("../admin/pages/ReauthOnboarding"));
const ShippingRates = lazy(() => import("../admin/pages/ShippingRates"));
const BlogPosts = lazy(() => import("../admin/pages/BlogPosts"));
const BrandingSettings = lazy(() => import("../admin/pages/BrandingSettings"));
const Tenants = lazy(() => import("../admin/pages/Tenants"));
const TenantDetails = lazy(() => import("../admin/pages/TenantDetails"));
const PlatformFeatures = lazy(() => import("../admin/pages/PlatformFeatures"));
const Clients = lazy(() => import("../admin/pages/ClientsPage"));
const ClientDetails = lazy(() => import("../admin/pages/ClientDetailsPage"));
const AdminWaitlist = lazy(() => import("../admin/pages/Waitlist"));
const TakePaymentPage = lazy(() => import("../tenant/pages/TakePaymentPage"));
const Seminars = lazy(() => import("../admin/pages/Seminars"));
const SeminarForm = lazy(() => import("../admin/pages/SeminarForm"));
const SeminarAttendees = lazy(() => import("../admin/pages/SeminarAttendees"));
const ConsentTemplates = lazy(() => import("../admin/pages/ConsentTemplates"));
const ConsentTemplateBuilder = lazy(() =>
  import("../admin/pages/ConsentTemplateBuilder"),
);
const ConsentTemplateView = lazy(() =>
  import("../admin/pages/ConsentTemplateView"),
);
const ConsentSigningPage = lazy(() =>
  import("../client/pages/ConsentSigningPage"),
);
const ConsentInitiatePage = lazy(() =>
  import("../client/pages/ConsentInitiatePage"),
);
const ClientFormsPage = lazy(() => import("../client/pages/ClientFormsPage"));
const WalletPage = lazy(() => import("../client/pages/WalletPage"));
const FavouritesPage = lazy(() => import("../client/pages/FavouritesPage"));
const OrdersPage = lazy(() => import("../client/pages/OrdersPage"));
const SettingsPage = lazy(() => import("../client/pages/SettingsPage"));
const SendGiftCardPage = lazy(() => import("../client/pages/SendGiftCardPage"));
const DownloadAppPage = lazy(() => import("../client/pages/DownloadAppPage"));
const LanguagePage = lazy(() => import("../client/pages/LanguagePage"));

const ENABLE_TOKEN_DEBUG_ROUTE =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_TOKEN_DEBUG === "true";

function CustomerLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Check if we're on the landing page (no additional path segments)
  const isLandingPage =
    location.pathname.split("/").filter(Boolean).length === 2; // /salon/slug

  // Check if we're on the times page (needs custom width handling)
  const isTimesPage = location.pathname.endsWith("/times");

  return (
    <SettingsProvider>
      <div className="min-h-screen overflow-x-hidden">
        <Navigation />
        <main
          className={
            isLandingPage || isTimesPage
              ? ""
              : "max-w-6xl mx-auto px-4 py-8 overflow-x-hidden"
          }
        >
          <Routes>
            <Route index element={<SalonLandingLuxury />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="specialists" element={<BeauticianSelectionPage />} />
            <Route path="times" element={<TimeSlots />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="confirmation" element={<ConfirmationPage />} />
            <Route path="contact" element={<SalonDetails />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="cancel" element={<CancelPage />} />
            <Route
              path="gift-cards/success"
              element={<GiftCardSuccessPage />}
            />
            <Route path="gift-cards/cancel" element={<GiftCardCancelPage />} />
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
            {ENABLE_TOKEN_DEBUG_ROUTE && (
              <Route path="token-debug" element={<TokenDebugPage />} />
            )}
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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Tenant Signup (public) */}
          <Route path="/signup" element={<TenantSignup />} />
          <Route path="/signup/success" element={<SignupSuccessPage />} />

          {/* Referral Program Signup (public) */}
          <Route path="/referral-signup" element={<ReferralSignupPage />} />
          <Route
            path="/join-referral-program"
            element={<ReferralSignupPage />}
          />
          <Route path="/referral-login" element={<ReferralLoginPage />} />
          <Route path="/referral-dashboard" element={<ReferralDashboard />} />

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
          <Route
            path="/client/forms"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ClientFormsPage />
              </Suspense>
            }
          />
          <Route
            path="/client/wallet"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <WalletPage />
              </Suspense>
            }
          />
          <Route
            path="/client/favourites"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FavouritesPage />
              </Suspense>
            }
          />
          <Route
            path="/client/orders"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="/client/settings"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="/gift-cards"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <SendGiftCardPage />
              </Suspense>
            }
          />
          <Route
            path="/download"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <DownloadAppPage />
              </Suspense>
            }
          />
          <Route
            path="/language"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LanguagePage />
              </Suspense>
            }
          />

          {/* Mobile Menu */}
          <Route path="/menu" element={<MenuPage />} />

          {/* Search Page - Use simple version for mobile compatibility */}
          <Route path="/search" element={<SearchPage />} />

          {/* Browse Businesses */}
          <Route path="/business" element={<LandingPage />} />
          <Route path="/business-rebuild" element={<LandingPageRebuild />} />

          {/* Platform marketing/landing page - Main route until search is fully developed */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing-rebuild" element={<LandingPageRebuild />} />

          {/* Help & Support */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />

          {/* Not Found */}
          <Route path="/404" element={<NotFoundPage />} />

          {/* Pricing Page */}
          <Route
            path="/pricing"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <PricingPage />
              </Suspense>
            }
          />

          {/* UK Money Pages */}
          <Route
            path="/salon-booking-software-uk"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UkMoneyPage slug="salon-booking-software-uk" />
              </Suspense>
            }
          />
          <Route
            path="/barbershop-booking-software-uk"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UkMoneyPage slug="barbershop-booking-software-uk" />
              </Suspense>
            }
          />
          <Route
            path="/nail-salon-booking-software-uk"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UkMoneyPage slug="nail-salon-booking-software-uk" />
              </Suspense>
            }
          />
          <Route
            path="/beauty-salon-booking-system-uk"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UkMoneyPage slug="beauty-salon-booking-system-uk" />
              </Suspense>
            }
          />
          <Route
            path="/hairdresser-booking-software-uk"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <UkMoneyPage slug="hairdresser-booking-software-uk" />
              </Suspense>
            }
          />

          {/* Industry Landing Pages */}
          <Route
            path="/industries/lash-technicians"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LashTechnicians />
              </Suspense>
            }
          />
          <Route
            path="/industries/hair-salons"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <HairSalons />
              </Suspense>
            }
          />
          <Route
            path="/industries/barbers"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <Barbers />
              </Suspense>
            }
          />

          {/* Comparison Pages */}
          <Route
            path="/compare"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ComparePage />
              </Suspense>
            }
          />
          <Route
            path="/compare/vs-fresha"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <VsFresha />
              </Suspense>
            }
          />
          <Route
            path="/compare/vs-treatwell"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <VsTreatwell />
              </Suspense>
            }
          />

          {/* Blog Pages */}
          <Route
            path="/blog/reduce-salon-no-shows"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ReduceSalonNoShows />
              </Suspense>
            }
          />

          {/* Feature Pages */}
          <Route
            path="/features"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <FeaturesPage />
              </Suspense>
            }
          />
          <Route
            path="/features/sms-reminders"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <SmsReminders />
              </Suspense>
            }
          />
          <Route
            path="/features/no-show-protection"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <NoShowProtection />
              </Suspense>
            }
          />
          <Route
            path="/features/calendar-sync"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <CalendarSync />
              </Suspense>
            }
          />
          <Route
            path="/features/online-booking"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <OnlineBooking />
              </Suspense>
            }
          />

          {/* Solutions Hub + Programmatic Local Solutions */}
          <Route
            path="/solutions"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <SolutionsPage />
              </Suspense>
            }
          />

          {/* Programmatic Local Solutions - 400+ pages: /solutions/{niche}-{city} */}
          <Route
            path="/solutions/:slugCombination"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LocalSolutionPage />
              </Suspense>
            }
          />

          {/* SEO Tools - Product-Led SEO */}
          <Route
            path="/tools/roi-calculator"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <RoiCalculator />
              </Suspense>
            }
          />
          <Route
            path="/tools/deposit-policy-generator"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <DepositPolicyGenerator />
              </Suspense>
            }
          />

          {/* Public Consent Signing */}
          <Route
            path="/consent/:token"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ConsentSigningPage />
              </Suspense>
            }
          />

          {/* Consent Initiation (authenticated) */}
          <Route
            path="/appointments/consent"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ConsentInitiatePage />
              </Suspense>
            }
          />

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
              path="waitlist"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <AdminWaitlist />
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
              path="tenants/:id"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <TenantDetails />
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
                  <BookingPoliciesPage />
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
            <Route
              path="consent-templates"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <ConsentTemplates />
                </Suspense>
              }
            />
            <Route
              path="consent-templates/:id"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <ConsentTemplateView />
                </Suspense>
              }
            />
            <Route
              path="consent-templates/new"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <ConsentTemplateBuilder />
                </Suspense>
              }
            />
            <Route
              path="consent-templates/:id/edit"
              element={
                <Suspense fallback={<LoadingSpinner center size="lg" />}>
                  <ConsentTemplateBuilder />
                </Suspense>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
