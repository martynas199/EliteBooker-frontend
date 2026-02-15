/**
 * Sitemap Generator for Programmatic Pages
 * Generates XML entries for 400+ city/niche landing pages + tools
 *
 * Usage:
 *   node generateSitemap.js            # writes UTF-8 sitemap to /public/sitemap.xml
 *   node generateSitemap.js --stdout   # prints XML to stdout
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEO_BASE_URL,
  canonicalForPath,
  getAllSeoRoutes,
  getProgrammaticSeoRoutes,
  getStaticSeoRoutes,
} from "../src/shared/seo/routeManifest.js";

const LAST_MOD = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, "../public/sitemap.xml");

const buildSitemapEntries = () => {
  const byCanonical = new Map();

  getAllSeoRoutes()
    .filter((route) => route.indexable !== false)
    .forEach((route) => {
      const canonicalLoc = canonicalForPath(route.path, route.canonical);
      if (!byCanonical.has(canonicalLoc)) {
        byCanonical.set(canonicalLoc, {
          loc: canonicalLoc,
          lastmod: LAST_MOD,
          changefreq: route.changefreq || "monthly",
          priority:
            typeof route.priority === "number"
              ? route.priority.toFixed(1)
              : "0.6",
        });
      }
    });

  return [...byCanonical.values()];
};

// Convert to XML format
const entriesToXml = (entries) => {
  return entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("");
};

// Main generator
const generateSitemap = () => {
  const allEntries = buildSitemapEntries();

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  ${entriesToXml(allEntries)}
  
</urlset>`;

  return xml;
};

// Output
const sitemapXml = generateSitemap();
const shouldWriteToStdout = process.argv.includes("--stdout");

if (shouldWriteToStdout) {
  console.log(sitemapXml);
} else {
  fs.writeFileSync(OUTPUT_PATH, sitemapXml, "utf8");
  console.error(`Sitemap written to: ${OUTPUT_PATH}`);
}

console.error(
  `\nGenerated ${getProgrammaticSeoRoutes().length} programmatic pages`,
);
console.error(
  `Generated ${getStaticSeoRoutes().filter((route) => route.intent === "tool").length} tool pages`,
);
console.error(
  `Total indexable URLs: ${getAllSeoRoutes().filter((route) => route.indexable !== false).length} (${SEO_BASE_URL})`,
);
