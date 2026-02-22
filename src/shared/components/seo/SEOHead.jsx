import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

/**
 * SEOHead Component - Manages all SEO meta tags for each page
 *
 * @param {string} title - Page title (will be appended with site name)
 * @param {string} description - Meta description for search engines
 * @param {string} keywords - Comma-separated keywords
 * @param {string} canonical - Canonical URL (defaults to current URL)
 * @param {string} ogImage - Open Graph image URL
 * @param {string} ogType - Open Graph type (default: 'website')
 * @param {boolean} noindex - If true, adds noindex meta tag
 * @param {object} schema - JSON-LD structured data
 */
export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage = "/android-chrome-512x512.png",
  ogType = "website",
  noindex = false,
  schema,
  schemas,
}) {
  const siteName = "Elite Booker";
  const locale = "en_GB";
  const fallbackDescription =
    "Commission-free booking software for UK beauty and wellness businesses.";
  const normalizedDescription = `${description || fallbackDescription}`.trim();
  const titleIncludesSiteName =
    typeof title === "string" &&
    title.toLowerCase().includes(siteName.toLowerCase());
  const fullTitle = title
    ? titleIncludesSiteName
      ? title
      : `${title} | ${siteName}`
    : siteName;
  const baseUrl = "https://www.elitebooker.co.uk";
  const normalizePath = (path = "/") => {
    const pathOnly = `${path}`.split("?")[0].split("#")[0] || "/";
    if (pathOnly === "/") return "/";
    return pathOnly.endsWith("/") ? pathOnly.slice(0, -1) : pathOnly;
  };

  const canonicalPath = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${baseUrl}${normalizePath(canonical)}`
    : typeof window !== "undefined"
    ? `${baseUrl}${normalizePath(window.location.pathname)}`
    : baseUrl;

  const canonicalUrl = canonicalPath;
  const robotsContent = noindex ? "noindex, nofollow" : "index, follow";

  if (import.meta.env.DEV) {
    if (!title || `${title}`.trim().length < 10) {
      console.warn("[SEOHead] Missing or weak title", { title, canonicalUrl });
    }
    if (!normalizedDescription || normalizedDescription.length < 70) {
      console.warn("[SEOHead] Missing or weak description", {
        description: normalizedDescription,
        canonicalUrl,
      });
    }
    if (fullTitle.length > 65) {
      console.warn("[SEOHead] Title may be too long", {
        length: fullTitle.length,
        fullTitle,
      });
    }
    if (normalizedDescription.length > 165) {
      console.warn("[SEOHead] Description may be too long", {
        length: normalizedDescription.length,
      });
    }
  }

  // Default keywords focused on appointment booking software - optimized for ranking #1
  const defaultKeywords = [
    "appointment booking software",
    "salon booking system",
    "spa scheduling software",
    "online appointment scheduler",
    "beauty booking app",
    "salon management software",
    "appointment scheduling system",
    "booking software for salons",
    "spa booking software",
    "beauty business software",
    "online booking platform",
    "salon software",
    "appointment system",
    "scheduling software",
    "booking management system",
  ];

  const keywordSource = keywords
    ? [...defaultKeywords, ...keywords.split(",").map((k) => k.trim())]
    : defaultKeywords;
  const seenKeywordKeys = new Set();
  const allKeywords = keywordSource.filter((keyword) => {
    const normalizedKeyword = `${keyword}`.trim();
    if (!normalizedKeyword) return false;
    const dedupeKey = normalizedKeyword.toLowerCase();
    if (seenKeywordKeys.has(dedupeKey)) return false;
    seenKeywordKeys.add(dedupeKey);
    return true;
  });

  const normalizeSchemaInput = (input) => {
    if (!input) return [];
    return Array.isArray(input) ? input.filter(Boolean) : [input];
  };
  const schemaEntries = [
    ...normalizeSchemaInput(schema),
    ...normalizeSchemaInput(schemas),
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={normalizedDescription} />
      <meta name="keywords" content={allKeywords.join(", ")} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Robots Meta */}
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={normalizedDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content="en_US" />
      {ogImage && (
        <>
          <meta
            property="og:image"
            content={
              ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`
            }
          />
          <meta
            property="og:image:secure_url"
            content={
              ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`
            }
          />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="512" />
          <meta property="og:image:height" content="512" />
          <meta
            property="og:image:alt"
            content="Elite Booker - Appointment Booking Software"
          />
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={normalizedDescription} />
      <meta name="twitter:url" content={canonicalUrl} />
      {ogImage && (
        <>
          <meta
            name="twitter:image"
            content={
              ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`
            }
          />
          <meta
            name="twitter:image:alt"
            content="Elite Booker - Appointment Booking Software"
          />
        </>
      )}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=yes" />

      {/* Software Category Tags */}
      <meta name="category" content="Business Software" />
      <meta name="application-name" content="Elite Booker" />
      <meta name="coverage" content="Worldwide" />

      {/* JSON-LD Structured Data */}
      {schemaEntries.map((schemaEntry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaEntry)}
        </script>
      ))}
    </Helmet>
  );
}

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonical: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  noindex: PropTypes.bool,
  schema: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  schemas: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
