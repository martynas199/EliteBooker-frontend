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
          stroke="url(#grad1)"
          strokeWidth="2"
        />
        <path
          d="M16 2v4M8 2v4M3 10h18"
          stroke="url(#grad1)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="8" cy="14" r="1.5" fill="url(#grad1)" />
        <circle cx="12" cy="14" r="1.5" fill="url(#grad1)" />
        <circle cx="16" cy="14" r="1.5" fill="url(#grad1)" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
        </defs>
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
          stroke="url(#grad2)"
          strokeWidth="2"
        />
        <path d="M2 10h20" stroke="url(#grad2)" strokeWidth="2" />
        <circle cx="6" cy="15" r="1" fill="url(#grad2)" />
        <path
          d="M10 15h8"
          stroke="url(#grad2)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
    reminders: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
          stroke="url(#grad3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13.73 21a2 2 0 0 1-3.46 0"
          stroke="url(#grad3)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="6" r="3" fill="url(#grad3)" />
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    ),
    staff: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
          stroke="url(#grad4)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="9" cy="7" r="4" stroke="url(#grad4)" strokeWidth="2" />
        <path
          d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="url(#grad4)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#c026d3" />
          </linearGradient>
        </defs>
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
          stroke="url(#grad5)"
          strokeWidth="2"
        />
        <path
          d="M9 18h6"
          stroke="url(#grad5)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="7" r="2" stroke="url(#grad5)" strokeWidth="2" />
        <path
          d="M9 12h6M9 15h6"
          stroke="url(#grad5)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    ),
    insights: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 3v18h18"
          stroke="url(#grad6)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M7 16l4-4 3 3 6-6"
          stroke="url(#grad6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="2" fill="url(#grad6)" />
        <circle cx="11" cy="12" r="2" fill="url(#grad6)" />
        <circle cx="14" cy="15" r="2" fill="url(#grad6)" />
        <circle cx="20" cy="9" r="2" fill="url(#grad6)" />
        <defs>
          <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
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
            Everything You Need to
            <span className="block mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Run Your Business Smoothly
            </span>
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
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className="h-full p-8 hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-violet-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-violet-50/30 group">
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  <FeatureIcon type={feature.id} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-violet-700 transition-colors">
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
