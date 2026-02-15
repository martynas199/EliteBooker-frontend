import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const COVERAGE_TARGETS = [
  {
    route: "/",
    file: "src/system/pages/LandingPage.jsx",
    canonical: "https://www.elitebooker.co.uk/",
  },
  {
    route: "/pricing",
    file: "src/system/pages/PricingPage.jsx",
    canonical: "https://www.elitebooker.co.uk/pricing",
    requiresSchema: true,
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
  },
  {
    route: "/features/no-show-protection",
    file: "src/system/pages/features/NoShowProtection.jsx",
    canonical: "https://www.elitebooker.co.uk/features/no-show-protection",
    requiresSchema: true,
  },
  {
    route: "/features/calendar-sync",
    file: "src/system/pages/features/CalendarSync.jsx",
    canonical: "https://www.elitebooker.co.uk/features/calendar-sync",
    requiresSchema: true,
  },
  {
    route: "/features/online-booking",
    file: "src/system/pages/features/OnlineBooking.jsx",
    canonical: "https://www.elitebooker.co.uk/features/online-booking",
    requiresSchema: true,
  },
  {
    route: "/compare",
    file: "src/system/pages/ComparePage.jsx",
    canonical: "https://www.elitebooker.co.uk/compare",
    requiresSchema: true,
  },
  {
    route: "/compare/vs-fresha",
    file: "src/system/pages/compare/VsFresha.jsx",
    canonical: "https://www.elitebooker.co.uk/compare/vs-fresha",
    requiresSchema: true,
  },
  {
    route: "/compare/vs-treatwell",
    file: "src/system/pages/compare/VsTreatwell.jsx",
    canonical: "https://www.elitebooker.co.uk/compare/vs-treatwell",
    requiresSchema: true,
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
  },
  {
    route: "/tools/roi-calculator",
    file: "src/system/pages/tools/RoiCalculator.jsx",
    canonical: "https://www.elitebooker.co.uk/tools/roi-calculator",
    requiresSchema: true,
  },
  {
    route: "/tools/deposit-policy-generator",
    file: "src/system/pages/tools/DepositPolicyGenerator.jsx",
    canonical: "https://www.elitebooker.co.uk/tools/deposit-policy-generator",
    requiresSchema: true,
  },
  {
    route: "/industries/lash-technicians",
    file: "src/system/pages/industries/LashTechnicians.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/lash-technicians",
    requiresSchema: true,
  },
  {
    route: "/industries/hair-salons",
    file: "src/system/pages/industries/HairSalons.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/hair-salons",
    requiresSchema: true,
  },
  {
    route: "/industries/barbers",
    file: "src/system/pages/industries/Barbers.jsx",
    canonical: "https://www.elitebooker.co.uk/industries/barbers",
    requiresSchema: true,
  },
];

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
