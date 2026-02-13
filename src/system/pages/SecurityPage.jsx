import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import SEOHead from "../../shared/components/seo/SEOHead";
import PageTransition from "../../shared/components/ui/PageTransition";
import Header from "../components/Header";
import Footer from "../components/Footer";

const securitySections = [
  {
    title: "Platform Security Controls",
    points: [
      "Traffic is encrypted in transit using HTTPS/TLS.",
      "Sensitive credentials and secrets are managed through secure server-side environment configuration.",
      "Access to production systems is restricted and monitored.",
    ],
  },
  {
    title: "Payment Security",
    points: [
      "Card payments are processed by Stripe; Elite Booker does not store raw card details.",
      "Stripe Checkout and connected account controls are used to reduce PCI scope and protect transactions.",
    ],
  },
  {
    title: "Data Protection",
    points: [
      "We apply least-privilege principles to internal access and operational tooling.",
      "Backups, logging, and service monitoring support continuity and rapid issue detection.",
      "Security updates and dependency maintenance are applied as part of ongoing operations.",
    ],
  },
  {
    title: "Incident Response",
    points: [
      "Security incidents are triaged with priority and investigated with audit trails where available.",
      "If a material incident affects customer data, impacted parties are notified in line with legal obligations.",
    ],
  },
  {
    title: "Responsible Disclosure",
    points: [
      "If you identify a vulnerability, contact us at admin@elitebooker.co.uk with reproduction steps.",
      "Please avoid destructive testing and allow us time to investigate and remediate safely.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <SEOHead
        title="Security"
        description="Learn how Elite Booker secures booking data, payments, and platform infrastructure."
        canonical="https://www.elitebooker.co.uk/security"
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
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Trust
                  </p>
                  <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                    Security
                  </h1>
                </div>
              </div>

              <p className="text-sm text-slate-600 sm:text-base">
                Last updated: February 13, 2026
              </p>

              <div className="mt-8 space-y-7">
                {securitySections.map((section) => (
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
