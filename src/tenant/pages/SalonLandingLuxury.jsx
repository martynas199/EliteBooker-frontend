import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { setService, setSpecialist } from "../state/bookingSlice";
import SEOHead from "../../shared/components/seo/SEOHead";
import ServiceCard from "../components/ServiceCard";
import SpecialistCard from "../components/SpecialistCard";

/**
 * Professional Toggle Switch
 */
function ProfessionalToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-xl p-1.5 shadow-inner">
      <button
        onClick={() => onChange("services")}
        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
          value === "services"
            ? "bg-white text-brand-600 shadow-md"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Services
      </button>
      <button
        onClick={() => onChange("specialists")}
        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
          value === "specialists"
            ? "bg-white text-brand-600 shadow-md"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Specialists
      </button>
    </div>
  );
}

/**
 * Loading State
 */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4 animate-pulse" />
      <div className="h-5 bg-gray-200 rounded mb-3 w-3/4 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded mb-2 w-full animate-pulse" />
      <div className="h-4 bg-gray-200 rounded mb-4 w-5/6 animate-pulse" />
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        <div className="h-10 bg-gray-200 rounded-xl w-28 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * Empty State
 */
function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center py-20 px-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
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

      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {type === "services" ? "No Services Yet" : "No Specialists Yet"}
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        {type === "services"
          ? "Check back soon for our curated service collection"
          : "Our talented team will be here soon"}
      </p>
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
  const [specialists, setSpecialists] = useState([]);
  const [services, setServices] = useState([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, specialistsRes, servicesRes, heroSectionsRes] =
          await Promise.all([
            api.get("/settings/display").catch(() => ({ data: null })),
            api.get("/specialists"), // API endpoint unchanged (backend compatibility)
            api.get("/services"),
            api.get("/hero-sections").catch(() => ({ data: [] })),
          ]);

        setSettings(settingsRes.data);

        if (heroSectionsRes.data && heroSectionsRes.data.length > 0) {
          const activeHero = heroSectionsRes.data.find((h) => h.active);
          setHeroSection(activeHero || heroSectionsRes.data[0]);
        }

        const activeSpecialists = specialistsRes.data.filter((b) => b.active);
        setSpecialists(activeSpecialists);

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

    if (specialists.length === 1) {
      dispatch(
        setSpecialist({
          specialistId: specialists[0]._id, // Backend field name preserved for API compatibility
          any: false,
          inSalonPayment: false,
        })
      );
      navigate(`/salon/${tenant?.slug}/times`);
    } else {
      navigate(`/salon/${tenant?.slug}/specialists`);
    }
  };

  const handleSpecialistClick = (specialist) => {
    navigate(`/salon/${tenant?.slug}/specialists?selected=${specialist._id}`);
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

  const hasMultipleSpecialists = specialists.length > 1;

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
        className="min-h-screen bg-white"
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
        title={`${salonName} - Premium Beauty Services`}
        description={salonDescription}
      />

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section - Clean and Professional */}
          <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-3xl overflow-hidden mb-12 shadow-2xl">
            {/* Hero Image Background */}
            {(heroSection?.centerImage?.url || settings?.heroImage?.url) && (
              <>
                <div className="absolute inset-0">
                  <img
                    src={
                      heroSection?.centerImage?.url || settings?.heroImage?.url
                    }
                    alt={
                      heroSection?.title ||
                      settings?.heroImage?.alt ||
                      `${salonName} hero`
                    }
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Hero image failed to load:", e.target.src);
                      e.target.style.display = "none";
                    }}
                  />
                  {/* Configurable Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: heroSection?.overlayColor || "#000000",
                      opacity: heroSection?.overlayOpacity ?? 0.3,
                    }}
                  />
                </div>
              </>
            )}

            <div className="relative z-10 px-6 md:px-12 py-20 md:py-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto text-center"
              >
                {/* Professional Availability Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl mb-8 border border-white/20"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium text-sm">
                    Available for booking now
                  </span>
                </motion.div>

                {/* Clean Professional Heading */}
                <motion.h1
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {heroSection?.title || salonName}
                </motion.h1>

                {/* Clear Value Proposition */}
                <motion.p
                  className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {heroSection?.subtitle || salonDescription}
                </motion.p>

                {/* Primary CTA - Focused on Booking */}
                {heroSection?.showCta !== false && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex justify-center px-4"
                  >
                    <motion.button
                      onClick={() => {
                        if (
                          heroSection?.ctaLink &&
                          heroSection.ctaLink !== "#services"
                        ) {
                          // Handle external links
                          if (heroSection.ctaLink.startsWith("http")) {
                            window.open(
                              heroSection.ctaLink,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                          // Handle internal tenant paths (e.g., "specialists", "products")
                          else if (!heroSection.ctaLink.startsWith("/")) {
                            navigate(
                              `/salon/${tenant?.slug}/${heroSection.ctaLink}`
                            );
                          }
                          // Handle absolute paths
                          else {
                            navigate(heroSection.ctaLink);
                          }
                        } else {
                          // Default behavior - show services view
                          setViewMode(
                            hasMultipleSpecialists ? viewMode : "services"
                          );
                        }
                      }}
                      className="px-10 py-5 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-2xl flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {heroSection?.ctaText || "Book Your Appointment"}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Toggle - Only show if multiple specialists */}
          {hasMultipleSpecialists && (
            <div className="flex justify-center mb-12">
              <ProfessionalToggle value={viewMode} onChange={setViewMode} />
            </div>
          )}

          {/* Main Content */}
          <section className="px-4 pb-20">
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
                    {!hasMultipleSpecialists && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                      >
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                          Our Services
                        </h2>
                        <p className="text-gray-600 text-lg">
                          Choose from our selection of premium services
                        </p>
                      </motion.div>
                    )}

                    {services.length === 0 ? (
                      <EmptyState type="services" />
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-2 overflow-x-hidden w-full">
                        {services.map((service) => (
                          <div
                            key={service._id}
                            className="w-full overflow-x-hidden"
                          >
                            <ServiceCard
                              service={service}
                              onClick={() => handleServiceClick(service)}
                            />
                          </div>
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
                    {specialists.length === 0 ? (
                      <EmptyState type="specialists" />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {specialists.map((specialist, index) => (
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
        </div>
      </div>
    </>
  );
}
