import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function FinalCtaSection({ onShowDemoModal }) {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1018] via-[#191f2e] to-[#2a3044] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-6 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-amber-300/15 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/15 bg-white/[0.04] px-4 py-8 shadow-2xl backdrop-blur sm:px-8 sm:py-10"
        >
          <h2 className="mb-5 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Ready to upgrade your entire booking experience?
          </h2>
          <p className="mb-8 text-base leading-relaxed text-slate-200 sm:mb-10 sm:text-lg md:text-xl">
            Join beauty businesses using Elite Booker to keep full revenue
            control while delivering a premium digital experience for clients.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/signup")}
              className="w-full rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:w-auto sm:py-4 sm:text-lg"
            >
              Get started free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onShowDemoModal) {
                  onShowDemoModal();
                }
              }}
              className="w-full rounded-xl border-2 border-white bg-transparent px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-white/10 sm:w-auto sm:py-4 sm:text-lg"
            >
              Schedule a demo
            </motion.button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-200 sm:text-xs">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              No credit card required
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              Setup in minutes
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
              Cancel anytime
            </span>
          </div>
          <p className="mt-5 text-xs text-slate-300 sm:text-sm">
            Join now for free. No credit card required. Setup in minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

