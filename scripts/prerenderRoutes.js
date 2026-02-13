import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLandingPages } from "../src/system/data/ukCitiesNiches.js";

const BASE_URL = "https://www.elitebooker.co.uk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, "../dist");
const TEMPLATE_PATH = path.join(DIST_DIR, "index.html");

const staticRoutes = [
  {
    route: "/",
    title: "Booking Software for UK Salons, Spas & Barbers | Elite Booker",
    description:
      "Commission-free booking software for UK beauty and wellness businesses. Online scheduling, SMS reminders, deposits and client management. Plans from GBP 0.",
    canonical: `${BASE_URL}/`,
  },
  {
    route: "/business",
    title: "Booking Software for UK Salons, Spas & Barbers | Elite Booker",
    description:
      "Commission-free booking software for UK beauty and wellness businesses. Online scheduling, SMS reminders, deposits and client management. Plans from GBP 0.",
    canonical: `${BASE_URL}/`,
  },
  {
    route: "/pricing",
    title: "Pricing - GBP 0 to GBP 49.99/month | Elite Booker UK",
    description:
      "Simple pricing for UK salons. Free Basic plan forever. Professional GBP 9.99/month. Enterprise GBP 49.99/month. No commission and no contracts.",
  },
  {
    route: "/signup",
    title: "Create Your Business Account | Elite Booker",
    description:
      "Start your Elite Booker account for your salon, barbershop, or wellness business. Set up in minutes and begin accepting bookings.",
  },
  {
    route: "/signup/success",
    title: "Signup Complete | Elite Booker",
    description: "Your Elite Booker account has been created successfully.",
    noindex: true,
  },
  {
    route: "/help",
    title: "Help & Support | Elite Booker",
    description:
      "Get help with booking appointments, managing your account, and more.",
  },
  {
    route: "/search",
    title: "Find Beauty & Wellness Businesses Near You | Elite Booker",
    description:
      "Search and book trusted salons, spas, and wellness businesses across the UK.",
  },
  {
    route: "/features",
    title: "Booking Software Features | Elite Booker",
    description:
      "Explore Elite Booker features for salons and wellness businesses: SMS reminders, no-show protection, calendar sync, and online booking.",
  },
  {
    route: "/features/sms-reminders",
    title: "SMS Appointment Reminders - Reduce No-Shows by 70% | Elite Booker",
    description:
      "Automated SMS reminders for UK salons. 98% open rate, one-click confirmations, reduce no-shows by 70%. £2.99/month unlimited. Try free today.",
  },
  {
    route: "/features/no-show-protection",
    title: "No-Show Protection with Deposits | Reduce No-Shows 85% | Elite Booker",
    description:
      "Automated deposit collection for UK salons. Reduce no-shows by 85%. Set custom policies, instant Stripe payments, automatic refunds. Protect your revenue.",
  },
  {
    route: "/features/calendar-sync",
    title: "Google Calendar Sync | Two-Way Appointment Sync | Elite Booker",
    description:
      "Sync appointments with Google Calendar, Apple Calendar, Outlook. Two-way sync, real-time updates, mobile app integration. Never double-book again.",
  },
  {
    route: "/features/online-booking",
    title: "24/7 Online Booking System | Accept Appointments Anytime | Elite Booker",
    description:
      "Let UK clients book appointments 24/7. Mobile-optimized, real-time availability, instant confirmations. Increase bookings 30% with online scheduling.",
  },
  {
    route: "/compare",
    title: "Compare Elite Booker",
    description:
      "Compare Elite Booker against Fresha and Treatwell with clear UK pricing and feature breakdowns.",
  },
  {
    route: "/compare/vs-fresha",
    title: "Elite Booker vs Fresha - Which Is Cheaper? (2026 Comparison)",
    description:
      "Honest comparison: Elite Booker saves you £180+/year vs Fresha. £0/month with no commission. SMS optional. See real cost breakdown with verified pricing.",
  },
  {
    route: "/compare/vs-treatwell",
    title: "Elite Booker vs Treatwell - Stop Paying 30% Commission",
    description:
      "Treatwell charges 30% commission per booking. Elite Booker charges £29/month flat. See how much you could save by switching.",
  },
  {
    route: "/solutions",
    title: "Local Booking Software Solutions | Elite Booker",
    description:
      "Explore local booking software pages for UK cities and beauty niches. Find tailored solutions for salons, barbers, lash techs, clinics, and more.",
  },
  {
    route: "/industries/lash-technicians",
    title: "Lash Technician Booking Software UK - Elite Booker",
    description:
      "Booking system built for lash techs. Online scheduling, deposit protection, client reminders & patch test tracking. Trusted by UK lash artists.",
  },
  {
    route: "/industries/hair-salons",
    title: "Salon Management Software UK - Elite Booker",
    description:
      "Complete management system for UK hair salons. Online booking, client database, stock control, POS & reporting. Used by 1000+ salons nationwide.",
  },
  {
    route: "/industries/barbers",
    title: "Barber Shop Booking System UK - Reduce No-Shows",
    description:
      "Modern booking software for UK barber shops. Walk-in queue management, online bookings, SMS reminders & staff scheduling. No commission fees.",
  },
  {
    route: "/blog/reduce-salon-no-shows",
    title: "How to Reduce Salon No-Shows by 40% - The UK Guide (2026)",
    description:
      "Proven strategies to cut no-shows & late cancellations. SMS reminders, deposit policies, confirmation systems. Implement today, see results this week.",
  },
  {
    route: "/tools/roi-calculator",
    title:
      "Salon Commission Calculator UK | Compare Fresha vs Elite Booker Costs",
    description:
      "Free calculator to see how much you'll save by switching from Fresha or Treatwell. Compare booking software costs for UK salons, spas, and beauty businesses.",
  },
  {
    route: "/tools/deposit-policy-generator",
    title: "Free Salon Deposit Policy Generator | HMRC-Compliant Template UK",
    description:
      "Generate a free, HMRC-compliant deposit & cancellation policy for your UK salon, spa, or beauty business in 30 seconds. Copy-paste ready, legally sound.",
  },
  {
    route: "/referral-signup",
    title: "Join the Referral Program | Elite Booker",
    description:
      "Join the Elite Booker referral program and earn rewards by introducing beauty and wellness businesses.",
  },
  {
    route: "/join-referral-program",
    title: "Join the Referral Program | Elite Booker",
    description:
      "Join the Elite Booker referral program and earn rewards by introducing beauty and wellness businesses.",
    canonical: `${BASE_URL}/referral-signup`,
  },
  {
    route: "/referral-login",
    title: "Referral Partner Login | Elite Booker",
    description: "Sign in to access your Elite Booker referral dashboard.",
    noindex: true,
  },
  {
    route: "/referral-dashboard",
    title: "Referral Dashboard | Elite Booker",
    description:
      "Track referral code activity and rewards in your Elite Booker dashboard.",
    noindex: true,
  },
  {
    route: "/menu",
    title: "Menu | Elite Booker",
    description: "Mobile navigation menu for Elite Booker.",
    noindex: true,
  },
  {
    route: "/404",
    title: "Page not found | Elite Booker",
    description: "The page you requested could not be found.",
    noindex: true,
  },
];

const programmaticRoutes = generateLandingPages().map((page) => ({
  route: page.url,
  title: page.title,
  description: page.metaDescription,
}));

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

const canonicalForRoute = (route, overrideCanonical) => {
  if (overrideCanonical) return overrideCanonical;
  const normalized = normalizeRoute(route);
  return normalized === "/" ? `${BASE_URL}/` : `${BASE_URL}${normalized}`;
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
  const canonical = canonicalForRoute(meta.route, meta.canonical);
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
  const allRoutes = dedupeByRoute([...staticRoutes, ...programmaticRoutes]);

  allRoutes.forEach((meta) => {
    const targetPath = outputFileForRoute(meta.route);
    const routeHtml = applyHeadMeta(htmlTemplate, meta);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, routeHtml, "utf8");
  });

  console.log(`Prerendered HTML head for ${allRoutes.length} routes.`);
};

run();
