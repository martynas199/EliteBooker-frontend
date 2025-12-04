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
  const siteName = "Noble Elegance Beauty Salon";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const baseUrl = "https://www.nobleelegance.co.uk";
  const canonicalUrl = canonical || window.location.href;

  // Default keywords that appear on every page - based on actual services offered
  const defaultKeywords = [
    "beauty salon Wisbech",
    "Noble Elegance Wisbech",
    "permanent makeup Wisbech",
    "lip fillers Cambridgeshire",
    "anti wrinkle injections Wisbech",
    "dermal fillers Wisbech",
    "laser treatments Wisbech",
    "facial treatments Cambridgeshire",
    "brow lamination Wisbech",
    "skin boosters Wisbech",
    "hair extensions Wisbech",
    "aesthetic clinic Wisbech",
    "beauty treatments Peterborough",
    "cosmetic injectables Cambridgeshire",
    "beauty salon March",
    "beauty salon King's Lynn",
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

      {/* Geographic Tags for Local SEO */}
      <meta name="geo.region" content="GB-CAM" />
      <meta name="geo.placename" content="Wisbech, Cambridgeshire" />
      <meta name="geo.position" content="52.6667;0.1601" />
      <meta name="ICBM" content="52.6667, 0.1601" />

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
