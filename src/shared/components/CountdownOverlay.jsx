import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.svg";

export default function CountdownOverlay() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();

      // Convert current time to UK timezone
      const ukTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/London" })
      );

      // Set target to 6 PM UK time today
      const target = new Date(ukTime);
      target.setHours(18, 0, 0, 0);

      // If it's already past 6 PM, target tomorrow at 6 PM
      if (ukTime >= target) {
        target.setDate(target.getDate() + 1);
      }

      // Calculate difference in milliseconds
      const difference = target - ukTime;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"
          />

          {/* Subtle Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(212, 167, 16) 1px, transparent 0)`,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 1,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            className="mb-8 flex justify-center"
          >
            <img
              src={logo}
              alt="Noble Elegance"
              className="w-32 h-32 md:w-40 md:h-40 opacity-90 drop-shadow-2xl"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 tracking-wide drop-shadow-lg">
              Opening Soon
            </h1>
            <p className="text-lg md:text-xl text-brand-200 mb-12 font-light tracking-wider">
              We're preparing something beautiful for you
            </p>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center gap-4 md:gap-8 mb-12"
          >
            {/* Hours */}
            <TimeUnit value={timeLeft.hours} label="Hours" />

            {/* Separator */}
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl md:text-6xl text-brand-300 font-light self-center mb-8"
            >
              :
            </motion.div>

            {/* Minutes */}
            <TimeUnit value={timeLeft.minutes} label="Minutes" />

            {/* Separator */}
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-4xl md:text-6xl text-brand-300 font-light self-center mb-8"
            >
              :
            </motion.div>

            {/* Seconds */}
            <TimeUnit value={timeLeft.seconds} label="Seconds" />
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-brand-200/80 text-sm md:text-base font-light"
          >
            <p className="mb-2">Opening at 6:00 PM UK Time</p>
            <div className="flex items-center justify-center gap-2 text-brand-300/60">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-brand-400 rounded-full"
              />
              <span>Preparing your experience</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="w-2 h-2 bg-brand-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-10 right-10 w-20 h-20 border-2 border-brand-400/20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-10 left-10 w-32 h-32 border-2 border-brand-400/20 rounded-full"
        />
      </motion.div>
    </AnimatePresence>
  );
}

// TimeUnit Component for displaying individual time values
function TimeUnit({ value, label }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 border border-brand-400/30 shadow-2xl mb-3"
      >
        <motion.span
          className="text-5xl md:text-7xl font-bold text-white tabular-nums tracking-tight"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </motion.div>
      <span className="text-sm md:text-base text-brand-300 uppercase tracking-widest font-light">
        {label}
      </span>
    </motion.div>
  );
}
