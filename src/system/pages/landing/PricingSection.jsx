import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../../../shared/components/ui/Card";
import { pricingPlans } from "./landingData";

export default function PricingSection({ onShowFeeModal }) {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState("monthly");

  const formatPrice = (price) => {
    if (price === 0) {
      return "Free";
    }
    return `GBP ${price}`;
  };

  return (
    <section id="pricing" className="bg-[#f3eee6] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-12 lg:mb-14"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 sm:px-4 sm:py-2 sm:text-xs">
            Pricing
          </span>
          <h2 className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
            Clear pricing, margin-first economics
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-base text-slate-600 sm:text-lg md:text-xl">
            Start free, scale when you are ready, and keep full control over
            your revenue profile.
          </p>

          <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:max-w-lg">
            <button
              onClick={() => setActivePlan("monthly")}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-6 ${
                activePlan === "monthly"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActivePlan("annual")}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-6 ${
                activePlan === "annual"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual{" "}
              <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 sm:ml-2 sm:mt-0 sm:text-xs">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 sm:-top-4 sm:text-sm">
                  Most Popular
                </div>
              )}

              <Card
                className={`h-full p-5 sm:p-7 lg:p-8 ${
                  plan.popular
                    ? "border-2 border-slate-900 bg-white shadow-xl"
                    : "border border-slate-200 bg-white/85"
                }`}
              >
                <h3 className="mb-2 text-2xl font-bold text-slate-950">
                  {plan.name}
                </h3>
                <p className="mb-5 text-sm text-slate-600 sm:mb-6 sm:min-h-[3rem] sm:text-base">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
                    {formatPrice(plan.price[activePlan])}
                  </span>
                  {plan.price[activePlan] !== 0 && <span className="ml-2 text-sm text-slate-600 sm:text-base">/month</span>}
                  {activePlan === "annual" && plan.price.annual > 0 && (
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      Billed GBP {(plan.price.annual * 12).toFixed(2)} annually
                    </p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/signup")}
                  className={`mb-4 w-full rounded-xl py-3 text-sm font-semibold transition-all sm:text-base ${
                    plan.popular
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "border border-slate-300 bg-white text-slate-900 hover:border-slate-800"
                  }`}
                >
                  {plan.cta}
                </motion.button>

                {plan.learnMore && (
                  <button
                    onClick={onShowFeeModal}
                    className="mb-4 w-full py-2 text-sm font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:text-slate-700"
                  >
                    Learn more about fees
                  </button>
                )}

                <ul className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      <span className="text-sm text-slate-700 sm:text-base">
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

