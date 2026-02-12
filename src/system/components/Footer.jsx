import { Link } from "react-router-dom";
import eliteLogo from "../../assets/elite.png";

const productLinks = [
  { label: "SMS Reminders", path: "/features/sms-reminders" },
  { label: "Online Booking", path: "/features/online-booking" },
  { label: "No-Show Protection", path: "/features/no-show-protection" },
  { label: "Pricing", path: "/pricing" },
];

const compareLinks = [
  { label: "vs Fresha", path: "/compare/vs-fresha" },
  { label: "vs Treatwell", path: "/compare/vs-treatwell" },
];

const companyLinks = [
  { label: "Help Center", path: "/help" },
  { label: "List your business", path: "/signup" },
  { label: "Business log in", path: "/admin/login" },
  { label: "Referral program", path: "/join-referral-program" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-gradient-to-b from-[#171a22] to-[#0c0f15] text-slate-200">
      <div
        className="mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 sm:pt-14 lg:px-8"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 2rem)" }}
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-6 lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
            <div>
              <Link to="/" className="inline-flex items-center">
                <img
                  src={eliteLogo}
                  alt="Elite Booker"
                  className="h-16 w-auto brightness-0 invert sm:h-20"
                />
              </Link>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
                Commission-free booking software for salons, spas, and wellness
                brands that want a premium customer experience without
                sacrificing margin.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-white px-5 text-sm font-semibold text-slate-900 transition-all hover:from-white hover:to-slate-100"
                >
                  Start free trial
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/40 px-5 text-sm font-medium text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-800/70"
                >
                  View pricing
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Product
                </p>
                <ul className="space-y-2.5">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Compare
                </p>
                <ul className="space-y-2.5">
                  {compareLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Company
                </p>
                <ul className="space-y-2.5">
                  {companyLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.path}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            &copy; {currentYear} Elite Booker. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/privacy"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Terms
            </Link>
            <Link
              to="/security"
              className="text-slate-400 transition-colors hover:text-white"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
