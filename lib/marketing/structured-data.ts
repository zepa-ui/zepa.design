/**
 * Marketing / SEO — structured data (JSON-LD) builders.
 *
 * Everything Google-entity related lives in lib/marketing/ so it's one
 * place, not scattered. These schemas teach Google what "Zepa UI" IS —
 * the entity-disambiguation fix for ranking against ZEPA port alliance /
 * Zeppa studio / Zepdash.
 *
 * Rendered via <JsonLd /> (./json-ld.tsx) in app/layout.tsx.
 */

import { SITE_URL } from "@/lib/site-url"
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo"

const LOGO_URL =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"

/** The product: Zepa UI is a free developer tool that runs on the web. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    alternateName: ["Zepa", "zepa.design", "Zepa UI components"],
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Person",
      name: "Sameer Shaik",
    },
    keywords:
      "react components, ui library, hero sections, next.js components, tailwind components, webgl components, shadcn registry",
  }
}

/** The entity that owns zepa.design. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Zepa",
    url: SITE_URL,
    logo: LOGO_URL,
    description:
      "Zepa UI is an open-source React component library — curated hero sections, WebGL scenes, and copy-paste components for Next.js and Tailwind.",
    founder: {
      "@type": "Person",
      name: "Sameer Shaik",
    },
  }
}

/** The website itself — site name Google should display in results. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "zepa.design",
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}
