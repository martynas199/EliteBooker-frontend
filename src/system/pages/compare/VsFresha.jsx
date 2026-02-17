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
    competitor: "GBP 14.95/month",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/pricing | Fresha: https://www.fresha.com/pricing",
  },
  {
    feature: "Marketplace commission",
    elite: "No marketplace commission model",
    competitor: "20% on new clients (minimum GBP 4)",
    notes: "Source: https://www.fresha.com/pricing",
  },
  {
    feature: "Online payment fee",
    elite: "Standard Stripe processing",
    competitor: "1.40% + 25p",
    notes: "Source: https://www.fresha.com/pricing",
  },
  {
    feature: "SMS reminders",
    elite: "GBP 2.99/month (optional add-on)",
    competitor: "5p each after 20 free",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/pricing | Fresha: https://www.fresha.com/pricing",
  },
  {
    feature: "Calendar sync",
    elite: "Supports",
    competitor: "Unknown",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/features | Fresha docs: https://support.fresha.com",
  },
  {
    feature: "Deposit / no-show policy tools",
    elite: "Supports",
    competitor: "Unknown",
    notes:
      "Elite Booker: https://www.elitebooker.co.uk/features/no-show-protection | Fresha docs: https://support.fresha.com",
  },
  {
    feature: "Data export / portability",
    elite: "Unknown",
    competitor: "Unknown",
    notes: "Fresha docs: https://support.fresha.com",
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
  { label: "Fresha pricing", url: "https://www.fresha.com/pricing" },
  { label: "Fresha support", url: "https://support.fresha.com" },
];

const faqs = [
  {
    question:
      "What should UK salons compare first: subscription or commission?",
    answer:
      "Compare both together. Subscription is fixed, but commission and payment fees vary with booking volume and new-client mix.",
  },
  {
    question: "Are the numbers on this page guaranteed for all businesses?",
    answer:
      "No. Vendor pricing and terms can change by date, plan, location, or promotions. Always verify on the linked source pages before making a decision.",
  },
  {
    question: "How should I estimate annual platform cost?",
    answer:
      "Model expected annual bookings, average ticket value, and proportion of marketplace-introduced clients, then apply listed subscription, commission, and payment fees.",
  },
  {
    question: "Why are some comparison rows marked Unknown?",
    answer:
      "Unknown means a claim was not clearly confirmed from a current public source. It is intentionally left unresolved to avoid unsupported assertions.",
  },
];

export default function VsFresha() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "vs Fresha", url: "/compare/vs-fresha" },
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
        title="Elite Booker vs Fresha | UK Booking Software Comparison"
        description="Source-linked UK comparison of Elite Booker vs Fresha pricing structure, fees, and operational feature areas."
        canonical="https://www.elitebooker.co.uk/compare/vs-fresha"
        schema={faqSchema}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-white px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            Elite Booker vs Fresha
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-700">
            Public pricing data is summarised below with source links. This page
            focuses on pricing structure and booking-cost mechanics rather than
            marketing language.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                Fresha snapshot
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Subscription, commission, payment and SMS charges are listed
                publicly and should be rechecked before decisions.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Elite Booker snapshot
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Basic, Professional and Enterprise pricing with booking-fee
                rules are listed on the pricing page.
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
              If your business prioritises predictable monthly cost and direct
              client ownership, compare commission exposure and payment fee
              stack first.
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
                  Fresha
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
