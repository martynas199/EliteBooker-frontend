/**
 * Elite Booker vs Fresha Comparison Page
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Check,
  X,
  ArrowRight,
  DollarSign,
  Shield,
  AlertCircle,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function VsFresha() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "vs Fresha", url: "/compare/vs-fresha" },
  ];

  const comparisons = [
    {
      feature: "Monthly Subscription",
      elite: "£0/month (Basic)",
      fresha: "£14.95/month",
    },
    {
      feature: "Marketplace Commission",
      elite: "0%",
      fresha: "20% on new clients (min £4)",
    },
    {
      feature: "Online Payment Fee",
      elite: "Standard Stripe",
      fresha: "1.40% + 25p",
    },
    {
      feature: "SMS Reminders",
      elite: "£2.99/month (optional)",
      fresha: "5p each (after 20 free)",
    },
    {
      feature: "Annual Cost (est.)",
      elite: "£0 - £36 (if using SMS)",
      fresha: "£179+ subscription + fees",
    },
    {
      feature: "Annual Savings with Elite Booker",
      elite: "—",
      fresha: "£179 - £279+ per year",
    },
    {
      feature: "Own Your Client Data",
      elite: <Check className="text-slate-700" />,
      fresha: <X className="text-slate-500" />,
    },
    {
      feature: "No Marketplace Competition",
      elite: <Check className="text-slate-700" />,
      fresha: <X className="text-slate-500" />,
    },
    {
      feature: "White Label Branding",
      elite: <Check className="text-slate-700" />,
      fresha: "Paid upgrade",
    },
    {
      feature: "Google Calendar Sync",
      elite: <Check className="text-slate-700" />,
      fresha: <Check className="text-gray-400" />,
    },
    {
      feature: "Deposit Protection",
      elite: <Check className="text-slate-700" />,
      fresha: <Check className="text-gray-400" />,
    },
    { feature: "Staff Management", elite: "Unlimited", fresha: "Unlimited" },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>
          Elite Booker vs Fresha - Which Is Cheaper? (2026 Comparison)
        </title>
        <meta
          name="description"
          content="Honest comparison: Elite Booker saves you £180+/year vs Fresha. £0/month with no commission. SMS optional. See real cost breakdown with verified pricing."
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/compare/vs-fresha"
        />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />

      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(180deg, #f8f5ef 0%, #f6f2ea 52%, #efe8dc 100%)" }}
      >
        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-700 px-4 py-14 text-white sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mx-auto mb-5 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.78)] sm:text-4xl lg:text-5xl">
                Elite Booker vs Fresha: Which Saves You More?
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-50 sm:text-lg">
                Fresha charges £14.95/month (£179/year) plus 20% commission on
                new clients and payment processing fees. Elite Booker starts at
                £0/month with no commission. Own your data, keep your profits.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Warning Box */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Fresha's Hidden Costs
                  </h3>
                  <p className="text-yellow-800">
                    Fresha charges £14.95/month subscription (£179/year), 20%
                    commission on new marketplace clients, 1.40% + 25p payment
                    processing, and 5p per SMS. Elite Booker Basic is £0/month
                    with zero commission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Feature-by-Feature Comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-xl">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 text-left text-gray-900 font-semibold">
                      Feature
                    </th>
                    <th className="py-4 px-6 text-center text-slate-700 font-semibold">
                      Elite Booker
                    </th>
                    <th className="py-4 px-6 text-center text-gray-600 font-semibold">
                      Fresha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} className="border-t border-gray-200">
                      <td className="py-4 px-6 text-gray-900">{row.feature}</td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-700">
                        <div className="flex items-center justify-center">
                          {row.elite}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-gray-600">
                        <div className="flex items-center justify-center">
                          {row.fresha}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cost Breakdown */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Real Annual Cost Comparison
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Elite Booker */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-50 p-8 rounded-2xl border-2 border-slate-700"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Elite Booker (Basic Plan)
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subscription</span>
                    <span className="font-semibold text-slate-700">£0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Commission per booking
                    </span>
                    <span className="font-semibold text-slate-700">£0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      SMS reminders (optional)
                    </span>
                    <span className="font-semibold">£36/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment processing</span>
                    <span className="font-semibold">Stripe standard</span>
                  </div>
                  <div className="border-t-2 border-slate-700 pt-4 flex justify-between text-xl font-bold">
                    <span>Total Annual Cost</span>
                    <span className="text-slate-700">£0 - £36</span>
                  </div>
                </div>
              </motion.div>

              {/* Fresha */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-8 rounded-2xl border-2 border-gray-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Fresha (Independent Plan)
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Subscription (£14.95/month)
                    </span>
                    <span className="font-semibold">£179</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      Marketplace Commission (10 new @ 20%)
                    </span>
                    <span className="font-semibold text-red-600">£40+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      SMS reminders (100/month @ 5p)
                    </span>
                    <span className="font-semibold">£60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment processing</span>
                    <span className="font-semibold">1.40% + 25p</span>
                  </div>
                  <div className="border-t-2 border-gray-400 pt-4 flex justify-between text-xl font-bold">
                    <span>Total Annual Cost</span>
                    <span className="text-red-600">£279+</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-block bg-slate-800 text-white px-8 py-4 rounded-lg">
                <p className="text-sm font-semibold mb-1">
                  YOUR ANNUAL SAVINGS
                </p>
                <p className="text-4xl font-bold">£179 - £279+</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Businesses Switch from Fresha
            </h2>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <p className="text-lg text-gray-700 mb-4 italic">
                  "Fresha's £14.95/month seemed cheap until I added up the
                  marketplace commissions and SMS costs. With Elite Booker's
                  free Basic plan, I only pay for what I use — no hidden fees,
                  no surprises."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    EM
                  </div>
                  <div>
                    <p className="font-semibold">Emma Mitchell</p>
                    <p className="text-gray-600">The Beauty Lounge, Leeds</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <p className="text-lg text-gray-700 mb-4 italic">
                  "The marketplace was our main issue with Fresha. Clients would
                  book through Fresha then see competitors' salons advertised to
                  them. With Elite Booker, we own the customer relationship."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    SJ
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-gray-600">StyleCraft Hair, Bristol</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700 px-4 py-14 text-white sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mx-auto mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.78)] sm:text-4xl">
              Ready to Save £180+/Year?
            </h2>
            <p className="mb-8 text-base text-slate-50 sm:text-lg">
              Switch to Elite Booker today. Migration support included free.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-slate-50">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}




