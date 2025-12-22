import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { ServicesAPI } from "./services.api";
import { SalonAPI } from "./salon.api";
import { useTenant } from "../../shared/contexts/TenantContext";
import { addService, setService } from "../state/bookingSlice";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import Card from "../../shared/components/ui/Card";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import SEOHead from "../../shared/components/seo/SEOHead";
import PageTransition from "../../shared/components/ui/PageTransition";
import ServiceCard from "../components/ServiceCard";
import ServiceStackBar from "../components/ServiceStackBar";
import toast from "react-hot-toast";

export default function ServicesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();
  const [services, setServices] = useState([]);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const bookingServices = useSelector((state) => state.booking.services) || [];

  useEffect(() => {
    async function loadData() {
      try {
        const [servicesData, salonData] = await Promise.all([
          ServicesAPI.list(),
          SalonAPI.get(),
        ]);
        setServices(servicesData.filter((s) => s.active));
        setSalon(salonData);
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(services.map((s) => s.category).filter(Boolean)),
  ];

  // Filter services by category
  const filteredServices =
    selectedCategory === "all"
      ? services
      : services.filter((s) => s.category === selectedCategory);

  const handleServiceClick = (service, selectedVariant) => {
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

      if (
        firstServiceSpecialistId &&
        serviceSpecialistId &&
        firstServiceSpecialistId !== serviceSpecialistId
      ) {
        toast.error(
          "You can only book services from the same specialist. Please clear your current selection to choose services from a different specialist.",
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
        variantName: selectedVariant.name,
        price: selectedVariant.price,
        durationMin: selectedVariant.durationMin,
        bufferBeforeMin: service.bufferBeforeMin || 0,
        bufferAfterMin: service.bufferAfterMin || 0,
        specialistId: serviceSpecialistId, // Store specialist ID
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const salonName = tenant?.name || salon?.name || "Beauty Salon";

  return (
    <>
      <SEOHead
        title={`Services - ${salonName}`}
        description={`Browse our professional beauty services at ${salonName}. Book your appointment online today.`}
      />

      <PageTransition>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-brand-50 via-white to-brand-50 rounded-3xl overflow-hidden mb-12 shadow-lg border border-brand-100">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LDEzMCwyNDYsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative px-8 py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Our Services
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {salon?.description ||
                  "Discover our range of professional beauty treatments"}
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center gap-8 mt-10"
            >
              <div className="text-center">
                <div className="text-3xl font-black text-brand-600">
                  {services.length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Services
                </div>
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-black text-brand-600">
                  {categories.length - 1}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Categories
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                    ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-brand-300 hover:shadow-md"
                    }
                  `}
                >
                  {category === "all" ? "All Services" : category}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No services found
              </h3>
              <p className="text-gray-600">
                {selectedCategory === "all"
                  ? "No services are currently available."
                  : `No services found in the "${selectedCategory}" category.`}
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid gap-6 sm:grid-cols-2 w-full"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                data-testid="service-card"
              >
                <ServiceCard
                  service={service}
                  onClick={(variant) => handleServiceClick(service, variant)}
                  isSelected={bookingServices.some(
                    (s) => s.serviceId === service._id
                  )}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

            <div className="relative">
              <h2 className="text-3xl font-black mb-3">Need Help Choosing?</h2>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Not sure which service is right for you? Visit our salon details
                page or contact us directly.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate("salon")}
                  className="px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => navigate("faq")}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 border-2 border-white/30 hover:border-white/50"
                >
                  View FAQ
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </PageTransition>

      {/* Service Stack Bar - Fixed at bottom when services are selected */}
      {bookingServices.length > 0 && <ServiceStackBar />}
    </>
  );
}
