import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Phone, Book } from "lucide-react";
import PageTransition from "../../shared/components/ui/PageTransition";
import SEOHead from "../../shared/components/seo/SEOHead";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function HelpPage() {
  const helpTopics = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "How to book an appointment",
      description: "Step-by-step guide to booking your first appointment",
      link: "#booking",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Managing your bookings",
      description: "View, reschedule, or cancel your appointments",
      link: "#manage",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Payment & refunds",
      description: "Learn about payments, deposits, and refund policy",
      link: "#payments",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Account settings",
      description: "Update your profile and notification preferences",
      link: "#account",
    },
  ];

  return (
    <>
      <SEOHead
        title="Help & Support"
        description="Get help with booking appointments, managing your account, and more."
        canonical="https://www.elitebooker.co.uk/help"
      />

      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
          <Header />

          {/* Hero */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to home</span>
            </Link>

            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How can we help you?
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Find answers to common questions or get in touch with our
                support team
              </p>
            </div>

            {/* Help Topics Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {helpTopics.map((topic, index) => (
                <a
                  key={index}
                  href={topic.link}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-slate-700 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-gray-600">{topic.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Still need help?
                </h2>
                <p className="text-gray-600">
                  Our support team is here to assist you
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <a
                  href="mailto:support@elitebooker.com"
                  className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-slate-500 hover:bg-slate-50 transition-all group"
                >
                  <div className="p-3 rounded-full bg-slate-100 text-slate-700">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-slate-700">
                      Email Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      support@elitebooker.com
                    </p>
                  </div>
                </a>

                <button className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-slate-500 hover:bg-slate-50 transition-all group">
                  <div className="p-3 rounded-full bg-slate-100 text-slate-700">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-slate-700">
                      Live Chat
                    </h3>
                    <p className="text-sm text-gray-600">Available 9am - 6pm</p>
                  </div>
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 group">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    <span>How do I create an account?</span>
                    <span className="text-slate-700">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Click "Log in or sign up" in the menu, then sign in with
                    your Google account or email. Your account will be created
                    automatically when you make your first booking.
                  </p>
                </details>

                <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    <span>Can I cancel or reschedule my booking?</span>
                    <span className="text-slate-700">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Yes! You can manage your bookings from your account profile.
                    Cancellation policies vary by business, so please check the
                    specific terms when booking.
                  </p>
                </details>

                <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    <span>How do payments work?</span>
                    <span className="text-slate-700">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Payments are processed securely through Stripe. Some
                    businesses require a deposit upfront, while others accept
                    payment at the salon. You'll see payment options during
                    checkout.
                  </p>
                </details>

                <details className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    <span>Will I receive a confirmation?</span>
                    <span className="text-slate-700">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600">
                    Yes! You'll receive an email confirmation immediately after
                    booking. You'll also receive reminder emails before your
                    appointment.
                  </p>
                </details>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </PageTransition>
    </>
  );
}


