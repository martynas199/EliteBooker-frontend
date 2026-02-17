const SITE_URL = "https://www.elitebooker.co.uk";

export function buildOrganizationSchema({
  name = "Elite Booker",
  url = SITE_URL,
  logo = `${SITE_URL}/android-chrome-512x512.png`,
  sameAs = [],
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    sameAs,
  };
}

export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildSoftwareApplicationSchema({
  name = "Elite Booker",
  url = SITE_URL,
  description,
  applicationCategory = "BusinessApplication",
  operatingSystem = "Web, iOS, Android",
  price = "0",
  priceCurrency = "GBP",
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    url,
    description,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
    },
  };
}

export function buildFaqSchema(faqItems = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  authorName = "Elite Booker",
  url,
  image,
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: authorName,
    },
    mainEntityOfPage: url,
    image,
  };
}
