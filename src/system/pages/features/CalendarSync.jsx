/**
 * Calendar Sync Feature Page
 * Target: 'Google Calendar booking', 'calendar sync appointment software UK'
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  RefreshCw,
  Clock,
  Smartphone,
  CheckCircle2,
  Zap,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CalendarSync() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
    { name: "Calendar Sync", url: "/features/calendar-sync" },
  ];

  const faqs = [
    {
      question: "Which calendars does Elite Booker sync with?",
      answer:
        "Google Calendar, Apple Calendar (iCal), Microsoft Outlook, and any calendar that supports iCal/ICS format. Two-way sync keeps everything automatically updated.",
    },
    {
      question: "What is two-way sync?",
      answer:
        "Changes in either calendar update the other automatically. Book in Elite Booker → appears in Google Calendar. Block time in Google Calendar → appears as busy in Elite Booker. No manual copying.",
    },
    {
      question: "Does calendar sync work on mobile?",
      answer:
        "Yes! Syncs with your phone's calendar app (iPhone Calendar, Google Calendar app, Outlook mobile). Appointments appear alongside your personal events.",
    },
    {
      question: "What if I have multiple staff members?",
      answer:
        "Each staff member connects their own calendar. Their Elite Booker availability syncs with their personal calendar. Perfect for freelancers or multi-location teams.",
    },
    {
      question: "How often does it sync?",
      answer:
        "Real-time. New bookings appear in your calendar within seconds. Changes in your personal calendar update Elite Booker within 5 minutes.",
    },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>
          Google Calendar Sync | Two-Way Appointment Sync | Elite Booker
        </title>
        <meta
          name="description"
          content="Sync appointments with Google Calendar, Apple Calendar, Outlook. Two-way sync, real-time updates, mobile app integration. Never double-book again."
        />
        <meta
          name="keywords"
          content="Google Calendar booking, calendar sync appointment software UK, two-way calendar sync, iCal sync booking system, Outlook calendar integration"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/features/calendar-sync"
        />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
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
              <Calendar className="mx-auto mb-6 h-14 w-14 text-slate-200 sm:h-16 sm:w-16" />
              <h1 className="mx-auto mb-5 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.78)] sm:text-4xl lg:text-5xl">
                Sync with Google Calendar, Apple, Outlook
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-50 sm:text-lg">
                Two-way calendar sync keeps your appointments and personal life
                in perfect harmony. Book in Elite Booker → appears in Google
                Calendar. Block time in Google Calendar → appears as busy in
                Elite Booker.
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

        {/* The Problem/Solution */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-red-50 p-8 rounded-xl border-2 border-red-200">
                <h3 className="text-2xl font-bold text-red-900 mb-4">
                  Without Calendar Sync:
                </h3>
                <ul className="space-y-3 text-lg text-gray-800">
                  <li>❌ Manually copy appointments to personal calendar</li>
                  <li>❌ Double bookings (forgot to block personal time)</li>
                  <li>❌ Checking two calendars constantly</li>
                  <li>❌ Missing appointments (didn't sync on phone)</li>
                  <li>❌ Confusion when schedules change</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border-2 border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  With Calendar Sync:
                </h3>
                <ul className="space-y-3 text-lg text-gray-800">
                  <li>✅ Appointments auto-appear in Google Calendar</li>
                  <li>✅ Block personal time = auto-busy in Elite Booker</li>
                  <li>✅ One calendar to check (your phone's)</li>
                  <li>✅ Real-time updates everywhere</li>
                  <li>✅ Never double-book again</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              How Two-Way Sync Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl text-center border-2 border-slate-200">
                <RefreshCw className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Connect Once
                </h3>
                <p className="text-gray-700">
                  Click "Connect Google Calendar" in Elite Booker settings.
                  Authorize access (read & write permissions). Done in 30
                  seconds.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border-2 border-slate-200">
                <Zap className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Auto-Sync Bookings
                </h3>
                <p className="text-gray-700">
                  New Elite Booker appointments appear in Google Calendar
                  automatically with client name, service, duration, location.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl text-center border-2 border-slate-200">
                <Clock className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Block Personal Time
                </h3>
                <p className="text-gray-700">
                  Add "Doctor Appointment" to Google Calendar → Elite Booker
                  marks you as busy. Clients can't book that slot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Perfect For:
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Salon Owners with Personal Lives
                </h3>
                <p className="text-lg text-gray-700">
                  "I block school pickup (3-4pm) in my Google Calendar and Elite
                  Booker automatically shows me as unavailable. Clients can't
                  accidentally book me during family time."
                </p>
                <p className="text-gray-600 mt-4">
                  — Sarah, Manchester Hair Salon
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Mobile Therapists
                </h3>
                <p className="text-lg text-gray-700">
                  "My appointments show with client addresses in Apple Calendar.
                  I use that for navigation and time management. Everything's on
                  my phone."
                </p>
                <p className="text-gray-600 mt-4">
                  — Emma, London Mobile Lash Tech
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Multi-Location Teams
                </h3>
                <p className="text-lg text-gray-700">
                  "Each therapist has their own calendar. I can see everyone's
                  Google Calendar to coordinate schedules and cover gaps."
                </p>
                <p className="text-gray-600 mt-4">
                  — Marcus, Birmingham Spa Chain
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Freelancers Working Multiple Salons
                </h3>
                <p className="text-lg text-gray-700">
                  "I rent chairs at 2 salons. My Google Calendar shows all
                  bookings from both locations. No more double-booking
                  confusion."
                </p>
                <p className="text-gray-600 mt-4">
                  — Priya, Leeds Freelance Stylist
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              What Gets Synced
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: CheckCircle2,
                  title: "Client Name",
                  desc: "See who you're seeing",
                },
                {
                  icon: Clock,
                  title: "Start & End Times",
                  desc: "Accurate duration",
                },
                {
                  icon: Smartphone,
                  title: "Service Type",
                  desc: "What treatment",
                },
                {
                  icon: Calendar,
                  title: "Location",
                  desc: "Salon address or mobile",
                },
                {
                  icon: RefreshCw,
                  title: "Updates",
                  desc: "Changes sync automatically",
                },
                {
                  icon: Zap,
                  title: "Cancellations",
                  desc: "Removed from both calendars",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center"
                >
                  <feature.icon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700">{feature.desc}</p>
                </div>
              ))}
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
              Sync Your Calendar in 30 Seconds
            </h2>
            <p className="mb-8 text-base text-slate-50 sm:text-lg">
              Connect Google Calendar, Apple Calendar, or Outlook. Two-way sync
              keeps everything automatically updated.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}




