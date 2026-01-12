import { useState } from "react";
import { motion } from "framer-motion";
import { demoVideoUrl } from "./landingData";

export default function DemoSection() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section
      id="demo"
      className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-indigo-100 mb-8 leading-relaxed">
              Watch how easy it is to manage appointments, accept payments, and
              grow your business. Everything you need in one beautiful
              dashboard.
            </p>
            <ul className="space-y-4">
              {[
                "Setup in under 10 minutes",
                "No credit card required",
                "It's always free",
              ].map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-2xl">✓</span>
                  <span className="text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20">
              {!videoLoaded ? (
                <button
                  onClick={() => setVideoLoaded(true)}
                  className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all group"
                  aria-label="Load video"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                      <svg
                        className="w-10 h-10 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                    <p className="text-white font-semibold">Watch Demo Video</p>
                    <p className="text-indigo-100 text-sm mt-1">
                      Click to play
                    </p>
                  </div>
                </button>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src={`${demoVideoUrl}?autoplay=1&mute=1&loop=1&playlist=uJC681X-d2Q&controls=1&rel=0`}
                  title="Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
