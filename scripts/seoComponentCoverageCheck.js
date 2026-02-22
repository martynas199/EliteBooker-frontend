import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const COVERAGE_TARGETS = [
  {
    route: "/",
    file: "src/system/pages/LandingPageRebuild.jsx",
    canonical: "https://www.elitebooker.co.uk/",
    requiresAliasNoindexGuard: true,
  },
  {
    route: "/pricing",
    file: "src/system/pages/PricingPage.jsx",
    canonical: "https://www.elitebooker.co.uk/pricing",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "SoftwareApplication"],
  },
  {
    route: "/features",
    file: "src/system/pages/FeaturesPage.jsx",
    canonical: "https://www.elitebooker.co.uk/features",
  },
  {
    route: "/features/sms-reminders",
    file: "src/system/pages/features/SmsReminders.jsx",
    canonical: "https://www.elitebooker.co.uk/features/sms-reminders",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/features/no-show-protection",
    file: "src/system/pages/features/NoShowProtection.jsx",
    canonical: "https://www.elitebooker.co.uk/features/no-show-protection",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/features/calendar-sync",
    file: "src/system/pages/features/CalendarSync.jsx",
    canonical: "https://www.elitebooker.co.uk/features/calendar-sync",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/features/online-booking",
    file: "src/system/pages/features/OnlineBooking.jsx",
    canonical: "https://www.elitebooker.co.uk/features/online-booking",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/compare",
    file: "src/system/pages/ComparePage.jsx",
    canonical: "https://www.elitebooker.co.uk/compare",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage"],
  },
  {
    route: "/compare/vs-fresha",
    file: "src/system/pages/compare/VsFresha.jsx",
    canonical: "https://www.elitebooker.co.uk/compare/vs-fresha",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage"],
  },
  {
    route: "/compare/vs-treatwell",
    file: "src/system/pages/compare/VsTreatwell.jsx",
    canonical: "https://www.elitebooker.co.uk/compare/vs-treatwell",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage"],
  },
  {
    route: "/solutions",
    file: "src/system/pages/SolutionsPage.jsx",
    canonical: "https://www.elitebooker.co.uk/solutions",
  },
  {
    route: "/blog/reduce-salon-no-shows",
    file: "src/system/pages/blog/ReduceSalonNoShows.jsx",
    canonical: "https://www.elitebooker.co.uk/blog/reduce-salon-no-shows",
    requiresSchema: true,
    expectedSchemaTypes: ["BlogPosting"],
  },
  {
    route: "/tools/roi-calculator",
    file: "src/system/pages/tools/RoiCalculator.jsx",
    canonical: "https://www.elitebooker.co.uk/tools/roi-calculator",
    requiresSchema: true,
    expectedSchemaTypes: ["WebApplication"],
  },
  {
    route: "/tools/deposit-policy-generator",
    file: "src/system/pages/tools/DepositPolicyGenerator.jsx",
    canonical: "https://www.elitebooker.co.uk/tools/deposit-policy-generator",
    requiresSchema: true,
    expectedSchemaTypes: ["WebApplication"],
  },
  {
    route: "/industries/lash-technicians",
    file: "src/system/pages/industries/LashTechnicians.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/lash-technicians",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/industries/hair-salons",
    file: "src/system/pages/industries/HairSalons.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/hair-salons",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
  {
    route: "/industries/barbers",
    file: "src/system/pages/industries/Barbers.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/barbers",
    requiresSchema: true,
    expectedSchemaTypes: ["WebPage", "Service"],
  },
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hasSchemaType = (source, schemaType) => {
  const schemaTypeRegex = new RegExp(
    `["']@type["']\\s*:\\s*["']${escapeRegExp(schemaType)}["']`,
  );
  return schemaTypeRegex.test(source);
};

const readTarget = (relativePath) => {
  const fullPath = path.resolve(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing target file: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
};

const validateTarget = (target) => {
  const source = readTarget(target.file);
  const issues = [];

  const hasSEOHead = /<SEOHead\b/.test(source);

  if (!hasSEOHead) {
    issues.push("Missing SEO metadata component (<SEOHead>)");
  }

  if (!source.includes(target.canonical)) {
    issues.push(`Missing canonical URL: ${target.canonical}`);
  }

  const hasDescription = /name=\"description\"|description=\"/.test(source);
  if (!hasDescription) {
    issues.push("Missing meta description definition");
  }

  const hasTitle = /<title>|title=\"/.test(source);
  if (!hasTitle) {
    issues.push("Missing title definition");
  }

  if (target.requiresSchema) {
    const hasSchemaProp = /\bschema=\{/.test(source);
    if (!hasSchemaProp) {
      issues.push("Missing structured data declaration (schema prop)");
    }
  }

  if (target.requiresAliasNoindexGuard) {
    const hasAliasNoindexGuard = /\bnoindex=\{!isPrimaryCanonicalPath\}/.test(
      source,
    );
    if (!hasAliasNoindexGuard) {
      issues.push("Missing alias noindex guard for duplicate landing routes");
    }
  }

  if (target.expectedSchemaTypes && target.expectedSchemaTypes.length > 0) {
    for (const schemaType of target.expectedSchemaTypes) {
      if (!hasSchemaType(source, schemaType)) {
        issues.push(`Missing expected schema type: ${schemaType}`);
      }
    }
  }

  return issues.map((issue) => `${target.route} (${target.file}): ${issue}`);
};

const run = () => {
  const allIssues = COVERAGE_TARGETS.flatMap(validateTarget);

  if (allIssues.length > 0) {
    console.error("SEO component coverage check failed:");
    allIssues.forEach((issue) => console.error(`- ${issue}`));
    process.exit(1);
  }

  console.log(
    `SEO component coverage passed for ${COVERAGE_TARGETS.length} marketing routes.`,
  );
};

run();
