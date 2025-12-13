import { motion } from "framer-motion";
import LoadingSpinner from "../../shared/components/ui/LoadingSpinner";
import { useAboutUs } from "../../shared/hooks/useAboutUsQueries";
import SEOHead from "../../shared/components/seo/SEOHead";
import {
  generateOrganizationSchema,
  generateBreadcrumbSchema,
} from "../../shared/utils/schemaGenerator";

export default function AboutUsPage() {
  const {
    data: aboutUs,
    isLoading,
    isError,
    error,
    isFetching,
    isStale,
  } = useAboutUs();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <div className="ml-4 text-gray-900 font-semibold">
          Loading About Us...
        </div>
      </div>
    );
  }

  if (isError || !aboutUs) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Content Coming Soon
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {error?.message ||
              "Our About Us page is being crafted with care. Please check back soon!"}
          </p>
        </div>
      </div>
    );
  }

  const paragraphs = aboutUs.description.split("\n\n").filter((p) => p.trim());

  // Generate schemas
  const organizationSchema = generateOrganizationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, breadcrumbSchema],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <SEOHead
        title="About Us - Our Story & Mission"
        description="Discover Noble Elegance Beauty Salon in Wisbech, Cambridgeshire. Learn about our expert specialists, premium beauty services, and our commitment to excellence. Located at 12 Blackfriars Rd, PE13 1AT. We specialize in permanent makeup, brows, lashes and luxury beauty treatments for clients across Wisbech, March, King's Lynn, Peterborough and Cambridgeshire."
        keywords="about Noble Elegance, beauty salon Wisbech story, experienced specialists Cambridgeshire, professional beauty services, award winning beauty salon, best beauty salon Wisbech"
        schema={combinedSchema}
      />

      {/* Background Refresh Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white text-center py-2 text-sm font-semibold shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Updating content...</span>
          </div>
        </div>
      )}

      {/* Data Freshness Indicator */}
      {isStale && !isFetching && (
        <div className="fixed top-0 right-4 z-40 bg-yellow-400 text-gray-900 px-3 py-1 rounded-b text-sm font-semibold shadow-lg">
          Content may be outdated
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-3 sm:mb-4 tracking-tight">
              About Us
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Discover our story and what makes us special
            </p>
          </motion.div>

          {/* Featured Image & Quote */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 shadow-lg sm:shadow-xl group-hover:shadow-2xl transition-all duration-500">
                <img
                  src={aboutUs.image.url}
                  alt="Our Team"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="relative">
                <svg
                  className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-10 sm:w-12 h-10 sm:h-12 text-gray-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-gray-700 leading-relaxed italic pl-6 sm:pl-8">
                  {aboutUs.quote}
                </blockquote>
              </div>
              <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-gray-900 to-transparent rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 md:py-32 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight">
              Our Story
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Every great journey begins with a vision and passion
            </p>
          </motion.div>

          {/* Story Content */}
          <div className="space-y-4 sm:space-y-6">
            {paragraphs.map((paragraph, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300 shadow-sm hover:shadow-lg">
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-4xl sm:text-6xl font-bold text-gray-100 select-none">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-base sm:text-lg md:text-xl leading-relaxed text-gray-700 relative z-10">
                    {paragraph}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that drive us forward every single day
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ),
                title: "Excellence",
                description:
                  "We pursue perfection in every detail, ensuring exceptional results and outstanding service.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ),
                title: "Passion",
                description:
                  "Our dedication drives us to continuously innovate and perfect what we do.",
              },
              {
                icon: (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                ),
                title: "Community",
                description:
                  "Building lasting relationships and creating a welcoming space for everyone.",
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-2xl bg-white border border-gray-200 hover:border-gray-900 transition-all duration-300 shadow-sm hover:shadow-lg h-full">
                  <div className="w-16 h-16 mb-6 bg-gray-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-12 md:p-16 rounded-3xl bg-white border border-gray-200 shadow-xl"
          >
            <div className="text-center">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Experience the difference. Book your appointment today and
                discover what makes us special.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="specialists"
                  className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-12 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Book Appointment
                </a>

                <a
                  href="salon"
                  className="group inline-flex items-center gap-3 border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-100 hover:border-gray-900 transition-all duration-300 font-bold text-lg"
                >
                  <svg
                    className="w-5 h-5 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Contact Us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
