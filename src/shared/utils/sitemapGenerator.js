/**
 * Sitemap Generator Utility
 * Generates dynamic sitemap.xml with all pages, services, and products
 */

const baseUrl = "https://www.nobleelegance.co.uk";

/**
 * Generate sitemap.xml content
 * @param {Array} services - List of services from API
 * @param {Array} products - List of products from API
 * @returns {string} XML sitemap content
 */
export function generateSitemap(services = [], products = []) {
  const currentDate = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: "", changefreq: "daily", priority: "1.0", lastmod: currentDate },
    {
      url: "/beauticians",
      changefreq: "weekly",
      priority: "0.9",
      lastmod: currentDate,
    },
    {
      url: "/products",
      changefreq: "weekly",
      priority: "0.9",
      lastmod: currentDate,
    },
    {
      url: "/about",
      changefreq: "monthly",
      priority: "0.8",
      lastmod: currentDate,
    },
    {
      url: "/salon",
      changefreq: "monthly",
      priority: "0.8",
      lastmod: currentDate,
    },
    {
      url: "/faq",
      changefreq: "monthly",
      priority: "0.7",
      lastmod: currentDate,
    },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Add static pages
  staticPages.forEach((page) => {
    xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add service pages (if services are provided)
  services.forEach((service) => {
    xml += `  <url>
    <loc>${baseUrl}/services/${encodeURIComponent(
      service.slug || service._id
    )}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add product pages (if products are provided)
  products.forEach((product) => {
    xml += `  <url>
    <loc>${baseUrl}/products/${encodeURIComponent(
      product.slug || product._id
    )}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    ${
      product.images && product.images.length > 0
        ? `<image:image>
      <image:loc>${product.images[0]}</image:loc>
      <image:title>${product.title}</image:title>
    </image:image>`
        : ""
    }
  </url>
`;
  });

  xml += `</urlset>`;

  return xml;
}

/**
 * Save sitemap to public folder
 * This should be called during build or on a schedule
 */
export async function saveSitemap(services, products) {
  const xml = generateSitemap(services, products);
  // In a real implementation, you would write this to public/sitemap.xml
  // For now, return the XML content
  return xml;
}

export default {
  generateSitemap,
  saveSitemap,
};
