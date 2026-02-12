import { motion } from "framer-motion";
import Card from "../../../shared/components/ui/Card";
import { features } from "./landingData";

// Feature Icons
const FeatureIcon = ({ type }) => {
  const icons = {
    booking: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 2v4M8 2v4M3 10h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" />
        <circle cx="16" cy="14" r="1.5" fill="currentColor" />
      </svg>
    ),
    payments: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="15" r="1" fill="currentColor" />
        <path
          d="M10 15h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    reminders: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="6" r="3" fill="currentColor" />
      </svg>
    ),
    staff: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    mobile: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <rect
          x="5"
          y="2"
          width="14"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M9 18h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7" r="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M9 12h6M9 15h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    insights: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3v18h18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 16l4-4 3 3 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="2" fill="currentColor" />
        <circle cx="11" cy="12" r="2" fill="currentColor" />
        <circle cx="14" cy="15" r="2" fill="currentColor" />
        <circle cx="20" cy="9" r="2" fill="currentColor" />
      </svg>
    ),
  };

  return icons[type] || null;
};

export default function FeaturesSection() {
  const accentColors = [
    "text-amber-300",
    "text-slate-300",
    "text-slate-300",
    "text-slate-300",
    "text-amber-300",
    "text-slate-300",
  ];

  return (
    <section
      id="features"
      className="bg-gradient-to-b from-[#10131b] via-[#121722] to-[#151b29] py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-14 lg:mb-16"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-300 sm:px-4 sm:py-2 sm:text-xs">
            Feature System
          </span>
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Operational muscle with premium presentation
          </h2>
          <p className="mx-auto max-w-3xl text-base text-slate-300 sm:text-lg md:text-xl">
            Every workflow is designed to increase repeat bookings while making
            your business look and feel unmistakably professional.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group h-full border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-amber-300/50 hover:shadow-2xl sm:p-7">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 sm:mb-6 sm:h-16 sm:w-16">
                  <div className={accentColors[idx % accentColors.length]}>
                    <FeatureIcon type={feature.id} />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white sm:text-2xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

