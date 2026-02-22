import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DemoRequestModal from "../../shared/components/modals/DemoRequestModal";
import { motion, MotionConfig } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import OrganizationSchema from "../../shared/components/Schema/OrganizationSchema";
import { stats } from "./landing/landingData";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
  </div>
);

function getIOSWebKitInfo() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isIOSWebKit: false };
  }

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const touchPoints = navigator.maxTouchPoints || 0;
  const isIOSDevice =
    /iP(hone|ad|od)/i.test(ua) || (platform === "MacIntel" && touchPoints > 1);
  const isWebKit = /AppleWebKit/i.test(ua);
  const hasTouchCalloutSupport =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("-webkit-touch-callout", "none");
  const coarsePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const mobileWebKitLike = hasTouchCalloutSupport && coarsePointer && isWebKit;
  return { isIOSWebKit: Boolean((isIOSDevice || mobileWebKitLike) && isWebKit) };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isBusinessAlias = location.pathname === "/business";
  const { isIOSWebKit } = getIOSWebKitInfo();
  const safeModeOverride = new URLSearchParams(location.search).get(
    "iosSafeMode",
  );
  const forceIOSSafeMode = safeModeOverride === "1";
  const disableIOSSafeMode = safeModeOverride === "0";
  // Default to safe mode on all iOS WebKit builds. Use ?iosSafeMode=1 to force or ?iosSafeMode=0 to disable.
  const useIOSSafeMode =
    forceIOSSafeMode || (isIOSWebKit && !disableIOSSafeMode);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const landingPageClassName = `ios-safari-landing ${
    useIOSSafeMode ? "ios-webkit-safe-mode bg-[#f6f2ea]" : "bg-white"
  }`;
  const heroSectionClassName = useIOSSafeMode
    ? "landing-hero relative flex w-full items-center justify-center overflow-visible bg-[#f6f2ea]"
    : "landing-hero relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f2ea] sm:bg-gradient-to-br sm:from-[#f8f5ef] sm:via-[#f6f2ea] sm:to-[#efe8dc]";
  const heroContainerClassName = useIOSSafeMode
    ? "relative mx-auto w-full max-w-7xl px-4 py-12 pt-10 sm:px-6 lg:px-8"
    : "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-24 sm:pt-20";
  const badgeClassName = useIOSSafeMode
    ? "mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2"
    : "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 mb-6";
  const heroGradientTextClassName = useIOSSafeMode
    ? "block text-gray-900"
    : "hero-gradient-text block bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent";
  const primaryCtaClassName = useIOSSafeMode
    ? "hero-primary-cta group relative overflow-hidden rounded-xl bg-slate-900 px-8 py-4 font-bold text-white"
    : "hero-primary-cta group relative px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all overflow-hidden";
  const secondaryCtaClassName = useIOSSafeMode
    ? "rounded-xl border-2 border-gray-300 bg-white px-8 py-4 font-semibold text-gray-900"
    : "px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-xl hover:border-slate-500 hover:text-slate-700 transition-all shadow-md hover:shadow-lg";
  const chipClassName = useIOSSafeMode
    ? "rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800"
    : "rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50";

  useEffect(() => {
    if (!useIOSSafeMode || typeof document === "undefined") {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    const prevHtmlMaxWidth = html.style.maxWidth;
    const prevBodyMaxWidth = body.style.maxWidth;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = body.style.overflowX;
    const prevBodyPaddingTop = body.style.paddingTop;
    const prevHtmlWidth = html.style.width;
    const prevBodyWidth = body.style.width;
    const prevRootMaxWidth = root?.style.maxWidth;
    const prevRootWidth = root?.style.width;
    const prevRootBg = root?.style.backgroundColor;

    html.style.backgroundColor = "#f6f2ea";
    body.style.backgroundColor = "#f6f2ea";
    html.style.maxWidth = "none";
    body.style.maxWidth = "none";
    html.style.width = "100%";
    body.style.width = "100%";
    html.style.overflowX = "clip";
    body.style.overflowX = "clip";
    body.style.paddingTop = "0px";
    html.classList.add("ios-landing-safe-root");

    if (root) {
      root.style.maxWidth = "none";
      root.style.width = "100%";
      root.style.backgroundColor = "#f6f2ea";
    }

    return () => {
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
      html.style.maxWidth = prevHtmlMaxWidth;
      body.style.maxWidth = prevBodyMaxWidth;
      html.style.width = prevHtmlWidth;
      body.style.width = prevBodyWidth;
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflowX = prevBodyOverflowX;
      body.style.paddingTop = prevBodyPaddingTop;
      html.classList.remove("ios-landing-safe-root");

      if (root) {
        root.style.maxWidth = prevRootMaxWidth || "";
        root.style.width = prevRootWidth || "";
        root.style.backgroundColor = prevRootBg || "";
      }
    };
  }, [useIOSSafeMode]);

  const AnimatedDiv = ({ children, className = "", ...animationProps }) => {
    if (useIOSSafeMode) {
      return <div className={className}>{children}</div>;
    }

    return (
      <motion.div className={className} {...animationProps}>
        {children}
      </motion.div>
    );
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead
        title="Booking Software for UK Salons, Spas & Barbers"
        description="Commission-free booking software for UK beauty and wellness businesses. Online scheduling, SMS reminders, deposits and client management. Plans from GBP 0."
        keywords="online booking system UK, salon booking software UK, appointment scheduling UK, beauty booking app, zero commission booking, salon management software"
        canonical="https://www.elitebooker.co.uk/"
        noindex={isBusinessAlias}
      />

      {/* Organization Schema */}
      <OrganizationSchema />

      <MotionConfig reducedMotion={useIOSSafeMode ? "always" : "never"}>
        <div
          className={landingPageClassName}
          data-ios-safe-mode={useIOSSafeMode ? "1" : "0"}
        >
          <Header iosSafeMode={useIOSSafeMode} minimalMode={useIOSSafeMode} />

        {/* Hero Section - Ultra Modern */}
        <section className={heroSectionClassName}>
          <div className={heroContainerClassName}>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Badge */}
                <div className={badgeClassName}>
                  <svg
                    className="w-4 h-4 text-slate-700"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-slate-800">
                    Built for UK salons and service businesses
                  </span>
                </div>

                {/* Main Headline - Problem/Solution */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight">
                  <span className="block text-gray-900">Keep More of</span>
                  <span className={heroGradientTextClassName}>
                    Every Booking
                  </span>
                  <span className="block text-gray-900">in Your Business</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-700 mb-4 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  Keep more control over your schedule and margin. Elite Booker
                  is a UK-focused{" "}
                  <span className="text-slate-700 font-bold">
                    booking platform
                  </span>{" "}
                  with clear pricing, direct client ownership, and no
                  marketplace commission model.
                </p>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-800">
                        SJ
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-800">
                        MC
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-800">
                        LA
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-lg">★★★★★</span>
                      <span className="text-sm font-semibold text-gray-900">
                        User-rated
                      </span>
                      <span className="text-sm text-gray-600">
                        (see public reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Value Prop */}
                <p className="text-base md:text-lg text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  <span className="font-semibold text-gray-900">
                    Reduce manual booking admin
                  </span>{" "}
                  with structured workflows. Start with our{" "}
                  <span className="font-semibold text-gray-900">
                    free forever plan
                  </span>
                  , upgrade when you're ready.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                  <button
                    onClick={() => navigate("/signup")}
                    className={primaryCtaClassName}
                  >
                    {!useIOSSafeMode && (
                      <div className="hero-primary-cta-overlay absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                    <div className="relative flex items-center justify-center gap-2">
                      <span className="text-lg">Start Free in Minutes</span>
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
                  </button>

                  <button
                    onClick={() => {
                      const element =
                        document.getElementById("pricing-section");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={secondaryCtaClassName}
                  >
                    Compare Pricing →
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-3 text-sm text-gray-600 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-5 h-5 text-slate-700"
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
                      className="w-5 h-5 text-slate-700"
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

                <div className="mt-5 flex flex-wrap gap-2 justify-center lg:justify-start text-xs">
                  <a
                    href="/salon-booking-software-uk"
                    className={chipClassName}
                  >
                    Salon booking software UK
                  </a>
                  <a
                    href="/barbershop-booking-software-uk"
                    className={chipClassName}
                  >
                    Barbershop booking software UK
                  </a>
                  <a
                    href="/nail-salon-booking-software-uk"
                    className={chipClassName}
                  >
                    Nail salon booking software UK
                  </a>
                </div>
              </div>

              {/* Right Content - Comparison Card */}
              {!useIOSSafeMode && (
                <AnimatedDiv
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="hidden flex-1 max-w-lg sm:block"
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

                  <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-900">
                        Elite Booker
                      </span>
                      <span className="text-emerald-700 font-bold">
                        You Keep
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free Plan</span>
                        <span className="font-semibold text-emerald-700">
                          £0/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission</span>
                        <span className="font-semibold text-emerald-700">
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
                      <div className="border-t-2 border-emerald-200 pt-2 mt-2 flex justify-between">
                        <span className="font-bold">Total Cost</span>
                        <span className="font-bold text-emerald-700 text-lg">
                          £0-£120/year
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-900 to-slate-700 rounded-xl text-white text-center">
                    <p className="text-sm font-semibold mb-1">YOU SAVE</p>
                    <p className="text-4xl font-extrabold">£2,759+</p>
                    <p className="text-sm text-slate-200 mt-1">
                      per year vs Fresha
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
                    Based on £12,000 annual revenue (illustrative scenario).
                    Assumptions and source links on comparison page.{" "}
                    <button
                      onClick={() => navigate("/compare/vs-fresha")}
                      className="text-slate-700 hover:underline font-semibold"
                    >
                      See full comparison →
                    </button>
                  </p>
                  </div>
                </AnimatedDiv>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section - Clean */}
        <section className="py-16 px-4 bg-gray-50 border-y border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  value: "£0",
                  label: "Base Plan Available",
                },
                {
                  value: "24/7",
                  label: "Online Booking",
                },
                {
                  value: "SMS",
                  label: "Reminder Workflows",
                },
                {
                  value: "UK",
                  label: "Market Focus",
                },
              ].map((stat, i) => (
                <AnimatedDiv
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-gray-600">
                    {stat.label}
                  </div>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Problem Section - Pain Points */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Why beauty professionals choose Elite Booker
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Replace ad-hoc booking admin with predictable scheduling and
                clear client communication.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: (
                    <svg
                      className="w-12 h-12 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Flexible pricing",
                  description:
                    "Choose a plan that fits your workflow and scale as your team grows.",
                },
                {
                  icon: (
                    <svg
                      className="w-12 h-12 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                  title: "24/7 online booking",
                  description:
                    "Accept appointments anytime, anywhere. Your clients book while you sleep.",
                },
                {
                  icon: (
                    <svg
                      className="w-12 h-12 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  ),
                  title: "Reduce missed appointments",
                  description:
                    "Reminder and policy tools help improve booking reliability.",
                },
                {
                  icon: (
                    <svg
                      className="w-12 h-12 text-slate-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  ),
                  title: "Your branded page",
                  description:
                    "Professional booking page with your branding. No competitor ads. Ever.",
                },
              ].map((item, i) => (
                <AnimatedDiv
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all"
                >
                  <div className="mb-4">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </AnimatedDiv>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate("/signup")}
                className="px-10 py-4 bg-black text-white font-semibold text-lg rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get started
              </button>
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-12 px-4 bg-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center text-white">
              {stats.map((stat, index) => (
                <AnimatedDiv
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg text-gray-300">{stat.label}</div>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <Suspense fallback={<SectionFallback />}>
          <FeaturesSection />
        </Suspense>

        {/* Demo Section */}
        <Suspense fallback={<SectionFallback />}>
          <DemoSection onDemoClick={() => setShowDemoModal(true)} />
        </Suspense>

        {/* Testimonials Section */}
        <Suspense fallback={<SectionFallback />}>
          <TestimonialsSection />
        </Suspense>

        {/* Pricing Section */}
        <div id="pricing-section">
          <Suspense fallback={<SectionFallback />}>
            <PricingSection onShowFeeModal={() => setShowFeeModal(true)} />
          </Suspense>
        </div>

        {/* Final CTA Section */}
        <Suspense fallback={<SectionFallback />}>
          <FinalCtaSection />
        </Suspense>

        <Footer />

        {/* Modals */}
        {showDemoModal && (
          <Suspense fallback={null}>
            <DemoRequestModal onClose={() => setShowDemoModal(false)} />
          </Suspense>
        )}

        {showFeeModal && (
          <Suspense fallback={null}>
            <BookingFeeModal
              isOpen={showFeeModal}
              onClose={() => setShowFeeModal(false)}
            />
          </Suspense>
        )}
        </div>
      </MotionConfig>
    </>
  );
}
