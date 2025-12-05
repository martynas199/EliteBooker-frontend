import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useDispatch } from "react-redux";
import { setService, setBeautician } from "../state/bookingSlice";
import { useTenant } from "../../shared/contexts/TenantContext";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../shared/components/ui/PageTransition";
import Card from "../../shared/components/ui/Card";
import ServiceCard from "../components/ServiceCard";
import ServiceVariantSelector from "../../shared/components/ServiceVariantSelector";
import SEOHead from "../../shared/components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../shared/utils/schemaGenerator";

export default function BeauticianSelectionPage() {
  const [beauticians, setBeauticians] = useState([]);
  const [selectedBeautician, setSelectedBeautician] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fetch all beauticians
    api
      .get("/beauticians")
      .then((res) => {
        const activeBeauticians = res.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);

        // Check if there's a selected beautician in URL params
        const selectedId = searchParams.get("selected");
        if (selectedId) {
          const beautician = activeBeauticians.find(
            (b) => b._id === selectedId
          );
          if (beautician) {
            handleBeauticianSelect(beautician);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch beauticians:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Restore booking state from URL parameters on mount
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const variantParam = searchParams.get("variant");
    const beauticianParam = searchParams.get("selected");

    if (serviceParam && beauticianParam) {
      // Restore service and beautician to Redux from URL
      api
        .get(`/services/${serviceParam}`)
        .then((res) => {
          const service = res.data;
          const variant =
            service.variants?.find((v) => v.name === variantParam) ||
            service.variants?.[0];

          if (variant) {
            const finalPrice = variant.promoPrice || variant.price;
            dispatch(
              setService({
                serviceId: service._id,
                serviceName: service.name,
                variantName: variant.name,
                price: finalPrice,
                durationMin: variant.durationMin,
                bufferBeforeMin: variant.bufferBeforeMin,
                bufferAfterMin: variant.bufferAfterMin,
              })
            );
          }
        })
        .catch((err) => console.error("Failed to restore service:", err));

      api
        .get(`/beauticians/${beauticianParam}`)
        .then((res) => {
          dispatch(
            setBeautician({
              beauticianId: res.data._id,
              any: false,
              inSalonPayment: res.data.inSalonPayment || false,
            })
          );
        })
        .catch((err) => console.error("Failed to restore beautician:", err));
    }
  }, []);

  const handleBeauticianSelect = async (beautician) => {
    // Fetch the full beautician data to ensure we have the latest inSalonPayment flag
    let fullBeauticianData = beautician;
    try {
      const beauticianRes = await api.get(`/beauticians/${beautician._id}`);
      fullBeauticianData = beauticianRes.data;
    } catch (err) {
      console.error("Failed to fetch full beautician data:", err);
    }

    setSelectedBeautician(fullBeauticianData);
    setServicesLoading(true);

    // Update URL to include selected beautician (preserve existing service params)
    const serviceParam = searchParams.get("service");
    const variantParam = searchParams.get("variant");
    const params = new URLSearchParams({ selected: beautician._id });
    if (serviceParam) params.set("service", serviceParam);
    if (variantParam) params.set("variant", variantParam);
    navigate(`/salon/${tenant?.slug}/beauticians?${params.toString()}`, {
      replace: true,
    });

    try {
      // Fetch services offered by this beautician
      const res = await api.get("/services", {
        params: { limit: 1000 }, // Fetch all services
      });
      const beauticianServices = res.data.filter((service) => {
        // Helper to get ID from either string or object
        const getId = (field) => {
          if (!field) return null;
          return typeof field === "object" && field._id ? field._id : field;
        };

        // Check primary beautician (can be populated object or ID string)
        const primaryId = getId(service.primaryBeauticianId);
        if (primaryId === beautician._id) return true;

        // Check legacy single beautician field
        const legacyId = getId(service.beauticianId);
        if (legacyId === beautician._id) return true;

        // Check additional beauticians array
        if (
          service.additionalBeauticianIds &&
          Array.isArray(service.additionalBeauticianIds)
        ) {
          const hasMatch = service.additionalBeauticianIds.some(
            (id) => getId(id) === beautician._id
          );
          if (hasMatch) return true;
        }

        // Check legacy beauticians array
        if (service.beauticianIds && Array.isArray(service.beauticianIds)) {
          const hasMatch = service.beauticianIds.some(
            (id) => getId(id) === beautician._id
          );
          if (hasMatch) return true;
        }

        return false;
      });

      setServices(beauticianServices);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceSelect = (service) => {
    // Check if service has variants that need selection
    if (service.variants && service.variants.length > 1) {
      setSelectedService(service);
      setShowVariantSelector(true);
    } else {
      // Auto-select single variant or use service defaults
      const variant = service.variants?.[0] || {
        name: "Standard Service",
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: 0,
        bufferAfterMin: 10,
      };

      handleVariantConfirm(variant, service);
    }
  };

  const handleVariantConfirm = (selectedVariant, service) => {
    // Set booking data with selected variant
    // Use promo price if available, otherwise use regular price
    const finalPrice = selectedVariant.promoPrice || selectedVariant.price;
    dispatch(
      setService({
        serviceId: service._id,
        serviceName: service.name,
        variantName: selectedVariant.name,
        price: finalPrice,
        durationMin: selectedVariant.durationMin,
        bufferBeforeMin: selectedVariant.bufferBeforeMin,
        bufferAfterMin: selectedVariant.bufferAfterMin,
      })
    );

    dispatch(
      setBeautician({
        beauticianId: selectedBeautician._id,
        any: false,
        inSalonPayment: selectedBeautician.inSalonPayment || false,
      })
    );

    // Navigate to time selection with URL params for persistence
    const params = new URLSearchParams({
      service: service._id,
      variant: selectedVariant.name,
      beautician: selectedBeautician._id,
    });
    navigate(`/salon/${tenant?.slug}/times?${params.toString()}`);
  };

  const handleVariantCancel = () => {
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  const handleBack = () => {
    setSelectedBeautician(null);
    setServices([]);
    setShowVariantSelector(false);
    setSelectedService(null);
    setIsBioExpanded(false);
    // Clear all URL parameters when going back
    navigate(`/salon/${tenant?.slug}/beauticians`, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Book Appointment", url: "/beauticians" },
  ]);

  return (
    <>
      {/* Dynamic Background with Spotify-style Dark Gradient */}
      <motion.div
        className="fixed inset-0 -z-10"
        animate={{
          background: selectedBeautician
            ? "linear-gradient(to bottom right, #172554, #312e81, #4c1d95)"
            : "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)",
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      {/* Noise Texture Overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 100, 0], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ y: [0, -100, 0], x: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <PageTransition className="min-h-screen py-8 overflow-x-hidden relative z-0">
        {/* SEO Meta Tags */}
        <SEOHead
          title="Book Appointment Wisbech | Expert Beauticians - Noble Elegance"
          description="Book your beauty appointment in Wisbech. Expert beauticians specializing in permanent makeup, brows, lashes & treatments. Online booking available 24/7!"
          keywords="book beauty appointment Wisbech, beauty booking Cambridgeshire, permanent makeup appointment, book beautician Wisbech, beauty salon booking March, online booking beauty salon, King's Lynn beauty appointments"
          schema={breadcrumbSchema}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {!selectedBeautician ? (
            // Step 1: Select a Beautician
            <>
              {/* Hero Section - Dark Spotify Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-16 text-center"
              >
                <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight">
                  Choose Your Specialist
                </h1>
                <p className="text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
                  Select your preferred beauty professional to begin your
                  journey
                </p>

                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex justify-center gap-8 mt-12"
                >
                  <div className="text-center px-8 py-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <div className="text-4xl font-black text-white mb-1">
                      {beauticians.length}
                    </div>
                    <div className="text-sm text-white/60 font-semibold uppercase tracking-wider">
                      Specialists
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {beauticians.map((beautician) => (
                  <StaggerItem key={beautician._id}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer overflow-hidden p-0 h-[480px] rounded-2xl border-2 border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl hover:shadow-white/5"
                      onClick={() => handleBeauticianSelect(beautician)}
                    >
                      {/* Full Card Image with Name Overlay */}
                      <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
                        {beautician.image?.url ? (
                          <img
                            src={beautician.image.url}
                            alt={`${
                              beautician.name
                            } - Expert Beautician specializing in ${
                              beautician.specialties?.slice(0, 2).join(", ") ||
                              "beauty treatments"
                            }`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent group-hover:from-purple-900/90 transition-colors duration-300"></div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          {/* Specialties badges at top */}
                          {beautician.specialties &&
                            beautician.specialties.length > 0 && (
                              <div className="flex-1 flex flex-wrap gap-2 content-start mb-4">
                                {beautician.specialties
                                  .slice(0, 3)
                                  .map((specialty, idx) => (
                                    <span
                                      key={idx}
                                      className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold rounded-full shadow-lg"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                {beautician.specialties.length > 3 && (
                                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold rounded-full shadow-lg">
                                    +{beautician.specialties.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                          {/* Name and CTA */}
                          <div>
                            <h3 className="text-3xl font-black text-white mb-3 group-hover:text-green-400 transition-colors">
                              {beautician.name}
                            </h3>

                            {beautician.bio && (
                              <p className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed">
                                {beautician.bio}
                              </p>
                            )}

                            {/* View Services Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                              <span className="text-white/90 text-sm font-medium">
                                View Services
                              </span>
                              <svg
                                className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </>
          ) : (
            // Step 2: Select a Service
            <>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBack}
                className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors font-semibold group"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Specialists
              </motion.button>

              {/* Beautician Header Card - Dark Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 overflow-hidden bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl"
              >
                <div className="flex items-start gap-6 p-8">
                  {/* Selected Beautician Image */}
                  <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 shadow-2xl ring-4 ring-white/10">
                    {selectedBeautician.image?.url ? (
                      <img
                        src={selectedBeautician.image.url}
                        alt={selectedBeautician.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
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
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-4xl font-black text-white">
                        {selectedBeautician.name}
                      </h1>
                      <svg
                        className="w-7 h-7 text-green-400"
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
                    {selectedBeautician.specialties &&
                      selectedBeautician.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedBeautician.specialties.map(
                            (specialty, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1.5 bg-white/10 text-white/90 text-xs font-bold rounded-full border border-white/20"
                              >
                                {specialty}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    {selectedBeautician.bio && (
                      <div>
                        <p
                          className={`text-white/80 leading-relaxed text-base ${
                            isBioExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {selectedBeautician.bio}
                        </p>
                        {selectedBeautician.bio.length > 120 && (
                          <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors mt-3 text-sm font-bold"
                          >
                            <span>
                              {isBioExpanded ? "Show less" : "Read more"}
                            </span>
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

              {/* Services Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-10"
              >
                <h2 className="text-4xl font-black text-white mb-3">
                  Available Services
                </h2>
                <p className="text-white/60 text-lg">
                  Select the service you'd like to book
                </p>
              </motion.div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : services.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10">
                    <motion.svg
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 mx-auto mb-6 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </motion.svg>
                    <h3 className="text-2xl font-black text-white mb-3">
                      Coming Soon!
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      This beautician is preparing their service menu. In the
                      meantime, feel free to explore our other talented
                      professionals!
                    </p>
                  </div>
                </motion.div>
              ) : (
                <StaggerContainer className="grid gap-6 sm:grid-cols-2 overflow-x-hidden w-full">
                  {services.map((service) => (
                    <StaggerItem
                      key={service._id}
                      className="w-full overflow-x-hidden"
                    >
                      <ServiceCard
                        service={service}
                        onClick={() => handleServiceSelect(service)}
                      />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </>
          )}
        </div>

        {/* Service Variant Selection Modal */}
        {showVariantSelector && selectedService && (
          <ServiceVariantSelector
            service={selectedService}
            selectedBeautician={selectedBeautician}
            onVariantSelect={handleVariantConfirm}
            onCancel={handleVariantCancel}
          />
        )}
      </PageTransition>
    </>
  );
}
