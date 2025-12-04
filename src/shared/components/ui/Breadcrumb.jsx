import { Link } from "react-router-dom";
import { generateBreadcrumbSchema } from "../../utils/schemaGenerator";

/**
 * Breadcrumb Navigation Component with Schema.org BreadcrumbList
 *
 * @param {Array} items - Array of breadcrumb objects with { name, url } properties
 * @param {string} className - Optional additional CSS classes
 *
 * @example
 * <Breadcrumb items={[
 *   { name: "Home", url: "/" },
 *   { name: "Products", url: "/products" },
 *   { name: "Skincare", url: "/products/skincare" }
 * ]} />
 */
export default function Breadcrumb({ items, className = "" }) {
  if (!items || items.length === 0) return null;

  // Generate schema for SEO
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      {/* Inject Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-2 text-sm ${className}`}
      >
        <ol className="flex items-center gap-2 flex-wrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-2">
                {!isLast ? (
                  <>
                    <Link
                      to={item.url}
                      className="text-gray-600 hover:text-brand-600 transition-colors duration-200 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </>
                ) : (
                  <span
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
