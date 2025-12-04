import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, useScroll, useTransform } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { setService, setBeautician } from "../state/bookingSlice";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import SEOHead from "../../shared/components/seo/SEOHead";

/**
 * Premium, luxury landing page for multi-tenant booking platform
 * Designed to compete with GlossGenius, Fresha, Doctolib, Squarespace Scheduling
 */
export default function SalonLanding() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [beauticians, setBeauticians] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, beauticiansRes, servicesRes] = await Promise.all([
          api.get("/settings").catch(() => ({ data: null })),
          api.get("/beauticians"),
          api.get("/services"),
        ]);

        setSettings(settingsRes.data);
        
        const activeBeauticians = beauticiansRes.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);
        
        const activeServices = servicesRes.data.filter((s) => s.active);
        setServices(activeServices);

        // Calculate stats
        const categories = new Set(activeServices.map((s) => s.category).filter(Boolean));
        setStats({
          services: activeServices.length,
          beauticians: activeBeauticians.length,
          categories: categories.size,
        });
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleBookNow = () => {
    // Navigate based on beautician count
    if (beauticians.length <= 1) {
      navigate("services");
    } else {
      navigate("beauticians");
    }
  };

  const handleServiceClick = (service) => {
    // Select the service
    dispatch(setService({
      serviceId: service._id,
      variantName: service.variantName,
      price: service.price,
      durationMin: service.durationMin,
      bufferBeforeMin: service.bufferBeforeMin,
      bufferAfterMin: service.bufferAfterMin,
    }));
    
    // If there's only one beautician, select them automatically and go to time slots
    if (beauticians.length === 1) {
      dispatch(setBeautician({
        beauticianId: beauticians[0]._id,
        any: false,
        inSalonPayment: false,
      }));
      navigate(`/salon/${tenant?.slug}/times`);
    } else {
      // Multiple beauticians - go to beautician selection
      navigate("beauticians");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const salonName = tenant?.name || settings?.salonName || "Beauty Salon";
  const salonDescription = tenant?.description || settings?.salonDescription || "Experience luxury beauty treatments";
  const heroImage = settings?.heroImage?.url;

  return (
    <>
      <SEOHead
        title={`${salonName} - Premium Beauty Services`}
        description={salonDescription}
      />

      <PageTransition>
        {/* Hero Section - Clean and Professional */}
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-3xl overflow-hidden mb-12 shadow-2xl">
          {/* Hero Image Overlay */}
          {heroImage && (
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={settings?.heroImage?.alt || `${salonName} hero`}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/90 via-brand-700/90 to-brand-900/90"></div>
            </div>
          )}

          <div className="relative px-6 md:px-12 py-20 md:py-28">
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
                <span className="text-gray-700 font-medium text-sm">Available for booking now</span>
              </motion.div>

              {/* Clean Professional Heading */}
              <motion.h1 
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Professional Beauty Services
              </motion.h1>

              {/* Clear Value Proposition */}
              <motion.p 
                className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Book your appointment online in seconds. Expert beauticians, premium products, exceptional results.
              </motion.p>

              {/* Primary CTA - Focused on Booking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              >
                <motion.button
                  onClick={handleBookNow}
                  className="px-10 py-5 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-2xl flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Your Appointment
                </motion.button>

                <motion.button
                  onClick={() => navigate("services")}
                  className="px-10 py-5 bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-xl border-2 border-white/40 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Services
                </motion.button>
              </motion.div>

              {/* Clean Stats Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="grid grid-cols-3 gap-8 sm:gap-12 mt-16 pt-10 border-t border-white/20 max-w-2xl mx-auto"
              >
                {[
                  { value: stats.services, label: "Services" },
                  { value: stats.beauticians, label: "Specialists" },
                  { value: stats.categories, label: "Categories" }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center"
                  >
                    <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                      {stat.value}+
                    </div>
                    <div className="text-sm text-white/70 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Beauticians Section - Show if multiple specialists */}
        {beauticians.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 bg-brand-100 text-brand-700 text-sm font-bold rounded-full mb-4">
                Our Specialists
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Meet Our Team
              </h2>
              <p className="text-xl text-gray-600">
                Expert beauticians ready to serve you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beauticians.map((beautician) => (
                <motion.div
                  key={beautician._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card
                    hoverable
                    className="group cursor-pointer overflow-hidden p-0 h-[480px] border-2 border-transparent hover:border-brand-200 transition-all duration-300"
                    onClick={() => navigate(`beauticians?selected=${beautician._id}`)}
                  >
                    {/* Full Card Image with Name Overlay */}
                    <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200">
                      {beautician.image?.url ? (
                        <img
                          src={beautician.image.url}
                          alt={`${beautician.name} - Expert Beautician specializing in ${beautician.specialties?.slice(0, 2).join(", ") || "beauty treatments"}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-brand-900/90 transition-colors duration-300"></div>

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        {/* Specialties badges at top */}
                        {beautician.specialties && beautician.specialties.length > 0 && (
                          <div className="flex-1 flex flex-wrap gap-2 content-start mb-4">
                            {beautician.specialties.slice(0, 3).map((specialty, idx) => (
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
                          <h3 className="text-3xl font-black text-white mb-3">
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services Section - Show if only one specialist */}
        {beauticians.length <= 1 && services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-2 bg-brand-100 text-brand-700 text-sm font-bold rounded-full mb-4">
                Our Services
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                Available Treatments
              </h2>
              <p className="text-xl text-gray-600">
                Discover our professional beauty services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.slice(0, 3).map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -8 }}
                  onHoverStart={() => setHoveredService(service._id)}
                  onHoverEnd={() => setHoveredService(null)}
                >
                  <Card
                    className="group cursor-pointer overflow-hidden h-full border-2 border-transparent hover:border-brand-300 transition-all duration-300 relative"
                    onClick={() => handleServiceClick(service)}
                  >
                    {/* Shine effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      animate={hoveredService === service._id ? { x: '200%' } : {}}
                      transition={{ duration: 0.8 }}
                    />

                    {service.image?.url && (
                      <div className="relative h-64 overflow-hidden">
                        <motion.img
                          src={service.image.url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                          animate={hoveredService === service._id ? { opacity: 0.5 } : { opacity: 1 }}
                        />
                        {service.category && (
                          <motion.div 
                            className="absolute top-4 left-4"
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-brand-700 text-xs font-bold rounded-full shadow-lg">
                              {service.category}
                            </span>
                          </motion.div>
                        )}
                        
                        {/* Floating price badge */}
                        <motion.div
                          className="absolute bottom-4 right-4"
                          initial={{ y: 20, opacity: 0 }}
                          animate={hoveredService === service._id ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-4 py-2 bg-brand-600 text-white font-black rounded-full shadow-xl">
                            {formatPrice(service.price)}
                          </div>
                        </motion.div>
                      </div>
                    )}
                    <div className="p-6 relative z-10">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {!service.image?.url && (
                            <span className="text-2xl font-black text-brand-600">
                              {formatPrice(service.price)}
                            </span>
                          )}
                        </div>
                        {service.durationMin && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-gray-700">{service.durationMin} min</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Book button */}
                      <motion.button 
                        onClick={() => handleServiceClick(service)}
                        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/30"
                        whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Book Now
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="text-center mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={() => navigate("services")}
                className="group relative px-10 py-5 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold text-lg rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/40"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative z-10 flex items-center gap-3">
                  View All Services
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <motion.span
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-full mb-4"
            >
              💎 Our Promise
            </motion.span>
            <h2 className="text-5xl font-black text-gray-900 mb-3">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600">
              Experience the difference of professional care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                title: "Expert Professionals",
                description: "Our skilled specialists bring years of experience and passion to every treatment",
                color: "from-violet-100 to-violet-200",
                iconColor: "text-violet-600"
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Easy Booking",
                description: "Book your appointment online 24/7 with instant confirmation",
                color: "from-brand-100 to-brand-200",
                iconColor: "text-brand-600"
              },
              {
                icon: (
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
                title: "Premium Quality",
                description: "We use only the finest products and latest techniques for exceptional results",
                color: "from-amber-100 to-amber-200",
                iconColor: "text-amber-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="text-center p-8 hover:shadow-2xl transition-all duration-300 group border-2 border-transparent hover:border-brand-200 h-full">
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className={feature.iconColor}>
                      {feature.icon}
                    </div>
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white p-12 md:p-16 text-center overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
              <motion.div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
                animate={{ 
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  repeatType: 'reverse',
                  ease: 'linear'
                }}
              />
            </div>

            {/* Floating orbs */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                x: [0, 15, 0],
              }}
              transition={{ 
                duration: 7, 
                repeat: Infinity, 
                ease: 'easeInOut'
              }}
              className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                y: [0, 25, 0],
                x: [0, -20, 0],
              }}
              transition={{ 
                duration: 9, 
                repeat: Infinity, 
                ease: 'easeInOut',
                delay: 1
              }}
              className="absolute bottom-10 right-10 w-40 h-40 bg-amber-300/20 rounded-full blur-3xl"
            />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Book Your Appointment</h2>
              <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Choose your preferred service and time slot. Easy online booking with instant confirmation.
              </p>

              <motion.button
                onClick={handleBookNow}
                className="px-12 py-5 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-2xl inline-flex items-center gap-3"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Get Started Now
              </motion.button>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Instant Confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Expert Beauticians</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </PageTransition>
    </>
  );
}
