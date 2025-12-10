import { motion } from "framer-motion";

/**
 * SPECIALIST CARD COMPONENT
 * Reusable card for displaying specialist information with image overlay
 */
export default function SpecialistCard({ specialist, onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="group cursor-pointer overflow-hidden p-0 h-[480px] rounded-2xl border border-gray-300 hover:border-gray-900 transition-all duration-300 shadow-xl hover:shadow-2xl">
        {/* Full Card Image with Name Overlay */}
        <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
          {specialist.image?.url ? (
            <img
              src={specialist.image.url}
              alt={specialist.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-brand-900/90 transition-colors duration-300"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Specialties badges at top */}
            {specialist.specialties && specialist.specialties.length > 0 && (
              <div className="flex-1 flex flex-wrap gap-2 content-start mb-4">
                {specialist.specialties.slice(0, 3).map((specialty, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg"
                  >
                    {specialty}
                  </span>
                ))}
                {specialist.specialties.length > 3 && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg">
                    +{specialist.specialties.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Name & Bio */}
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white group-hover:text-brand-300 transition-colors">
                {specialist.name}
              </h3>

              {specialist.bio && (
                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">
                  {specialist.bio}
                </p>
              )}

              {/* Call to Action */}
              <div className="flex items-center gap-2 text-white/90 group-hover:text-brand-300 font-semibold text-sm transition-colors">
                <span>View Services</span>
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
