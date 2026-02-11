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
          stroke="#111827"
          strokeWidth="2"
        />
        <path
          d="M16 2v4M8 2v4M3 10h18"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="14" r="1.5" fill="#111827" />
        <circle cx="12" cy="14" r="1.5" fill="#111827" />
        <circle cx="16" cy="14" r="1.5" fill="#111827" />
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
          stroke="#111827"
          strokeWidth="2"
        />
        <path d="M2 10h20" stroke="#111827" strokeWidth="2" />
        <circle cx="6" cy="15" r="1" fill="#111827" />
        <path
          d="M10 15h8"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    reminders: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="6" r="3" fill="#111827" />
      </svg>
    ),
    staff: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="#111827" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="#111827"
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
          stroke="#111827"
          strokeWidth="2"
        />
        <path
          d="M9 18h6"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7" r="2" stroke="#111827" strokeWidth="2" />
        <path
          d="M9 12h6M9 15h6"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    insights: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3v18h18"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 16l4-4 3 3 6-6"
          stroke="#111827"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="2" fill="#111827" />
        <circle cx="11" cy="12" r="2" fill="#111827" />
        <circle cx="14" cy="15" r="2" fill="#111827" />
        <circle cx="20" cy="9" r="2" fill="#111827" />
      </svg>
    ),
  };

  return icons[type] || null;
};

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed specifically for beauty and wellness
            businesses
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full p-8 hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300 group">
                <div className="mb-6">
                  <FeatureIcon type={feature.id} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
