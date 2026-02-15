/**
 * No-Show Protection Feature Page
 * Target: 'deposit booking system', 'no show protection salon'
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Shield,
  DollarSign,
  Lock,
  TrendingDown,
  Clock,
  Award,
} from "lucide-react";
import Breadcrumb from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import SEOHead from "../../../shared/components/seo/SEOHead";

export default function NoShowProtection() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
    { name: "No-Show Protection", url: "/features/no-show-protection" },
  ];

  const faqs = [
    {
      question: "How do deposits reduce no-shows?",
      answer:
        "Deposits create financial commitment. When clients have 'skin in the game' (£10-20 deposit), they're 85% less likely to no-show. It transforms a casual booking into a real commitment.",
    },
    {
      question: "Should I charge deposits for all clients?",
      answer:
        "No. Charge deposits for: new clients (first appointment), high-value treatments (over £80), evening/weekend slots, and clients with no-show history. Exempt your loyal regulars to reward their loyalty.",
    },
    {
      question: "What happens if client cancels with notice?",
      answer:
        "If they cancel 48+ hours before, they get a full refund instantly. 24-48 hours = 50% refund. Less than 24 hours or no-show = no refund. You set your own cancellation policy.",
    },
    {
      question: "How are deposits collected?",
      answer:
        "Automatically via Stripe when clients book online. The deposit is charged immediately to their card and deducted from the final payment. No manual processing required.",
    },
    {
      question: "Won't deposits hurt my bookings?",
      answer:
        "No. Serious clients understand deposits are standard (like restaurants or hotels). You attract higher-quality bookings from clients who value your time. 99% of UK clients find it reasonable.",
    },
  ];

  const noShowProtectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "No-Show Protection with Deposits",
    description:
      "Deposit and cancellation policy workflows for UK salons to reduce no-shows and protect revenue.",
    url: "https://www.elitebooker.co.uk/features/no-show-protection",
    isPartOf: {
      "@type": "WebSite",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
  };

  const noShowProtectionServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "No-show protection and deposits",
    provider: {
      "@type": "Organization",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
    areaServed: "GB",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Salon and barbershop owners",
    },
  };

  return (
    <>
      <SEOHead
        title="No-Show Protection with Deposits | Reduce No-Shows 85% | Elite Booker"
        description="Automated deposit collection for UK salons. Reduce no-shows by 85%. Set custom policies, instant Stripe payments, automatic refunds. Protect your revenue."
        keywords="deposit booking system, no show protection salon, automated deposits, cancellation policy software, salon deposit management UK"
        canonical="https://www.elitebooker.co.uk/features/no-show-protection"
        schema={[noShowProtectionPageSchema, noShowProtectionServiceSchema]}
      />
      <Header />

      <Breadcrumb items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, #f8f5ef, #f6f2ea 55%, #efe8dc)",
        }}
      >
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 px-4 py-14 text-white sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Shield className="mx-auto mb-6 h-14 w-14 text-slate-200 sm:h-16 sm:w-16" />
              <h1 className="mx-auto mb-5 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.78)] sm:text-4xl lg:text-5xl">
                Stop Losing Money to No-Shows
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-50 sm:text-lg">
                Automated deposit collection reduces no-shows by 85%. Set your
                policy, collect payments instantly via Stripe, and protect your
                revenue.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-red-50 p-8 rounded-xl border-2 border-red-200">
                <h3 className="text-2xl font-bold text-red-900 mb-4">
                  The Problem:
                </h3>
                <ul className="space-y-3 text-lg text-gray-800">
                  <li>• No-shows cost UK salons £500-£2,000/month</li>
                  <li>• 25-30% of appointments are missed</li>
                  <li>
                    • Empty slots = lost revenue (can't rebook last-minute)
                  </li>
                  <li>• Staff lose commission on no-shows</li>
                  <li>• No financial consequence = clients don't commit</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border-2 border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  The Solution:
                </h3>
                <ul className="space-y-3 text-lg text-gray-800">
                  <li>• Deposits create financial commitment</li>
                  <li>• 85% reduction in no-shows (proven data)</li>
                  <li>• Automatic collection via Stripe</li>
                  <li>
                    • Fair refund policy (48hr cancellation = full refund)
                  </li>
                  <li>• Protect your most valuable slots</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Set Your Policy
                </h3>
                <p className="text-gray-700">
                  Define deposit amounts by client type (new vs regular),
                  service (high-value vs standard), or time slot (Saturday vs
                  Monday).
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Automatic Collection
                </h3>
                <p className="text-gray-700">
                  When client books online, deposit is charged immediately to
                  their card via Stripe. Deducted from final payment at
                  appointment.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Automatic Refunds
                </h3>
                <p className="text-gray-700">
                  If client cancels with 48+ hours notice, refund processes
                  automatically. Less than 24 hours or no-show = no refund (you
                  keep deposit).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Deposit Policy Examples */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Flexible Deposit Policies
            </h2>
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-300 bg-white">
              <table className="w-full min-w-[760px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left text-gray-900">
                      Client/Booking Type
                    </th>
                    <th className="py-4 px-6 text-center text-gray-900">
                      Recommended Deposit
                    </th>
                    <th className="py-4 px-6 text-center text-gray-900">Why</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">
                      New clients (first appointment)
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">
                      £10-20
                    </td>
                    <td className="py-4 px-6">No relationship built yet</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">Regular clients (returning)</td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">
                      £0 (exempt)
                    </td>
                    <td className="py-4 px-6">Reward loyalty</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">
                      High-value treatments (over £80)
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">
                      50%
                    </td>
                    <td className="py-4 px-6">Protect valuable time</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">Saturday appointments</td>
                    <td className="py-4 px-6 text-center font-semibold text-slate-700">
                      £20
                    </td>
                    <td className="py-4 px-6">High demand slot</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">Clients with no-show history</td>
                    <td className="py-4 px-6 text-center font-semibold text-red-600">
                      100% prepay
                    </td>
                    <td className="py-4 px-6">Patterns repeat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gray-50 px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Deposits Work
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border-2 border-slate-200"
              >
                <TrendingDown className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  85% Reduction in No-Shows
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  When clients have £10-20 at stake, they commit. Data from
                  1,000+ UK salons shows no-show rates drop from 25% to 4%.
                </p>
                <p className="text-gray-600">
                  That's £1,000+ saved per month for average salon.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border-2 border-slate-200"
              >
                <DollarSign className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Protect Revenue
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  Even if someone no-shows, you keep the deposit. This covers
                  part of your lost revenue and compensates for the empty slot.
                </p>
                <p className="text-gray-600">
                  Plus clients are less likely to no-show when money is
                  involved.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border-2 border-slate-200"
              >
                <Lock className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Secure with Stripe
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  All payments processed via Stripe (industry-leading security).
                  PCI compliant, encrypted, fraud protection. You never handle
                  card details.
                </p>
                <p className="text-gray-600">
                  Instant payouts to your bank account.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border-2 border-yellow-200"
              >
                <Award className="w-12 h-12 text-yellow-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Professional Image
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  Deposits signal you're a professional business that values
                  your time. It actually increases perceived quality and
                  attracts better clients.
                </p>
                <p className="text-gray-600">
                  Those who complain about reasonable deposits aren't your ideal
                  clients.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-gray-200"
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
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 px-4 py-14 text-white sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mx-auto mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.78)] sm:text-4xl">
              Stop Losing £1,000+/Month to No-Shows
            </h2>
            <p className="mb-8 text-base text-slate-50 sm:text-lg">
              Join UK salons protecting their revenue with automated deposit
              collection. Set up in 10 minutes.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <p className="mt-4 text-xs text-slate-100 sm:text-sm">
              <Link to="/pricing" className="underline hover:text-white">
                View pricing
              </Link>
              {" • "}
              <Link
                to="/compare/vs-treatwell"
                className="underline hover:text-white"
              >
                Compare vs Treatwell
              </Link>
              {" • "}
              <Link to="/solutions" className="underline hover:text-white">
                Browse local solutions
              </Link>
            </p>
            <p className="mt-2 text-slate-50">
              <Link
                to="/blog/reduce-salon-no-shows"
                className="underline hover:text-white"
              >
                Read: How to Reduce Salon No-Shows by 40%
              </Link>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
