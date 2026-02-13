import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";
import SEOHead from "../../shared/components/seo/SEOHead";
import PageTransition from "../../shared/components/ui/PageTransition";
import Header from "../components/Header";
import Footer from "../components/Footer";

const termsSections = [
  {
    title: "Use of Service",
    points: [
      "Elite Booker provides booking and operational tools for salons, spas, and wellness businesses.",
      "By using this website and platform, you agree to these terms and applicable UK laws.",
      "You must provide accurate account and booking information and keep credentials secure.",
    ],
  },
  {
    title: "Bookings and Payments",
    points: [
      "Payment, deposit, cancellation, and refund terms may vary by business using the platform.",
      "Online payments are processed by Stripe and are subject to Stripe’s terms.",
      "You are responsible for reviewing service details, pricing, and policies before confirming bookings.",
    ],
  },
  {
    title: "Acceptable Use",
    points: [
      "You must not misuse the platform, attempt unauthorised access, or interfere with service availability.",
      "Automated scraping, abuse, harassment, fraud, and unlawful conduct are prohibited.",
      "We may suspend or terminate access where misuse, risk, or legal non-compliance is identified.",
    ],
  },
  {
    title: "Intellectual Property",
    points: [
      "Elite Booker branding, software, and content remain our intellectual property unless stated otherwise.",
      "You may not copy, modify, redistribute, or reverse engineer the platform beyond lawful exceptions.",
    ],
  },
  {
    title: "Liability and Legal",
    points: [
      "The platform is provided on an as-available basis, subject to maintenance and third-party dependencies.",
      "To the extent permitted by law, we are not liable for indirect, consequential, or loss-of-profit damages.",
      "These terms are governed by the laws of England and Wales.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read the Elite Booker terms of service for platform usage, bookings, payments, and legal conditions."
        canonical="https://www.elitebooker.co.uk/terms"
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
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Legal
                  </p>
                  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                    Terms of Service
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-600 sm:text-base">
                Last updated: February 13, 2026
              </p>

              <div className="mt-8 space-y-7">
                {termsSections.map((section) => (
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
