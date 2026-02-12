import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ArrowRight } from "lucide-react";

const nextSteps = [
  {
    title: "Sign in",
    description: "Access your dashboard with your new account credentials.",
  },
  {
    title: "Add services",
    description: "Create your treatments, durations, and pricing packages.",
  },
  {
    title: "Add staff",
    description: "Invite your team and assign service availability.",
  },
  {
    title: "Go live",
    description: "Start accepting direct online bookings from clients.",
  },
];

export default function SignupSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5ef] via-[#f6f2ea] to-[#efe8dc]">
      <Header />

      <main className="relative overflow-hidden">
        <motion.div
          animate={{ x: [0, 70, 0], y: [0, -80, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-[-8rem] top-8 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -80, 0], y: [0, 70, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute bottom-[-2rem] right-[-7rem] h-96 w-96 rounded-full bg-amber-300/15 blur-3xl"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:3rem_3rem]" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-xl sm:p-10"
          >
            <span className="inline-flex min-h-10 items-center rounded-full border border-emerald-200 bg-emerald-100/80 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Account Created
            </span>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
            >
              <svg
                className="h-11 w-11"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>

            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              You&apos;re all set
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Your Elite Booker business account is ready. Here are the next
              steps to launch quickly.
            </p>

            <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
              {nextSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">
                        {step.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <motion.button
              onClick={() => navigate("/admin/login")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:from-slate-800 hover:to-slate-700 sm:w-auto sm:px-10"
            >
              Sign in to dashboard
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            <div className="mt-8 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-600">Need help getting started?</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
                <Link
                  to="/help"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Help center
                </Link>
                <Link
                  to="/pricing"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Pricing
                </Link>
                <Link
                  to="/"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                >
                  Back to homepage
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
