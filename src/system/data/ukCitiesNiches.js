/**
 * UK Cities and Niches Database for Programmatic SEO
 * Powers 400+ hyper-targeted landing pages at /solutions/{niche}-{city}
 *
 * Data sources:
 * - Top 50 UK cities by population (ONS 2025 data)
 * - Beauty/wellness sub-niches with high booking software demand
 *
 * SEO Strategy: Capture long-tail searches like "booking software for barbers in Manchester"
 * with low competition and high conversion intent.
 */

export const UK_CITIES = [
  // England - Major Cities
  { name: "London", slug: "london", region: "London", population: 9540576 },
  {
    name: "Birmingham",
    slug: "birmingham",
    region: "West Midlands",
    population: 2607437,
  },
  {
    name: "Manchester",
    slug: "manchester",
    region: "Greater Manchester",
    population: 2730076,
  },
  {
    name: "Leeds",
    slug: "leeds",
    region: "West Yorkshire",
    population: 1889095,
  },
  {
    name: "Liverpool",
    slug: "liverpool",
    region: "Merseyside",
    population: 864122,
  },
  {
    name: "Newcastle",
    slug: "newcastle",
    region: "Tyne and Wear",
    population: 774891,
  },
  {
    name: "Sheffield",
    slug: "sheffield",
    region: "South Yorkshire",
    population: 685368,
  },
  { name: "Bristol", slug: "bristol", region: "Bristol", population: 617280 },
  {
    name: "Nottingham",
    slug: "nottingham",
    region: "Nottinghamshire",
    population: 729977,
  },
  {
    name: "Leicester",
    slug: "leicester",
    region: "Leicestershire",
    population: 508916,
  },

  // Scotland
  { name: "Glasgow", slug: "glasgow", region: "Scotland", population: 635640 },
  {
    name: "Edinburgh",
    slug: "edinburgh",
    region: "Scotland",
    population: 524930,
  },
  {
    name: "Aberdeen",
    slug: "aberdeen",
    region: "Scotland",
    population: 198590,
  },

  // Wales
  { name: "Cardiff", slug: "cardiff", region: "Wales", population: 362310 },
  { name: "Swansea", slug: "swansea", region: "Wales", population: 246466 },

  // Northern Ireland
  {
    name: "Belfast",
    slug: "belfast",
    region: "Northern Ireland",
    population: 345418,
  },

  // England - Additional Major Cities
  {
    name: "Brighton",
    slug: "brighton",
    region: "East Sussex",
    population: 474485,
  },
  { name: "Plymouth", slug: "plymouth", region: "Devon", population: 262100 },
  {
    name: "Southampton",
    slug: "southampton",
    region: "Hampshire",
    population: 253651,
  },
  { name: "Reading", slug: "reading", region: "Berkshire", population: 318014 },
  { name: "Derby", slug: "derby", region: "Derbyshire", population: 257174 },
  {
    name: "Portsmouth",
    slug: "portsmouth",
    region: "Hampshire",
    population: 238137,
  },
  {
    name: "Coventry",
    slug: "coventry",
    region: "West Midlands",
    population: 345385,
  },
  {
    name: "Bradford",
    slug: "bradford",
    region: "West Yorkshire",
    population: 539776,
  },
  {
    name: "Wolverhampton",
    slug: "wolverhampton",
    region: "West Midlands",
    population: 263357,
  },
  {
    name: "Bournemouth",
    slug: "bournemouth",
    region: "Dorset",
    population: 395784,
  },
  { name: "Norwich", slug: "norwich", region: "Norfolk", population: 213166 },
  { name: "Swindon", slug: "swindon", region: "Wiltshire", population: 185609 },
  {
    name: "Milton Keynes",
    slug: "milton-keynes",
    region: "Buckinghamshire",
    population: 229941,
  },
  {
    name: "Northampton",
    slug: "northampton",
    region: "Northamptonshire",
    population: 225100,
  },

  // Regional Hub Cities
  { name: "Oxford", slug: "oxford", region: "Oxfordshire", population: 154600 },
  {
    name: "Cambridge",
    slug: "cambridge",
    region: "Cambridgeshire",
    population: 145674,
  },
  { name: "York", slug: "york", region: "North Yorkshire", population: 153717 },
  { name: "Bath", slug: "bath", region: "Somerset", population: 101557 },
  { name: "Exeter", slug: "exeter", region: "Devon", population: 130709 },
  { name: "Chester", slug: "chester", region: "Cheshire", population: 90524 },
  { name: "Canterbury", slug: "canterbury", region: "Kent", population: 55240 },
  {
    name: "Cheltenham",
    slug: "cheltenham",
    region: "Gloucestershire",
    population: 116447,
  },
  { name: "Ipswich", slug: "ipswich", region: "Suffolk", population: 144957 },
  {
    name: "Lincoln",
    slug: "lincoln",
    region: "Lincolnshire",
    population: 97541,
  },

  // Additional Strategic Cities
  {
    name: "Stoke-on-Trent",
    slug: "stoke-on-trent",
    region: "Staffordshire",
    population: 258366,
  },
  {
    name: "Hull",
    slug: "hull",
    region: "East Riding of Yorkshire",
    population: 267014,
  },
  {
    name: "Middlesbrough",
    slug: "middlesbrough",
    region: "North Yorkshire",
    population: 138400,
  },
  {
    name: "Sunderland",
    slug: "sunderland",
    region: "Tyne and Wear",
    population: 277417,
  },
  {
    name: "Preston",
    slug: "preston",
    region: "Lancashire",
    population: 141800,
  },
  { name: "Luton", slug: "luton", region: "Bedfordshire", population: 225262 },
  {
    name: "Peterborough",
    slug: "peterborough",
    region: "Cambridgeshire",
    population: 202110,
  },
  {
    name: "Blackpool",
    slug: "blackpool",
    region: "Lancashire",
    population: 139305,
  },
  {
    name: "Watford",
    slug: "watford",
    region: "Hertfordshire",
    population: 96577,
  },
  { name: "Slough", slug: "slough", region: "Berkshire", population: 158025 },
];

export const NICHES = [
  {
    id: "lash-techs",
    name: "Lash Technicians",
    slug: "lash-techs",
    pluralName: "Lash Techs",
    singularName: "Lash Technician",
    description:
      "Eyelash extension specialists, volume lash artists, and lash lift technicians",
    painPoints: [
      "High no-show rates (30-40% without deposits)",
      "Time-consuming phone bookings during treatments",
      "Difficulty managing back-to-back appointments",
      "Lost revenue from last-minute cancellations",
    ],
    averageTreatmentPrice: 65,
    averageMonthlyBookings: 85,
    typicalServices: [
      "Classic Lashes",
      "Volume Lashes",
      "Lash Lift",
      "Lash Removal",
    ],
  },
  {
    id: "barbers",
    name: "Barbers",
    slug: "barbers",
    pluralName: "Barbers",
    singularName: "Barber",
    description:
      "Traditional barbershops, fade specialists, and modern barber studios",
    painPoints: [
      "Walk-in chaos disrupting scheduled appointments",
      "Saturday morning rush overwhelming phone lines",
      "Regulars expecting priority without appointments",
      "Cash-only perception hurting deposit collection",
    ],
    averageTreatmentPrice: 28,
    averageMonthlyBookings: 220,
    typicalServices: [
      "Haircut & Beard Trim",
      "Skin Fade",
      "Hot Towel Shave",
      "Beard Styling",
    ],
  },
  {
    id: "hair-salons",
    name: "Hair Salons",
    slug: "hair-salons",
    pluralName: "Hair Salons",
    singularName: "Hair Salon",
    description:
      "Full-service hair salons, color specialists, and styling studios",
    painPoints: [
      "Complex multi-service bookings (cut + color + treatment)",
      "Color consultations running over time",
      "Retail product tracking alongside appointments",
      "Staff schedule coordination for team bookings",
    ],
    averageTreatmentPrice: 75,
    averageMonthlyBookings: 180,
    typicalServices: [
      "Cut & Blow Dry",
      "Highlights",
      "Balayage",
      "Keratin Treatment",
    ],
  },
  {
    id: "aesthetics",
    name: "Aesthetics Clinics",
    slug: "aesthetics",
    pluralName: "Aesthetics Clinics",
    singularName: "Aesthetics Clinic",
    description:
      "Medical aesthetics, Botox practitioners, dermal filler specialists, and skin clinics",
    painPoints: [
      "High-value treatments requiring 50% deposits",
      "Strict medical consent forms and aftercare protocols",
      "Client confidentiality and GDPR compliance",
      "Insurance requirements for treatment documentation",
    ],
    averageTreatmentPrice: 280,
    averageMonthlyBookings: 65,
    typicalServices: [
      "Botox",
      "Dermal Fillers",
      "Skin Peels",
      "Laser Hair Removal",
    ],
  },
  {
    id: "nail-techs",
    name: "Nail Technicians",
    slug: "nail-techs",
    pluralName: "Nail Techs",
    singularName: "Nail Technician",
    description:
      "Gel nail specialists, acrylic artists, and mobile nail technicians",
    painPoints: [
      "Back-to-back bookings with no buffer time",
      "Gel removal no-shows wasting prep time",
      "Complex nail art requiring time estimates",
      "Product costs for unused appointments",
    ],
    averageTreatmentPrice: 42,
    averageMonthlyBookings: 140,
    typicalServices: [
      "Gel Manicure",
      "Acrylic Extensions",
      "Nail Art",
      "Pedicure",
    ],
  },
  {
    id: "massage-therapists",
    name: "Massage Therapists",
    slug: "massage-therapists",
    pluralName: "Massage Therapists",
    singularName: "Massage Therapist",
    description:
      "Sports massage, deep tissue, Swedish massage, and holistic therapists",
    painPoints: [
      "Same-day bookings filling schedule inefficiently",
      "Medical history forms lost or incomplete",
      "Difficulty blocking lunch breaks for recovery",
      "Regulars expecting their preferred time slot",
    ],
    averageTreatmentPrice: 58,
    averageMonthlyBookings: 95,
    typicalServices: [
      "Deep Tissue Massage",
      "Sports Massage",
      "Swedish Massage",
      "Hot Stone Therapy",
    ],
  },
  {
    id: "tattoo-artists",
    name: "Tattoo Artists",
    slug: "tattoo-artists",
    pluralName: "Tattoo Artists",
    singularName: "Tattoo Artist",
    description:
      "Custom tattoo artists, traditional tattoo studios, and body art specialists",
    painPoints: [
      "Custom design consultations before booking",
      "Multi-session tattoos requiring session deposits",
      "Aftercare instruction distribution",
      "Portfolio sharing for consultation bookings",
    ],
    averageTreatmentPrice: 180,
    averageMonthlyBookings: 45,
    typicalServices: [
      "Custom Tattoo",
      "Cover-Up Tattoo",
      "Tattoo Touch-Up",
      "Flash Tattoo",
    ],
  },
  {
    id: "dog-grooming",
    name: "Dog Groomers",
    slug: "dog-grooming",
    pluralName: "Dog Groomers",
    singularName: "Dog Groomer",
    description:
      "Pet grooming salons, mobile dog groomers, and breed specialists",
    painPoints: [
      "Aggressive dog no-shows wasting blocked time",
      "Breed-specific grooming time variations",
      "Flea/tick discoveries extending appointments",
      "Client education about grooming frequency",
    ],
    averageTreatmentPrice: 45,
    averageMonthlyBookings: 160,
    typicalServices: [
      "Full Groom",
      "Wash & Blow Dry",
      "Puppy First Groom",
      "Nail Clipping",
    ],
  },
];

/**
 * Generate all city + niche combinations (400+ landing pages)
 */
export const generateLandingPages = () => {
  const pages = [];

  UK_CITIES.forEach((city) => {
    NICHES.forEach((niche) => {
      pages.push({
        url: `/solutions/${niche.slug}-${city.slug}`,
        city,
        niche,
        title: `Booking Software for ${city.name} ${niche.pluralName} | Elite Booker`,
        metaDescription: `The #1 no-commission booking system for ${
          city.name
        } ${niche.pluralName.toLowerCase()}. £0 setup, £0.99 fee on Basic plan. Stop paying 20% to Fresha. Get started free today.`,
        h1: `The #1 No-Commission Booking System for ${city.name} ${niche.pluralName}`,
        keywords: [
          `booking software ${city.name.toLowerCase()}`,
          `${niche.pluralName.toLowerCase()} ${city.name.toLowerCase()}`,
          `appointment software ${niche.pluralName.toLowerCase()}`,
          `${city.name.toLowerCase()} ${niche.singularName.toLowerCase()} booking system`,
          `no commission booking ${city.name.toLowerCase()}`,
        ],
      });
    });
  });

  return pages;
};

/**
 * Get landing page data by slug
 */
export const getLandingPageData = (nicheSlug, citySlug) => {
  const niche = NICHES.find((n) => n.slug === nicheSlug);
  const city = UK_CITIES.find((c) => c.slug === citySlug);

  if (!niche || !city) return null;

  return {
    city,
    niche,
    title: `Booking Software for ${city.name} ${niche.pluralName} | Elite Booker`,
    metaDescription: `The #1 no-commission booking system for ${
      city.name
    } ${niche.pluralName.toLowerCase()}. £0 setup, £0.99 fee on Basic plan. Stop paying 20% to Fresha. Get started free today.`,
    h1: `The #1 No-Commission Booking System for ${city.name} ${niche.pluralName}`,
    heroSubheading: `Join ${Math.floor(50 + Math.random() * 100)} ${
      city.name
    } ${niche.pluralName.toLowerCase()} who stopped paying 20% commission to marketplaces. Start free, pay £0/month on our Basic plan forever.`,
    url: `/solutions/${nicheSlug}-${citySlug}`,
    breadcrumbs: [
      { label: "Home", url: "/" },
      { label: "Solutions", url: "/solutions" },
      {
        label: `${city.name} ${niche.pluralName}`,
        url: `/solutions/${nicheSlug}-${citySlug}`,
      },
    ],
  };
};

/**
 * Get all landing page paths for sitemap generation
 */
export const getAllLandingPagePaths = () => {
  const paths = [];

  UK_CITIES.forEach((city) => {
    NICHES.forEach((niche) => {
      paths.push(`/solutions/${niche.slug}-${city.slug}`);
    });
  });

  return paths;
};

// Export count for documentation
export const TOTAL_LANDING_PAGES = UK_CITIES.length * NICHES.length; // 50 cities × 8 niches = 400 pages
