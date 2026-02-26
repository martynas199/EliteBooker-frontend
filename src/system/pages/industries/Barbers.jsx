/**
 * Barber Shop Booking System Landing Page
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Scissors,
  Users,
  Clock,
  Shield,
  Smartphone,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import SEOHead from "../../../shared/components/seo/SEOHead";

export default function Barbers() {
  const faqs = [
    {
      question: "Can customers book haircuts online?",
      answer:
        "Yes, Elite Booker lets your customers book their haircut appointments 24/7 through your website or booking link. They choose their barber, service, and time slot in seconds.",
    },
    {
      question: "Does it work for walk-in customers?",
      answer:
        "Yes. You can quickly add walk-in customers to your schedule from the dashboard and manage appointments in one place.",
    },
    {
      question: "Can each barber have their own schedule?",
      answer:
        "Yes, every barber in your shop gets their own calendar with individual availability settings. Customers can choose their preferred barber when booking.",
    },
    {
      question: "How do SMS reminders reduce no-shows?",
      answer:
        "Automated SMS reminders are sent 48 and 24 hours before appointments. This helps reduce forgotten appointments and lowers no-shows.",
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Industries", url: "/industries" },
    { name: "Barbers", url: "/industries/barbers" },
  ];

  const barbersPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Barber Shop Booking System UK",
    description:
      "Booking software for UK barber shops with reminders and staff scheduling.",
    url: "https://www.elitebooker.co.uk/industries/barbers",
    isPartOf: {
      "@type": "WebSite",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
  };

  const barbersServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Booking software for barbershops",
    provider: {
      "@type": "Organization",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
    areaServed: "GB",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Barber shops",
    },
  };

  return (
    <>
      <SEOHead
        title="Barber Shop Booking System UK - Reduce No-Shows"
        description="Modern booking software for UK barber shops. Online bookings, SMS reminders & staff scheduling. No commission fees."
        canonical="https://www.elitebooker.co.uk/industries/barbers"
        schema={[barbersPageSchema, barbersServiceSchema]}
      />
      <Header />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, #eef4ff, #edf4ff 55%, #dfeeff)",
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
                Booking Software Built for UK Barber Shops
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Stop juggling phone calls and double bookings. Elite Booker
                gives you a professional online booking system that works 24/7,
                reduces no-shows by 70%, and lets you focus on cutting hair.
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
                  to="/signup"
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
              Why Barbers Choose Elite Booker
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Everything you need to run your barber shop professionally, from
              walk-ins to bookings
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar className="w-8 h-8 text-slate-700" />,
                  title: "24/7 Online Booking",
                  description:
                    "Customers book their own appointments online anytime. Frees up your phone lines and reduces admin work.",
                },
                {
                  icon: <Users className="w-8 h-8 text-slate-700" />,
                  title: "Walk-In Booking Support",
                  description:
                    "Quickly add walk-in customers to your schedule and keep your day organised from one dashboard.",
                },
                {
                  icon: <MessageSquare className="w-8 h-8 text-slate-700" />,
                  title: "Automated SMS Reminders",
                  description:
                    "Send automatic reminders 48 & 24 hours before appointments. Cut no-shows by 70% and keep your chair filled.",
                },
                {
                  icon: <Shield className="w-8 h-8 text-slate-700" />,
                  title: "Deposit Protection",
                  description:
                    "Require deposits for evening/weekend slots or new clients. Secure your busiest times and reduce no-shows to near zero.",
                },
                {
                  icon: <Users className="w-8 h-8 text-slate-700" />,
                  title: "Multi-Barber Scheduling",
                  description:
                    "Manage unlimited barbers, each with their own calendar, availability settings, and service menu.",
                },
                {
                  icon: <Smartphone className="w-8 h-8 text-slate-700" />,
                  title: "Mobile Dashboard",
                  description:
                    "Manage bookings, check your schedule, and update availability from your phone. Perfect for busy barber shops.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  MT
                </div>
                <p className="text-2xl font-medium text-gray-900 mb-2">
                  Marcus Thompson
                </p>
                <p className="text-gray-600">Owner, Birmingham Barbers</p>
              </div>
              <blockquote className="text-xl text-gray-700 italic max-w-3xl mx-auto leading-relaxed">
                "Elite Booker cut our no-shows from 25% to under 5%. The SMS
                reminders work brilliantly, and customers love being able to
                book online. Best investment we've made for our shop."
              </blockquote>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-gray-600 mb-12">
              Everything you need to know about Elite Booker for barber shops
            </p>

            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="border-b border-gray-200 pb-6 last:border-0"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl">
              Ready to Modernize Your Barber Shop?
            </h2>
            <p className="text-xl text-slate-100 mb-8">
              Join hundreds of UK barbers using Elite Booker. Setup takes 10
              minutes.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="mt-4 text-slate-100 text-sm">
              No credit card required • Cancel anytime • Free 14-day trial
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

