import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Globe,
  Layout,
  MessageSquare,
  Settings2,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../shared/components/Schema/BreadcrumbSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";

const spotlightFeatures = [
  {
    title: "SMS Reminders",
    description:
      "Send automated reminders with high open rates to reduce missed appointments.",
    metric: "Up to 70% fewer no-shows",
    href: "/features/sms-reminders",
    icon: MessageSquare,
  },
  {
    title: "No-Show Protection",
    description:
      "Collect deposits and enforce cancellation policies to protect your revenue.",
    metric: "Deposits + policy controls",
    href: "/features/no-show-protection",
    icon: Shield,
  },
  {
    title: "Calendar Sync",
    description:
      "Two-way sync with Google, Apple, and Outlook to prevent double bookings.",
    metric: "Real-time availability sync",
    href: "/features/calendar-sync",
    icon: Calendar,
  },
  {
    title: "Online Booking",
    description:
      "Take bookings 24/7 from mobile and desktop with instant confirmations.",
    metric: "Always-on booking flow",
    href: "/features/online-booking",
    icon: Globe,
  },
];

const featureGroups = [
  {
    id: "booking-engine",
    title: "Booking Engine",
    icon: Globe,
    items: [
      "24/7 online booking with mobile-first flow",
      "Service, specialist, and time-slot selection",
      "Real-time availability and double-booking protection",
      "Client self-service booking, cancel, and reschedule journeys",
      "Automatic booking confirmations and status updates",
    ],
  },
  {
    id: "communication-client-experience",
    title: "Communication & Client Experience",
    icon: MessageSquare,
    items: [
      "Automated email confirmations and reminders",
      "SMS confirmations and reminders (premium add-on)",
      "Client login, profile, and appointments dashboard",
      "Consent requests and signing flow in client journey",
      "Referral program flow (signup, login, dashboard)",
    ],
  },
  {
    id: "operations-team-management",
    title: "Operations & Team Management",
    icon: Users,
    items: [
      "Service catalog with variants, pricing, and active status",
      "Staff management with permissions and assignments",
      "Working hours calendar and recurring schedule controls",
      "Time-off and availability override management",
      "Multi-location support for scaling teams",
    ],
  },
  {
    id: "payments-revenue-protection",
    title: "Payments & Revenue Protection",
    icon: CreditCard,
    items: [
      "Stripe Connect onboarding for business payouts",
      "Deposit collection and no-show protection policies",
      "In-salon payment capture (Tap to Pay feature)",
      "Revenue analytics and profit tracking dashboards",
      "Cancellation rules with payment/refund handling",
    ],
  },
  {
    id: "website-builder-brand",
    title: "Website Builder & Brand",
    icon: Layout,
    items: [
      "Hero section management for public pages",
      "About page content management",
      "Contact/business details management",
      "Social links management mapped to tenant footer",
      "Branding controls for public experience consistency",
    ],
  },
  {
    id: "commerce-content-expansion",
    title: "Commerce, Content & Expansion",
    icon: ShoppingBag,
    items: [
      "E-commerce products, checkout, and order management",
      "Shipping rates configuration for product orders",
      "Seminars/masterclasses creation and booking flows",
      "Seminar attendee tracking for admins",
      "Blog and content support for organic growth",
    ],
  },
];

const recommendedNextFeatures = [
  {
    title: "Waitlist Auto-Fill",
    description:
      "Auto-fill canceled slots from waitlist and notify clients instantly to recover lost revenue.",
  },
  {
    title: "Memberships & Packages",
    description:
      "Recurring memberships, prepaid bundles, and usage tracking to improve retention and cash flow.",
  },
  {
    title: "WhatsApp Automation",
    description:
      "Optional WhatsApp reminders and follow-ups for higher engagement than email alone.",
  },
  {
    title: "Review & Reputation Workflows",
    description:
      "Automated post-visit review requests and reputation tracking across Google and social channels.",
  },
  {
    title: "Smart Upsell Suggestions",
    description:
      "Recommend add-ons at checkout and post-visit based on service history and basket patterns.",
  },
  {
    title: "Location-Level Reporting",
    description:
      "Drill-down analytics by branch, staff member, and service category for multi-location operators.",
  },
];

export default function FeaturesPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
  ];

  return (
    <>
      <SEOHead
        title="Booking Software Features"
        description="Explore the full Elite Booker feature set: online booking, reminders, no-show protection, payments, staff tools, website builder, e-commerce, seminars, and more."
        canonical="https://www.elitebooker.co.uk/features"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
        <Header />

        <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <section className="text-center">
              <span className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Full Feature Catalog
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Everything included in Elite Booker
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Complete platform capabilities across booking, operations,
                payments, website management, and growth.
              </p>
            </section>

            <section className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
              {spotlightFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.href}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-slate-900">
                          {feature.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                          {feature.description}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                          {feature.metric}
                        </p>
                        <Link
                          to={feature.href}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                        >
                          View feature
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </section>

            <section id="platform-feature-catalog" className="mt-10 scroll-mt-28 sm:mt-12">
              <div className="mb-4 flex items-center gap-2 sm:mb-5">
                <Settings2 className="h-5 w-5 text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Full Platform Features
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featureGroups.map((group, index) => {
                  const Icon = group.icon;
                  return (
                    <motion.article
                      key={group.title}
                      id={group.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 + index * 0.04 }}
                      className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-6"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {group.title}
                        </h3>
                      </div>
                      <ul className="space-y-2.5">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.article>
                  );
                })}
              </div>
            </section>

            <section id="recommended-next-features" className="mt-10 scroll-mt-28 sm:mt-12">
              <div className="mb-4 flex items-center gap-2 sm:mb-5">
                <Sparkles className="h-5 w-5 text-slate-700" />
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Suggested Next Features
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedNextFeatures.map((feature, index) => (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.04 }}
                    className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm"
                  >
                    <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </motion.article>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 px-5 py-8 text-center text-white shadow-xl sm:mt-12 sm:px-8 sm:py-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Start with a commission-free booking stack
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Launch quickly with features designed for salons, clinics, and
                wellness businesses in the UK.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Start free
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-300 sm:text-sm">
                <Link to="/compare" className="underline hover:text-white">
                  Compare alternatives
                </Link>
                {" • "}
                <Link to="/solutions" className="underline hover:text-white">
                  Browse local solutions
                </Link>
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
