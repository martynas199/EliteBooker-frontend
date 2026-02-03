/**
 * SMS Reminders Feature Page
 * Target: 'SMS appointment reminders UK', 'automated SMS reminders salon'
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  BarChart,
  Smartphone,
  Zap,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function SmsReminders() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
    { name: "SMS Reminders", url: "/features/sms-reminders" },
  ];

  const faqs = [
    {
      question: "How much do SMS reminders cost?",
      answer:
        "£2.99/month for unlimited SMS reminders. This optional add-on gives you unlimited texts to send appointment confirmations, reminders, and updates to your clients.",
    },
    {
      question: "Can clients reply to SMS reminders?",
      answer:
        "Yes! Clients can reply YES to confirm or NO to cancel. Replies are tracked in your dashboard and automatically update appointment status.",
    },
    {
      question: "When are SMS reminders sent?",
      answer:
        "You control the timing. Most salons send 48-hour and 24-hour reminders. You can also send immediate booking confirmations and 2-hour reminders for high-value treatments.",
    },
    {
      question: "Do I need SMS reminders if I use email?",
      answer:
        "Yes. SMS has a 98% open rate vs 20% for email. Text messages reach clients instantly on their phones and are far more effective at reducing no-shows.",
    },
    {
      question: "Can I customize SMS messages?",
      answer:
        "Absolutely. Customize message content, timing, and which appointment types trigger reminders. Add your salon name, address, phone number, and custom instructions.",
    },
  ];

  const benefits = [
    {
      icon: BarChart,
      title: "Reduce No-Shows by 70%",
      description:
        "SMS reminders cut forgotten appointments dramatically. 98% open rate means clients actually see your message.",
    },
    {
      icon: Clock,
      title: "Save 5 Hours Per Week",
      description:
        "Stop manually calling clients to confirm. Automated SMS works 24/7 while you focus on delivering great service.",
    },
    {
      icon: CheckCircle,
      title: "One-Click Confirmations",
      description:
        "Clients reply YES to confirm or NO to cancel. You get instant confirmation status in your dashboard.",
    },
    {
      icon: Smartphone,
      title: "98% Open Rate",
      description:
        "Unlike email (20% open rate), SMS messages are read within minutes. Clients have phones with them everywhere.",
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description:
        "Messages arrive instantly. No spam folders, no delays. Direct to their phone, every time.",
    },
    {
      icon: MessageSquare,
      title: "Two-Way Communication",
      description:
        "Clients can reply with questions, reschedule requests, or cancellations. You respond from one dashboard.",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Client Books Appointment",
      description:
        "When a client books online or you add them manually, the appointment enters your calendar.",
    },
    {
      step: "2",
      title: "Automatic Confirmation (Immediate)",
      description:
        "Client instantly receives SMS: 'Hi Sarah, your lashes are booked for Friday 2pm with Emma at The Beauty Lounge. See you then!'",
    },
    {
      step: "3",
      title: "48-Hour Reminder",
      description:
        "2 days before: 'Hi Sarah, reminder you have lashes tomorrow at 2pm. Reply YES to confirm or NO to cancel.'",
    },
    {
      step: "4",
      title: "24-Hour Reminder",
      description:
        "1 day before: 'See you tomorrow at 2pm! Address: 123 High St. Running late? Call 020 1234 5678.'",
    },
    {
      step: "5",
      title: "Client Confirms or Cancels",
      description:
        "Client replies YES (confirmed) or NO (cancelled). Your dashboard updates automatically. If they cancel, your waitlist is notified.",
    },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>
          SMS Appointment Reminders - Reduce No-Shows by 70% | Elite Booker
        </title>
        <meta
          name="description"
          content="Automated SMS reminders for UK salons. 98% open rate, one-click confirmations, reduce no-shows by 70%. £2.99/month unlimited. Try free today."
        />
        <meta
          name="keywords"
          content="SMS appointment reminders UK, automated SMS reminders salon, appointment confirmation SMS, reduce no-shows SMS, beauty salon text reminders"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/features/sms-reminders"
        />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <div
        className="min-h-screen"
        style={{
          background:
            "linear-gradient(to bottom, rgb(249, 250, 251), rgb(255, 255, 255))",
        }}
      >
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-block bg-emerald-500 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                98% Open Rate • 70% Fewer No-Shows
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                SMS Appointment Reminders That Actually Get Read
              </h1>
              <p className="text-xl text-emerald-50 mb-8 max-w-3xl mx-auto">
                Stop losing money to forgotten appointments. Automated SMS
                reminders reduce no-shows by 70% with 98% open rate. Unlimited
                SMS for just £2.99/month (optional).
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-400 border-2 border-white"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-emerald-600 mb-2">
                  98%
                </div>
                <div className="text-gray-600">SMS Open Rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-600 mb-2">
                  70%
                </div>
                <div className="text-gray-600">Fewer No-Shows</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-600 mb-2">
                  3min
                </div>
                <div className="text-gray-600">Average Read Time</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-emerald-600 mb-2">
                  £2.99
                </div>
                <div className="text-gray-600">Unlimited Per Month</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              How SMS Reminders Work
            </h2>
            <div className="space-y-8">
              {howItWorks.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-6 bg-white p-6 rounded-xl border-2 border-gray-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-700">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
              Why SMS Reminders Beat Everything Else
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 transition-all"
                >
                  <benefit.icon className="w-12 h-12 text-emerald-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-8">
              Simple, Transparent Pricing
            </h2>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 rounded-2xl text-center">
              <div className="text-6xl font-bold mb-4">£2.99/month</div>
              <div className="text-2xl text-emerald-50 mb-6">
                Unlimited SMS Reminders
              </div>
              <ul className="text-left max-w-md mx-auto space-y-3 text-emerald-50 mb-8">
                <li>✓ Unlimited appointment reminders</li>
                <li>✓ Unlimited confirmations</li>
                <li>✓ Two-way SMS replies</li>
                <li>✓ Customize message content & timing</li>
                <li>✓ Cancel anytime (optional add-on)</li>
              </ul>
              <p className="text-emerald-100 mb-6">
                Compare: 100 SMS/month at 5p each = £5/month with competitors.
                We charge flat £2.99 for unlimited.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
              >
                Start Free Trial
              </Link>
              <p className="text-emerald-100 mt-4 text-sm">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 px-4 bg-gray-50">
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
        <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Reduce No-Shows by 70%?
            </h2>
            <p className="text-xl text-emerald-50 mb-8">
              Join 1,000+ UK salons using Elite Booker's SMS reminders. Set up
              in 5 minutes, see results immediately.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <p className="text-emerald-100 mt-4">
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
