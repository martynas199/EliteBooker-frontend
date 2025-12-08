import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { ServicesAPI } from "./services.api";
import { SalonAPI } from "./salon.api";
import { useTenant } from "../../shared/contexts/TenantContext";
import { setService } from "../state/bookingSlice";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import Card from "../../shared/components/ui/Card";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import SEOHead from "../../shared/components/seo/SEOHead";
import PageTransition from "../../shared/components/ui/PageTransition";

export default function ServicesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();
  const [services, setServices] = useState([]);
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  const handleServiceSelect = (service) => {
    const firstVariant = service.variants?.[0];
    dispatch(
      setService({
        serviceId: service._id,
        variantName: firstVariant?.name,
        price: firstVariant?.price || service.price,
        durationMin: firstVariant?.durationMin || service.durationMin,
        bufferBeforeMin: service.bufferBeforeMin,
        bufferAfterMin: service.bufferAfterMin,
      })
    );
    navigate(`/salon/${tenant?.slug}/specialists`);
  };

  // Get service price display
  const getServicePrice = (service) => {
    if (service.variants && service.variants.length > 0) {
      const prices = service.variants.map((v) => v.price || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) {
        return formatPrice(minPrice);
      }
      return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
    }
    return formatPrice(service.price || 0);
  };

  // Get service duration display
  const getServiceDuration = (service) => {
    if (service.variants && service.variants.length > 0) {
      const durations = service.variants
        .map((v) => v.durationMin)
        .filter(Boolean);
      if (durations.length > 0) {
        const minDuration = Math.min(...durations);
        const maxDuration = Math.max(...durations);

        if (minDuration === maxDuration) {
          return `${minDuration} min`;
        }
        return `${minDuration}-${maxDuration} min`;
      }
    }
    return service.durationMin ? `${service.durationMin} min` : null;
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                data-testid="service-card"
              >
                <Card
                  className="group h-full hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-brand-200"
                  onClick={() => handleServiceSelect(service)}
                >
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
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-bold rounded-full shadow-lg">
                            {service.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Service Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {service.name}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    {/* Price & Duration */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-sm text-gray-500 font-medium mb-1">
                          Price
                        </div>
                        <div className="text-2xl font-black text-brand-600">
                          {getServicePrice(service)}
                        </div>
                      </div>

                      {getServiceDuration(service) && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 font-medium mb-1">
                            Duration
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
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
                            {getServiceDuration(service)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variants Info */}
                    {service.variants && service.variants.length > 1 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 text-brand-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="font-medium">
                            {service.variants.length} options available
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 shadow-lg shadow-brand-500/30 group-hover:shadow-xl group-hover:shadow-brand-500/40 group-hover:scale-105">
                      Book Now
                    </button>
                  </div>
                </Card>
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
    </>
  );
}
