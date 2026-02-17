import { generateLandingPages } from "../../system/data/ukCitiesNiches.js";

export const SEO_BASE_URL = "https://www.elitebooker.co.uk";

export const MARKETING_ROUTE_MANIFEST = [
  {
    path: "/",
    title: "Booking Software for UK Salons, Spas & Barbers | Elite Booker",
    description:
      "Commission-free booking software for UK beauty and wellness businesses. Online scheduling, SMS reminders, deposits and client management. Plans from GBP 0.",
    canonical: `${SEO_BASE_URL}/`,
    indexable: true,
    changefreq: "daily",
    priority: 1,
    intent: "core",
  },
  {
    path: "/business",
    title: "Booking Software for UK Salons, Spas & Barbers | Elite Booker",
    description:
      "Commission-free booking software for UK beauty and wellness businesses. Online scheduling, SMS reminders, deposits and client management. Plans from GBP 0.",
    canonical: `${SEO_BASE_URL}/`,
    indexable: false,
    changefreq: "monthly",
    priority: 0.2,
    intent: "utility",
  },
  {
    path: "/pricing",
    title: "Salon Software Pricing UK | No Hidden Booking Fees | Elite Booker",
    description:
      "Simple pricing for UK salons. Free Basic plan forever. Professional GBP 9.99/month. Enterprise GBP 49.99/month. No commission and no contracts.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
    intent: "core",
  },
  {
    path: "/salon-booking-software-uk",
    title: "Salon Booking Software UK | Online Appointments for Growing Teams",
    description:
      "UK salon booking software for online appointments, reminders, deposits, and team scheduling.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "money-page",
  },
  {
    path: "/barbershop-booking-software-uk",
    title: "Barbershop Booking Software UK | Fill Chairs and Reduce Gaps",
    description:
      "UK barbershop booking software with online appointments, slot controls, reminders, and staff scheduling.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "money-page",
  },
  {
    path: "/nail-salon-booking-software-uk",
    title: "Nail Salon Booking Software UK | Appointments, Reminders, Deposits",
    description:
      "UK nail salon booking software to manage appointments, add-ons, reminders, and deposit rules.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "money-page",
  },
  {
    path: "/beauty-salon-booking-system-uk",
    title:
      "Beauty Salon Booking System UK | Scheduling, Reminders, Team Control",
    description:
      "Beauty salon booking system for UK businesses with online scheduling, reminders, and policy controls.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "money-page",
  },
  {
    path: "/hairdresser-booking-software-uk",
    title: "Hairdresser Booking Software UK | Online Diary for Hair Teams",
    description:
      "Hairdresser booking software in the UK for consultation-led services, reminders, and scheduling controls.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "money-page",
  },
  {
    path: "/signup",
    title: "Create Your Business Account | Elite Booker",
    description:
      "Start your Elite Booker account for your salon, barbershop, or wellness business. Set up in minutes and begin accepting bookings.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "conversion",
  },
  {
    path: "/signup/success",
    title: "Signup Complete | Elite Booker",
    description: "Your Elite Booker account has been created successfully.",
    indexable: false,
    changefreq: "monthly",
    priority: 0.2,
    intent: "utility",
  },
  {
    path: "/help",
    title: "Help & Support | Elite Booker",
    description:
      "Get help with bookings, account setup, billing, and troubleshooting for Elite Booker.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.6,
    intent: "support",
  },
  {
    path: "/search",
    title: "Find Beauty & Wellness Businesses Near You | Elite Booker",
    description:
      "Search and book trusted salons, spas, and wellness businesses across the UK.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.6,
    intent: "discovery",
  },
  {
    path: "/features",
    title: "Booking Software Features | Elite Booker",
    description:
      "Explore Elite Booker features for salons and wellness businesses: SMS reminders, no-show protection, calendar sync, and online booking.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "feature-hub",
  },
  {
    path: "/features/sms-reminders",
    title: "SMS Appointment Reminders - Reduce No-Shows by 70% | Elite Booker",
    description:
      "Automated outbound SMS reminders for UK salons. 98% open rate, reduce no-shows by 70%. GBP 2.99/month unlimited. Try free today.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "feature",
  },
  {
    path: "/features/no-show-protection",
    title: "No-Show Protection & Deposits | Elite Booker",
    description:
      "Automated deposit collection for UK salons. Reduce no-shows by 85%. Set custom policies, instant Stripe payments, automatic refunds. Protect your revenue.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "feature",
  },
  {
    path: "/features/calendar-sync",
    title: "Google Calendar Sync | Two-Way Appointment Sync | Elite Booker",
    description:
      "Sync appointments with Google Calendar, Apple Calendar, Outlook. Two-way sync, real-time updates, mobile app integration. Never double-book again.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "feature",
  },
  {
    path: "/features/online-booking",
    title: "24/7 Online Booking System | Elite Booker",
    description:
      "Let UK clients book appointments 24/7. Mobile-optimized, real-time availability, instant confirmations. Increase bookings 30% with online scheduling.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "feature",
  },
  {
    path: "/compare",
    title: "Elite Booker Comparisons | Fresha & Treatwell Alternatives",
    description:
      "Compare Elite Booker against Fresha and Treatwell with clear UK pricing and feature breakdowns.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "comparison-hub",
  },
  {
    path: "/compare/vs-fresha",
    title: "Elite Booker vs Fresha | UK Pricing & Fee Comparison",
    description:
      "Source-linked UK comparison page covering subscription, commission, payment, and SMS pricing structure between Elite Booker and Fresha.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "comparison",
  },
  {
    path: "/compare/vs-treatwell",
    title: "Elite Booker vs Treatwell | UK Pricing & Commission Comparison",
    description:
      "Source-linked UK comparison page covering subscription tiers, commission model, and booking-cost structure between Elite Booker and Treatwell.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.9,
    intent: "comparison",
  },
  {
    path: "/solutions",
    title: "Local Booking Software Solutions | Elite Booker",
    description:
      "Explore local booking software pages for UK cities and beauty niches. Find tailored solutions for salons, barbers, lash techs, clinics, and more.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.8,
    intent: "solution-hub",
  },
  {
    path: "/industries/lash-technicians",
    title: "Lash Technician Booking Software UK - Elite Booker",
    description:
      "Booking system built for lash techs. Online scheduling, deposit protection, client reminders & patch test tracking. Trusted by UK lash artists.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
    intent: "industry",
  },
  {
    path: "/industries/hair-salons",
    title: "Salon Management Software UK - Elite Booker",
    description:
      "Complete management system for UK hair salons. Online booking, client database, stock control, POS & reporting. Used by 1000+ salons nationwide.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
    intent: "industry",
  },
  {
    path: "/industries/barbers",
    title: "Barber Shop Booking System UK - Reduce No-Shows",
    description:
      "Modern booking software for UK barber shops. Online bookings, SMS reminders & staff scheduling. No commission fees.",
    indexable: true,
    changefreq: "weekly",
    priority: 0.9,
    intent: "industry",
  },
  {
    path: "/blog/reduce-salon-no-shows",
    title: "How to Reduce Salon No-Shows by 40% - The UK Guide (2026)",
    description:
      "Proven strategies to cut no-shows & late cancellations. SMS reminders, deposit policies, confirmation systems. Implement today, see results this week.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.7,
    intent: "blog",
  },
  {
    path: "/tools/roi-calculator",
    title: "Salon Commission Calculator UK | Elite Booker",
    description:
      "Free calculator to see how much you'll save by switching from Fresha or Treatwell. Compare booking software costs for UK salons, spas, and beauty businesses.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "tool",
  },
  {
    path: "/tools/deposit-policy-generator",
    title: "Free Salon Deposit Policy Generator | HMRC-Compliant Template UK",
    description:
      "Generate a free, HMRC-compliant deposit & cancellation policy for your UK salon, spa, or beauty business in 30 seconds. Copy-paste ready, legally sound.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.8,
    intent: "tool",
  },
  {
    path: "/referral-signup",
    title: "Join the Referral Program | Elite Booker",
    description:
      "Join the Elite Booker referral program and earn rewards by introducing beauty and wellness businesses.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.5,
    intent: "referral",
  },
  {
    path: "/join-referral-program",
    title: "Join the Referral Program | Elite Booker",
    description:
      "Join the Elite Booker referral program and earn rewards by introducing beauty and wellness businesses.",
    canonical: `${SEO_BASE_URL}/referral-signup`,
    indexable: false,
    changefreq: "monthly",
    priority: 0.2,
    intent: "utility",
  },
  {
    path: "/referral-login",
    title: "Referral Partner Login | Elite Booker",
    description: "Sign in to access your Elite Booker referral dashboard.",
    indexable: false,
    changefreq: "monthly",
    priority: 0.2,
    intent: "utility",
  },
  {
    path: "/referral-dashboard",
    title: "Referral Dashboard | Elite Booker",
    description:
      "Track referral code activity and rewards in your Elite Booker dashboard.",
    indexable: false,
    changefreq: "monthly",
    priority: 0.2,
    intent: "utility",
  },
  {
    path: "/menu",
    title: "Menu | Elite Booker",
    description: "Mobile navigation menu for Elite Booker.",
    indexable: false,
    changefreq: "monthly",
    priority: 0.1,
    intent: "utility",
  },
  {
    path: "/404",
    title: "Page not found | Elite Booker",
    description: "The page you requested could not be found.",
    indexable: false,
    changefreq: "monthly",
    priority: 0.1,
    intent: "utility",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Elite Booker",
    description:
      "Read Elite Booker privacy policy for data handling and GDPR commitments.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.4,
    intent: "legal",
  },
  {
    path: "/terms",
    title: "Terms of Service | Elite Booker",
    description:
      "Read Elite Booker terms for usage, billing, and account responsibilities.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.4,
    intent: "legal",
  },
  {
    path: "/security",
    title: "Security & Data Protection | Elite Booker",
    description:
      "Learn how Elite Booker protects client and business data across the platform.",
    indexable: true,
    changefreq: "monthly",
    priority: 0.4,
    intent: "legal",
  },
];

const normalizePath = (path = "/") => {
  const pathOnly = `${path}`.split("?")[0].split("#")[0] || "/";
  if (pathOnly === "/") return "/";
  return pathOnly.endsWith("/") ? pathOnly.slice(0, -1) : pathOnly;
};

const dedupeByPath = (routes) => {
  const routeMap = new Map();
  routes.forEach((route) => {
    routeMap.set(normalizePath(route.path), {
      ...route,
      path: normalizePath(route.path),
    });
  });
  return [...routeMap.values()];
};

export const canonicalForPath = (path, canonical) => {
  if (canonical) return canonical;
  const normalized = normalizePath(path);
  return normalized === "/"
    ? `${SEO_BASE_URL}/`
    : `${SEO_BASE_URL}${normalized}`;
};

export const getStaticSeoRoutes = () => dedupeByPath(MARKETING_ROUTE_MANIFEST);

export const getProgrammaticSeoRoutes = () =>
  generateLandingPages().map((page) => ({
    path: page.url,
    title: page.title,
    description: page.metaDescription,
    indexable: page.indexable !== false,
    changefreq: "monthly",
    priority: 0.7,
    intent: "location",
  }));

export const getAllSeoRoutes = () =>
  dedupeByPath([...getStaticSeoRoutes(), ...getProgrammaticSeoRoutes()]);

export const getIndexableSeoRoutes = () =>
  getAllSeoRoutes().filter((route) => route.indexable !== false);
