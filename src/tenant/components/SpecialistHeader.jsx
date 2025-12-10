import { motion } from "framer-motion";

/**
 * SpecialistHeader - displays specialist information with image, name, specialties, and bio
 * @param {object} props
 * @param {object} props.specialist - The specialist object
 * @param {boolean} props.isBioExpanded - Whether the bio is expanded
 * @param {function} props.onToggleBio - Callback to toggle bio expansion
 */
export default function SpecialistHeader({
  specialist,
  isBioExpanded,
  onToggleBio,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 sm:mb-10 overflow-hidden bg-white rounded-2xl border border-gray-300 hover:border-gray-400 shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4 sm:gap-6 p-4 sm:p-8">
        {/* Specialist Image */}
        <div className="flex-shrink-0 w-20 h-20 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-xl ring-2 sm:ring-4 ring-gray-100">
          {specialist.image?.url ? (
            <img
              src={specialist.image.url}
              alt={specialist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
              {specialist.name}
            </h1>
            <svg
              className="w-5 h-5 sm:w-7 sm:h-7 text-green-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Specialties */}
          {specialist.specialties && specialist.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {specialist.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {specialist.bio && (
            <div>
              <p
                className={`text-gray-700 leading-relaxed text-sm sm:text-base ${
                  isBioExpanded ? "" : "line-clamp-2"
                }`}
              >
                {specialist.bio}
              </p>
              {specialist.bio.length > 120 && (
                <button
                  onClick={onToggleBio}
                  className="flex items-center gap-1 text-gray-900 hover:text-black transition-colors mt-3 text-sm font-bold"
                >
                  <span>{isBioExpanded ? "Show less" : "Read more"}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isBioExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
