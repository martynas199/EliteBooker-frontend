import SEOHead from "../../../shared/components/seo/SEOHead";
import BreadcrumbSchema from "../../../shared/components/Schema/BreadcrumbSchema";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getUkMoneyPage } from "../../data/ukMoneyPages";

export default function UkMoneyPage({ slug }) {
  const page = getUkMoneyPage(slug);

  if (!page) {
    return null;
  }

  const canonical = `https://www.elitebooker.co.uk/${page.slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((question) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: "This topic is addressed on the page with practical implementation guidance for UK booking workflows.",
      },
    })),
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elite Booker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
  };

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: page.h1, url: `/${page.slug}` },
  ];

  return (
    <>
      <SEOHead
        title={page.title}
        description={page.metaDescription}
        canonical={canonical}
        schema={[faqSchema, softwareSchema]}
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <Header />
      <main className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-700">
            {page.intro}
          </p>

          <div className="mt-10 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-slate-900">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-2xl font-bold text-slate-900">FAQs</h2>
            <ul className="mt-4 space-y-3 text-slate-700">
              {page.faqs.map((faq) => (
                <li key={faq} className="rounded-lg bg-white p-3">
                  {faq}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-2xl font-bold text-slate-900">Next steps</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/features"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Explore features
              </a>
              <a
                href="/pricing"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                View pricing
              </a>
              <a
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Start free
              </a>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
