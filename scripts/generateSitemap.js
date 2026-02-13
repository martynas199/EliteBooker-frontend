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
import { UK_CITIES, NICHES } from "../src/system/data/ukCitiesNiches.js";

const BASE_URL = "https://www.elitebooker.co.uk";
const LAST_MOD = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_PATH = path.resolve(__dirname, "../public/sitemap.xml");

// Generate programmatic landing page URLs
const generateProgrammaticPages = () => {
  const entries = [];

  UK_CITIES.forEach((city) => {
    NICHES.forEach((niche) => {
      entries.push({
        loc: `${BASE_URL}/solutions/${niche.slug}-${city.slug}`,
        lastmod: LAST_MOD,
        changefreq: "monthly",
        priority: 0.7,
      });
    });
  });

  return entries;
};

// Generate tool page URLs
const generateToolPages = () => {
  return [
    {
      loc: `${BASE_URL}/tools/roi-calculator`,
      lastmod: LAST_MOD,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${BASE_URL}/tools/deposit-policy-generator`,
      lastmod: LAST_MOD,
      changefreq: "monthly",
      priority: 0.8,
    },
  ];
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
  const programmaticPages = generateProgrammaticPages();
  const toolPages = generateToolPages();
  const allEntries = [...toolPages, ...programmaticPages];

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
  
  <!-- Homepage - Appointment Booking Software -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Software Pages -->
  <url>
    <loc>${BASE_URL}/signup</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${BASE_URL}/pricing</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Industry Landing Pages (high priority - target niche keywords) -->
  <url>
    <loc>${BASE_URL}/industries/lash-technicians</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${BASE_URL}/industries/hair-salons</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${BASE_URL}/industries/barbers</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Comparison Pages (high priority - bottom funnel, high commercial intent) -->
  <url>
    <loc>${BASE_URL}/compare/vs-fresha</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${BASE_URL}/compare/vs-treatwell</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${BASE_URL}/compare</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Feature Pages (good priority - mid-funnel) -->
  <url>
    <loc>${BASE_URL}/features/sms-reminders</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${BASE_URL}/features/no-show-protection</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${BASE_URL}/features/calendar-sync</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${BASE_URL}/features/online-booking</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${BASE_URL}/features</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Solutions Hub -->
  <url>
    <loc>${BASE_URL}/solutions</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Blog Posts (moderate priority - top funnel) -->
  <url>
    <loc>${BASE_URL}/blog/reduce-salon-no-shows</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- SEO Tools (high value - backlink magnets) -->${entriesToXml(toolPages)}

  <!-- Programmatic Local Landing Pages (400+ pages) -->${entriesToXml(
    programmaticPages,
  )}
  
  <!-- Support Pages -->
  <url>
    <loc>${BASE_URL}/help</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${BASE_URL}/search</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>${BASE_URL}/terms</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <url>
    <loc>${BASE_URL}/security</loc>
    <lastmod>${LAST_MOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Total URLs: ${allEntries.length + 21} -->
  
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
  `\nGenerated ${UK_CITIES.length * NICHES.length} programmatic pages`,
);
console.error(`Generated ${2} tool pages`);
console.error(`Total URLs: ${UK_CITIES.length * NICHES.length + 2 + 21}`);
