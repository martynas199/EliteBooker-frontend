import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEOHead from "../../shared/components/seo/SEOHead";
import OrganizationSchema from "../../shared/components/Schema/OrganizationSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";

const trustMetrics = [
  { value: "0%", label: "Marketplace commission" },
  { value: "24/7", label: "Online booking availability" },
  { value: "UK", label: "Built for UK service businesses" },
  { value: "Clear", label: "Transparent plan structure" },
];

const trustBadges = [
  "No hidden commission model",
  "Own your customer relationships",
  "Professional branded booking page",
];

const heroAudienceInitials = ["SJ", "MC", "LA"];

const heroServiceChips = [
  {
    href: "/salon-booking-software-uk",
    label: "Salon booking software UK",
  },
  {
    href: "/barbershop-booking-software-uk",
    label: "Barbershop booking software UK",
  },
  {
    href: "/nail-salon-booking-software-uk",
    label: "Nail salon booking software UK",
  },
];

const heroTrustPoints = ["No credit card required", "Cancel anytime"];

const heroOperationalStats = [
  { value: "GBP 0", label: "Base plan available" },
  { value: "24/7", label: "Online booking" },
  { value: "SMS", label: "Reminder workflows" },
  { value: "UK", label: "Market focus" },
];

const demoChecklist = [
  "Launch in under 10 minutes",
  "Automated reminders and no-show protection",
  "Payments and client profiles in one dashboard",
];

const demoVideoUrl = "https://www.youtube.com/embed/uJC681X-d2Q";

const coreBenefits = [
  {
    title: "24/7 booking without message back-and-forth",
    description:
      "Clients can book from your branded page any time, which reduces manual admin and missed opportunities.",
    points: [
      "Live availability updates",
      "Automatic booking confirmations",
      "Fewer manual scheduling replies",
    ],
  },
  {
    title: "Protect your margin with clear pricing",
    description:
      "Use a plan that matches your current stage and keep pricing predictable as your business grows.",
    points: [
      "No marketplace commission model",
      "Transparent plan structure",
      "Upgrade only when needed",
    ],
  },
  {
    title: "Fewer no-shows with reminder workflows",
    description:
      "Support appointment reliability with reminder and policy tools designed for service businesses.",
    points: [
      "Automated reminder support",
      "Better client attendance habits",
      "More stable daily revenue",
    ],
  },
  {
    title: "Brand-first experience for your clients",
    description:
      "Present your own business identity from discovery to checkout, without competitor ads.",
    points: [
      "Professional branded booking page",
      "Direct client relationship ownership",
      "Consistent customer experience",
    ],
  },
];

const socialProofStats = [
  { value: "10,000+", label: "Appointments booked" },
  { value: "500+", label: "Service businesses onboarded" },
  { value: "70%", label: "Fewer no-shows with reminders" },
];

const socialProofTestimonials = [
  {
    quote:
      "Our no-shows dropped quickly after enabling reminders. Daily operations are much more predictable.",
    author: "Sarah Thompson",
    role: "Owner, Bella Beauty Salon",
    rating: "5/5",
  },
  {
    quote:
      "Clients now book outside business hours without messaging us directly. We gained more appointment volume.",
    author: "Marcus Chen",
    role: "Manager, Serenity Spa",
    rating: "5/5",
  },
  {
    quote:
      "The system is simple to run and keeps our booking flow professional. It saves our team hours every week.",
    author: "Emma Rodriguez",
    role: "Owner, Elite Hair Studio",
    rating: "5/5",
  },
];

const pricingSnapshotPlans = [
  {
    name: "Starter",
    description: "Solo professionals getting online for the first time",
    price: { monthly: 0, annual: 0 },
    features: [
      "Online booking page",
      "Core appointment management",
      "Client profile tracking",
      "Basic support access",
    ],
    ctaLabel: "Start free",
    ctaRoute: "/signup",
    highlighted: false,
  },
  {
    name: "Professional",
    description: "Growing teams that need deeper automation and reporting",
    price: { monthly: 9.99, annual: 8.33 },
    features: [
      "Everything in Starter",
      "Reminder workflows",
      "Advanced analytics",
      "Priority support",
    ],
    ctaLabel: "View professional plan",
    ctaRoute: "/pricing",
    highlighted: true,
  },
  {
    name: "Multi-location",
    description: "Established businesses coordinating multiple locations",
    price: { monthly: 49.99, annual: 41.66 },
    features: [
      "Everything in Professional",
      "Location-level controls",
      "Centralized reporting",
      "Onboarding support",
    ],
    ctaLabel: "Compare options",
    ctaRoute: "/pricing",
    highlighted: false,
  },
];

const finalCtaBadges = [
  "No credit card required",
  "Cancel anytime",
  "Built for UK service businesses",
];

const coreBenefitIcons = [
  <svg
    key="calendar"
    className="h-10 w-10 text-slate-700"
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
  </svg>,
  <svg
    key="pound"
    className="h-10 w-10 text-slate-700"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3c-2.2 0-4 1.8-4 4v2H6m2 0h7m-7 0v3c0 1.7-1 3.2-2.4 3.9h9.9"
    />
  </svg>,
  <svg
    key="bell"
    className="h-10 w-10 text-slate-700"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.4-1.4c-.4-.4-.6-.9-.6-1.4V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>,
  <svg
    key="brush"
    className="h-10 w-10 text-slate-700"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.3M11 7.3l1.7-1.6a2 2 0 012.8 0l2.8 2.8a2 2 0 010 2.8l-8.5 8.5M7 17h.01"
    />
  </svg>,
];

export default function LandingPageRebuild() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pricingCycle, setPricingCycle] = useState("monthly");
  const [demoVideoLoaded, setDemoVideoLoaded] = useState(false);
  const isPrimaryCanonicalPath = location.pathname === "/";

  return (
    <>
      <SEOHead
        title="Booking Software for UK Salons, Spas & Barbers"
        description="Commission-free booking software for UK beauty and wellness businesses."
        keywords="online booking system UK, salon booking software UK"
        canonical="https://www.elitebooker.co.uk/"
        noindex={!isPrimaryCanonicalPath}
      />
      <OrganizationSchema />

      <div className="min-h-screen bg-[#f6f2ea] text-slate-900">
        <Header iosSafeMode />

        <main>
          {/* Section 1: Hero */}
          <section id="section-1" className="border-b border-amber-100 bg-[#f6f2ea]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                <div>
                  <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
                    Built for UK salons and service businesses
                  </p>

                  <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                    <span className="block text-slate-900">Keep More of</span>
                    <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Every Booking
                    </span>
                    <span className="block text-slate-900">in Your Business</span>
                  </h1>

                  <p className="mt-6 max-w-2xl text-lg text-slate-700">
                    Commission-free booking software with online scheduling,
                    reminders, and client management in one platform.
                  </p>

                  <p className="mt-4 max-w-2xl text-base text-slate-600">
                    <span className="font-semibold text-slate-900">
                      Reduce manual booking admin
                    </span>{" "}
                    with structured workflows. Start with our{" "}
                    <span className="font-semibold text-slate-900">
                      free forever plan
                    </span>
                    , then upgrade only when your team needs more.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/signup")}
                      className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-4 text-base font-bold text-white shadow-xl"
                    >
                      Start Free in Minutes
                    </button>
                    <button
                      onClick={() => {
                        const target = document.getElementById("section-5");
                        target?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-md"
                    >
                      Compare Plans
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <div className="flex -space-x-2">
                      {heroAudienceInitials.map((initials) => (
                        <div
                          key={initials}
                          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-bold text-slate-800"
                        >
                          {initials}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className="h-4 w-4 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm font-semibold text-slate-900">
                        User-rated
                      </span>
                      <span className="text-sm text-slate-600">
                        (see public reviews)
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {heroServiceChips.map((chip) => (
                      <a
                        key={chip.label}
                        href={chip.href}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800"
                      >
                        {chip.label}
                      </a>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    {heroTrustPoints.map((point, index) => (
                      <div key={point} className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{point}</span>
                        {index < heroTrustPoints.length - 1 && (
                          <span className="text-slate-300">&middot;</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-slate-900">
                      Save Thousands
                    </h3>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                      vs commission models
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Typical marketplace
                      </span>
                      <span className="font-bold text-rose-700">You lose</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subscription</span>
                        <span className="font-semibold text-slate-900">
                          GBP 179/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission</span>
                        <span className="font-semibold text-rose-700">
                          GBP 2,400/year
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-rose-300 pt-2">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-bold text-rose-700">
                          GBP 2,879/year
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-bold text-slate-900">Elite Booker</span>
                      <span className="font-bold text-emerald-700">You keep</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Free plan</span>
                        <span className="font-semibold text-emerald-700">
                          GBP 0/year
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission</span>
                        <span className="font-semibold text-emerald-700">
                          GBP 0 forever
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-300 pt-2">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-bold text-emerald-700">
                          GBP 0-120/year
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-900 p-4 text-center text-white">
                    <p className="text-sm font-semibold">Illustrative savings</p>
                    <p className="mt-1 text-3xl font-extrabold">GBP 2,759+</p>
                    <p className="text-xs text-slate-200">per year vs typical model</p>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Based on a sample annual revenue scenario.{" "}
                    <button
                      onClick={() => navigate("/compare/vs-fresha")}
                      className="font-semibold text-slate-700 underline"
                    >
                      See full comparison
                    </button>
                  </p>
                </aside>
              </div>
            </div>
          </section>

          {/* Section 1B: Operational Snapshot */}
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {heroOperationalStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
                  >
                    <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 2: Trust Strip */}
          <section id="section-2" className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                      Trust and clarity
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                      Built for teams that want control and predictable pricing
                    </h2>
                    <p className="mt-3 max-w-2xl text-slate-600">
                      Keep your client relationships, avoid marketplace
                      commission, and run bookings on your own branded page.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/pricing")}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    View pricing
                  </button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {trustMetrics.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <p className="text-2xl font-extrabold text-slate-900">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {trustBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Core Benefits */}
          <section id="section-3" className="border-b border-slate-200 bg-[#f8f6f1]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Core benefits
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Core benefits that reduce admin and protect your margin
                </h2>
                <p className="mt-4 text-slate-600">
                  Everything you need to run daily bookings with less admin and
                  fewer missed appointments.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {coreBenefits.map((benefit, index) => (
                  <article
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      {coreBenefitIcons[index]}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Benefit {index + 1}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600">
                      {benefit.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {benefit.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span
                            className="mt-2 inline-block h-2 w-2 rounded-full bg-slate-500"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-300 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    Ready to replace manual booking workflows?
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Start with the free plan and switch to paid only when your
                    team needs advanced tooling.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/signup")}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white"
                >
                  Create free account
                </button>
              </div>
            </div>
          </section>

          {/* Section 3B: Demo */}
          <section className="border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="grid items-center gap-10 md:grid-cols-2">
                <div>
                  <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
                    Product demo
                  </p>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    See the booking workflow in action
                  </h2>
                  <p className="mt-4 text-slate-300">
                    Watch how quickly you can accept appointments, run reminders,
                    and manage your daily schedule from one dashboard.
                  </p>

                  <ul className="mt-6 space-y-3">
                    {demoChecklist.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-500 bg-slate-700/40">
                          <svg
                            className="h-3.5 w-3.5 text-slate-100"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        <span className="text-sm text-slate-200 sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigate("/signup")}
                      className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                    >
                      Start free in minutes
                    </button>
                    {!demoVideoLoaded && (
                      <button
                        onClick={() => setDemoVideoLoaded(true)}
                        className="rounded-xl border border-slate-500 px-6 py-3 text-sm font-semibold text-white"
                      >
                        Watch instant preview
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-video overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl">
                    {!demoVideoLoaded ? (
                      <button
                        onClick={() => setDemoVideoLoaded(true)}
                        className="flex h-full w-full items-center justify-center bg-slate-900 text-white"
                        aria-label="Load demo video"
                      >
                        <div className="text-center">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
                            <svg
                              className="ml-1 h-8 w-8"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                          </div>
                          <p className="text-sm font-semibold sm:text-base">
                            Watch demo video
                          </p>
                          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                            Click to load preview
                          </p>
                        </div>
                      </button>
                    ) : (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`${demoVideoUrl}?autoplay=1&mute=1&loop=1&playlist=uJC681X-d2Q&controls=1&rel=0`}
                        title="Platform demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Social Proof */}
          <section id="section-4" className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Customer results
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Social proof from teams using Elite Booker
                </h2>
                <p className="mt-4 text-slate-600">
                  Real businesses highlight reliability, easier operations, and
                  better booking consistency after switching.
                </p>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {socialProofStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm"
                  >
                    <p className="text-3xl font-extrabold text-slate-900">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {socialProofTestimonials.map((testimonial) => (
                  <article
                    key={testimonial.author}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Rating {testimonial.rating}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className="h-4 w-4 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      "{testimonial.quote}"
                    </p>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-slate-600">{testimonial.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Section 4B: Performance Banner */}
          <section className="border-b border-slate-800 bg-slate-900">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-8 text-center text-white md:grid-cols-3">
                {socialProofStats.map((item) => (
                  <div key={item.label}>
                    <p className="text-4xl font-extrabold">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 5: Pricing Snapshot */}
          <section id="section-5" className="border-b border-slate-200 bg-[#f8f6f1]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Pricing
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Pricing snapshot for different growth stages
                  </h2>
                  <p className="mt-4 text-slate-600">
                    Start free, then move up only when you need more automation,
                    reporting, or multi-location tooling.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/pricing")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900"
                >
                  See full pricing breakdown
                </button>
              </div>

              <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm">
                <button
                  onClick={() => setPricingCycle("monthly")}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    pricingCycle === "monthly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingCycle("annual")}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    pricingCycle === "annual"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Annual
                  <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                    Save 17%
                  </span>
                </button>
              </div>

              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                {pricingSnapshotPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={`rounded-2xl border bg-white p-6 shadow-sm ${
                      plan.highlighted
                        ? "border-slate-900 shadow-lg"
                        : "border-slate-200"
                    }`}
                  >
                    {plan.highlighted && (
                      <p className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                        Most chosen
                      </p>
                    )}
                    <h3 className="mt-3 text-xl font-bold text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                    <p className="mt-5 text-3xl font-extrabold text-slate-900">
                      {plan.price[pricingCycle] === 0
                        ? "GBP 0"
                        : `GBP ${plan.price[pricingCycle].toFixed(2)}`}
                      {plan.price[pricingCycle] > 0 && (
                        <span className="ml-1 text-base font-medium text-slate-600">
                          /month
                        </span>
                      )}
                    </p>
                    {pricingCycle === "annual" && plan.price.annual > 0 && (
                      <p className="mt-1 text-xs text-slate-600">
                        Billed GBP {(plan.price.annual * 12).toFixed(2)} yearly
                      </p>
                    )}

                    <ul className="mt-5 space-y-2 text-sm text-slate-700">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span
                            className="mt-2 inline-block h-2 w-2 rounded-full bg-slate-500"
                            aria-hidden="true"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => navigate(plan.ctaRoute)}
                      className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold ${
                        plan.highlighted
                          ? "bg-slate-900 text-white"
                          : "border border-slate-300 bg-white text-slate-900"
                      }`}
                    >
                      {plan.ctaLabel}
                    </button>
                  </article>
                ))}
              </div>

              <p className="mt-6 text-xs text-slate-500">
                Snapshot pricing is for quick comparison. Check the pricing page
                for current full details.
              </p>
            </div>
          </section>

          {/* Section 6: Final CTA */}
          <section
            id="section-6"
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white"
          >
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center sm:p-10">
                <p className="inline-flex rounded-full border border-slate-500 bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">
                  Get started
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Move your bookings to a simpler, more predictable workflow
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-slate-200">
                  Launch quickly with the free plan, keep full ownership of your
                  client relationships, and scale when your team is ready.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    onClick={() => navigate("/signup")}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-sm font-semibold text-slate-900"
                  >
                    Start free in minutes
                  </button>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-500 bg-slate-900 px-8 py-3 text-sm font-semibold text-white"
                  >
                    Compare plans
                  </button>
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {finalCtaBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full border border-slate-500 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
