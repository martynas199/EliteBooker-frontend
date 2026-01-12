import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function FinalCtaSection({ onShowDemoModal }) {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-gray-200 mb-10 leading-relaxed">
            Join 500+ salons and spas already using our platform to manage
            appointments, accept payments, and delight their clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShowDemoModal}
              className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:border-white/60 transition-all"
            >
              Schedule a Demo
            </motion.button>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Join now - it's free! No credit card required • Setup in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
