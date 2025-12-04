/**
 * Schema Markup Generator
 * Creates JSON-LD structured data for different types of content
 */

const baseUrl = "https://www.nobleelegance.co.uk";
const businessName = "Noble Elegance Beauty Salon";

/**
 * Generate LocalBusiness & BeautySalon Schema
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "MedicalClinic", "LocalBusiness"],
    name: businessName,
    description:
      "Noble Elegance is a premier aesthetic clinic and beauty salon in Wisbech, Cambridgeshire, offering expert cosmetic treatments and professional beauty services. We specialize in lip fillers, anti-wrinkle injections, dermal fillers, skin boosters, and permanent makeup for lips and brows. Our services include laser tattoo removal, laser teeth whitening, professional facial treatments, brow lamination, hair extensions, cutting, coloring, styling, and full body waxing. Located at 12 Blackfriars Rd, PE13 1AT, we serve clients from Wisbech, March, King's Lynn, Peterborough, Downham Market, and surrounding Cambridgeshire areas. Open 7 days a week, 9am-5pm. Expert aestheticians committed to enhancing your natural beauty with premium treatments.",
    image: `${baseUrl}/src/assets/logo.svg`,
    "@id": baseUrl,
    url: baseUrl,
    telephone: "+447928775746",
    priceRange: "££-£££",
    medicalSpecialty: [
      "Aesthetic Medicine",
      "Dermatology",
      "Cosmetic Procedures",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "12 Blackfriars Rd",
      addressLocality: "Wisbech",
      addressRegion: "Cambridgeshire",
      postalCode: "PE13 1AT",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 52.6667,
      longitude: 0.1601,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    sameAs: [
      // TODO: Add social media profiles
      // "https://www.facebook.com/nobleelegance",
      // "https://www.instagram.com/nobleelegance",
    ],
    paymentAccepted: "Cash, Credit Card, Debit Card",
    areaServed: [
      {
        "@type": "City",
        name: "Wisbech",
      },
      {
        "@type": "City",
        name: "March",
      },
      {
        "@type": "City",
        name: "King's Lynn",
      },
      {
        "@type": "City",
        name: "Peterborough",
      },
      {
        "@type": "City",
        name: "Downham Market",
      },
      {
        "@type": "City",
        name: "Chatteris",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Beauty and Aesthetic Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Permanent Makeup",
            description: "Expert permanent makeup for brows and lips",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Lip Fillers",
            description: "Russian and Classic lip filler techniques",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Anti-Wrinkle Injections",
            description: "Professional anti-wrinkle treatments",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Dermal Fillers",
            description: "Cheek, chin and facial contouring",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Skin Boosters",
            description: "Advanced skin hydration treatments",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Laser Treatments",
            description: "Laser tattoo removal and teeth whitening",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Facial Treatments",
            description:
              "Professional facial cleansing, peels and rejuvenation",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Brow Lamination",
            description: "Eyebrow shaping and lamination services",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hair Extensions",
            description: "Professional hair extension application and removal",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Hair Services",
            description: "Cutting, coloring, styling and treatments",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Waxing Services",
            description: "Full body waxing treatments",
          },
        },
      ],
    },
  };
}

/**
 * Generate Service Schema
 */
export function generateServiceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name || "Beauty Service",
    provider: {
      "@type": "BeautySalon",
      name: businessName,
      url: baseUrl,
    },
    description: service.description,
    areaServed: {
      "@type": "City",
      name: "Wisbech",
      containedIn: {
        "@type": "AdministrativeArea",
        name: "Cambridgeshire",
      },
    },
    ...(service.price && {
      offers: {
        "@type": "Offer",
        price: service.price,
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
    }),
  };
}

/**
 * Generate Product Schema
 */
export function generateProductSchema(product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images?.[0] || "",
    brand: {
      "@type": "Brand",
      name: product.brand || businessName,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "GBP",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: businessName,
      },
    },
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url ? `${baseUrl}${crumb.url}` : undefined,
    })),
  };
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: businessName,
    url: baseUrl,
    logo: `${baseUrl}/src/assets/logo.svg`,
    description:
      "Leading aesthetic clinic and beauty salon in Wisbech offering professional beauty treatments, cosmetic injectables, permanent makeup, and premium beauty products.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "12 Blackfriars Rd",
      addressLocality: "Wisbech",
      addressRegion: "Cambridgeshire",
      postalCode: "PE13 1AT",
      addressCountry: "GB",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+447928775746",
      contactType: "customer service",
      areaServed: "GB",
      availableLanguage: ["English"],
    },
  };
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate WebSite Schema with Search Action
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: businessName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate BlogPosting Schema
 */
export function generateBlogPostSchema({
  title,
  description,
  content,
  author,
  publishedDate,
  modifiedDate,
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    articleBody: content?.replace(/<[^>]*>/g, ""), // Strip HTML tags
    author: {
      "@type": "Person",
      name: author || businessName,
    },
    publisher: {
      "@type": "Organization",
      name: businessName,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/src/assets/logo.svg`,
      },
    },
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": baseUrl,
    },
  };
}

export default {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  generateWebSiteSchema,
  generateBlogPostSchema,
};
