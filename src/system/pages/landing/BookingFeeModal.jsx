import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function BookingFeeModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Booking Fee Details
            </h3>
            <p className="text-xs text-gray-600">
              Fair and transparent pricing
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 -mt-1"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">
                £
              </div>
              <div className="pt-0.5">
                <p className="font-bold text-gray-900 text-sm leading-none mb-0.5">
                  £0.99 per booking
                </p>
                <p className="text-xs text-gray-600 leading-none">
                  Simple pay-as-you-go
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Paid by the customer
                </p>
                <p className="text-xs text-gray-600">
                  The £0.99 fee is paid by the customer when they book
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  No hidden costs
                </p>
                <p className="text-xs text-gray-600">
                  You keep 100% of your service price
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Only pay when you get bookings
                </p>
                <p className="text-xs text-gray-600">
                  No monthly fees or setup costs
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-700 mb-1">
              <strong>Example:</strong> Customer books £50 haircut → Pays £50.99
              total (£50 service + £0.99 booking fee)
            </p>
            <p className="text-xs text-gray-600">
              * You receive £50 minus{" "}
              <a
                href="https://stripe.com/gb/pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 hover:text-slate-800 underline"
              >
                Stripe processing fees
              </a>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            Close
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onClose();
              navigate("/signup");
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

