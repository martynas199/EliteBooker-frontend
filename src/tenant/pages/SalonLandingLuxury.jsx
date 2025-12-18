import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { useClientAuth } from "../../shared/contexts/ClientAuthContext";
import { addService, setServices, setSpecialist } from "../state/bookingSlice";
import { useBookingAutoCleanup } from "../hooks/useBookingGuard";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "../../shared/api/favorites.api";
import SEOHead from "../../shared/components/seo/SEOHead";
import ServiceCard from "../components/ServiceCard";
import SpecialistCard from "../components/SpecialistCard";
import LocationServicesView from "../components/LocationServicesView";
import GiftCardModal from "../../shared/components/modals/GiftCardModal";
import LoginDrawer from "../../shared/components/modals/LoginDrawer";
import ServiceStackBar from "../components/ServiceStackBar";
import toast from "react-hot-toast";

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
  const { client, isAuthenticated } = useClientAuth();

  // Auto-cleanup: Clear any stale booking state on landing
  useBookingAutoCleanup();
  
  // Get selected services from Redux
  const bookingServices = useSelector((state) => state.booking.services || []);

  // State
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("services"); // 'services' or 'specialists'
  const [settings, setSettings] = useState(null);
  const [heroSection, setHeroSection] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [services, setServices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);
  const [showLoginDrawer, setShowLoginDrawer] = useState(false);

  // Check if multi-location feature is enabled from tenant features
  const isMultiLocationEnabled = tenant?.features?.multiLocation || false;

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          settingsRes,
          specialistsRes,
          servicesRes,
          heroSectionsRes,
          locationsRes,
        ] = await Promise.all([
          api.get("/settings").catch(() => ({ data: null })),
          api.get("/specialists"), // API endpoint unchanged (backend compatibility)
          api.get("/services"),
          api.get("/hero-sections").catch(() => ({ data: [] })),
          api.get("/locations").catch((err) => {
            console.error("[LANDING] Error fetching locations:", err);
            return { data: [] };
          }),
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

        // Filter active locations
        const activeLocations = locationsRes.data.filter((l) => l.isActive);
        setLocations(activeLocations);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load favorites when user is authenticated
  useEffect(() => {
    const loadFavorites = async () => {
      if (isAuthenticated) {
        try {
          const data = await getFavorites();
          setFavorites(data.favorites || []);

          // Check if current tenant is in favorites
          if (tenant?._id && data.favorites) {
            const isInFavorites = data.favorites.some(
              (fav) => (fav._id || fav) === tenant._id
            );
            setIsFavorite(isInFavorites);
          }
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
    };

    loadFavorites();
  }, [isAuthenticated, tenant]);

  // Handler for toggling favorites
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setShowLoginDrawer(true);
      return;
    }

    if (!tenant?._id) return;

    setFavoritesLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(tenant._id);
        setIsFavorite(false);
        toast.success("Removed from favourites");
      } else {
        await addToFavorites(tenant._id);
        setIsFavorite(true);
        toast.success("Added to favourites");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update favourites");
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Handler for sharing the business
  const handleShare = async () => {
    const shareData = {
      title: salonName,
      text: `Check out ${salonName}${
        salonDescription ? ` - ${salonDescription}` : ""
      }`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      // User cancelled share or error occurred
      if (error.name !== "AbortError") {
        console.error("Error sharing:", error);
        toast.error("Failed to share");
      }
    }
  };

  // Handlers
  const handleServiceClick = (service, variant) => {
    // Get specialist ID from service
    const serviceSpecialistId = 
      service.primaryBeauticianId?._id || 
      service.primaryBeauticianId ||
      service.specialistId?._id ||
      service.specialistId ||
      service.beauticianIds?.[0]?._id ||
      service.beauticianIds?.[0];

    // Check if user already has services from a different specialist
    if (bookingServices.length > 0) {
      const firstServiceSpecialistId = bookingServices[0].specialistId;
      
      if (firstServiceSpecialistId && serviceSpecialistId && 
          firstServiceSpecialistId !== serviceSpecialistId) {
        toast.error(
          'You can only book services from the same specialist. Please clear your current selection to choose services from a different specialist.',
          { duration: 4000 }
        );
        return;
      }
    }

    // Add service to the booking stack with the selected variant
    dispatch(
      addService({
        serviceId: service._id,
        serviceName: service.name,
        variantName: variant.name,
        price: variant.price,
        durationMin: variant.durationMin,
        bufferBeforeMin: service.bufferBeforeMin || 0,
        bufferAfterMin: service.bufferAfterMin || 0,
        specialistId: serviceSpecialistId, // Store specialist ID
      })
    );

    // Auto-select the specialist if this is the first service
    if (bookingServices.length === 0 && serviceSpecialistId) {
      // Find the specialist object
      const specialist = specialists.find(s => 
        s._id === serviceSpecialistId
      );
      
      if (specialist) {
        dispatch(
          setSpecialist({
            specialistId: specialist._id,
            any: false,
            inSalonPayment: specialist.inSalonPayment || false,
          })
        );
      }
    }

    // Don't navigate - let user continue adding services
    // They can click Continue on the ServiceStackBar when ready
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

  // Group services by specialist
  const servicesBySpecialist = useMemo(() => {
    if (!services.length || !specialists.length) return [];

    const grouped = new Map();

    services.forEach(service => {
      const specialistId = 
        service.primaryBeauticianId?._id || 
        service.primaryBeauticianId ||
        service.specialistId?._id ||
        service.specialistId ||
        service.beauticianIds?.[0]?._id ||
        service.beauticianIds?.[0];

      if (specialistId) {
        if (!grouped.has(specialistId)) {
          const specialist = specialists.find(s => s._id === specialistId);
          grouped.set(specialistId, {
            specialist,
            services: []
          });
        }
        grouped.get(specialistId).services.push(service);
      }
    });

    return Array.from(grouped.values());
  }, [services, specialists]);

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
          <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-2xl sm:rounded-3xl overflow-hidden mb-12 shadow-lg sm:shadow-xl">
            {/* Action Buttons - Top Right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
              {/* Share Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={handleShare}
                className="p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
                aria-label="Share this business"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-brand-600 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </motion.button>

              {/* Favorite Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                onClick={handleToggleFavorite}
                disabled={favoritesLoading}
                className="p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group disabled:opacity-50"
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <motion.svg
                  initial={false}
                  animate={{
                    scale: isFavorite ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${
                    isFavorite
                      ? "text-red-500 fill-current"
                      : "text-gray-400 group-hover:text-red-500"
                  }`}
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </motion.svg>
              </motion.button>
            </div>

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
                    loading="eager"
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

            <div className="relative z-10 px-4 sm:px-6 md:px-12 py-16 sm:py-20 md:py-28">
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
                    className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4"
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
                      className="px-10 py-5 bg-white text-brand-600 font-bold text-lg rounded-xl shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
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

                    {/* Gift Card Button */}
                    <motion.button
                      onClick={() => setShowGiftCardModal(true)}
                      className="px-8 py-5 bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-xl shadow-xl flex items-center justify-center gap-3 border-2 border-white/30 w-full sm:w-auto"
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                      }}
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
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                      Send a Gift Card
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Locations Section - Show only if multi-location enabled AND multiple locations exist */}
          {isMultiLocationEnabled && locations.length > 1 && (
            <section className="px-4 py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Our Locations
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Visit us at any of our convenient locations
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4 md:px-0">
                  {locations.map((location, index) => (
                    <motion.div
                      key={location._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => {
                        setSelectedLocation(location);
                        // Scroll to services section
                        setTimeout(() => {
                          const servicesSection =
                            document.getElementById("location-services");
                          servicesSection?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }, 100);
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                          {location.name}
                        </h3>
                        {location.isPrimary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            Main
                          </span>
                        )}
                      </div>

                      {location.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {location.description}
                        </p>
                      )}

                      <div className="space-y-3 text-sm text-gray-700">
                        {location.address && (
                          <div className="flex items-start gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>
                              {location.address.street && (
                                <>
                                  {location.address.street}
                                  <br />
                                </>
                              )}
                              {location.address.city}
                              {location.address.postalCode &&
                                `, ${location.address.postalCode}`}
                            </span>
                          </div>
                        )}

                        {location.phone && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <a
                              href={`tel:${location.phone}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {location.phone}
                            </a>
                          </div>
                        )}

                        {location.email && (
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <a
                              href={`mailto:${location.email}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {location.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {location.settings?.amenities &&
                        location.settings.amenities.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">
                              Amenities:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {location.settings.amenities.map((amenity) => (
                                <span
                                  key={amenity}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* View Services Button */}
                      <button className="mt-6 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition-colors group-hover:shadow-lg">
                        View Services & Specialists
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Location-Specific Services/Specialists View */}
          {selectedLocation && (
            <section
              id="location-services"
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen"
            >
              <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Back Button */}
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedLocation(null)}
                  className="mb-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
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
                  Back to all locations
                </motion.button>

                <LocationServicesView
                  location={selectedLocation}
                  allServices={services}
                  allSpecialists={specialists}
                  initialView={viewMode}
                />
              </div>
            </section>
          )}

          {/* Toggle - Only show if multiple specialists and no location selected */}
          {hasMultipleSpecialists && !selectedLocation && (
            <div className="flex justify-center mb-12">
              <ProfessionalToggle value={viewMode} onChange={setViewMode} />
            </div>
          )}

          {/* Main Content - Only show if no location is selected */}
          {!selectedLocation && (
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
                      ) : hasMultipleSpecialists && servicesBySpecialist.length > 0 ? (
                        // Grouped by specialist
                        <div className="space-y-12">
                          {servicesBySpecialist.map(({ specialist, services: specialistServices }) => (
                            <div key={specialist?._id || 'unknown'} className="space-y-6">
                              {/* Specialist Header */}
                              {specialist && (
                                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                                  {specialist.profilePicture?.url && (
                                    <img
                                      src={specialist.profilePicture.url}
                                      alt={specialist.name}
                                      className="w-16 h-16 rounded-full object-cover border-2 border-brand-500"
                                    />
                                  )}
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                      {specialist.name}
                                    </h3>
                                    {specialist.title && (
                                      <p className="text-gray-600">{specialist.title}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Specialist's Services */}
                              <div className="grid gap-6 sm:grid-cols-2 overflow-x-hidden w-full">
                                {specialistServices.map((service) => (
                                  <div
                                    key={service._id}
                                    className="w-full overflow-x-hidden"
                                  >
                                    <ServiceCard
                                      service={service}
                                      onClick={(variant) =>
                                        handleServiceClick(service, variant)
                                      }
                                      isSelected={bookingServices.some(
                                        (s) => s.serviceId === service._id
                                      )}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Single specialist or ungrouped
                        <div className="grid gap-6 sm:grid-cols-2 overflow-x-hidden w-full">
                          {services.map((service) => (
                            <div
                              key={service._id}
                              className="w-full overflow-x-hidden"
                            >
                              <ServiceCard
                                service={service}
                                onClick={(variant) =>
                                  handleServiceClick(service, variant)
                                }
                                isSelected={bookingServices.some(
                                  (s) => s.serviceId === service._id
                                )}
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
          )}
        </div>

        {/* Gift Card Modal */}
        <GiftCardModal
          isOpen={showGiftCardModal}
          onClose={() => setShowGiftCardModal(false)}
          onSuccess={(giftCard) => {}}
        />

        {/* Login Drawer */}
        <LoginDrawer
          isOpen={showLoginDrawer}
          onClose={() => setShowLoginDrawer(false)}
          message="Please sign in to add this salon to your favorites"
        />

        {/* Service Stack Bar - Floating bottom bar with selected services */}
        <ServiceStackBar />
      </div>
    </>
  );
}
