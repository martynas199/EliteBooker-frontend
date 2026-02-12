import { motion } from "framer-motion";
import Card from "../../../shared/components/ui/Card";
import { testimonials } from "./landingData";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-gradient-to-b from-[#f6f2ea] via-[#f8f5ef] to-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center sm:mb-14 lg:mb-16"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 sm:px-4 sm:py-2 sm:text-xs">
            Social Proof
          </span>
          <h2 className="mb-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
            Trusted by owners who care about brand and margin
          </h2>
          <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg md:text-xl">
            Teams move to Elite Booker when they want their booking flow to
            feel premium and perform reliably.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-7">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-7">
                <div className="mb-4 text-3xl leading-none text-slate-300 sm:mb-5 sm:text-4xl">
                  "
                </div>
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current text-amber-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-slate-700 sm:mb-7 sm:text-base">
                  {testimonial.quote}
                </p>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-950 sm:text-base">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-slate-600 sm:text-sm">
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
