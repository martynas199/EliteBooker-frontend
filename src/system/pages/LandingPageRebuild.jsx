import { useNavigate } from "react-router-dom";
import SEOHead from "../../shared/components/seo/SEOHead";
import OrganizationSchema from "../../shared/components/Schema/OrganizationSchema";
import Header from "../components/Header";
import Footer from "../components/Footer";

const sectionPlaceholders = [
  { id: "section-2", title: "Section 2: Trust Strip" },
  { id: "section-3", title: "Section 3: Core Benefits" },
  { id: "section-4", title: "Section 4: Social Proof" },
  { id: "section-5", title: "Section 5: Pricing Snapshot" },
  { id: "section-6", title: "Section 6: Final CTA" },
];

export default function LandingPageRebuild() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Booking Software for UK Salons, Spas & Barbers"
        description="Commission-free booking software for UK beauty and wellness businesses."
        keywords="online booking system UK, salon booking software UK"
        canonical="https://www.elitebooker.co.uk/landing-rebuild"
        noindex
      />
      <OrganizationSchema />

      <div className="min-h-screen bg-[#f6f2ea] text-slate-900">
        <Header iosSafeMode minimalMode />

        <main>
          {/* Section 1: Hero (active build section) */}
          <section id="section-1" className="border-b border-amber-100 bg-[#f6f2ea]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">
                New Landing Rebuild - Section 1
              </p>

              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
                Keep More of Every Booking in Your Business
              </h1>

              <p className="mt-6 max-w-2xl text-lg text-slate-700">
                A simpler, iOS-safe rebuild of the landing page. We will add
                each section progressively and validate on real devices after
                every step.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/signup")}
                  className="rounded-xl bg-slate-900 px-8 py-4 text-base font-bold text-white"
                >
                  Start Free in Minutes
                </button>
                <button
                  onClick={() => {
                    const target = document.getElementById("section-5");
                    target?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-900"
                >
                  Jump to Pricing Section
                </button>
              </div>
            </div>
          </section>

          {/* Section placeholders for iterative rebuild */}
          {sectionPlaceholders.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="border-b border-slate-200 bg-white"
            >
              <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Placeholder. We will build this section next and test on
                    the affected iPhone before moving forward.
                  </p>
                </div>
              </div>
            </section>
          ))}
        </main>

        <Footer />
      </div>
    </>
  );
}
