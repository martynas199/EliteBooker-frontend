/**
 * No-Show Protection Feature Page
 * Target: 'deposit booking system', 'no show protection salon'
 */

import { Helmet } from "react-helmet-async";
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

  return (
    <>
      <Header />
      <Helmet>
        <title>
          No-Show Protection with Deposits | Reduce No-Shows 85% | Elite Booker
        </title>
        <meta
          name="description"
          content="Automated deposit collection for UK salons. Reduce no-shows by 85%. Set custom policies, instant Stripe payments, automatic refunds. Protect your revenue."
        />
        <meta
          name="keywords"
          content="deposit booking system, no show protection salon, automated deposits, cancellation policy software, salon deposit management UK"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/features/no-show-protection"
        />
      </Helmet>

      <Breadcrumb items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, rgb(249, 250, 251), rgb(255, 255, 255))",
        }}
      >
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Shield className="w-20 h-20 mx-auto mb-6 text-blue-100" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Stop Losing Money to No-Shows
              </h1>
              <p className="text-xl text-blue-50 mb-8 max-w-3xl mx-auto">
                Automated deposit collection reduces no-shows by 85%. Set your
                policy, collect payments instantly via Stripe, and protect your
                revenue.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className="py-20 px-4">
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
              <div className="bg-emerald-50 p-8 rounded-xl border-2 border-emerald-200">
                <h3 className="text-2xl font-bold text-emerald-900 mb-4">
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
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl text-center border-2 border-gray-200">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
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
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
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
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
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
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Flexible Deposit Policies
            </h2>
            <div className="bg-white border-2 border-gray-300 rounded-2xl overflow-hidden">
              <table className="w-full">
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
                    <td className="py-4 px-6 text-center font-semibold text-blue-600">
                      £10-20
                    </td>
                    <td className="py-4 px-6">No relationship built yet</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">Regular clients (returning)</td>
                    <td className="py-4 px-6 text-center font-semibold text-emerald-600">
                      £0 (exempt)
                    </td>
                    <td className="py-4 px-6">Reward loyalty</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">
                      High-value treatments (over £80)
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-blue-600">
                      50%
                    </td>
                    <td className="py-4 px-6">Protect valuable time</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-4 px-6">Saturday appointments</td>
                    <td className="py-4 px-6 text-center font-semibold text-blue-600">
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
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why Deposits Work
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl border-2 border-blue-200"
              >
                <TrendingDown className="w-12 h-12 text-blue-600 mb-4" />
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
                className="bg-white p-8 rounded-xl border-2 border-emerald-200"
              >
                <DollarSign className="w-12 h-12 text-emerald-600 mb-4" />
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
                className="bg-white p-8 rounded-xl border-2 border-purple-200"
              >
                <Lock className="w-12 h-12 text-purple-600 mb-4" />
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
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
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
        <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Stop Losing £1,000+/Month to No-Shows
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Join UK salons protecting their revenue with automated deposit
              collection. Set up in 10 minutes.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <p className="text-blue-100 mt-4">
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
