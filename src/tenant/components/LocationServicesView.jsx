import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setService, setSpecialist } from "../state/bookingSlice";
import { useTenant } from "../../shared/contexts/TenantContext";
import ServiceCard from "./ServiceCard";
import SpecialistCard from "./SpecialistCard";

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
 * Empty State Component
 */
function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full text-center py-20"
    >
      <div className="text-gray-400 mb-4">
        <svg
          className="w-24 h-24 mx-auto opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <p className="text-xl text-gray-500">
        {type === "services"
          ? "No services available at this location"
          : "No specialists available at this location"}
      </p>
    </motion.div>
  );
}

/**
 * LocationServicesView Component
 * Displays services and specialists for a specific location
 *
 * @param {Object} props
 * @param {Object} props.location - The location object with _id, name, etc.
 * @param {Array} props.allServices - All services (will be filtered by location)
 * @param {Array} props.allSpecialists - All specialists (will be filtered by location)
 * @param {string} props.initialView - Initial view mode: 'services' or 'specialists'
 */
export default function LocationServicesView({
  location,
  allServices = [],
  allSpecialists = [],
  initialView = "services",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenant } = useTenant();
  const [viewMode, setViewMode] = useState(initialView);

  // Filter services and specialists by location
  const locationServices = allServices.filter((service) =>
    service.availableAt?.some(
      (loc) => loc._id === location._id || loc === location._id
    )
  );

  const locationSpecialists = allSpecialists.filter((specialist) =>
    specialist.locationIds?.some(
      (loc) => loc._id === location._id || loc === location._id
    )
  );

  // Auto-select view based on what's available
  useEffect(() => {
    if (locationServices.length === 0 && locationSpecialists.length > 0) {
      setViewMode("specialists");
    } else if (
      locationSpecialists.length === 0 &&
      locationServices.length > 0
    ) {
      setViewMode("services");
    }
  }, [locationServices.length, locationSpecialists.length]);

  const handleServiceClick = (service) => {
    dispatch(
      setService({
        serviceId: service._id,
        name: service.name,
        description: service.description,
        price: service.price,
        durationMin: service.durationMin,
        bufferBeforeMin: service.bufferBeforeMin,
        bufferAfterMin: service.bufferAfterMin,
        locationId: location._id,
        locationName: location.name,
      })
    );

    // Filter specialists who can provide this service at this location
    const availableSpecialists = locationSpecialists.filter((specialist) =>
      specialist.services?.some(
        (s) => s._id === service._id || s === service._id
      )
    );

    if (availableSpecialists.length === 1) {
      dispatch(
        setSpecialist({
          specialistId: availableSpecialists[0]._id,
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
    dispatch(
      setSpecialist({
        specialistId: specialist._id,
        any: false,
        inSalonPayment: false,
        locationId: location._id,
        locationName: location.name,
      })
    );
    navigate(`/salon/${tenant?.slug}/specialists?selected=${specialist._id}`);
  };

  const currentItems =
    viewMode === "services" ? locationServices : locationSpecialists;
  const hasItems = currentItems.length > 0;

  return (
    <div className="py-12">
      {/* Location Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-white mb-3">{location.name}</h2>
        <p className="text-white/70 text-lg">
          {location.address?.street && location.address?.city
            ? `${location.address.street}, ${location.address.city}`
            : "Explore our services and specialists"}
        </p>
      </motion.div>

      {/* Toggle for Services/Specialists */}
      {locationServices.length > 0 && locationSpecialists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <ProfessionalToggle value={viewMode} onChange={setViewMode} />
        </motion.div>
      )}

      {/* Services/Specialists Grid */}
      <AnimatePresence mode="wait">
        {!hasItems ? (
          <EmptyState type={viewMode} />
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4"
          >
            {viewMode === "services"
              ? locationServices.map((service, index) => (
                  <motion.div
                    key={service._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ServiceCard
                      service={service}
                      onClick={() => handleServiceClick(service)}
                    />
                  </motion.div>
                ))
              : locationSpecialists.map((specialist, index) => (
                  <motion.div
                    key={specialist._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <SpecialistCard
                      specialist={specialist}
                      onClick={() => handleSpecialistClick(specialist)}
                    />
                  </motion.div>
                ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      {hasItems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-white/60"
        >
          <p className="text-sm">
            Showing {currentItems.length}{" "}
            {viewMode === "services" ? "service" : "specialist"}
            {currentItems.length !== 1 ? "s" : ""} at {location.name}
          </p>
        </motion.div>
      )}
    </div>
  );
}
