import { useEffect, useState } from "react";
import { HeroSectionsAPI } from "./heroSections.api";

export default function HeroSectionDisplay() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    HeroSectionsAPI.list()
      .then((data) => {
        // Filter active sections only
        const activeSections = data.filter((s) => s.active);
        setSections(activeSections);
      })
      .catch((err) => {
        console.error("Failed to load hero sections:", err);
        setSections([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {sections.map((section) => (
        <div
          key={section._id}
          className="bg-gradient-to-br from-amber-50 to-white rounded-3xl overflow-hidden shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 md:gap-0">
            {/* Left Section - Text Content */}
            <div className="p-8 md:p-12 md:pl-6 flex flex-col justify-center bg-white/50 backdrop-blur-sm animate-slideInLeft min-h-[400px]">
              <h2 className="text-3xl md:text-5xl lg:text-5xl mb-6 leading-tight font-script text-brand-900">
                {section.title}
              </h2>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-8 italic font-light text-brand-800">
                {section.subtitle}
              </p>
              {section.ctaText && (
                <a
                  href={section.ctaLink || "#"}
                  className="inline-flex items-center gap-2 text-brand-900 hover:text-brand-700 transition-colors group text-xl font-script font-semibold"
                >
                  <span>{section.ctaText}</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              )}
            </div>

            {/* Center Section - Beautician Image */}
            {section.centerImage?.url && (
              <div className="relative h-[400px] md:h-[500px] overflow-hidden animate-slideInBottom">
                <img
                  src={section.centerImage.url}
                  alt={`${section.title} - Professional beauty treatments at Noble Elegance Wisbech Cambridgeshire`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
            )}

            {/* Right Section - Image 2 */}
            {section.rightImage?.url && (
              <div className="relative h-[400px] md:h-[500px] overflow-hidden animate-slideInRight">
                <img
                  src={section.rightImage.url}
                  alt={`${section.title} showcase - Expert beauty services at Noble Elegance Beauty Salon`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
