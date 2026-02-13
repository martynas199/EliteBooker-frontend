import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import SEOHead from "../../shared/components/seo/SEOHead";
import PageTransition from "../../shared/components/ui/PageTransition";
import Header from "../components/Header";
import Footer from "../components/Footer";

const privacySections = [
  {
    title: "Information We Collect",
    points: [
      "Account details such as name, email address, phone number, and business profile data.",
      "Booking information including services selected, appointment times, and communication preferences.",
      "Technical data such as device/browser details, IP address, and usage analytics for platform performance.",
    ],
  },
  {
    title: "How We Use Your Information",
    points: [
      "Deliver and improve the booking platform, reminders, and account features.",
      "Process payments securely through trusted payment partners such as Stripe.",
      "Provide customer support, fraud prevention, and service reliability monitoring.",
    ],
  },
  {
    title: "Sharing and Storage",
    points: [
      "We only share data with essential processors (for example hosting, email, SMS, and payment providers).",
      "We do not sell personal data.",
      "Data is retained only as long as needed for legal, operational, and contractual obligations.",
    ],
  },
  {
    title: "Your Rights (UK GDPR)",
    points: [
      "You may request access, correction, deletion, or restriction of your personal data.",
      "You may object to processing and request portability where applicable.",
      "To exercise your rights, contact us at admin@elitebooker.co.uk.",
    ],
  },
  {
    title: "Cookies",
    points: [
      "We use cookies and similar technologies for authentication, session security, analytics, and performance.",
      "You can control cookies through your browser settings; some platform features may be limited if disabled.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Read how Elite Booker collects, uses, stores, and protects personal data under UK GDPR."
        canonical="https://www.elitebooker.co.uk/privacy"
      />

      <PageTransition>
        <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
          <Header />

          <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8 lg:p-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Legal
                  </p>
                  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                    Privacy Policy
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-600 sm:text-base">
                Last updated: February 13, 2026
              </p>

              <div className="mt-8 space-y-7">
                {privacySections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {section.title}
                    </h2>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 sm:text-base">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </PageTransition>
    </>
  );
}
