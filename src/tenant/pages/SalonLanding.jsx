import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { setService, setBeautician } from "../state/bookingSlice";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import SEOHead from "../../shared/components/seo/SEOHead";

/**
 * Premium, world-class landing page for multi-tenant booking platform
 * Designed to compete with GlossGenius, Fresha, Doctolib, Squarespace Scheduling
 */
export default function SalonLanding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();

  // State
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [heroSection, setHeroSection] = useState(null);
  const [beauticians, setBeauticians] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Scroll animations
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const heroY = useTransform(scrollY, [0, 400], [0, -100]);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, beauticiansRes, servicesRes, heroSectionsRes] =
          await Promise.all([
            api.get("/settings").catch(() => ({ data: null })),
            api.get("/beauticians"),
            api.get("/services"),
            api.get("/hero-sections").catch(() => ({ data: [] })),
          ]);

        setSettings(settingsRes.data);

        // Get active hero section
        if (heroSectionsRes.data && heroSectionsRes.data.length > 0) {
          const activeHero = heroSectionsRes.data.find((h) => h.active);
          setHeroSection(activeHero || heroSectionsRes.data[0]);
        }

        const activeBeauticians = beauticiansRes.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);

        const activeServices = servicesRes.data.filter((s) => s.active);
        setServices(activeServices);

        // Group services by category
        const grouped = activeServices.reduce((acc, service) => {
          const category = service.category || "Other";
          if (!acc[category]) acc[category] = [];
          acc[category].push(service);
          return acc;
        }, {});
        setServicesByCategory(grouped);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleServiceClick = (service) => {
    dispatch(
      setService({
        serviceId: service._id,
        serviceName: service.name,
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
      // Add URL params for persistence
      const params = new URLSearchParams({
        service: service._id,
        variant: service.variantName,
        beautician: beauticians[0]._id,
      });
      navigate(`/salon/${tenant?.slug}/times?${params.toString()}`);
    } else {
      // Add service to URL params when navigating to beautician selection
      const params = new URLSearchParams({
        service: service._id,
        variant: service.variantName,
      });
      navigate(`/salon/${tenant?.slug}/beauticians?${params.toString()}`);
    }
  };

  const handleSpecialistClick = (specialist) => {
    navigate(`/salon/${tenant?.slug}/beauticians?selected=${specialist._id}`);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600 font-medium">
            Loading your experience...
          </p>
        </motion.div>
      </div>
    );
  }

  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription =
    tenant?.description ||
    settings?.salonDescription ||
    "Experience luxury beauty treatments";
  const heroImage =
    heroSection?.centerImage?.url ||
    heroSection?.rightImage?.url ||
    settings?.heroImage?.url;
  const categories = Object.keys(servicesByCategory);
  const hasMultipleSpecialists = beauticians.length > 1;

  return (
    <>
      <SEOHead
        title={`${salonName} - Premium Beauty & Wellness`}
        description={salonDescription}
      />

      {/* Luxury Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(196,181,253,0.1),transparent_50%)]"></div>
      </div>

      {/* Premium Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden"
      >
        {/* Hero Background Image - Full Width/Height */}
        {heroImage && (
          <>
            <motion.img
              src={heroImage}
              alt={heroSection?.heading || salonName}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80"></div>
          </>
        )}

        {/* Ambient Background Elements (only if no hero image) */}
        {!heroImage && (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl"
            />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto text-center px-4">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-lg"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-sm font-medium text-white/90">
                Available for bookings
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="text-white drop-shadow-2xl">{salonName}</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl max-w-2xl mx-auto font-light leading-relaxed text-white/70">
              {salonDescription}
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <motion.button
                onClick={() =>
                  scrollToSection(
                    hasMultipleSpecialists ? "specialists" : "services"
                  )
                }
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-10 py-5 bg-green-400 hover:bg-green-500 text-black rounded-full font-semibold text-lg shadow-lg shadow-green-400/30 transition-all"
              >
                <span className="flex items-center gap-2">
                  Book Appointment
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </motion.button>

              <motion.button
                onClick={() => scrollToSection("services")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-10 py-5 bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all"
              >
                View Services
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center gap-12 pt-16"
            >
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${
                    heroImage ? "text-white" : "text-slate-900"
                  }`}
                >
                  {services.length}+
                </div>
                <div
                  className={`text-sm mt-1 ${
                    heroImage ? "text-white/80" : "text-slate-600"
                  }`}
                >
                  Services
                </div>
              </div>
              <div
                className={`w-px h-12 ${
                  heroImage ? "bg-white/30" : "bg-slate-200"
                }`}
              ></div>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${
                    heroImage ? "text-white" : "text-slate-900"
                  }`}
                >
                  {beauticians.length}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    heroImage ? "text-white/80" : "text-slate-600"
                  }`}
                >
                  Specialists
                </div>
              </div>
              <div
                className={`w-px h-12 ${
                  heroImage ? "bg-white/30" : "bg-slate-200"
                }`}
              ></div>
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${
                    heroImage ? "text-white" : "text-slate-900"
                  }`}
                >
                  {categories.length}
                </div>
                <div
                  className={`text-sm mt-1 ${
                    heroImage ? "text-white/80" : "text-slate-600"
                  }`}
                >
                  Categories
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer"
              onClick={() =>
                scrollToSection(
                  hasMultipleSpecialists ? "specialists" : "services"
                )
              }
            >
              <span className="text-sm font-medium">Scroll to explore</span>
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Specialists Section (if multiple) */}
      {hasMultipleSpecialists && (
        <section id="specialists" className="relative py-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
                Our Specialists
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Meet our talented team of beauty professionals
              </p>
            </motion.div>

            {/* Specialists Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beauticians.map((specialist, index) => (
                <motion.div
                  key={specialist._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredCard(specialist._id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="group relative rounded-3xl border border-white/10 shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-green-400/20 hover:border-green-400/30 transition-all duration-500 cursor-pointer overflow-hidden aspect-[3/4]"
                    onClick={() => handleSpecialistClick(specialist)}
                  >
                    {/* Full Background Image */}
                    {specialist.image?.url ? (
                      <motion.img
                        src={specialist.image.url}
                        alt={specialist.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.6 }}
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                        <span className="text-8xl font-bold text-white/20">
                          {specialist.name?.charAt(0)}
                        </span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                    {/* Glow Effect on Hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: hoveredCard === specialist._id ? 1 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Info - Positioned at Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                        {specialist.name}
                      </h3>
                      {specialist.specialties &&
                        specialist.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {specialist.specialties
                              .slice(0, 3)
                              .map((specialty, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-xs font-medium border border-white/20"
                                >
                                  {specialty}
                                </span>
                              ))}
                          </div>
                        )}
                      {specialist.bio && (
                        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
                          {specialist.bio}
                        </p>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <motion.div
                      className="absolute bottom-8 right-8 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg"
                      animate={{
                        x: hoveredCard === specialist._id ? 4 : 0,
                        scale: hoveredCard === specialist._id ? 1.1 : 1,
                      }}
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section
        id="services"
        className="relative py-32 px-4 bg-gradient-to-b from-transparent to-slate-50/50"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our range of premium beauty treatments
            </p>
          </motion.div>

          {/* Category Tabs */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-16"
            >
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  selectedCategory === "all"
                    ? "bg-slate-900 text-white shadow-lg scale-105"
                    : "bg-white/60 backdrop-blur-xl text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                All Services
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white shadow-lg scale-105"
                      : "bg-white/60 backdrop-blur-xl text-slate-700 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(selectedCategory === "all"
                ? services
                : servicesByCategory[selectedCategory] || []
              ).map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onHoverStart={() => setHoveredCard(service._id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer h-full flex flex-col"
                    onClick={() => handleServiceClick(service)}
                  >
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"
                      animate={{ opacity: hoveredCard === service._id ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Service Image */}
                    {service.image?.url && (
                      <div className="relative mb-4 overflow-hidden rounded-xl aspect-video">
                        <motion.img
                          src={service.image.url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative z-10 flex-grow flex flex-col">
                      {/* Category Badge */}
                      {service.category && (
                        <span className="inline-block w-fit px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium mb-3">
                          {service.category}
                        </span>
                      )}

                      {/* Service Name */}
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>

                      {/* Description */}
                      {service.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
                          {service.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col gap-1">
                          <span className="text-2xl font-bold text-slate-900">
                            {formatPrice(service.price)}
                          </span>
                          {service.durationMin && (
                            <span className="text-sm text-slate-500">
                              {service.durationMin} minutes
                            </span>
                          )}
                        </div>

                        {/* Book Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                        >
                          Book
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Mobile Sticky CTA */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: scrolled ? 0 : 100 }}
        className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl z-50"
      >
        <motion.button
          onClick={() =>
            scrollToSection(hasMultipleSpecialists ? "specialists" : "services")
          }
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl"
        >
          Book Appointment
        </motion.button>
      </motion.div>
    </>
  );
}
