import { useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SEOHead from "../../../shared/components/seo/SEOHead";
import {
  NICHES,
  UK_CITIES,
  getLandingPageData,
  isIndexableLandingPage,
} from "../../data/ukCitiesNiches";

export default function LocalSolutionPage() {
  const { slugCombination } = useParams();
  const normalizedSlug = (slugCombination || "").toLowerCase().trim();
  const sortedCities = [...UK_CITIES].sort(
    (left, right) => right.slug.length - left.slug.length,
  );
  const matchedCity = sortedCities.find(
    (city) =>
      normalizedSlug === city.slug || normalizedSlug.endsWith(`-${city.slug}`),
  );

  if (!matchedCity) {
    return <Navigate to="/404" replace />;
  }

  const potentialCitySlug = matchedCity.slug;
  const nicheSuffixLength = potentialCitySlug.length + 1;
  const potentialNicheSlug = normalizedSlug.slice(0, -nicheSuffixLength);

  if (!potentialNicheSlug) {
    return <Navigate to="/404" replace />;
  }

  const data = getLandingPageData(potentialNicheSlug, potentialCitySlug);
  if (!data) {
    return <Navigate to="/404" replace />;
  }

  const {
    city,
    niche,
    title,
    metaDescription,
    h1,
    heroSubheading,
    breadcrumbs,
  } = data;

  const isIndexable = isIndexableLandingPage(niche.slug, city.slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `https://www.elitebooker.co.uk${crumb.url}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Can ${
          city.name
        } ${niche.pluralName.toLowerCase()} use online booking without changing their full workflow?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Most teams begin by publishing one booking link, then enable reminders, deposits, and availability rules gradually.",
        },
      },
      {
        "@type": "Question",
        name: `How quickly can a ${niche.singularName.toLowerCase()} team in ${
          city.name
        } start using the platform?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most accounts can configure services, staff schedules, and booking availability in a short onboarding session.",
        },
      },
      {
        "@type": "Question",
        name: "Does this page include competitor pricing claims?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. This page avoids competitor-specific pricing or feature claims unless a source is cited on a dedicated comparison page.",
        },
      },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elite Booker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    areaServed: {
      "@type": "City",
      name: city.name,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  const canonicalUrl = `https://www.elitebooker.co.uk/solutions/${potentialNicheSlug}-${potentialCitySlug}`;

  const relatedNiches = NICHES.filter(
    (entry) => entry.slug !== niche.slug,
  ).slice(0, 4);

  return (
    <>
      <SEOHead
        title={title}
        description={metaDescription}
        canonical={canonicalUrl}
        noindex={!isIndexable}
        keywords={`${city.name} ${niche.pluralName}, booking software ${
          city.name
        }, appointment software ${niche.pluralName.toLowerCase()}`}
        schema={[breadcrumbSchema, softwareSchema, faqSchema]}
      />

      <Header />

      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc] px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.url}>
                  <a href={crumb.url} className="hover:text-slate-700">
                    {crumb.label}
                  </a>
                  {index < breadcrumbs.length - 1 && (
                    <span className="ml-2">/</span>
                  )}
                </span>
              ))}
            </nav>

            {!isIndexable && (
              <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                This local page is published for users, but it is not part of
                the curated index set for search indexing.
              </div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 sm:text-5xl"
            >
              {h1}
            </motion.h1>
            <p className="mt-4 max-w-3xl text-lg text-gray-700">
              {heroSubheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/signup"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Start free
              </a>
              <a
                href="/pricing"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                View pricing
              </a>
              <a
                href="/features"
                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Explore features
              </a>
            </div>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Built for {city.name} {niche.pluralName}
            </h2>
            <p className="mt-4 text-gray-700">
              This page focuses on operational fit: scheduling, reminders, team
              availability, and booking controls for{" "}
              {niche.pluralName.toLowerCase()} serving clients in {city.name}.
              The goal is to provide practical implementation guidance without
              unverifiable competitor claims.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {niche.painPoints.map((point) => (
                <article
                  key={point}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
                >
                  <h3 className="font-semibold text-gray-900">
                    Workflow challenge
                  </h3>
                  <p className="mt-2 text-sm text-gray-700">{point}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Recommended setup checklist
            </h2>
            <ol className="mt-6 space-y-3 text-gray-700">
              <li>1. Publish services with realistic durations and buffers.</li>
              <li>2. Configure team schedules and blocked time.</li>
              <li>3. Enable reminders and confirmation messages.</li>
              <li>4. Apply deposits/cancellation rules where appropriate.</li>
              <li>
                5. Add internal links from pricing, features, and signup
                journeys.
              </li>
            </ol>
            <p className="mt-6 text-sm text-gray-600">
              Information may change; verify on vendor sites when comparing
              other platforms.
            </p>
          </div>
        </section>

        <section className="px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-gray-900">
              Explore related local pages
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {relatedNiches.map((entry) => (
                <a
                  key={entry.slug}
                  href={`/solutions/${entry.slug}-${city.slug}`}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 hover:bg-gray-50"
                >
                  {entry.pluralName} in {city.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
