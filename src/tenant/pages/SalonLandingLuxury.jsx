import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { setService, setBeautician } from "../state/bookingSlice";
import SEOHead from "../../shared/components/seo/SEOHead";

/**
 * SPOTIFY-STYLE TOGGLE SWITCH
 * Large, bold toggle that triggers background color shift
 */
function SpotifyToggle({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-0 bg-black/40 backdrop-blur-md rounded-full p-2 border border-white/10">
      <motion.button
        onClick={() => onChange("services")}
        className={`relative px-12 py-4 text-xl font-black uppercase tracking-wide rounded-full transition-all duration-300 ${
          value === "services"
            ? "text-black"
            : "text-white/60 hover:text-white/80"
        }`}
        whileHover={{ scale: value === "services" ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {value === "services" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white rounded-full shadow-2xl"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">Services</span>
      </motion.button>

      <motion.button
        onClick={() => onChange("specialists")}
        className={`relative px-12 py-4 text-xl font-black uppercase tracking-wide rounded-full transition-all duration-300 ${
          value === "specialists"
            ? "text-black"
            : "text-white/60 hover:text-white/80"
        }`}
        whileHover={{ scale: value === "specialists" ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {value === "specialists" && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-white rounded-full shadow-2xl"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">Specialists</span>
      </motion.button>
    </div>
  );
}

/**
 * STEP 2: SKELETON LOADER
 * Beautiful loading state while fetching data
 */
function SkeletonCard() {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50">
      {/* Image Skeleton */}
      <div className="w-full aspect-[4/3] bg-gray-200/80 rounded-2xl mb-6 animate-pulse" />

      {/* Text Skeletons */}
      <div className="h-6 bg-gray-200/80 rounded-lg mb-3 w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200/60 rounded-lg mb-2 w-full animate-pulse" />
      <div className="h-4 bg-gray-200/60 rounded-lg mb-6 w-5/6 animate-pulse" />

      {/* Footer Skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-8 bg-gray-200/80 rounded-lg w-24 animate-pulse" />
        <div className="h-10 bg-gray-200/80 rounded-xl w-28 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * SPOTIFY-STYLE EMPTY STATE
 * Dark mode with bold messaging
 */
function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-32 px-4"
    >
      {/* Animated Icon */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mb-12"
      >
        <div className="w-32 h-32 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10">
          {type === "services" ? (
            <svg
              className="w-16 h-16 text-white/40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          ) : (
            <svg
              className="w-16 h-16 text-white/40"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </div>
      </motion.div>

      {/* Bold Text */}
      <h3 className="text-5xl font-black text-white mb-4 text-center">
        {type === "services" ? "No Services Yet" : "No Specialists Yet"}
      </h3>
      <p className="text-xl text-white/50 text-center max-w-md font-light">
        {type === "services"
          ? "Check back soon for our curated service collection"
          : "Our talented team will be here soon"}
      </p>
    </motion.div>
  );
}

/**
 * SERVICE CARD COMPONENT
 * Clean card design with image and hover effects
 */
function ServiceCard({ service, onClick, formatPrice, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="h-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/20 hover:-translate-y-2">
        {/* Service Image */}
        {service.image?.url && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={service.image.url}
              alt={service.image.alt || service.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Category Badge */}
            {service.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold rounded-full shadow-lg">
                  {service.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {/* Service Name */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
            {service.name}
          </h3>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}

          {/* Price & Duration */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <div className="text-sm text-white/50 font-medium mb-1">
                Price
              </div>
              <div className="text-2xl font-black text-white">
                {formatPrice(service.price)}
              </div>
            </div>

            {service.durationMin && (
              <div className="text-right">
                <div className="text-sm text-white/50 font-medium mb-1">
                  Duration
                </div>
                <div className="flex items-center gap-1.5 text-white/80 font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {service.durationMin} min
                </div>
              </div>
            )}
          </div>

          {/* Book Button */}
          <button className="w-full mt-6 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-green-400 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-105">
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SPECIALIST CARD COMPONENT
 * Matches the original BeauticianPage card design
 */
function SpecialistCard({ specialist, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="group cursor-pointer overflow-hidden p-0 h-[480px] rounded-2xl border-2 border-white/10 hover:border-brand-200 transition-all duration-300 hover:shadow-2xl">
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
                    className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold rounded-full shadow-lg"
                  >
                    {specialty}
                  </span>
                ))}
                {specialist.specialties.length > 3 && (
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-full shadow-lg">
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

/**
 * STEP 6: MAIN LANDING PAGE COMPONENT
 */
export default function SalonLandingLuxury() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();

  // State
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("services"); // 'services' or 'specialists'
  const [settings, setSettings] = useState(null);
  const [heroSection, setHeroSection] = useState(null);
  const [beauticians, setBeauticians] = useState([]);
  const [services, setServices] = useState([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, beauticiansRes, servicesRes, heroSectionsRes] =
          await Promise.all([
            api.get("/settings/display").catch(() => ({ data: null })),
            api.get("/beauticians"),
            api.get("/services"),
            api.get("/hero-sections").catch(() => ({ data: [] })),
          ]);

        setSettings(settingsRes.data);

        if (heroSectionsRes.data && heroSectionsRes.data.length > 0) {
          const activeHero = heroSectionsRes.data.find((h) => h.active);
          setHeroSection(activeHero || heroSectionsRes.data[0]);
        }

        const activeBeauticians = beauticiansRes.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);

        const activeServices = servicesRes.data.filter((s) => s.active);
        setServices(activeServices);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers
  const handleServiceClick = (service) => {
    dispatch(
      setService({
        serviceId: service._id,
        variantName: service.variantName,
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: service.bufferBeforeMin,
        bufferAfterMin: service.bufferAfterMin,
      })
    );

    if (beauticians.length === 1) {
      dispatch(
        setBeautician({
          beauticianId: beauticians[0]._id,
          any: false,
          inSalonPayment: false,
        })
      );
      navigate(`/salon/${tenant?.slug}/times`);
    } else {
      navigate("beauticians");
    }
  };

  const handleSpecialistClick = (specialist) => {
    navigate(`beauticians?selected=${specialist._id}`);
  };

  // Data
  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription =
    tenant?.description ||
    settings?.salonDescription ||
    "Experience luxury beauty treatments";
  const heroImage =
    heroSection?.centerImage?.url ||
    heroSection?.rightImage?.url ||
    settings?.heroImage?.url;

  const hasMultipleSpecialists = beauticians.length > 1;

  // Set initial view mode based on specialists count
  useEffect(() => {
    if (!loading) {
      setViewMode(hasMultipleSpecialists ? "specialists" : "services");
    }
  }, [loading, hasMultipleSpecialists]);

  // Dynamic background colors based on mode
  const backgroundColors = {
    services: "from-slate-900 via-slate-800 to-slate-900",
    specialists: "from-blue-950 via-indigo-950 to-purple-950",
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex justify-center mb-16">
            <div className="h-20 w-96 bg-white/5 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${salonName} - Premium Beauty & Wellness`}
        description={salonDescription}
      />

      {/* Dynamic Background with Color Shift */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background:
            viewMode === "services"
              ? "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)"
              : "linear-gradient(to bottom right, #172554, #312e81, #4c1d95)",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        {/* Animated Noise Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E')",
              backgroundSize: "200px 200px",
            }}
          />
        </div>

        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Header Section */}
      <section className="relative pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Salon Name - Massive Typography */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-7xl md:text-9xl font-black text-white mb-6 leading-none tracking-tight">
              {salonName}
            </h1>
            <p className="text-2xl text-white/60 font-light max-w-2xl mx-auto">
              {salonDescription}
            </p>
          </motion.div>

          {/* Spotify-Style Toggle - Only show if multiple specialists */}
          {hasMultipleSpecialists && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center mb-20"
            >
              <SpotifyToggle value={viewMode} onChange={setViewMode} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Content - Masonry Layout */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {viewMode === "services" ? (
              <motion.div
                key="services"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Services Title - Only show when there's a single beautician */}
                {!hasMultipleSpecialists && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      Services
                    </h2>
                    <p className="text-white/60 text-lg">
                      Choose from our selection of premium services
                    </p>
                  </motion.div>
                )}

                {services.length === 0 ? (
                  <EmptyState type="services" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                      <ServiceCard
                        key={service._id}
                        service={service}
                        onClick={() => handleServiceClick(service)}
                        formatPrice={formatPrice}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="specialists"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {beauticians.length === 0 ? (
                  <EmptyState type="specialists" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {beauticians.map((specialist, index) => (
                      <SpecialistCard
                        key={specialist._id}
                        specialist={specialist}
                        onClick={() => handleSpecialistClick(specialist)}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
