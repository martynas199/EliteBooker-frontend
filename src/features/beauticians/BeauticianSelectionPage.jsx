import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/apiClient";
import { useDispatch } from "react-redux";
import { setService, setBeautician } from "../booking/bookingSlice";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "../../components/ui/PageTransition";
import Card from "../../components/ui/Card";
import ServiceCard from "../landing/ServiceCard";
import ServiceVariantSelector from "../../components/ServiceVariantSelector";
import SEOHead from "../../components/seo/SEOHead";
import { generateBreadcrumbSchema } from "../../utils/schemaGenerator";

export default function BeauticianSelectionPage() {
  const [specialists, setBeauticians] = useState([]);
  const [selectedSpecialist, setSelectedBeautician] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fetch all specialists
    api
      .get("/specialists")
      .then((res) => {
        const activeBeauticians = res.data.filter((b) => b.active);
        setBeauticians(activeBeauticians);

        // Check if there's a selected specialist in URL params
        const selectedId = searchParams.get("selected");
        if (selectedId) {
          const specialist = activeBeauticians.find(
            (b) => b._id === selectedId
          );
          if (specialist) {
            handleBeauticianSelect(specialist);
          }
        }
      })
      .catch((err) => console.error("Failed to fetch specialists:", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleBeauticianSelect = async (specialist) => {
    // Fetch the full specialist data to ensure we have the latest inSalonPayment flag
    let fullBeauticianData = specialist;
    try {
      const beauticianRes = await api.get(`/specialists/${specialist._id}`);
      fullBeauticianData = beauticianRes.data;
    } catch (err) {
      console.error("Failed to fetch full specialist data:", err);
    }

    setSelectedBeautician(fullBeauticianData);
    setServicesLoading(true);

    // Update URL to include selected specialist
    navigate(`?selected=${specialist._id}`, { replace: true });

    try {
      // Fetch services offered by this specialist
      const res = await api.get("/services", {
        params: { limit: 1000 }, // Fetch all services
      });
      const beauticianServices = res.data.filter((service) => {
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
        variantName: selectedVariant.name,
        price: finalPrice,
        durationMin: selectedVariant.durationMin,
        bufferBeforeMin: selectedVariant.bufferBeforeMin,
        bufferAfterMin: selectedVariant.bufferAfterMin,
      })
    );

    dispatch(
      setBeautician({
        specialistId: selectedSpecialist._id,
        any: false,
        inSalonPayment: selectedSpecialist.inSalonPayment || false,
      })
    );

    // Navigate to time selection
    navigate("times");
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
    // Clear the URL parameter when going back
    navigate("", { replace: true });
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
    <PageTransition className="min-h-screen bg-gray-50 py-8 overflow-x-hidden">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Book Appointment Wisbech | Expert Specialists - Noble Elegance"
        description="Book your beauty appointment in Wisbech. Expert specialists specializing in permanent makeup, brows, lashes & treatments. Online booking available 24/7!"
        keywords="book beauty appointment Wisbech, beauty booking Cambridgeshire, permanent makeup appointment, book specialist Wisbech, beauty salon booking March, online booking beauty salon, King's Lynn beauty appointments"
        schema={breadcrumbSchema}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {!selectedSpecialist ? (
          // Step 1: Select a Specialist
          <>
            {/* Hero Section */}
            <div className="bg-white rounded-3xl overflow-hidden mb-12 shadow-sm border border-gray-200">
              <div className="px-8 py-16 text-center">
                <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                  Choose Your Specialist
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Select your preferred beauty professional to begin your
                  journey
                </p>

                {/* Quick Info */}
                <div className="flex justify-center gap-8 mt-10">
                  <div className="text-center">
                    <div className="text-3xl font-black text-gray-900">
                      {specialists.length}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Specialists
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {specialists.map((specialist) => (
                <StaggerItem key={specialist._id}>
                  <Card
                    hoverable
                    className="group cursor-pointer overflow-hidden p-0 h-[480px] border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
                    onClick={() => handleBeauticianSelect(specialist)}
                  >
                    {/* Card split: Image top, Content bottom */}
                    <div className="relative h-full w-full flex flex-col bg-white">
                      {/* Image Section - 60% height */}
                      <div className="relative h-3/5 overflow-hidden bg-gray-100">
                        {specialist.image?.url ? (
                          <img
                            src={specialist.image.url}
                            alt={`${
                              specialist.name
                            } - Expert Specialist specializing in ${
                              specialist.specialties?.slice(0, 2).join(", ") ||
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

                        {/* Specialties badges overlay on image */}
                        {specialist.specialties &&
                          specialist.specialties.length > 0 && (
                            <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
                              {specialist.specialties
                                .slice(0, 3)
                                .map((specialty, idx) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full shadow-lg"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              {specialist.specialties.length > 3 && (
                                <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                                  +{specialist.specialties.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                      </div>

                      {/* Content Section - 40% height, white background */}
                      <div className="h-2/5 p-6 flex flex-col justify-between bg-white">
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 mb-2">
                            {specialist.name}
                          </h3>

                          {specialist.bio && (
                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                              {specialist.bio}
                            </p>
                          )}
                        </div>

                        {/* View Services Button */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <span className="text-gray-900 text-sm font-semibold">
                            View Services
                          </span>
                          <svg
                            className="w-5 h-5 text-gray-900 group-hover:translate-x-2 transition-transform duration-300"
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
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        ) : (
          // Step 2: Select a Service
          <>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors font-medium"
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
              Back to Specialists
            </button>

            {/* Specialist Header Card */}
            <Card className="mb-10 overflow-hidden bg-white border-2 border-gray-200">
              <div className="flex items-start gap-6 p-6">
                {/* Selected Specialist Image */}
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gray-200 shadow-lg">
                  {selectedSpecialist.image?.url ? (
                    <img
                      src={selectedSpecialist.image.url}
                      alt={selectedSpecialist.name}
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
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-gray-900">
                      {selectedSpecialist.name}
                    </h1>
                    <svg
                      className="w-6 h-6 text-gray-500"
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
                  {selectedSpecialist.specialties &&
                    selectedSpecialist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedSpecialist.specialties.map(
                          (specialty, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full"
                            >
                              {specialty}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  {selectedSpecialist.bio && (
                    <div>
                      <p
                        className={`text-gray-700 leading-relaxed ${
                          isBioExpanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {selectedSpecialist.bio}
                      </p>
                      {selectedSpecialist.bio.length > 120 && (
                        <button
                          onClick={() => setIsBioExpanded(!isBioExpanded)}
                          className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors mt-2 text-sm font-semibold"
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
            </Card>

            {/* Services Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Available Services
              </h2>
              <p className="text-gray-600">
                Select the service you'd like to book
              </p>
            </div>

            {servicesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-gray-600">
                    This specialist is preparing their service menu. In the
                    meantime, feel free to explore our other talented
                    professionals!
                  </p>
                </div>
              </div>
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
          selectedSpecialist={selectedSpecialist}
          onVariantSelect={handleVariantConfirm}
          onCancel={handleVariantCancel}
        />
      )}
    </PageTransition>
  );
}
