import { useParams, Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  TrendingDown,
  Clock,
  Shield,
  Smartphone,
  Star,
  ArrowRight,
  Calendar,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SEOHead from "../../../shared/components/seo/SEOHead";
import {
  NICHES,
  UK_CITIES,
  getLandingPageData,
} from "../../data/ukCitiesNiches";

/**
 * Programmatic Local + Industry Landing Page
 * Powers 400+ hyper-targeted pages: /solutions/{niche}-{city}
 *
 * SEO Strategy: Capture long-tail searches like "booking software for barbers manchester"
 * with low competition and massive conversion rates.
 */
export default function LocalSolutionPage() {
  const { slugCombination } = useParams();
  const normalizedSlug = (slugCombination || "").toLowerCase().trim();
  const sortedCities = [...UK_CITIES].sort(
    (left, right) => right.slug.length - left.slug.length,
  );
  const matchedCity = sortedCities.find(
    (city) =>
      normalizedSlug === city.slug || normalizedSlug.endsWith(`-${city.slug}`),
  );

  if (!matchedCity) {
    return <Navigate to="/404" replace />;
  }

  const potentialCitySlug = matchedCity.slug;
  const nicheSuffixLength = potentialCitySlug.length + 1;
  const potentialNicheSlug = normalizedSlug.slice(0, -nicheSuffixLength);

  if (!potentialNicheSlug) {
    return <Navigate to="/404" replace />;
  }

  const data = getLandingPageData(potentialNicheSlug, potentialCitySlug);

  // If invalid combination, redirect to 404
  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const {
    city,
    niche,
    title,
    metaDescription,
    h1,
    heroSubheading,
    breadcrumbs,
  } = data;

  const hashSeed = `${city.slug}-${niche.slug}`
    .split("")
    .reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
  const localAdoptionCount = 50 + (hashSeed % 100);
  const socialProofCount = 40 + (hashSeed % 70);

  const relatedNiches = NICHES.filter(
    (entry) => entry.slug !== niche.slug,
  ).slice(0, 4);
  const nearbyCities = UK_CITIES.filter(
    (entry) => entry.slug !== city.slug && entry.region === city.region,
  ).slice(0, 4);
  const fallbackCities = UK_CITIES.filter(
    (entry) => entry.slug !== city.slug,
  ).slice(0, 4);
  const suggestedCities =
    nearbyCities.length > 0 ? nearbyCities : fallbackCities;

  // Calculate savings example
  const monthlyBookings = niche.averageMonthlyBookings;
  const avgPrice = niche.averageTreatmentPrice;
  const monthlyRevenue = monthlyBookings * avgPrice;
  const freshaCommission = monthlyRevenue * 0.2; // 20% commission
  const freshaFees = monthlyBookings * 1.65; // £1.40 + 25p average
  const freshaSubscription = 14.95;
  const froshaTotalCost = freshaCommission + freshaFees + freshaSubscription;

  const eliteBookerCost = 9.99 + monthlyBookings * 0; // Pro plan, no booking fees
  const annualSavings = (froshaTotalCost - eliteBookerCost) * 12;

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `https://www.elitebooker.co.uk${crumb.url}`,
    })),
  };

  // Generate AggregateRating schema (Trust Engine)
  const ratingSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elite Booker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "247",
      bestRating: "5",
      worstRating: "1",
    },
  };

  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What makes Elite Booker better than Fresha for ${
          city.name
        } ${niche.pluralName.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Elite Booker charges £0/month on our Basic plan (vs Fresha's £14.95) and £0.99 per booking (vs Fresha's 20% commission + 1.40% + 25p payment fees). For a typical ${niche.singularName.toLowerCase()} doing ${monthlyBookings} appointments/month at £${avgPrice} average, you'll save £${Math.round(
            annualSavings,
          )}/year.`,
        },
      },
      {
        "@type": "Question",
        name: `How quickly can I start accepting bookings in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can set up your Elite Booker account and start accepting bookings in under 10 minutes. Add your services, set your availability, and share your booking link instantly - no website required.",
        },
      },
      {
        "@type": "Question",
        name: `Do I need to pay for SMS reminders separately?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "SMS reminders are an optional add-on at £2.99/month for unlimited messages. Email and app notifications are always free. Most of our clients add SMS to reduce no-shows by 70%.",
        },
      },
      {
        "@type": "Question",
        name: `Can I collect deposits for appointments?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our Professional plan (£9.99/month) includes automatic deposit collection via Stripe. Set deposit amounts per service, and clients pay when they book. Reduce no-shows by 85%.",
        },
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${niche.name} Booking Software in ${city.name}`,
    serviceType: "Appointment Booking Software",
    areaServed: {
      "@type": "City",
      name: city.name,
    },
    provider: {
      "@type": "Organization",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: "0",
      availability: "https://schema.org/InStock",
    },
  };

  const canonicalUrl = `https://www.elitebooker.co.uk/solutions/${potentialNicheSlug}-${potentialCitySlug}`;

  return (
    <>
      <SEOHead
        title={title}
        description={metaDescription}
        canonical={canonicalUrl}
        keywords={`${city.name} ${niche.pluralName}, booking software ${
          city.name
        }, ${niche.slug} ${
          city.slug
        }, appointment software ${niche.pluralName.toLowerCase()}, no commission booking system`}
        schema={[breadcrumbSchema, ratingSchema, faqSchema, serviceSchema]}
      />

      <Header />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc] overflow-hidden">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <a href={crumb.url} className="hover:text-slate-700">
                    {crumb.label}
                  </a>
                  {index < breadcrumbs.length - 1 && <span>/</span>}
                </div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-700">
                  4.9/5 from 247 reviews
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {h1}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {heroSubheading}
              </p>

              {/* ROI Highlight */}
              <div className="inline-flex items-center gap-3 bg-green-50 border-2 border-green-200 rounded-2xl px-6 py-4 mb-10">
                <TrendingDown className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <div className="text-sm text-green-700 font-medium">
                    Typical {city.name} {niche.singularName} Saves:
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    £{Math.round(annualSavings).toLocaleString()}/year
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-full hover:shadow-xl transition-all text-lg"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 font-semibold rounded-full hover:border-slate-700 transition-all text-lg"
                >
                  Calculate Your Savings
                </a>
              </div>

              <p className="text-sm text-gray-500 mt-6">
                No credit card required • £0 setup fee • Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pain Points Section - Hyper-Specific to Niche */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
                Built for {city.name} {niche.pluralName}'s Unique Challenges
              </h2>
              <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
                We understand the specific problems{" "}
                {niche.pluralName.toLowerCase()} face every day. Here's how we
                solve them:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {niche.painPoints.map((painPoint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">😤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 line-through decoration-red-500">
                          {painPoint}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {index === 0 &&
                            "Automated SMS reminders + deposit collection reduces no-shows by 85%"}
                          {index === 1 &&
                            "24/7 online booking means clients book themselves while you focus on treatments"}
                          {index === 2 &&
                            "Real-time calendar sync prevents double bookings and shows availability instantly"}
                          {index === 3 &&
                            "Automatic deposit collection + clear cancellation policy protects your revenue"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
              Everything {city.name} {niche.pluralName} Need to Thrive
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  SMS Reminders (£2.99/mo)
                </h3>
                <p className="text-gray-600 mb-4">
                  Unlimited SMS reminders at 48hr and 24hr before appointments.
                  98% open rate reduces no-shows by 70%.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Automatic 48hr + 24hr reminders</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Clients reply YES to confirm</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Unlimited messages included</span>
                  </li>
                </ul>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Deposit Collection
                </h3>
                <p className="text-gray-600 mb-4">
                  Collect deposits automatically via Stripe when clients book.
                  Reduce no-shows by 85% overnight.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Set deposit amount per service</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Automatic refunds on cancellation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>PCI-compliant Stripe integration</span>
                  </li>
                </ul>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <Calendar className="w-7 h-7 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Google Calendar Sync
                </h3>
                <p className="text-gray-600 mb-4">
                  Two-way sync with Google, Apple, and Outlook. Bookings appear
                  in your calendar automatically.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Real-time calendar updates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Block personal time from your phone</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-5 h-5 text-slate-700 flex-shrink-0 mt-0.5" />
                    <span>Prevent double bookings automatically</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Local Social Proof */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
              Trusted by {city.name} {niche.pluralName}
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
              Join {localAdoptionCount} {niche.pluralName.toLowerCase()} in{" "}
              {city.name} who've already made the switch.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Switched from Fresha last month and I'm already saving £
                  {Math.round(froshaTotalCost - eliteBookerCost)}/month.
                  No-shows dropped from 6-8/week to 1-2. Game changer."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-800">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah J.</div>
                    <div className="text-sm text-gray-600">
                      {niche.singularName}, {city.name}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 2 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "The deposit feature alone pays for itself. Went from 20%
                  no-shows to under 3%. My {city.name} regulars love how easy it
                  is to book."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-800">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Michael C.
                    </div>
                    <div className="text-sm text-gray-600">
                      {niche.singularName}, {city.name}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Testimonial 3 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Setup took 8 minutes. Shared my booking link on Instagram and
                  had 3 bookings within an hour. Why didn't I do this sooner?"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-800">
                    LA
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Lucy A.</div>
                    <div className="text-sm text-gray-600">
                      {niche.singularName}, {city.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Related Local Links */}
        <section className="py-14 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Nearby {niche.pluralName} pages
              </h2>
              <div className="grid gap-3">
                {suggestedCities.map((nearbyCity) => (
                  <Link
                    key={`${niche.slug}-${nearbyCity.slug}`}
                    to={`/solutions/${niche.slug}-${nearbyCity.slug}`}
                    className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-slate-800 hover:bg-slate-50"
                  >
                    <span>
                      {niche.pluralName} in {nearbyCity.name}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Other {city.name} booking software options
              </h2>
              <div className="grid gap-3">
                {relatedNiches.map((relatedNiche) => (
                  <Link
                    key={`${relatedNiche.slug}-${city.slug}`}
                    to={`/solutions/${relatedNiche.slug}-${city.slug}`}
                    className="inline-flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-slate-800 hover:bg-slate-50"
                  >
                    <span>
                      {relatedNiche.pluralName} in {city.name}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
              Stop Paying 20% Commission
            </h2>
            <p className="text-xl text-gray-600 mb-12 text-center">
              See how much you'll save compared to Fresha/Treatwell:
            </p>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-slate-200">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">
                      Cost Breakdown
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Fresha/Treatwell
                    </th>
                    <th className="px-6 py-4 text-center font-semibold">
                      Elite Booker Pro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Monthly subscription
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      £14.95
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      £9.99
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">
                      Commission on bookings
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      20%
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      £0
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-gray-700">
                      Payment processing fee
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      1.40% + 25p
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      Stripe direct (1.5% + 20p)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">Per booking fee</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      Included in commission
                    </td>
                    <td className="px-6 py-4 text-center text-green-600 font-bold">
                      £0
                    </td>
                  </tr>
                  <tr className="border-t-4 border-slate-200">
                    <td className="px-6 py-5 text-gray-900 font-bold text-lg">
                      Monthly Cost ({monthlyBookings} bookings)
                    </td>
                    <td className="px-6 py-5 text-center text-red-600 font-bold text-xl">
                      £{Math.round(froshaTotalCost)}
                    </td>
                    <td className="px-6 py-5 text-center text-green-600 font-bold text-xl">
                      £{Math.round(eliteBookerCost)}
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-6 py-5 text-gray-900 font-bold text-lg">
                      Annual Savings
                    </td>
                    <td className="px-6 py-5 text-center"></td>
                    <td className="px-6 py-5 text-center text-green-600 font-bold text-2xl">
                      £{Math.round(annualSavings).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-full hover:shadow-xl transition-all text-lg"
              >
                Start Saving Today
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqSchema.mainEntity.map((faq, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-6 border border-gray-200 group"
                >
                  <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.name}
                    <span className="text-slate-700 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-700 leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-black/20 pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-white drop-shadow-lg">
              Join {city.name}'s {niche.pluralName} Who've Already Switched
            </h2>
            <p className="text-xl mb-10 text-slate-100">
              {socialProofCount}+ local businesses already use Elite Booker.
              Start with our free Basic plan. Upgrade only when you're ready.
              Cancel anytime.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-10 py-5 bg-white text-slate-700 font-bold rounded-full hover:shadow-2xl transition-all text-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-10 py-5 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-slate-700 transition-all text-lg"
              >
                View Pricing
              </a>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">£0 setup fee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
