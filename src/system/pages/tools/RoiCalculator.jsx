import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Calculator,
  TrendingDown,
  CheckCircle,
  ArrowRight,
  PoundSterling,
  AlertCircle,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

/**
 * ROI Calculator Tool - Product-Led SEO
 * Target keywords: "salon commission calculator UK", "booking software cost comparison"
 *
 * Strategy: Free tool that solves a real problem BEFORE signup
 * Result: High-quality backlinks + organic traffic + trust building
 */
export default function RoiCalculator() {
  // Form inputs
  const [monthlyBookings, setMonthlyBookings] = useState(120);
  const [averagePrice, setAveragePrice] = useState(50);
  const [currentPlatform, setCurrentPlatform] = useState("fresha");
  const [includesSMS, setIncludesSMS] = useState(true);

  // Calculate current costs
  const monthlyRevenue = monthlyBookings * averagePrice;

  // Fresha costs
  const freshaSubscription = 14.95;
  const freshaCommission = monthlyRevenue * 0.2; // 20%
  const freshaPaymentFees = monthlyBookings * (averagePrice * 0.014 + 0.25); // 1.4% + 25p
  const freshaSMS = includesSMS ? monthlyBookings * 0.05 : 0; // 5p per SMS (2 per booking)
  const freshaTotalCost =
    freshaSubscription + freshaCommission + freshaPaymentFees + freshaSMS;

  // Treatwell costs
  const treatwellSubscription = 39;
  const treatwellCommission = monthlyRevenue * 0.15; // 15%
  const treatwellPaymentFees = monthlyBookings * (averagePrice * 0.014 + 0.25);
  const treatwellSMS = includesSMS ? monthlyBookings * 0.05 : 0;
  const treatwellTotalCost =
    treatwellSubscription +
    treatwellCommission +
    treatwellPaymentFees +
    treatwellSMS;

  // Elite Booker costs
  const eliteSubscription = 9.99; // Pro plan
  const eliteCommission = 0; // No commission
  const elitePaymentFees = monthlyBookings * (averagePrice * 0.015 + 0.2); // Stripe direct: 1.5% + 20p
  const eliteSMS = includesSMS ? 2.99 : 0; // Flat £2.99 unlimited
  const eliteTotalCost =
    eliteSubscription + eliteCommission + elitePaymentFees + eliteSMS;

  // Calculate savings
  const currentCost =
    currentPlatform === "fresha"
      ? freshaTotalCost
      : currentPlatform === "treatwell"
      ? treatwellTotalCost
      : monthlyRevenue * 0.2 + 50; // "Other marketplace" estimate

  const monthlySavings = currentCost - eliteTotalCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = ((monthlySavings / currentCost) * 100).toFixed(1);

  // Break-even analysis
  const setupCost = 0; // Elite Booker has no setup fee
  const monthsToBreakEven =
    setupCost > 0 ? (setupCost / monthlySavings).toFixed(1) : 0;

  // Schema.org for calculator tool
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Salon Commission Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    description:
      "Free calculator to compare booking software costs. See how much you can save by switching from Fresha or Treatwell to Elite Booker.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How accurate is this salon commission calculator?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "This calculator uses official pricing from Fresha (20% commission + £14.95/month + 1.4% + 25p payment fees) and Treatwell (15% commission + £39/month). Elite Booker pricing is £9.99/month with 0% commission on the Professional plan. All calculations are accurate as of February 2026.",
        },
      },
      {
        "@type": "Question",
        name: "What fees does Fresha charge that Elite Booker doesn't?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Fresha charges a 20% commission on every booking, which Elite Booker does not charge. For a salon doing £6,000/month in revenue, that's £1,200/month (£14,400/year) in commission fees alone. Elite Booker charges a flat £9.99/month with no commission.",
        },
      },
      {
        "@type": "Question",
        name: "Are SMS reminders included in Elite Booker pricing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SMS reminders are an optional add-on at £2.99/month for unlimited messages. Fresha charges 5p per SMS (£12/month for 240 SMS). Elite Booker saves you £9/month on SMS alone while offering unlimited sending.",
        },
      },
      {
        "@type": "Question",
        name: "Can I really save thousands per year by switching?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. A typical salon doing 120 appointments/month at £50 average saves £1,100+/month (£13,200/year) by switching from Fresha to Elite Booker. The savings come from eliminating 20% commission, lower payment processing fees, and cheaper SMS.",
        },
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>
          Salon Commission Calculator UK | Compare Fresha vs Elite Booker Costs
        </title>
        <meta
          name="description"
          content="Free calculator to see how much you'll save by switching from Fresha or Treatwell. Compare booking software costs for UK salons, spas, and beauty businesses."
        />
        <meta
          name="keywords"
          content="salon commission calculator UK, booking software cost comparison, fresha alternative calculator, treatwell cost calculator, salon software savings"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/tools/roi-calculator"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Salon Commission Calculator UK | See Your Savings"
        />
        <meta
          property="og:description"
          content="Free calculator: Compare Fresha, Treatwell, and Elite Booker costs. See how much you'll save in 30 seconds."
        />
        <meta
          property="og:url"
          content="https://www.elitebooker.co.uk/tools/roi-calculator"
        />
        <meta property="og:type" content="website" />

        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify(calculatorSchema)}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        {/* Hero Section */}
        <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-violet-100 mb-6">
                <Calculator className="w-5 h-5 text-violet-600" />
                <span className="text-sm font-medium text-gray-700">
                  Free Tool - No Signup Required
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Salon Commission Calculator
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                See exactly how much you'll save by switching from Fresha or
                Treatwell to Elite Booker. Real pricing, real savings,
                calculated in 30 seconds.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-violet-600" />
                  Your Business Details
                </h2>

                <div className="space-y-6">
                  {/* Monthly Bookings */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Appointments
                    </label>
                    <input
                      type="number"
                      value={monthlyBookings}
                      onChange={(e) =>
                        setMonthlyBookings(Number(e.target.value))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-600 focus:outline-none text-lg"
                      min="1"
                      max="1000"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Average: 80-150 for solo, 200-400 for multi-chair salons
                    </p>
                  </div>

                  {/* Average Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Average Treatment Price (£)
                    </label>
                    <div className="relative">
                      <PoundSterling className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={averagePrice}
                        onChange={(e) =>
                          setAveragePrice(Number(e.target.value))
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-600 focus:outline-none text-lg"
                        min="1"
                        max="1000"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Your average service price (£25-£80 typical)
                    </p>
                  </div>

                  {/* Current Platform */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Booking Platform
                    </label>
                    <select
                      value={currentPlatform}
                      onChange={(e) => setCurrentPlatform(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-violet-600 focus:outline-none text-lg bg-white"
                    >
                      <option value="fresha">
                        Fresha (20% commission + £14.95/mo)
                      </option>
                      <option value="treatwell">
                        Treatwell (15% commission + £39/mo)
                      </option>
                      <option value="other">
                        Other marketplace (20% commission)
                      </option>
                    </select>
                  </div>

                  {/* SMS Option */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="sms"
                      checked={includesSMS}
                      onChange={(e) => setIncludesSMS(e.target.checked)}
                      className="mt-1 w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
                    />
                    <label htmlFor="sms" className="text-sm text-gray-700">
                      <span className="font-semibold">
                        Include SMS reminders
                      </span>
                      <br />
                      <span className="text-gray-500">
                        Fresha: 5p/SMS • Elite Booker: £2.99/month unlimited
                      </span>
                    </label>
                  </div>

                  {/* Revenue Display */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">
                      Your Monthly Revenue
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                      £{monthlyRevenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {monthlyBookings} appointments × £{averagePrice}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Results Display */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-6"
              >
                {/* Savings Highlight */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-8 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="w-6 h-6" />
                    <h3 className="text-xl font-bold">
                      Your Potential Savings
                    </h3>
                  </div>

                  <div className="mb-6">
                    <div className="text-5xl sm:text-6xl font-black mb-2">
                      £{Math.round(annualSavings).toLocaleString()}
                    </div>
                    <div className="text-xl opacity-90">per year</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                    <div>
                      <div className="text-sm opacity-75">Monthly Savings</div>
                      <div className="text-2xl font-bold">
                        £{Math.round(monthlySavings).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Save vs Current</div>
                      <div className="text-2xl font-bold">
                        {savingsPercentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Cost Breakdown
                  </h3>

                  <div className="space-y-4">
                    {/* Current Platform Costs */}
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">
                          {currentPlatform === "fresha"
                            ? "Fresha"
                            : currentPlatform === "treatwell"
                            ? "Treatwell"
                            : "Current Platform"}
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          £{Math.round(currentCost).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        {currentPlatform === "fresha" && (
                          <>
                            <div className="flex justify-between">
                              <span>Subscription</span>
                              <span>£{freshaSubscription.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-red-700">
                              <span>Commission (20%)</span>
                              <span>
                                £{Math.round(freshaCommission).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment fees</span>
                              <span>£{Math.round(freshaPaymentFees)}</span>
                            </div>
                            {includesSMS && (
                              <div className="flex justify-between">
                                <span>
                                  SMS ({monthlyBookings * 2} messages)
                                </span>
                                <span>£{Math.round(freshaSMS)}</span>
                              </div>
                            )}
                          </>
                        )}
                        {currentPlatform === "treatwell" && (
                          <>
                            <div className="flex justify-between">
                              <span>Subscription</span>
                              <span>£{treatwellSubscription}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-red-700">
                              <span>Commission (15%)</span>
                              <span>
                                £
                                {Math.round(
                                  treatwellCommission,
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment fees</span>
                              <span>£{Math.round(treatwellPaymentFees)}</span>
                            </div>
                            {includesSMS && (
                              <div className="flex justify-between">
                                <span>SMS</span>
                                <span>£{Math.round(treatwellSMS)}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Elite Booker Costs */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-gray-900">
                          Elite Booker Pro
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          £{Math.round(eliteTotalCost).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Subscription</span>
                          <span>£{eliteSubscription}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-green-700">
                          <span>Commission</span>
                          <span>£0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment fees (Stripe direct)</span>
                          <span>£{Math.round(elitePaymentFees)}</span>
                        </div>
                        {includesSMS && (
                          <div className="flex justify-between">
                            <span>SMS (unlimited)</span>
                            <span>£{eliteSMS}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    Save £{Math.round(annualSavings).toLocaleString()} This Year
                  </h3>
                  <p className="mb-6 opacity-90">
                    Start with our free plan. Upgrade only when you're ready.
                  </p>
                  <a
                    href="/signup"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-bold rounded-full hover:shadow-2xl transition-all text-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <p className="text-sm mt-4 opacity-75">
                    No credit card required • £0 setup fee • Cancel anytime
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why This Matters */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Commission-Free Matters
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  20% Commission = Hidden Tax
                </h3>
                <p className="text-gray-600 text-sm">
                  For every £1,000 you earn, Fresha takes £200. That's £2,400
                  from a £12,000/year revenue - gone.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">It Adds Up Fast</h3>
                <p className="text-gray-600 text-sm">
                  Most salons don't realize they're paying £800-£1,500/month
                  until they calculate it. That's a car payment!
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">You Keep 100%</h3>
                <p className="text-gray-600 text-sm">
                  With Elite Booker, you keep every penny you earn. £9.99/month
                  flat fee, zero commission, forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Calculator FAQs
            </h2>

            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 group"
                >
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.name}
                    <span className="text-violet-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
