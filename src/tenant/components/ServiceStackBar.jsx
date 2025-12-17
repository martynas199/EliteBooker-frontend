import { useState } from "react";
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
  const [isExpanded, setIsExpanded] = useState(false);

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
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed bottom-0 left-0 right-0 z-[9999] backdrop-blur-2xl bg-white/95 border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Expandable Service List */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-gray-200 bg-gray-50/80"
              >
                <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
                  {services.map((service, index) => (
                    <motion.div
                      key={`${service.serviceId}-${index}`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {service.serviceName}
                        </p>
                        {service.variantName && (
                          <p className="text-xs text-gray-500">
                            {service.variantName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(service.price)}
                        </span>
                        <button
                          onClick={() => handleRemoveService(index)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Remove service"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Bar */}
          <div className="px-4 py-4">
            {/* Summary Row - Tap to expand */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-3 mb-4 w-full text-left group"
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-bold">
                  {services.length}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {services.length === 1 ? "service" : "services"}
                </span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{totalDuration} min</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-400 group-hover:text-gray-600"
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.div>
            </button>

            {/* Action Row */}
            <div className="flex items-center gap-4">
              {/* Total Price */}
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-0.5">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 px-8 py-4 bg-black hover:bg-gray-900 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.97] text-base"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
