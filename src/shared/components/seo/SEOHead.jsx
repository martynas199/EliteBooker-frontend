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
  ogImage = "/src/assets/logo.svg",
  ogType = "website",
  noindex = false,
  schema,
}) {
  const siteName = "Elite Booker";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const baseUrl = "https://www.elitebooker.com";
  const canonicalUrl = canonical || window.location.href;

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

  const allKeywords = keywords
    ? [...defaultKeywords, ...keywords.split(",").map((k) => k.trim())]
    : defaultKeywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(", ")} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Meta */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      {ogImage && (
        <meta
          property="og:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`
          }
        />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && (
        <meta
          name="twitter:image"
          content={
            ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`
          }
        />
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
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}

SEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string,
  canonical: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  noindex: PropTypes.bool,
  schema: PropTypes.object,
};
