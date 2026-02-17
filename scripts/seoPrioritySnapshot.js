import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");
const OUTPUT_DIR = path.resolve(__dirname, "../reports");

const PRIORITY_URLS = [
  "/",
  "/pricing",
  "/compare",
  "/compare/vs-fresha",
  "/compare/vs-treatwell",
  "/salon-booking-software-uk",
  "/barbershop-booking-software-uk",
  "/nail-salon-booking-software-uk",
  "/beauty-salon-booking-system-uk",
  "/hairdresser-booking-software-uk",
];

const normalizePath = (urlPath) => {
  if (!urlPath || urlPath === "/") return "/";
  const clean = urlPath.split("?")[0].split("#")[0];
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
};

const htmlFileForPath = (urlPath) => {
  const normalized = normalizePath(urlPath);
  if (normalized === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, normalized.replace(/^\//, ""), "index.html");
};

const extractTagValue = (html, pattern) => {
  const match = html.match(pattern);
  return match?.[1]?.trim() || "";
};

const decodeHtmlEntities = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  const toPosixPath = (value = "") => value.split(path.sep).join("/");

const csvEscape = (value = "") => {
  const normalized = String(value).replace(/\r?\n|\r/g, " ").trim();
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
};

const ensurePrerequisites = () => {
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error(
      `Missing dist folder at ${DIST_DIR}. Run \"npm run build\" before \"npm run seo:snapshot\".`,
    );
  }
};

const getSeoRow = (urlPath) => {
  const filePath = htmlFileForPath(urlPath);

  if (!fs.existsSync(filePath)) {
    return {
      urlPath,
      status: "missing",
      title: "",
      description: "",
      canonical: "",
      robots: "",
      hasPrerenderFallback: "no",
      htmlFile: toPosixPath(path.relative(path.resolve(__dirname, ".."), filePath)),
    };
  }

  const html = fs.readFileSync(filePath, "utf-8");
  const title = decodeHtmlEntities(extractTagValue(html, /<title>([\s\S]*?)<\/title>/i));
  const description = decodeHtmlEntities(
    extractTagValue(html, /<meta\s+name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i),
  );
  const canonical = extractTagValue(
    html,
    /<link\s+rel=["']canonical["'][^>]*href=["']([\s\S]*?)["'][^>]*>/i,
  );
  const robots = extractTagValue(
    html,
    /<meta\s+name=["']robots["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i,
  );
  const hasPrerenderFallback = /id=["']seo-prerender-content["']/i.test(html)
    ? "yes"
    : "no";

  return {
    urlPath,
    status: "ok",
    title,
    description,
    canonical,
    robots,
    hasPrerenderFallback,
    htmlFile: toPosixPath(path.relative(path.resolve(__dirname, ".."), filePath)),
  };
};

const toCsv = (rows) => {
  const headers = [
    "urlPath",
    "status",
    "title",
    "description",
    "canonical",
    "robots",
    "hasPrerenderFallback",
    "htmlFile",
  ];
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }

  return `${lines.join("\n")}\n`;
};

const run = () => {
  ensurePrerequisites();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const rows = PRIORITY_URLS.map(getSeoRow);
  const dateStamp = new Date().toISOString().slice(0, 10);
  const datedPath = path.join(OUTPUT_DIR, `seo-priority-snapshot-${dateStamp}.csv`);
  const latestPath = path.join(OUTPUT_DIR, "seo-priority-snapshot-latest.csv");
  const csv = toCsv(rows);

  fs.writeFileSync(datedPath, csv, "utf-8");
  fs.writeFileSync(latestPath, csv, "utf-8");

  const missingCount = rows.filter((row) => row.status === "missing").length;
  console.log(`SEO priority snapshot exported: ${path.relative(path.resolve(__dirname, ".."), datedPath)}`);
  console.log(`Latest snapshot updated: ${path.relative(path.resolve(__dirname, ".."), latestPath)}`);
  if (missingCount > 0) {
    console.warn(`Missing pages in dist: ${missingCount}`);
  }
};

run();