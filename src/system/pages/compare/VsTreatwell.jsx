import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SEOHead from "../../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const LAST_UPDATED = "2026-02-17";

const rows = [
  {
    feature: "Subscription",
    elite: "GBP 0 (Basic) / GBP 9.99 Pro",
    competitor: "Freelancer and Advanced plans listed with Start for free",
    notes: "Treatwell pricing: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Freelancer plan scope",
    elite: "N/A",
    competitor:
      "Digital calendar to manage your schedule on the go; New customers via the Treatwell marketplace; Mobile-friendly interface to suit your needs",
    notes: "Treatwell pricing: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Advanced plan scope",
    elite: "N/A",
    competitor:
      "Everything included in the Freelancer plan; Unlimited staff members",
    notes: "Treatwell pricing: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Marketplace commission",
    elite: "No marketplace commission model",
    competitor:
      "New client commission applies to clients introduced via the Treatwell marketplace (subject to location)",
    notes:
      "Treatwell pricing source: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Booking fees",
    elite: "GBP 0.99 on Basic, waived on Pro/Enterprise",
    competitor:
      "0% commission for repeat bookings; 2.5% processing fee for online prepayments; all commissions and fees are subject to VAT",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/pricing | Treatwell: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Deposits / policy controls",
    elite: "Supports",
    competitor: "Unknown",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/features/no-show-protection | Treatwell pricing: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Calendar integrations",
    elite: "Supports",
    competitor: "Unknown",
    notes:
      "Elite Booker features: https://www.elitebooker.co.uk/features | Treatwell pricing: https://www.treatwell.co.uk/partners/pricing/",
  },
  {
    feature: "Data export / portability",
    elite: "Unknown",
    competitor: "Unknown",
    notes:
      "Treatwell pricing source: https://www.treatwell.co.uk/partners/pricing/",
  },
];

const sources = [
  {
    label: "Elite Booker pricing",
    url: "https://www.elitebooker.co.uk/pricing",
  },
  {
    label: "Elite Booker features",
    url: "https://www.elitebooker.co.uk/features",
  },
  {
    label: "Treatwell partner pricing",
    url: "https://www.treatwell.co.uk/partners/pricing/",
  },
];

const faqs = [
  {
    question:
      "Does Treatwell list clear monthly GBP prices on the linked partner pricing page?",
    answer:
      "The linked page clearly lists Freelancer and Advanced plans plus commission and processing terms, but explicit monthly GBP figures may vary or not be shown in all contexts.",
  },
  {
    question: "What Treatwell terms are clearly stated on the source page?",
    answer:
      "New client commission applies for marketplace-introduced clients (subject to location), repeat bookings show 0% commission, online prepayments include a 2.5% processing fee, and fees are subject to VAT.",
  },
  {
    question: "How should salons compare costs fairly between platforms?",
    answer:
      "Use the same booking volume assumptions, expected new-client mix, and payment behavior across both platforms, then compare fixed and variable cost components.",
  },
  {
    question: "Why are some Treatwell feature rows marked Unknown?",
    answer:
      "Unknown is used where current public sources do not clearly confirm a capability. This prevents unsupported feature claims.",
  },
];

export default function VsTreatwell() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "vs Treatwell", url: "/compare/vs-treatwell" },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="Elite Booker vs Treatwell | UK Booking Software Comparison"
        description="Source-linked UK comparison of Elite Booker vs Treatwell pricing structure, fees, and operational feature areas."
        canonical="https://www.elitebooker.co.uk/compare/vs-treatwell"
        schema={faqSchema}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-white px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Elite Booker vs Treatwell
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">
            Public pricing data is summarised below with source links. The table
            focuses on cost structure and core operational categories for UK
            businesses.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                Treatwell snapshot
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Subscription and commission model are publicly discussed and
                should be rechecked before signing.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Elite Booker snapshot
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Free-to-enter pricing with Pro and Enterprise tiers listed on
                the pricing page.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Last updated: {LAST_UPDATED}
          </p>
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Vendor terms can change. Confirm final numbers on each provider's
            pricing page before switching.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
              Quick takeaway
            </p>
            <p className="mt-2 text-sm text-slate-700">
              If your team wants predictable cost structure, map subscription
              and commission exposure together before deciding on long-term
              platform fit.
            </p>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-lg"
        >
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Elite Booker
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Treatwell
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.feature}
                  className="border-t border-slate-200 even:bg-slate-50/60"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.elite}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {row.competitor}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.section>

        <section className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Comparison FAQs</h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm text-slate-700">{faq.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Sources to verify
          </h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            {sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-900 underline"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/pricing"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              See Elite Booker pricing
            </Link>
            <Link
              to="/features"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              See feature breakdown
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start free trial
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
