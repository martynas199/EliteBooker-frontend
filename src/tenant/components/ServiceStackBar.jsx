import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { X, Clock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { removeService } from "../state/bookingSlice";
import { useCurrency } from "../../shared/contexts/CurrencyContext";
import { useTenant } from "../../shared/contexts/TenantContext";

/**
 * ServiceStackBar - Floating bottom bar showing selected services
 * Appears when services are selected, allows removing services and continuing
 */
export default function ServiceStackBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const { formatPrice } = useCurrency();
  const services = useSelector((state) => state.booking.services);
  const specialist = useSelector((state) => state.booking.specialist);

  if (!services || services.length === 0) return null;

  // Calculate totals
  const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalDuration = services.reduce(
    (sum, s) => sum + (s.durationMin || 0),
    0
  );

  const handleContinue = () => {
    if (specialist) {
      navigate(`/salon/${tenant?.slug}/times`);
    } else {
      navigate(`/salon/${tenant?.slug}/specialists`);
    }
  };

  const handleRemoveService = (index) => {
    dispatch(removeService(index));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-black shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            {/* Left: Selected Services */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  {services.length}{" "}
                  {services.length === 1 ? "Service" : "Services"}
                </h3>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{totalDuration} min</span>
                </div>
              </div>

              {/* Service Pills */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap max-h-20 sm:max-h-none overflow-y-auto">
                {services.map((service, index) => (
                  <motion.div
                    key={`${service.serviceId}-${index}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-violet-100 text-violet-900 rounded-full text-xs sm:text-sm font-medium"
                  >
                    <span className="max-w-[80px] sm:max-w-[150px] truncate">
                      {service.serviceName}
                    </span>
                    <span className="text-violet-700 font-bold text-xs sm:text-sm">
                      {formatPrice(service.price)}
                    </span>
                    <button
                      onClick={() => handleRemoveService(index)}
                      className="hover:bg-violet-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove service"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Total & Continue Button */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="text-left sm:text-right">
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              <button
                onClick={handleContinue}
                className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Continue
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
