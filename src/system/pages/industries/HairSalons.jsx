/**
 * Hair Salon Booking Software Landing Page
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  Users,
  Calendar,
  MessageSquare,
  CreditCard,
  Gift,
  TrendingUp,
  Shield,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import SEOHead from "../../../shared/components/seo/SEOHead";

export default function HairSalons() {
  const faqs = [
    {
      question: "How does online booking work for hair salons?",
      answer:
        "Elite Booker provides a booking widget you can embed on your website or share as a standalone link. Clients select their service, preferred stylist, date and time, then book instantly. You get notifications and the appointment syncs to your calendar automatically.",
    },
    {
      question: "Can we manage multiple stylists with Elite Booker?",
      answer:
        "Yes, Elite Booker supports unlimited staff members. Each stylist has their own calendar, availability settings, and can be assigned specific services. Clients can choose their preferred stylist when booking, or you can auto-assign appointments.",
    },
    {
      question: "Does it integrate with our salon POS system?",
      answer:
        "Elite Booker has a built-in POS system for taking payments, selling retail products, and managing gift cards. It integrates with Stripe for card payments and generates detailed reports for your accountant.",
    },
    {
      question: "How much does Elite Booker cost for hair salons?",
      answer:
        "Plans start from £29/month for unlimited bookings, all features, and multi-staff support. There are no setup fees, no commission charges, and no long-term contracts. Cancel anytime.",
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Industries", url: "/industries" },
    { name: "Hair Salons", url: "/industries/hair-salons" },
  ];

  const hairSalonsPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Salon Management Software UK",
    description:
      "All-in-one software for UK hair salons with booking, staff scheduling, POS, and reporting.",
    url: "https://www.elitebooker.co.uk/industries/hair-salons",
    isPartOf: {
      "@type": "WebSite",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
  };

  const hairSalonsServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Booking software for hair salons",
    provider: {
      "@type": "Organization",
      name: "Elite Booker",
      url: "https://www.elitebooker.co.uk",
    },
    areaServed: "GB",
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Hair salons",
    },
  };

  return (
    <>
      <SEOHead
        title="Salon Management Software UK - Elite Booker"
        description="Complete management system for UK hair salons. Online booking, client database, stock control, POS & reporting. Used by 1000+ salons nationwide."
        canonical="https://www.elitebooker.co.uk/industries/hair-salons"
        schema={[hairSalonsPageSchema, hairSalonsServiceSchema]}
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
        {/* Hero */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="mb-5 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                Salon Management Software Trusted by 1,000+ UK Salons
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Run your hair salon smarter with all-in-one software: online
                booking, client management, staff scheduling, POS, and powerful
                reporting. No commission fees, ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-lg hover:from-slate-800 hover:to-slate-700 shadow-lg"
                >
                  Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-700 hover:bg-slate-50"
                >
                  Book a Demo
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto bg-white">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Everything Your Salon Needs in One Platform
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Calendar />,
                  title: "Online Booking 24/7",
                  desc: "Let clients book their own appointments anytime. Reduce phone calls by 80%.",
                },
                {
                  icon: <Users />,
                  title: "Multi-Staff Scheduling",
                  desc: "Manage your entire team's calendars, availability, and appointments in one place.",
                },
                {
                  icon: <MessageSquare />,
                  title: "Automated Reminders",
                  desc: "SMS and email reminders reduce no-shows by 70%. Set and forget.",
                },
                {
                  icon: <Shield />,
                  title: "Deposit Protection",
                  desc: "Require deposits for new clients or high-value services. Reduce no-shows to near zero.",
                },
                {
                  icon: <CreditCard />,
                  title: "Integrated POS",
                  desc: "Take payments for services and products. Card terminals, tips, split bills.",
                },
                {
                  icon: <Gift />,
                  title: "Gift Cards",
                  desc: "Sell digital gift cards online. Perfect for Christmas and birthdays.",
                },
                {
                  icon: <TrendingUp />,
                  title: "Business Reporting",
                  desc: "Track revenue, popular services, staff performance, and client retention.",
                },
                {
                  icon: <Smartphone />,
                  title: "Mobile App",
                  desc: "Manage your salon from your phone. Perfect for owners on-the-go.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Simple, Transparent Pricing
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-slate-700">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Plan
              </h3>
              <div className="mb-4 text-4xl font-bold text-slate-700 sm:text-5xl">
                £29<span className="text-2xl text-gray-600">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Unlimited
                  bookings & clients
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Unlimited staff
                  members
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> SMS reminders
                  (£2.99/month optional add-on)
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Deposit
                  protection
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Integrated POS
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Gift cards &
                  loyalty
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> Business
                  reporting
                </li>
                <li className="flex items-center">
                  <span className="text-slate-700 mr-2">✓</span> No commission
                  fees ever
                </li>
              </ul>
              <Link
                to="/signup"
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-800"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
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

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-14 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Salon?
            </h2>
            <p className="text-xl text-slate-100 mb-8">
              Join 1,000+ UK salons using Elite Booker. Setup takes 10 minutes.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

