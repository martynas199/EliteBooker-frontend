import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import SEOHead from "../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../shared/components/Schema/BreadcrumbSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { NICHES, UK_CITIES, TOTAL_LANDING_PAGES } from "../data/ukCitiesNiches";

const primaryCitySlugs = [
  "london",
  "manchester",
  "birmingham",
  "leeds",
  "glasgow",
  "cardiff",
];

const primaryCities = primaryCitySlugs
  .map((slug) => UK_CITIES.find((city) => city.slug === slug))
  .filter(Boolean);

const cityAndNicheLinks = UK_CITIES.slice(0, 16).map((city, index) => {
  const niche = NICHES[index % NICHES.length];
  return {
    cityName: city.name,
    nicheName: niche.pluralName,
    href: `/solutions/${niche.slug}-${city.slug}`,
  };
});

export default function SolutionsPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Solutions", url: "/solutions" },
  ];

  return (
    <>
      <SEOHead
        title="Local Booking Software Solutions"
        description="Explore local booking software pages for UK cities and beauty niches. Find tailored solutions for salons, barbers, lash techs, clinics, and more."
        canonical="https://www.elitebooker.co.uk/solutions"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <div className="min-h-screen bg-gradient-to-b from-[#eef4ff] via-[#edf4ff] to-[#dfeeff]">
        <Header />

        <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <section className="text-center">
              <span className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Local Solutions
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Booking software by city and business type
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Find the most relevant page for your location and niche.
                Compare costs, feature fit, and expected savings with
                market-specific messaging.
              </p>
              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                <Sparkles className="h-4 w-4" />
                {TOTAL_LANDING_PAGES}+ targeted landing pages
              </div>
            </section>

            <section className="mt-10 sm:mt-12">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Browse by niche
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {NICHES.map((niche, index) => (
                  <motion.article
                    key={niche.slug}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-6"
                  >
                    <h3 className="text-xl font-bold text-slate-900">
                      {niche.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {niche.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {primaryCities.slice(0, 3).map((city) => (
                        <Link
                          key={`${niche.slug}-${city.slug}`}
                          to={`/solutions/${niche.slug}-${city.slug}`}
                          className="inline-flex min-h-9 items-center rounded-full border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                        >
                          {city.name}
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={`/solutions/${niche.slug}-london`}
                      className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
                    >
                      View niche solutions
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.article>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:mt-12 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Popular local pages
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Jump directly to high-intent city and niche combinations.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cityAndNicheLinks.map((entry) => (
                  <Link
                    key={entry.href}
                    to={entry.href}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {entry.cityName} {entry.nicheName}
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 px-5 py-8 text-center text-white shadow-xl sm:mt-12 sm:px-8 sm:py-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Ready to launch your own booking page?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Start free, compare alternatives, and choose the feature stack
                that fits your growth plan.
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
              <p className="mt-4 text-xs text-slate-300">
                <Link to="/compare" className="underline hover:text-white">
                  Compare platforms
                </Link>
                {" • "}
                <Link to="/features" className="underline hover:text-white">
                  Explore features
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

