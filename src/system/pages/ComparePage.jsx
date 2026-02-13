import { Link } from "react-router-dom";
import { ArrowRight, PoundSterling, Scale, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import SEOHead from "../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../shared/components/Schema/BreadcrumbSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";

const comparisonCards = [
  {
    title: "Elite Booker vs Fresha",
    description:
      "Compare monthly costs, commissions, payment fees, and ownership of your client data.",
    highlight: "Keep more revenue",
    href: "/compare/vs-fresha",
  },
  {
    title: "Elite Booker vs Treatwell",
    description:
      "See how commission-free booking changes profitability for salons and clinics.",
    highlight: "Protect your margin",
    href: "/compare/vs-treatwell",
  },
];

const principles = [
  {
    title: "Transparent costs",
    description:
      "Every comparison focuses on total cost, not headline plan prices.",
    icon: PoundSterling,
  },
  {
    title: "Feature parity",
    description:
      "We compare what matters to operations: no-shows, calendar sync, and deposits.",
    icon: Scale,
  },
  {
    title: "Profit protection",
    description:
      "The goal is to reduce leakage from commissions and hidden add-on fees.",
    icon: ShieldCheck,
  },
];

export default function ComparePage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
  ];

  return (
    <>
      <SEOHead
        title="Compare Elite Booker"
        description="Compare Elite Booker against Fresha and Treatwell with clear UK pricing and feature breakdowns."
        canonical="https://www.elitebooker.co.uk/compare"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
        <Header />

        <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <section className="text-center">
              <span className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Platform Comparisons
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Compare booking platforms before you switch
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Side-by-side breakdowns built for founders and operators who
                care about total cost, conversion, and long-term profit.
              </p>
            </section>

            <section className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2">
              {comparisonCards.map((item, index) => (
                <motion.article
                  key={item.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-6"
                >
                  <h2 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {item.highlight}
                  </p>
                  <Link
                    to={item.href}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                  >
                    View comparison
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.article>
              ))}
            </section>

            <section className="mt-10 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:mt-12 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                How we compare
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {principles.map((principle) => {
                  const Icon = principle.icon;
                  return (
                    <article
                      key={principle.title}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-slate-900">
                        {principle.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {principle.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 px-5 py-8 text-center text-white shadow-xl sm:mt-12 sm:px-8 sm:py-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Ready to switch to a commission-free model?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Start free, migrate quickly, and keep control over your booking
                flow and customer data.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Start free
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  View pricing
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-300 sm:text-sm">
                <Link to="/features" className="underline hover:text-white">
                  Explore features
                </Link>
                {" • "}
                <Link to="/solutions" className="underline hover:text-white">
                  Browse local solutions
                </Link>
              </p>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
