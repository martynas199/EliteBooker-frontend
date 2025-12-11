import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle, Phone, Book } from "lucide-react";
import PageTransition from "../../shared/components/ui/PageTransition";
import SEOHead from "../../shared/components/seo/SEOHead";

export default function HelpPage() {
  const navigate = useNavigate();

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
        title="Help & Support | EliteBooker"
        description="Get help with booking appointments, managing your account, and more."
      />

      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-violet-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to home</span>
              </button>
            </div>
          </header>

          {/* Hero */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                    <div className="p-3 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-600 group-hover:scale-110 transition-transform">
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
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
                  className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-violet-600 hover:bg-violet-50 transition-all group"
                >
                  <div className="p-3 rounded-full bg-violet-100 text-violet-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-violet-600">
                      Email Support
                    </h3>
                    <p className="text-sm text-gray-600">
                      support@elitebooker.com
                    </p>
                  </div>
                </a>

                <button className="flex items-center gap-4 p-6 rounded-xl border-2 border-gray-200 hover:border-violet-600 hover:bg-violet-50 transition-all group">
                  <div className="p-3 rounded-full bg-violet-100 text-violet-600">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-violet-600">
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
                    <span className="text-violet-600">+</span>
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
                    <span className="text-violet-600">+</span>
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
                    <span className="text-violet-600">+</span>
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
                    <span className="text-violet-600">+</span>
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
        </div>
      </PageTransition>
    </>
  );
}
