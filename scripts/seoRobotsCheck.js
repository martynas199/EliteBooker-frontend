import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROBOTS_PATH = path.resolve(__dirname, "../public/robots.txt");

const REQUIRED_RULES = [
  "Disallow: /client/",
  "Disallow: /admin/",
  "Disallow: /api/",
  "Disallow: /salon/*/login",
  "Disallow: /salon/*/register",
  "Disallow: /salon/*/profile",
  "Disallow: /salon/*/profile/*",
  "Disallow: /salon/*/checkout",
  "Disallow: /salon/*/product-checkout",
  "Disallow: /salon/*/confirmation",
  "Disallow: /salon/*/success",
  "Disallow: /salon/*/cancel",
  "Disallow: /salon/*/shop/success",
  "Disallow: /salon/*/shop/cancel",
  "Disallow: /salon/*/token-debug",
  "Disallow: /salon/*/auth/success",
  "Disallow: /order-success/*",
  "Sitemap: https://www.elitebooker.co.uk/sitemap.xml",
];

const run = () => {
  if (!fs.existsSync(ROBOTS_PATH)) {
    console.error(`Missing robots.txt at ${ROBOTS_PATH}`);
    process.exit(1);
  }

  const robotsRaw = fs.readFileSync(ROBOTS_PATH, "utf8");
  const robotsLines = robotsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const missing = REQUIRED_RULES.filter((rule) => !robotsLines.includes(rule));

  if (missing.length > 0) {
    console.error("SEO robots check failed:");
    missing.forEach((rule) => console.error(`- Missing rule: ${rule}`));
    process.exit(1);
  }

  console.log(
    `SEO robots check passed: ${REQUIRED_RULES.length} required rules present.`,
  );
};

run();
