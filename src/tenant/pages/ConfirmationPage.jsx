import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../../shared/components/ui/Button";

export default function ConfirmationPage() {
  return (
    <>
      {/* Fixed background layer */}
      <div className="fixed inset-0 bg-slate-900 -z-10">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full"
        >
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6 flex justify-center"
            >
              <div className="bg-green-400/20 border-2 border-green-400 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                <svg
                  className="w-10 h-10 md:w-12 md:h-12 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              Booking Confirmed!
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/80 text-lg mb-8 max-w-md mx-auto"
            >
              We've sent confirmation emails to you and your specialist. Thank
              you for booking with us!
            </motion.p>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/">
                <Button variant="brand" className="w-full sm:w-auto px-8">
                  Back to Home
                </Button>
              </Link>
              <Link to="/bookings">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 border-white/20 text-white hover:bg-white/10"
                >
                  View My Bookings
                </Button>
              </Link>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-sm text-white/60">
                Check your email for appointment details and calendar invite
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
