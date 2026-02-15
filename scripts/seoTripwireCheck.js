import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalForPath,
  getAllSeoRoutes,
  getIndexableSeoRoutes,
} from "../src/shared/seo/routeManifest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITEMAP_PATH = path.resolve(__dirname, "../public/sitemap.xml");

const parseSitemapLocs = (xml) => {
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((match) => match[1].trim());
};

const validateRoutes = (routes) => {
  const issues = [];

  routes.forEach((route) => {
    const isUtility = route.indexable === false || route.intent === "utility";
    const isProgrammatic = route.intent === "location";
    const maxTitleLength = isProgrammatic ? 80 : 65;
    const minDescriptionLength = isUtility ? 20 : 70;

    if (!route.path || !route.path.startsWith("/")) {
      issues.push(`Invalid path: ${route.path || "<empty>"}`);
    }

    if (!route.title || route.title.trim().length < 10) {
      issues.push(`Weak title for ${route.path}`);
    }
    if (route.title && route.title.length > maxTitleLength) {
      issues.push(`Title too long (${route.title.length}) for ${route.path}`);
    }

    if (!route.description || route.description.trim().length < minDescriptionLength) {
      issues.push(`Weak description for ${route.path}`);
    }
    if (route.description && route.description.length > 165) {
      issues.push(
        `Description too long (${route.description.length}) for ${route.path}`,
      );
    }
  });

  return issues;
};

const validateSitemapParity = (sitemapLocs) => {
  const issues = [];

  const indexableRoutes = getIndexableSeoRoutes();
  const expectedLocs = new Set(
    indexableRoutes.map((route) => canonicalForPath(route.path, route.canonical)),
  );

  for (const expected of expectedLocs) {
    if (!sitemapLocs.includes(expected)) {
      issues.push(`Missing in sitemap: ${expected}`);
    }
  }

  getAllSeoRoutes()
    .filter((route) => route.indexable === false)
    .forEach((route) => {
      const blocked = canonicalForPath(route.path, route.canonical);
      if (sitemapLocs.includes(blocked)) {
        issues.push(`Non-indexable route leaked into sitemap: ${blocked}`);
      }
    });

  return issues;
};

const run = () => {
  const routeIssues = validateRoutes(getAllSeoRoutes());

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error(`Missing sitemap at ${SITEMAP_PATH}. Run npm run sitemap first.`);
    process.exit(1);
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, "utf8");
  const sitemapLocs = parseSitemapLocs(sitemapXml);
  const sitemapIssues = validateSitemapParity(sitemapLocs);

  const allIssues = [...routeIssues, ...sitemapIssues];

  if (allIssues.length > 0) {
    console.error("SEO tripwire check failed:");
    allIssues.forEach((issue) => console.error(`- ${issue}`));
    process.exit(1);
  }

  console.log(
    `SEO tripwire check passed: ${getAllSeoRoutes().length} routes validated, ${sitemapLocs.length} sitemap URLs verified.`,
  );
};

run();
