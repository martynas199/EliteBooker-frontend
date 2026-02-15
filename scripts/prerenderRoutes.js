import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  canonicalForPath,
  getAllSeoRoutes,
} from "../src/shared/seo/routeManifest.js";

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

const applyHeadMeta = (htmlTemplate, meta) => {
  let html = htmlTemplate;
  const title = meta.title || "Elite Booker";
  const description =
    meta.description ||
    "Commission-free booking software for UK service businesses.";
  const canonical = canonicalForPath(meta.route, meta.canonical);
  const robots = meta.noindex ? "noindex, nofollow" : "index, follow";

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

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
    const routeHtml = applyHeadMeta(htmlTemplate, meta);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, routeHtml, "utf8");
  });

  console.log(`Prerendered HTML head for ${allRoutes.length} routes.`);
};

run();
