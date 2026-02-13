import { Link } from "react-router-dom";
import { MessageSquare, Shield, Calendar, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../shared/components/Schema/BreadcrumbSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";

const featureCards = [
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

export default function FeaturesPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
  ];

  return (
    <>
      <SEOHead
        title="Booking Software Features"
        description="Explore Elite Booker features for salons and wellness businesses: SMS reminders, no-show protection, calendar sync, and online booking."
        canonical="https://www.elitebooker.co.uk/features"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
        <Header />

        <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <section className="text-center">
              <span className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Product Features
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Tools built to increase bookings and protect margin
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Everything you need to run a premium booking experience without
                paying marketplace commission.
              </p>
            </section>

            <section className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
              {featureCards.map((feature, index) => {
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
