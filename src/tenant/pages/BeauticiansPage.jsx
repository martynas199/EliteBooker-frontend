import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../shared/lib/apiClient";
import { useDispatch } from "react-redux";
import { addService, setSpecialist } from "../state/bookingSlice";
import { useTenant } from "../../shared/contexts/TenantContext";
import { useBookingGuard } from "../hooks/useBookingGuard";
import BookingConfirmLeaveModal from "../components/BookingConfirmLeaveModal";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../shared/components/ui/PageTransition";
import ServiceCard from "../components/ServiceCard";
import SpecialistHeader from "../components/SpecialistHeader";
import SpecialistCard from "../components/SpecialistCard";
import ServiceVariantSelector from "../../shared/components/ServiceVariantSelector";
import ServiceStackBar from "../components/ServiceStackBar";
import SEOHead from "../../shared/components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../shared/utils/schemaGenerator";

export default function SpecialistSelectionPage() {
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
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

  // Enable booking guard to warn on navigation away
  const { showModal, onConfirmLeave, onCancelLeave, checkNavigation } =
    useBookingGuard();

  useEffect(() => {
    // Fetch all specialists
    api
      .get("/specialists")
      .then((res) => {
        const activeSpecialists = res.data.filter((b) => b.active);
        setSpecialists(activeSpecialists);

        // Check if there's a selected specialist in URL params
        const selectedId = searchParams.get("selected");
        if (selectedId) {
          const specialist = activeSpecialists.find(
            (b) => b._id === selectedId
          );
          if (specialist) {
            handleSpecialistSelect(specialist);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch specialists:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Restore booking state from URL parameters on mount
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const variantParam = searchParams.get("variant");
    const specialistParam = searchParams.get("selected");

    if (serviceParam && specialistParam) {
      // Restore service and specialist to Redux from URL
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
        .get(`/specialists/${specialistParam}`)
        .then((res) => {
          dispatch(
            setSpecialist({
              specialistId: res.data._id,
              any: false,
              inSalonPayment: res.data.inSalonPayment || false,
            })
          );
        })
        .catch((err) => console.error("Failed to restore specialist:", err));
    }
  }, []);

  const handleSpecialistSelect = async (specialist) => {
    // Fetch the full specialist data to ensure we have the latest inSalonPayment flag
    let fullSpecialistData = specialist;
    try {
      const specialistRes = await api.get(`/specialists/${specialist._id}`);
      fullSpecialistData = specialistRes.data;
    } catch (err) {
      console.error("Failed to fetch full specialist data:", err);
    }

    setSelectedSpecialist(fullSpecialistData);
    setServicesLoading(true);

    // Update URL to include selected specialist (preserve existing service params)
    const serviceParam = searchParams.get("service");
    const variantParam = searchParams.get("variant");
    const params = new URLSearchParams({ selected: specialist._id });
    if (serviceParam) params.set("service", serviceParam);
    if (variantParam) params.set("variant", variantParam);
    navigate(`/salon/${tenant?.slug}/specialists?${params.toString()}`, {
      replace: true,
    });

    try {
      // Fetch services offered by this specialist
      const res = await api.get("/services", {
        params: { limit: 1000 }, // Fetch all services
      });
      const specialistServices = res.data.filter((service) => {
        // Helper to get ID from either string or object
        const getId = (field) => {
          if (!field) return null;
          return typeof field === "object" && field._id ? field._id : field;
        };

        // Check primary specialist (can be populated object or ID string)
        const primaryId = getId(service.primaryBeauticianId);
        if (primaryId === specialist._id) return true;

        // Check legacy single specialist field
        const legacyId = getId(service.specialistId);
        if (legacyId === specialist._id) return true;

        // Check additional specialists array
        if (
          service.additionalBeauticianIds &&
          Array.isArray(service.additionalBeauticianIds)
        ) {
          const hasMatch = service.additionalBeauticianIds.some(
            (id) => getId(id) === specialist._id
          );
          if (hasMatch) return true;
        }

        // Check legacy specialists array
        if (service.beauticianIds && Array.isArray(service.beauticianIds)) {
          const hasMatch = service.beauticianIds.some(
            (id) => getId(id) === specialist._id
          );
          if (hasMatch) return true;
        }

        return false;
      });

      setServices(specialistServices);
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
    // Add service to the booking stack
    // Use promo price if available, otherwise use regular price
    const finalPrice = selectedVariant.promoPrice || selectedVariant.price;
    dispatch(
      addService({
        serviceId: service._id,
        serviceName: service.name,
        variantName: selectedVariant.name,
        price: finalPrice,
        durationMin: selectedVariant.durationMin,
        bufferBeforeMin: selectedVariant.bufferBeforeMin || 0,
        bufferAfterMin: selectedVariant.bufferAfterMin || 0,
      })
    );

    // Set specialist if not already set
    dispatch(
      setSpecialist({
        specialistId: selectedSpecialist._id,
        any: false,
        inSalonPayment: selectedSpecialist.inSalonPayment || false,
      })
    );

    // Close variant selector - don't navigate
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  const handleVariantCancel = () => {
    setShowVariantSelector(false);
    setSelectedService(null);
  };

  const handleBack = () => {
    const canNavigate = checkNavigation(`/salon/${tenant?.slug}`, () => {
      setSelectedSpecialist(null);
      setServices([]);
      setShowVariantSelector(false);
      setSelectedService(null);
      setIsBioExpanded(false);
      // Clear all URL parameters when going back
      navigate(`/salon/${tenant?.slug}/specialists`, { replace: true });
    });

    if (canNavigate) {
      setSelectedSpecialist(null);
      setServices([]);
      setShowVariantSelector(false);
      setSelectedService(null);
      setIsBioExpanded(false);
      navigate(`/salon/${tenant?.slug}/specialists`, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Book Appointment", url: "/specialists" },
  ]);

  return (
    <>
      {/* Booking Guard Modal */}
      <BookingConfirmLeaveModal
        isOpen={showModal}
        onConfirm={onConfirmLeave}
        onCancel={onCancelLeave}
      />

      <PageTransition className="min-h-screen py-8">
        {/* SEO Meta Tags */}
        <SEOHead
          title="Book Appointment Wisbech | Expert Specialists - Elite Booker"
          description="Book your beauty appointment in Wisbech. Expert specialists specializing in permanent makeup, brows, lashes & treatments. Online booking available 24/7!"
          keywords="book beauty appointment Wisbech, beauty booking Cambridgeshire, permanent makeup appointment, book specialist Wisbech, beauty salon booking March, online booking beauty salon, King's Lynn beauty appointments"
          schema={breadcrumbSchema}
        />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {!selectedSpecialist ? (
            // Step 1: Select a Specialist
            <>
              {/* Hero Section - Dark Spotify Style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mb-16 sm:mb-20 text-center"
              >
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight px-4">
                  Choose Your Specialist
                </h1>
                <p className="text-lg sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light px-4">
                  Select your preferred beauty professional to begin your
                  journey
                </p>

                {/* Quick Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 px-4"
                >
                  <div className="text-center px-6 sm:px-8 py-3 sm:py-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1">
                      {specialists.length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wider">
                      Specialists
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <StaggerContainer className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6 pb-4 sm:pt-8 sm:pb-6">
                {specialists.map((specialist, index) => (
                  <StaggerItem key={specialist._id}>
                    <SpecialistCard
                      specialist={specialist}
                      onClick={() => handleSpecialistSelect(specialist)}
                      index={index}
                    />
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
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 sm:mb-8 transition-colors font-semibold group text-sm sm:text-base"
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

              {/* Specialist Header Card */}
              <SpecialistHeader
                specialist={selectedSpecialist}
                isBioExpanded={isBioExpanded}
                onToggleBio={() => setIsBioExpanded(!isBioExpanded)}
              />

              {/* Services Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8 sm:mb-10"
              >
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-3">
                  Available Services
                </h2>
                <p className="text-gray-600 text-base sm:text-lg">
                  Select the service you'd like to book
                </p>
              </motion.div>

              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
              ) : services.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12 sm:py-20 px-4"
                >
                  <div className="max-w-md mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-white/10">
                    <motion.svg
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-white/40"
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
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 sm:mb-3">
                      Coming Soon!
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      This specialist is preparing their service menu. In the
                      meantime, feel free to explore our other talented
                      professionals!
                    </p>
                  </div>
                </motion.div>
              ) : (
                <StaggerContainer className="grid gap-4 sm:gap-6 sm:grid-cols-2 w-full">
                  {services.map((service) => (
                    <StaggerItem key={service._id} className="w-full">
                      <ServiceCard
                        service={service}
                        onClick={(variant) => {
                          // Directly add the service with selected variant
                          handleVariantConfirm(variant, service);
                        }}
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
            selectedSpecialist={selectedSpecialist}
            onVariantSelect={handleVariantConfirm}
            onCancel={handleVariantCancel}
          />
        )}

        {/* Service Stack Bar - Floating bottom bar with selected services */}
        <ServiceStackBar />
      </PageTransition>
    </>
  );
}
