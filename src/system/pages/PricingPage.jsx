/**
 * Standalone Pricing Page
 * Target: "booking system pricing UK", "salon software pricing"
 */

import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import BreadcrumbSchema from "../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../shared/components/Schema/FAQSchema";
import { pricingPlans } from "./landing/landingData";
import Header from "../components/Header";
import Footer from "../components/Footer";

const comparisonRows = [
  { feature: "Online Booking 24/7", basic: true, professional: true, enterprise: true },
  { feature: "Calendar Management", basic: true, professional: true, enterprise: true },
  { feature: "Client Database", basic: true, professional: true, enterprise: true },
  { feature: "Email Confirmations", basic: true, professional: true, enterprise: true },
  {
    feature: "Booking Fee",
    basic: "GBP 0.99/booking",
    professional: "GBP 0 (waived)",
    enterprise: "GBP 0 (waived)",
  },
  { feature: "Staff Members", basic: "Up to 3", professional: "Up to 10", enterprise: "Unlimited" },
  { feature: "Deposit Collection", basic: false, professional: true, enterprise: true },
  { feature: "Google Calendar Sync", basic: false, professional: true, enterprise: true },
  { feature: "Multi-Location Support", basic: false, professional: false, enterprise: true },
  { feature: "White-Label Branding", basic: false, professional: false, enterprise: true },
  { feature: "Priority Support", basic: false, professional: true, enterprise: true },
];

const faqs = [
  {
    question: "Can I start with the free plan?",
    answer:
      "Yes. Basic is free forever with no credit card required. It includes online booking, calendar management, and a client database. Upgrade when you want advanced features.",
  },
  {
    question: "What is the booking fee?",
    answer:
      "Basic plan: GBP 0.99 per booking. Professional and Enterprise: booking fee waived. Standard Stripe processing still applies where relevant.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term contracts. If you are on annual billing, access continues until the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Major credit and debit cards through Stripe. Annual plans can also be arranged by bank transfer.",
  },
  {
    question: "Do you offer multi-location discounts?",
    answer:
      "Yes. Contact sales for custom multi-location pricing, typically with discounted rates for larger groups.",
  },
  {
    question: "Is SMS included?",
    answer:
      "SMS is an optional add-on at GBP 2.99/month. Add it when you are ready to increase confirmation rates and reduce no-shows.",
  },
];

const formatPrice = (price) => {
  if (price === 0) {
    return "GBP 0";
  }
  return `GBP ${price}`;
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState("monthly");

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/pricing" },
  ];

  const renderCell = (value, isHighlighted = false, compact = false) => {
    if (value === true) {
      return (
        <Check
          className={`mx-auto text-emerald-600 ${compact ? "h-4 w-4" : "h-5 w-5"}`}
        />
      );
    }
    if (value === false) {
      return (
        <X className={`mx-auto text-slate-300 ${compact ? "h-4 w-4" : "h-5 w-5"}`} />
      );
    }

    return (
      <span
        className={`${
          compact ? "text-xs" : "text-sm"
        } ${
          isHighlighted ? "font-semibold text-emerald-700" : "text-slate-600"
        }`}
      >
        {value}
      </span>
    );
  };

  return (
    <>
      <Header />
      <Helmet>
        <title>Pricing - GBP 0 to GBP 49.99/month | Elite Booker UK</title>
        <meta
          name="description"
          content="Simple pricing for UK salons. Free Basic plan forever. Professional GBP 9.99/month. Enterprise GBP 49.99/month. No commission and no contracts."
        />
        <meta
          name="keywords"
          content="booking system pricing UK, salon software cost, appointment scheduling pricing, beauty booking software price, zero commission booking"
        />
        <link rel="canonical" href="https://www.elitebooker.co.uk/pricing" />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-[#f7f3ec] via-[#f6f2ea] to-[#f2ece2]">
        <section className="relative overflow-hidden px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
            <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="mb-4 inline-flex items-center rounded-full border border-slate-300 bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 sm:px-4 sm:py-2 sm:text-xs">
                Pricing
              </span>
              <h1 className="mb-6 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl">
                Clear pricing for growth-focused beauty businesses
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-600 sm:text-lg lg:text-xl">
                No hidden fees, no commission model, no lock-in contracts. Start
                free and scale when it makes sense.
              </p>

              <div className="mx-auto grid w-full max-w-sm grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-2 sm:items-center sm:justify-center">
                <button
                  onClick={() => setActivePlan("monthly")}
                  className={`w-full rounded-xl px-7 py-3 text-sm font-semibold transition-all sm:w-auto sm:text-base ${
                    activePlan === "monthly"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePlan("annual")}
                  className={`w-full rounded-xl px-7 py-3 text-sm font-semibold transition-all sm:w-auto sm:text-base ${
                    activePlan === "annual"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Annual
                  <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:ml-2 sm:mt-0 sm:text-xs">
                    Save 17%
                  </span>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-700 sm:text-xs">
                <span className="rounded-full border border-amber-100 bg-white/75 px-3 py-1">
                  No contracts
                </span>
                <span className="rounded-full border border-amber-100 bg-white/75 px-3 py-1">
                  Cancel anytime
                </span>
                <span className="rounded-full border border-amber-100 bg-white/75 px-3 py-1">
                  500+ UK businesses
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3 lg:gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-amber-400 px-5 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-900 shadow-lg sm:-top-4 sm:text-sm">
                      Most Popular
                    </div>
                  )}

                  <div
                    className={`h-full rounded-2xl p-5 sm:p-7 lg:p-8 ${
                      plan.popular
                        ? "border-2 border-slate-900 bg-white shadow-2xl shadow-slate-900/10"
                        : "border border-slate-200 bg-white/90 shadow-lg"
                    }`}
                  >
                    <h3 className="mb-2 text-3xl font-bold text-slate-950">{plan.name}</h3>
                    <p className="mb-5 text-sm text-slate-600 sm:mb-6 sm:min-h-[48px] sm:text-base">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-slate-950 sm:text-4xl lg:text-5xl">
                        {formatPrice(plan.price[activePlan])}
                      </span>
                      {plan.price[activePlan] > 0 && (
                        <span className="ml-2 text-sm text-slate-600 sm:text-base lg:text-lg">
                          /month
                        </span>
                      )}
                      {activePlan === "annual" && plan.price.annual > 0 && (
                        <p className="mt-2 text-xs font-medium text-emerald-700 sm:text-sm">
                          Billed GBP {(plan.price.annual * 12).toFixed(2)} annually
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => navigate("/signup")}
                      className={`mb-7 w-full rounded-xl px-6 py-3.5 text-base font-bold transition-all sm:mb-8 sm:py-4 sm:text-lg ${
                        plan.popular
                          ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:from-slate-800 hover:to-slate-700"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {plan.cta}
                    </button>

                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                          <span className="text-sm text-slate-700 sm:text-base">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/70 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-slate-950 sm:text-4xl">
              Compare all features
            </h2>
            <div className="space-y-3 lg:hidden">
              {comparisonRows.map((row) => (
                <div
                  key={row.feature}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-slate-900">{row.feature}</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Basic
                      </p>
                      <div className="mt-1">{renderCell(row.basic, false, true)}</div>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                        Pro
                      </p>
                      <div className="mt-1">
                        {renderCell(
                          row.professional,
                          typeof row.professional === "string",
                          true,
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Enterprise
                      </p>
                      <div className="mt-1">
                        {renderCell(row.enterprise, typeof row.enterprise === "string", true)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl lg:block">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                      Basic
                    </th>
                    <th className="bg-amber-50 px-6 py-4 text-center text-sm font-bold text-slate-900">
                      Professional
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {comparisonRows.map((row) => (
                    <tr key={row.feature}>
                      <td className="px-6 py-4 text-sm text-slate-700">{row.feature}</td>
                      <td className="px-6 py-4 text-center">{renderCell(row.basic)}</td>
                      <td className="bg-amber-50 px-6 py-4 text-center">
                        {renderCell(row.professional, typeof row.professional === "string")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderCell(row.enterprise, typeof row.enterprise === "string")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-slate-950 sm:text-4xl">
              Optional add-ons
            </h2>
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-xl sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-xl text-white">
                  SMS
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-2xl font-bold text-slate-950">
                    SMS Reminders - GBP 2.99/month
                  </h3>
                  <p className="mb-4 text-slate-600">
                    Unlimited reminder texts with high open rates, automated
                    reminder windows, and confirmation-friendly workflows.
                  </p>
                  <Link
                    to="/features/sms-reminders"
                    className="font-semibold text-slate-900 underline hover:text-slate-700"
                  >
                    Learn more about SMS
                  </Link>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl font-bold text-slate-950">GBP 2.99</div>
                  <div className="text-sm text-slate-600">/month</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/70 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-slate-950 sm:text-4xl">
              Pricing FAQs
            </h2>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <h3 className="mb-3 text-lg font-bold text-slate-900 sm:text-xl">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-slate-700 sm:text-base">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-slate-900 px-5 py-10 text-center text-white shadow-2xl sm:px-10 sm:py-12">
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
              Start your free trial today
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 sm:text-lg">
              No credit card required. Launch quickly and scale with confidence.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/signup")}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3.5 text-base font-bold text-slate-900 transition-colors hover:bg-slate-100 sm:text-lg"
              >
                Start free trial
              </button>
              <button
                onClick={() => navigate("/help")}
                className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-transparent px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10 sm:text-lg"
              >
                Talk to support
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Join 500+ UK salons, spas, and beauty businesses using Elite Booker
            </p>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              <Link to="/compare" className="underline hover:text-white">
                Compare alternatives
              </Link>
              {" • "}
              <Link to="/features" className="underline hover:text-white">
                Explore features
              </Link>
              {" • "}
              <Link to="/solutions" className="underline hover:text-white">
                Find local solutions
              </Link>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

