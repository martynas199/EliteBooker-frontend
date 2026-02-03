/**
 * Standalone Pricing Page
 * Target: 'booking system pricing UK', 'salon software pricing'
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

export default function PricingPage() {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState("monthly");

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Pricing", url: "/pricing" },
  ];

  const faqs = [
    {
      question: "Can I start with the free plan?",
      answer:
        "Yes! Our Basic plan is free forever. No credit card required. Includes online booking, calendar management, and client database. Upgrade when you're ready for advanced features like SMS reminders and deposit protection.",
    },
    {
      question: "What's the booking fee?",
      answer:
        "Basic plan: £0.99 per booking. Professional plan: £0 booking fee (waived). All plans: Standard Stripe payment processing (2.9% + 30p for Tap to Pay).",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, cancel anytime with no penalties. If you're on an annual plan, you'll have access until the end of your billing period. No long-term contracts or commitments.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit/debit cards via Stripe. Annual plans can also be paid by bank transfer. All transactions are secure and PCI-compliant.",
    },
    {
      question: "Do you offer discounts for multiple locations?",
      answer:
        "Yes! Contact our sales team for multi-location pricing. Typically 20-30% discount for 3+ locations on Professional or Enterprise plans.",
    },
    {
      question: "Is SMS included in the price?",
      answer:
        "SMS is an optional add-on: £2.99/month for unlimited SMS reminders. Not included in any plan by default. Add it when you're ready to reduce no-shows by 70%.",
    },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>Pricing - £0 to £49.99/month | Elite Booker UK</title>
        <meta
          name="description"
          content="Simple, transparent pricing for UK salons. Free Basic plan forever. Pro £9.99/month (no booking fees). Enterprise £49.99/month. No commission, no contracts."
        />
        <meta
          name="keywords"
          content="booking system pricing UK, salon software cost, appointment scheduling pricing, beauty booking software price, zero commission booking"
        />
        <link rel="canonical" href="https://www.elitebooker.co.uk/pricing" />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                No hidden fees. No commission. No contracts. Start free, upgrade
                when you're ready.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-4 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
                <button
                  onClick={() => setActivePlan("monthly")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    activePlan === "monthly"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActivePlan("annual")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    activePlan === "annual"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
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
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`h-full p-8 bg-white rounded-2xl ${
                      plan.popular
                        ? "border-2 border-violet-500 shadow-2xl"
                        : "border border-gray-200 shadow-lg"
                    }`}
                  >
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-6 min-h-[48px]">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.price[activePlan] === 0 ? (
                        <span className="text-6xl font-bold text-gray-900">
                          £0
                        </span>
                      ) : (
                        <>
                          <span className="text-6xl font-bold text-gray-900">
                            £{plan.price[activePlan]}
                          </span>
                          <span className="text-gray-600 text-xl ml-2">
                            /month
                          </span>
                        </>
                      )}
                      {activePlan === "annual" && plan.price.annual > 0 && (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          Billed £{(plan.price.annual * 12).toFixed(2)} annually
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => navigate("/signup")}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all mb-8 ${
                        plan.popular
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-xl"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {plan.cta}
                    </button>

                    {/* Features */}
                    <ul className="space-y-4">
                      {plan.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Compare All Features
            </h2>
            <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      Basic
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-violet-50">
                      Professional
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Online Booking 24/7
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Calendar Management
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Client Database
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Email Confirmations
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Booking Fee
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      £0.99/booking
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50 text-sm font-bold text-green-600">
                      £0 (waived)
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-green-600">
                      £0 (waived)
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Staff Members
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Up to 3
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50 text-sm text-gray-600">
                      Up to 10
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      Unlimited
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Deposit Collection
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Google Calendar Sync
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Multi-Location Support
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      White-Label Branding
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      Priority Support
                    </td>
                    <td className="px-6 py-4 text-center">
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center bg-violet-50">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Optional Add-ons */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Optional Add-Ons
            </h2>
            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-violet-200">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl">💬</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    SMS Reminders - £2.99/month
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Unlimited SMS appointment reminders. Reduce no-shows by 70%.
                    98% open rate. Automatic 48hr and 24hr reminders. Two-way
                    replies (YES to confirm).
                  </p>
                  <Link
                    to="/features/sms-reminders"
                    className="text-violet-600 hover:text-violet-700 font-semibold"
                  >
                    Learn more about SMS →
                  </Link>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">£2.99</div>
                  <div className="text-sm text-gray-600">/month</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Pricing FAQs
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-lg text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Start Your Free Trial Today
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-2xl transition-all text-lg"
            >
              Start Free Trial
            </button>
            <p className="text-gray-500 mt-4 text-sm">
              Join 500+ UK salons, spas & beauty businesses using Elite Booker
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
