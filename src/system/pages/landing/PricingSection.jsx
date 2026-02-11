import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../../shared/components/ui/Card";
import { pricingPlans } from "./landingData";

export default function PricingSection({ onShowFeeModal }) {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState("monthly");

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your business. Upgrade or downgrade
            anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setActivePlan("monthly")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activePlan === "monthly"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActivePlan("annual")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activePlan === "annual"
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-gray-100 text-gray-900 px-2 py-1 rounded-full font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <Card
                className={`h-full p-8 ${
                  plan.popular
                    ? "border-2 border-gray-900 shadow-xl"
                    : "border border-gray-200"
                }`}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                <div className="mb-6">
                  {plan.price[activePlan] === 0 ? (
                    <span className="text-5xl font-bold text-gray-900">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold text-gray-900">
                        £{plan.price[activePlan]}
                      </span>
                      <span className="text-gray-600 ml-2">/month</span>
                    </>
                  )}
                  {activePlan === "annual" && plan.price.annual > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Billed £{(plan.price.annual * 12).toFixed(2)} annually
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signup")}
                  className={`w-full py-3 rounded-lg font-semibold mb-4 transition-all ${
                    plan.popular
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white border border-gray-300 text-gray-900 hover:border-gray-900"
                  }`}
                >
                  {plan.cta}
                </motion.button>
                {plan.learnMore && (
                  <button
                    onClick={onShowFeeModal}
                    className="w-full py-2 mb-4 text-sm text-gray-900 hover:text-gray-700 font-medium underline"
                  >
                    Learn more about fees
                  </button>
                )}
                <ul className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <span className="text-green-500 mt-1">✓</span>
                      <span
                        className={`text-gray-700 ${
                          feature.includes("£0.99") ? "text-sm" : ""
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
