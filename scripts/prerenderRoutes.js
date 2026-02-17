import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalForPath,
  getAllSeoRoutes,
} from "../src/shared/seo/routeManifest.js";
import { getUkMoneyPage } from "../src/system/data/ukMoneyPages.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const normalizeRoute = (route) => {
  if (!route || route === "/") return "/";
  const clean = route.split("?")[0].split("#")[0];
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
};

const upsertTag = (html, pattern, tag) => {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace("</head>", `  ${tag}\n</head>`);
};

const CRITICAL_MARKETING_FALLBACK = {
  "/": `
<section id="seo-prerender-content" aria-label="Elite Booker booking software overview">
  <h1>Booking Software for UK Salons, Spas &amp; Barbers</h1>
  <p>Commission-free booking software for UK beauty and wellness businesses with online scheduling, SMS reminders, pricing plans, and comparison guides.</p>
  <nav aria-label="Primary internal links">
    <a href="/features">Booking software features</a>
    <a href="/pricing">UK pricing</a>
    <a href="/compare">Comparison pages</a>
    <a href="/solutions">Local UK solutions</a>
    <a href="/signup">Start free</a>
  </nav>
</section>`,
  "/features": `
<section id="seo-prerender-content" aria-label="Elite Booker features overview">
  <h1>Booking Software Features</h1>
  <p>Explore online booking, SMS reminders, no-show protection, and calendar sync for UK service businesses.</p>
  <nav aria-label="Feature links">
    <a href="/features/online-booking">Online booking</a>
    <a href="/features/sms-reminders">SMS reminders</a>
    <a href="/features/no-show-protection">No-show protection</a>
    <a href="/features/calendar-sync">Calendar sync</a>
    <a href="/pricing">Pricing</a>
  </nav>
</section>`,
  "/pricing": `
<section id="seo-prerender-content" aria-label="Elite Booker pricing overview">
  <h1>Salon Software Pricing UK</h1>
  <p>Compare plans and feature access for UK salons, barbershops, and beauty businesses.</p>
  <nav aria-label="Pricing links">
    <a href="/signup">Create account</a>
    <a href="/features">Feature details</a>
    <a href="/compare/vs-fresha">Compare with Fresha</a>
    <a href="/compare/vs-treatwell">Compare with Treatwell</a>
  </nav>
</section>`,
  "/compare": `
<section id="seo-prerender-content" aria-label="Elite Booker comparison hub">
  <h1>Elite Booker Comparisons</h1>
  <p>Comparison resources for booking software options in the UK market.</p>
  <nav aria-label="Comparison links">
    <a href="/compare/vs-fresha">Elite Booker vs Fresha</a>
    <a href="/compare/vs-treatwell">Elite Booker vs Treatwell</a>
    <a href="/pricing">Elite Booker pricing</a>
  </nav>
</section>`,
  "/compare/vs-fresha": `
<section id="seo-prerender-content" aria-label="Elite Booker versus Fresha">
  <h1>Elite Booker vs Fresha</h1>
  <p>Review feature and pricing information with source references and verification notes.</p>
  <nav aria-label="Comparison navigation">
    <a href="/compare">All comparisons</a>
    <a href="/pricing">Elite Booker pricing</a>
    <a href="/signup">Start free</a>
  </nav>
</section>`,
  "/compare/vs-treatwell": `
<section id="seo-prerender-content" aria-label="Elite Booker versus Treatwell">
  <h1>Elite Booker vs Treatwell</h1>
  <p>Review differences in platform model, pricing structure, and booking workflow for UK businesses.</p>
  <nav aria-label="Comparison navigation">
    <a href="/compare">All comparisons</a>
    <a href="/pricing">Elite Booker pricing</a>
    <a href="/signup">Start free</a>
  </nav>
</section>`,
};

const buildFallbackBodyContent = (route) => {
  const normalized = normalizeRoute(route);
  if (CRITICAL_MARKETING_FALLBACK[normalized]) {
    return CRITICAL_MARKETING_FALLBACK[normalized];
  }
  if (normalized.startsWith("/solutions/")) {
    return `
<section id="seo-prerender-content" aria-label="Local UK booking software page">
  <h1>Local UK Booking Software</h1>
  <p>Explore local booking software information and links for UK beauty and wellness business categories.</p>
  <nav aria-label="Local solution links">
    <a href="/solutions">Solutions hub</a>
    <a href="/features">Features</a>
    <a href="/pricing">Pricing</a>
  </nav>
</section>`;
  }
  if (normalized.startsWith("/industries/")) {
    return `
<section id="seo-prerender-content" aria-label="Industry booking software page">
  <h1>Industry Booking Software</h1>
  <p>Industry-specific booking software pages for UK salons, barbershops, and beauty businesses.</p>
  <nav aria-label="Industry links">
    <a href="/industries/hair-salons">Hair salons</a>
    <a href="/industries/barbers">Barbers</a>
    <a href="/industries/lash-technicians">Lash technicians</a>
    <a href="/pricing">Pricing</a>
  </nav>
</section>`;
  }

  const moneyPageSlug = normalized.replace(/^\//, "");
  const moneyPage = getUkMoneyPage(moneyPageSlug);
  if (moneyPage) {
    const sectionsHtml = moneyPage.sections
      .map(
        (section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
        .join("\n      ")}
    </section>`,
      )
      .join("\n");

    return `
<article id="seo-prerender-content" aria-label="${escapeHtml(moneyPage.h1)}">
  <h1>${escapeHtml(moneyPage.h1)}</h1>
  <p>${escapeHtml(moneyPage.intro)}</p>
  ${sectionsHtml}
  <section>
    <h2>FAQs</h2>
    <ul>
      ${moneyPage.faqs
        .map((faq) => `<li>${escapeHtml(faq)}</li>`)
        .join("\n      ")}
    </ul>
  </section>
  <nav aria-label="Money page links">
    <a href="/features">Features</a>
    <a href="/pricing">Pricing</a>
    <a href="/signup">Start free</a>
  </nav>
</article>`;
  }

  return "";
};

const applyHeadMeta = (htmlTemplate, meta) => {
  let html = htmlTemplate;
  const title = meta.title || "Elite Booker";
  const description =
    meta.description ||
    "Commission-free booking software for UK service businesses.";
  const canonical = canonicalForPath(meta.route, meta.canonical);
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";

  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  );

  html = upsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  html = upsertTag(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${robots}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
  );
  html = upsertTag(
    html,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
  );

  return html;
};

const injectBodyFallback = (htmlTemplate, route) => {
  const fallbackContent = buildFallbackBodyContent(route);
  if (!fallbackContent) return htmlTemplate;

  return htmlTemplate.replace(
    /<div id="root"><\/div>/i,
    `<div id="root"></div>\n  ${fallbackContent}`,
  );
};

const outputFileForRoute = (route) => {
  const normalized = normalizeRoute(route);
  if (normalized === "/") {
    return path.join(DIST_DIR, "index.html");
  }
  return path.join(DIST_DIR, normalized.replace(/^\//, ""), "index.html");
};

const ensureDistExists = () => {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(
      `Dist folder not found at ${DIST_DIR}. Run "vite build" before prerendering.`,
    );
  }
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template file not found at ${TEMPLATE_PATH}.`);
  }
};

const dedupeByRoute = (routes) => {
  const routeMap = new Map();
  routes.forEach((routeMeta) => {
    routeMap.set(normalizeRoute(routeMeta.route), {
      ...routeMeta,
      route: normalizeRoute(routeMeta.route),
    });
  });
  return [...routeMap.values()];
};

const run = () => {
  ensureDistExists();
  const htmlTemplate = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const allRoutes = dedupeByRoute(
    getAllSeoRoutes().map((routeMeta) => ({
      route: routeMeta.path,
      title: routeMeta.title,
      description: routeMeta.description,
      canonical: routeMeta.canonical,
      noindex: routeMeta.indexable === false,
    })),
  );

  allRoutes.forEach((meta) => {
    const targetPath = outputFileForRoute(meta.route);
    const routeHtml = injectBodyFallback(
      applyHeadMeta(htmlTemplate, meta),
      meta.route,
    );
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, routeHtml, "utf8");
  });

  console.log(`Prerendered HTML head for ${allRoutes.length} routes.`);
};

run();
