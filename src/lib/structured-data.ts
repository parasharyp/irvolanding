export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Irvo",
    url: "https://irvo.co.uk",
    description:
      "AI Act compliance documentation platform for EU and UK SMEs",
    foundingDate: "2026",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@irvo.co.uk",
      contactType: "sales",
    },
  };
}

export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Irvo",
    url: "https://irvo.co.uk",
    description:
      "EU AI Act compliance SaaS — risk classification, obligations mapping, and evidence pack generation for SMEs",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://irvo.co.uk/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Irvo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI-powered EU AI Act compliance platform that generates risk classifications, obligations maps, and regulator-ready evidence packs for SMEs",
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        priceCurrency: "GBP",
        price: "149",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "149",
          priceCurrency: "GBP",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Growth",
        priceCurrency: "GBP",
        price: "399",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "399",
          priceCurrency: "GBP",
          unitText: "MONTH",
        },
      },
      {
        "@type": "Offer",
        name: "Plus",
        priceCurrency: "GBP",
        price: "799",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "799",
          priceCurrency: "GBP",
          unitText: "MONTH",
        },
      },
    ],
  };
}

export function getFAQSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
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
