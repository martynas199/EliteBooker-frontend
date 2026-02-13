/**
 * Elite Booker vs Treatwell Comparison Page
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Check, X, ArrowRight, TrendingDown } from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";

export default function VsTreatwell() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "vs Treatwell", url: "/compare/vs-treatwell" },
  ];

  const comparisons = [
    {
      feature: "Monthly Subscription",
      elite: "£0/month",
      treatwell: "£79-199/month",
    },
    {
      feature: "Commission per Booking",
      elite: "0%",
      treatwell: "30% of service price",
    },
    {
      feature: "Payment Processing Fee",
      elite: "1.5% + 20p (Stripe)",
      treatwell: "Included in subscription",
    },
    {
      feature: "Own Your Client Data",
      elite: <Check className="text-slate-700" />,
      treatwell: <X className="text-slate-500" />,
    },
    {
      feature: "No Marketplace Competition",
      elite: <Check className="text-slate-700" />,
      treatwell: <X className="text-slate-500" />,
    },
    {
      feature: "SMS Reminders",
      elite: "£2.99/month (optional)",
      treatwell: "Included",
    },
    {
      feature: "Google Calendar Sync",
      elite: <Check className="text-slate-700" />,
      treatwell: <Check className="text-gray-400" />,
    },
    {
      feature: "Deposit Protection",
      elite: <Check className="text-slate-700" />,
      treatwell: <Check className="text-gray-400" />,
    },
    {
      feature: "White Label Branding",
      elite: <Check className="text-slate-700" />,
      treatwell: <X className="text-slate-500" />,
    },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>Elite Booker vs Treatwell - Stop Paying 30% Commission</title>
        <meta
          name="description"
          content="Treatwell charges 30% commission per booking. Elite Booker charges £29/month flat. See how much you could save by switching."
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/compare/vs-treatwell"
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
              <TrendingDown className="w-16 h-16 mx-auto mb-6" />
              <h1 className="mx-auto mb-5 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.78)] sm:text-4xl lg:text-5xl">
                Stop Paying 30% Commission to Treatwell
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-50 sm:text-lg">
                Treatwell takes 30% of every booking. That's £3,600/year on £12k
                revenue. Elite Booker costs £348/year total. Keep your profits.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
              >
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Side-by-Side Comparison
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
                      Treatwell
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
                          {row.treatwell}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cost Calculator */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Your Potential Savings
            </h2>
            <div className="bg-red-50 p-8 rounded-2xl border-2 border-red-600">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Scenario: £12,000 annual revenue
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">
                    Treatwell Commission (30%)
                  </span>
                  <span className="font-bold text-red-600">-£3,600</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">
                    Treatwell Subscription (£79/month)
                  </span>
                  <span className="font-bold text-red-600">-£948</span>
                </div>
                <div className="border-t-2 border-red-600 pt-4 flex justify-between text-xl font-bold">
                  <span>Total Cost with Treatwell</span>
                  <span className="text-red-600">£4,548/year</span>
                </div>
              </div>

              <div className="my-8 border-t-2 border-gray-300 pt-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">
                      Elite Booker Subscription (£29/month)
                    </span>
                    <span className="font-bold text-slate-700">£348</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Commission</span>
                    <span className="font-bold text-slate-700">£0</span>
                  </div>
                  <div className="border-t-2 border-slate-700 pt-4 flex justify-between text-xl font-bold">
                    <span>Total Cost with Elite Booker</span>
                    <span className="text-slate-700">£348/year</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 text-white p-6 rounded-lg text-center">
                <p className="text-sm font-semibold mb-1">
                  YOUR ANNUAL SAVINGS
                </p>
                <p className="text-4xl font-bold sm:text-5xl">£4,200</p>
                <p className="mt-2 text-slate-50">
                  That's enough to hire part-time staff or invest in marketing
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg shadow-lg"
            >
              <p className="text-xl text-gray-700 mb-4 italic">
                "Leaving Treatwell was the best business decision I made. The
                30% commission was killing my margins. Now with Elite Booker, I
                keep 100% of my earnings and still get all the features I need."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  LW
                </div>
                <div>
                  <p className="font-semibold">Laura Williams</p>
                  <p className="text-gray-600">
                    Glow Beauty Studio, Manchester
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-700 px-4 py-14 text-white sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mx-auto mb-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.78)] sm:text-4xl">
              Ready to Keep Your Profits?
            </h2>
            <p className="mb-8 text-base text-slate-50 sm:text-lg">
              Switch from Treatwell today. We'll help you migrate all your data
              for free.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="mt-4 text-xs text-slate-100 sm:text-sm">
              <Link to="/pricing" className="underline hover:text-white">
                View pricing
              </Link>
              {" • "}
              <Link to="/features" className="underline hover:text-white">
                Explore features
              </Link>
              {" • "}
              <Link to="/solutions" className="underline hover:text-white">
                Browse local solutions
              </Link>
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}




