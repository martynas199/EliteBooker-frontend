/**
 * Lash Technician Booking Software Landing Page
 * SEO-optimized industry page
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Shield,
  Camera,
  Smartphone,
  Calendar,
  CreditCard,
  Gift,
  ArrowRight,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import SEOHead from "../../../shared/components/seo/SEOHead";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function LashTechnicians() {
  const faqs = [
    {
      question: "Can clients book lash appointments online with Elite Booker?",
      answer:
        "Yes, Elite Booker provides a 24/7 online booking widget that clients can use to book lash appointments directly through your website or custom booking page. They can select their preferred service (classic, volume, hybrid, infills), choose available time slots, and pay deposits if required.",
    },
    {
      question: "Does Elite Booker track patch tests for lash extensions?",
      answer:
        "Yes, Elite Booker includes patch test tracking specifically for lash technicians. The system records patch test dates and sends automatic reminders when they're due for renewal (typically every 6-12 months), helping you stay compliant with UK lash extension safety regulations.",
    },
    {
      question: "Can I take deposits for lash appointments?",
      answer:
        "Absolutely. Elite Booker allows you to require deposits for new clients, evening appointments, or specific treatments like volume lash sets. Deposits are automatically collected via Stripe when clients book online, reducing no-shows by up to 70%.",
    },
    {
      question: "How much does Elite Booker cost for lash technicians?",
      answer:
        "Elite Booker offers a free Starter plan for new lash technicians, and a Professional plan at £29/month with unlimited bookings, SMS reminders, and all features. There are no setup fees, no commission charges, and no contracts.",
    },
    {
      question: "Does Elite Booker work for mobile lash technicians?",
      answer:
        "Yes, Elite Booker is perfect for mobile lash artists. You can set different availability for multiple locations, add travel time between appointments, and manage everything from your phone via the mobile-friendly dashboard.",
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Industries", url: "/industries" },
    { name: "Lash Technicians", url: "/industries/lash-technicians" },
  ];

  const lashTechniciansPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Lash Technician Booking Software UK",
    description:
      "Booking software for UK lash artists with online booking, deposits, reminders, and patch test tracking.",
    url: "https://www.elitebooker.co.uk/industries/lash-technicians",
    isPartOf: {
      "@type": "WebSite",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
  };

  const lashTechniciansServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Booking software for lash technicians",
    provider: {
      "@type": "Organization",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
    areaServed: "GB",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Lash technicians",
    },
  };

  return (
    <>
      <SEOHead
        title="Lash Technician Booking Software UK - Elite Booker"
        description="Booking system built for lash techs. Online scheduling, deposit protection, client reminders & patch test tracking. Trusted by UK lash artists."
        keywords="lash technician booking software UK, lash booking system, online booking for lash artists, lash appointment software, mobile lash booking app"
        canonical="https://www.elitebooker.co.uk/industries/lash-technicians"
        schema={[lashTechniciansPageSchema, lashTechniciansServiceSchema]}
      />
      <Header />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, #f8f5ef, #f6f2ea 55%, #efe8dc)",
        }}
      >
        {/* Hero Section */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="mb-5 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                Booking Software Built for UK Lash Technicians
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Stop juggling Instagram DMs, WhatsApp messages, and lost
                bookings. Elite Booker gives you a professional online booking
                system that works 24/7, reduces no-shows by 70%, and lets you
                focus on creating beautiful lashes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-lg hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/book-demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-700 hover:bg-slate-50 transition-all"
                >
                  Book a Demo
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                ✓ No credit card required ✓ Setup in 10 minutes ✓ No commission
                fees
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto bg-white">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Why Lash Artists Choose Elite Booker
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Everything you need to run your lash business professionally,
              without the admin headache
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Smartphone className="w-8 h-8 text-slate-700" />,
                  title: "24/7 Online Booking",
                  description:
                    "Clients book appointments directly through your custom booking page or website widget, even while you're working on another client",
                },
                {
                  icon: <Clock className="w-8 h-8 text-slate-700" />,
                  title: "Automated SMS Reminders",
                  description:
                    "Reduce no-shows by up to 70% with automatic appointment reminders sent 48 hours and 24 hours before",
                },
                {
                  icon: <Shield className="w-8 h-8 text-slate-700" />,
                  title: "Deposit Protection",
                  description:
                    "Require deposits for new clients or high-value treatments. Payments automatically processed via Stripe",
                },
                {
                  icon: <CheckCircle className="w-8 h-8 text-slate-700" />,
                  title: "Patch Test Tracking",
                  description:
                    "Record patch test dates and receive automatic alerts when they're due for renewal—essential for compliance",
                },
                {
                  icon: <Calendar className="w-8 h-8 text-slate-700" />,
                  title: "Treatment Duration Management",
                  description:
                    "Set accurate timings for different services (classic sets, volume, infills, removals) so your calendar reflects reality",
                },
                {
                  icon: <Camera className="w-8 h-8 text-slate-700" />,
                  title: "Client History & Photos",
                  description:
                    "Store before/after photos, lash length preferences, glue sensitivities, and retention issues—everything for personalised service",
                },
                {
                  icon: <Smartphone className="w-8 h-8 text-slate-700" />,
                  title: "Mobile-Friendly Dashboard",
                  description:
                    "Manage your bookings on the go from your phone. Perfect for mobile lash techs working from multiple locations",
                },
                {
                  icon: <CreditCard className="w-8 h-8 text-slate-700" />,
                  title: "No Commission Fees",
                  description:
                    "Keep 100% of your booking revenue. We never take a cut of your hard-earned income",
                },
                {
                  icon: <Gift className="w-8 h-8 text-slate-700" />,
                  title: "Gift Cards & Google Calendar Sync",
                  description:
                    "Sell digital gift cards and sync with your personal calendar to prevent double bookings",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Lash Technicians Are Saying
            </h2>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-slate-700"
              >
                <p className="text-gray-700 mb-4 italic">
                  "Since switching to Elite Booker, I've cut my no-show rate
                  from 30% to just 5%. The SMS reminders and deposit system have
                  been game-changers for my business. I'm now booked 3 weeks in
                  advance and no longer lose sleep worrying about gaps in my
                  schedule."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold mr-4">
                    CM
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Chloe M.</p>
                    <p className="text-gray-600 text-sm">
                      London Lash Technician
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-lg shadow-lg border-l-4 border-slate-700"
              >
                <p className="text-gray-700 mb-4 italic">
                  "I love that I can manage everything from my phone between
                  clients. The patch test reminders are brilliant—I used to
                  forget and had to turn clients away. Now it's all automated
                  and professional."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-bold mr-4">
                    ST
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sophie T.</p>
                    <p className="text-gray-600 text-sm">
                      Mobile Lash Artist, Manchester
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl">
              Get Started in 10 Minutes
            </h2>
            <p className="text-xl text-slate-100 mb-8">
              Setting up Elite Booker takes less time than scrolling through
              Instagram. Create your account, add your lash services, and share
              your booking link. Your clients can start booking immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-slate-700 transition-all"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}




