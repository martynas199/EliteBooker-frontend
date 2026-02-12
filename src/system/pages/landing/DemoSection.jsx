import { useState } from "react";
import { motion } from "framer-motion";
import { demoVideoUrl } from "./landingData";

export default function DemoSection({ onDemoClick }) {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section
      id="demo"
      className="relative overflow-hidden bg-gradient-to-br from-[#0b0d12] via-[#121722] to-[#1e2535] py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-slate-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 md:grid-cols-2 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="mb-5 inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 sm:px-4 sm:py-2 sm:text-xs">
              Product Demo
            </span>
            <h2 className="mb-5 text-3xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
              See the <span className="text-amber-300">booking engine</span> in
              action
            </h2>
            <p className="mb-7 text-base leading-relaxed text-slate-300 sm:text-lg md:text-xl">
              Watch how quickly your team can manage appointments, take
              payments, and deliver a polished client experience from one
              premium dashboard.
            </p>
            <ul className="space-y-3.5 sm:space-y-4">
              {[
                "Launch in under 10 minutes",
                "Automated reminders and no-show protection",
                "Payment-ready from day one",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300/40 bg-slate-400/10 text-slate-300">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.4}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-sm sm:text-base lg:text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
              <button
                onClick={() => {
                  if (onDemoClick) {
                    onDemoClick();
                    return;
                  }
                  setVideoLoaded(true);
                }}
                className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Request guided demo
              </button>
              {!videoLoaded && (
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="w-full rounded-xl border border-slate-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-slate-300 sm:w-auto"
                >
                  Watch instant preview
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video overflow-hidden rounded-2xl border border-slate-600/60 bg-slate-900 shadow-2xl">
              {!videoLoaded ? (
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="w-full h-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 transition-all group"
                  aria-label="Load video"
                >
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/90 transition-all group-hover:bg-slate-600 sm:mb-4 sm:h-20 sm:w-20">
                      <svg
                        className="ml-1 h-8 w-8 text-white sm:h-10 sm:w-10"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-white sm:text-base">
                      Watch demo video
                    </p>
                    <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                      Click to play
                    </p>
                  </div>
                </button>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={`${demoVideoUrl}?autoplay=1&mute=1&loop=1&playlist=uJC681X-d2Q&controls=1&rel=0`}
                  title="Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


