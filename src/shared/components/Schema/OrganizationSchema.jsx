/**
 * Organization Schema Component
 * Site-wide schema for Elite Booker
 */

import { Helmet } from "react-helmet-async";

export default function OrganizationSchema() {
  const currentYear = new Date().getUTCFullYear();
  const priceValidUntil = `${currentYear + 1}-12-31`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Elite Booker",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Appointment Scheduling Software",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "GBP",
      priceValidUntil,
      availability: "https://schema.org/InStock",
      url: "https://www.elitebooker.co.uk/pricing",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "587",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: "Elite Booker Ltd",
      url: "https://www.elitebooker.co.uk",
      logo: "https://www.elitebooker.co.uk/android-chrome-512x512.png",
      sameAs: [
        "https://www.facebook.com/elitebookeruk",
        "https://www.instagram.com/elitebookeruk",
        "https://www.linkedin.com/company/elitebooker",
        "https://twitter.com/elitebookeruk",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+44-20-3769-0000",
        contactType: "Customer Service",
        areaServed: "GB",
        availableLanguage: ["English"],
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "20 Eastbourne Terrace",
        addressLocality: "London",
        addressRegion: "Greater London",
        postalCode: "W2 6LG",
        addressCountry: "GB",
      },
    },
    description:
      "Elite Booker is the UK's leading online booking and appointment management software for salons, spas, and beauty professionals. Features include automated SMS reminders, deposit protection, client management, and integrated payments with zero commission fees.",
    featureList: [
      "Online Booking Widget",
      "Automated SMS Reminders",
      "Deposit & No-Show Protection",
      "Client Database & CRM",
      "Google Calendar Sync",
      "Point of Sale System",
      "Gift Cards",
      "Multi-Staff Scheduling",
      "Business Reporting",
      "GDPR Compliant",
    ],
    softwareVersion: "2.0",
    datePublished: "2024-01-15",
    dateModified: "2026-02-01",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
