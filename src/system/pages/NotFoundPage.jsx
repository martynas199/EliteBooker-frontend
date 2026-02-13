import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import SEOHead from "../../shared/components/seo/SEOHead";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <SEOHead
        title="Page not found"
        description="The page you requested could not be found."
        canonical="https://www.elitebooker.co.uk/404"
        noindex
      />

      <Header />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
          <Compass className="h-8 w-8" />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          404
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          This URL does not exist or has moved. You can continue from the
          homepage, pricing, or search.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Go to homepage
          </Link>
          <Link
            to="/pricing"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            View pricing
          </Link>
          <Link
            to="/search"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            Find a business
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
