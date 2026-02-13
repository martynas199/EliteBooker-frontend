/**
 * Online Booking Feature Page
 * Target: '24/7 booking software', 'online appointment booking UK'
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Smartphone,
  Globe,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import FAQSchema from "../../../shared/components/Schema/FAQSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function OnlineBooking() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features" },
    { name: "Online Booking", url: "/features/online-booking" },
  ];

  const faqs = [
    {
      question: "How do clients book online?",
      answer:
        "You get a unique booking link (e.g. elitebooker.co.uk/yoursal on). Share it on Instagram, Facebook, Google, your website. Clients click, choose service, pick time, pay deposit (optional), done. Takes 60 seconds.",
    },
    {
      question: "Can clients book on their phones?",
      answer:
        "Yes! Fully mobile-optimized. 80% of UK bookings happen on phones. Your booking page works beautifully on iPhone, Android, tablets, and desktop.",
    },
    {
      question: "What if I'm already fully booked?",
      answer:
        "Clients only see available slots. Your calendar updates in real-time as appointments are booked. No double-bookings, no manual blocking. They can join the waitlist for popular times.",
    },
    {
      question: "Can clients book outside business hours?",
      answer:
        "Yes, that's the magic! Clients book at 11pm on Sunday when they remember. You wake up to new bookings. 24/7 availability increases bookings by 30%.",
    },
    {
      question: "Do I need a website?",
      answer:
        "No! Your Elite Booker booking page IS your website. Or embed it into your existing site with one line of code. Works either way.",
    },
  ];

  return (
    <>
      <Header />
      <Helmet>
        <title>
          24/7 Online Booking System | Accept Appointments Anytime | Elite
          Booker
        </title>
        <meta
          name="description"
          content="Let UK clients book appointments 24/7. Mobile-optimized, real-time availability, instant confirmations. Increase bookings 30% with online scheduling."
        />
        <meta
          name="keywords"
          content="24/7 booking software, online appointment booking UK, mobile booking system, salon online scheduling, beauty booking platform"
        />
        <link
          rel="canonical"
          href="https://www.elitebooker.co.uk/features/online-booking"
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
              <Clock className="mx-auto mb-6 h-14 w-14 text-slate-200 sm:h-16 sm:w-16" />
              <h1 className="mx-auto mb-5 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_6px_26px_rgba(0,0,0,0.78)] sm:text-4xl lg:text-5xl">
                Accept Bookings 24/7, Even While You Sleep
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-base text-slate-50 sm:text-lg">
                Clients book at 11pm when they remember. You wake up to new
                appointments. Mobile-optimized online booking increases revenue
                by 30% without lifting a finger.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-semibold rounded-lg hover:bg-gray-100 shadow-lg"
                >
                  Start Free Trial
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center justify-center px-8 py-4 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 border-2 border-white"
                >
                  See Live Demo
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="mb-2 text-4xl font-bold text-slate-700 sm:text-5xl">
                  30%
                </div>
                <div className="text-gray-600">More Bookings</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-slate-700 sm:text-5xl">
                  24/7
                </div>
                <div className="text-gray-600">Always Open</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-slate-700 sm:text-5xl">
                  60sec
                </div>
                <div className="text-gray-600">Booking Time</div>
              </div>
              <div>
                <div className="mb-2 text-4xl font-bold text-slate-700 sm:text-5xl">
                  £0
                </div>
                <div className="text-gray-600">Setup Cost</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Online Booking */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Clients Love Online Booking
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl border-2 border-slate-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For Clients:
                </h3>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Book at 11pm when they remember (not waiting for you to
                      open)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      See real availability (not "I'll check and call you back")
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>No phone anxiety (introverts love this!)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>Instant confirmation (no waiting)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>Easy reschedule/cancel (one click)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-xl border-2 border-slate-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  For You:
                </h3>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>Stop answering phone calls during treatments</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      No more "let me check my calendar" conversations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Bookings while you sleep, on holiday, or with clients
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      Automatic deposit collection (no chasing payments)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-slate-700 mr-3 mt-1 flex-shrink-0" />
                    <span>Professional image (not amateur "DM to book")</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              How It Works
            </h2>
            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Share Your Link",
                  desc: "Get your unique booking link: elitebooker.co.uk/yoursalon. Add to Instagram bio, Facebook page, Google Business, website. QR codes for in-salon.",
                },
                {
                  step: "2",
                  title: "Client Chooses Service",
                  desc: "They see your services with photos, descriptions, prices, durations. Click the one they want. Simple, visual, mobile-friendly.",
                },
                {
                  step: "3",
                  title: "Pick Time & Staff",
                  desc: "Calendar shows real availability. Choose their preferred therapist or 'any available'. Only see slots that are actually free.",
                },
                {
                  step: "4",
                  title: "Enter Details",
                  desc: "Name, phone, email. Optional: pay deposit (if you require it). Takes 30 seconds.",
                },
                {
                  step: "5",
                  title: "Instant Confirmation",
                  desc: "SMS + email confirmation sent immediately. Add-to-calendar link. They're booked. You're notified. Done.",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-6 bg-white p-6 rounded-xl border-2 border-gray-200"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-700">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile First */}
        <section className="px-4 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Smartphone className="w-16 h-16 text-slate-700 mb-6" />
                <h2 className="mb-5 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Mobile-First Design
                </h2>
                <p className="text-xl text-gray-700 mb-6">
                  80% of UK bookings happen on phones. Your booking page is
                  designed mobile-first, then adapted for desktop. Fast loading,
                  thumb-friendly buttons, no zooming or scrolling.
                </p>
                <ul className="space-y-3 text-lg text-gray-700">
                  <li>✓ Works on iPhone, Android, tablets</li>
                  <li>✓ No app download required</li>
                  <li>✓ Saves payment info for next time</li>
                  <li>✓ One-click rebook favorite treatments</li>
                </ul>
              </div>
              <div className="bg-gray-100 rounded-2xl p-8 text-center">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-auto">
                  <div className="text-left">
                    <div className="text-sm text-gray-500 mb-4">
                      Mobile Preview
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      The Beauty Lounge
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-[#f8f5ef] to-[#efe8dc] p-4 rounded-lg border border-slate-200">
                        <div className="font-semibold text-gray-900">
                          Eyelash Extensions
                        </div>
                        <div className="text-sm text-gray-600">
                          90 min • £65
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-semibold text-gray-900">
                          Gel Nails
                        </div>
                        <div className="text-sm text-gray-600">
                          60 min • £35
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="font-semibold text-gray-900">
                          Facial Treatment
                        </div>
                        <div className="text-sm text-gray-600">
                          75 min • £50
                        </div>
                      </div>
                    </div>
                    <button className="w-full mt-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-lg">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI */}
        <section className="bg-slate-50 px-4 py-14 sm:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <TrendingUp className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <h2 className="mb-5 text-2xl font-bold text-gray-900 sm:text-3xl">
              The ROI is Massive
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              UK salons using online booking report 30% increase in appointments
              within 3 months.
            </p>
            <div className="bg-white p-8 rounded-2xl border-2 border-slate-700">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Example: Small Salon
              </h3>
              <div className="space-y-3 text-lg text-gray-700">
                <p>
                  <strong>Before:</strong> 80 appointments/month (phone bookings
                  only)
                </p>
                <p>
                  <strong>After:</strong> 104 appointments/month (+30% from 24/7
                  availability)
                </p>
                <p>
                  <strong>Average treatment:</strong> £45
                </p>
                <p className="text-2xl font-bold text-slate-700 mt-4">
                  +£1,080/month revenue
                </p>
                <p className="text-gray-600">
                  That's £12,960/year from adding online booking.
                </p>
              </div>
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
              Start Accepting Bookings 24/7 Today
            </h2>
            <p className="mb-8 text-base text-slate-50 sm:text-lg">
              Set up your online booking page in 10 minutes. Get your first
              booking tonight.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-700 font-bold rounded-lg hover:bg-gray-100 shadow-lg"
            >
              Start Your Free Trial
            </Link>
            <p className="mt-4 text-sm text-slate-50">
              14-day free trial • No credit card required • £0 Basic plan
              forever
            </p>
            <p className="mt-2 text-xs text-slate-100 sm:text-sm">
              <Link to="/pricing" className="underline hover:text-white">
                View pricing
              </Link>
              {" • "}
              <Link to="/compare" className="underline hover:text-white">
                Compare alternatives
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



