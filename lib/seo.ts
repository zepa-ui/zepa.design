import type { Metadata } from "next"

import { SITE_URL } from "@/lib/site-url"

export const SITE_NAME = "Zepa UI"
export const SITE_TAGLINE = "UI Components"
export const DEFAULT_TITLE = `${SITE_NAME} - ${SITE_TAGLINE}`
export const DEFAULT_DESCRIPTION =
  "Copy-paste React UI components for modern landing pages. Hero sections, animations, and shadcn-ready blocks — built for Next.js, Tailwind, and teams who ship fast."

/** Core SEO keywords for UI / React component discovery */
export const SEO_KEYWORDS = [
  "zepa ui",
  "zepa design",
  "ui library",
  "ui component",
  "ui components",
  "react library",
  "react ui library",
  "component library",
  "react component library",
  "react components",
  "next.js components",
  "nextjs ui",
  "shadcn ui",
  "shadcn components",
  "tailwind ui",
  "tailwind components",
  "hero section",
  "hero sections",
  "landing page components",
  "framer motion components",
  "webgl components",
  "three.js components",
  "design system",
  "open source ui",
  "copy paste components",
  "animated ui components",
  "frontend components",
] as const

/** Geographic targeting meta (rendered as custom meta tags) */
export const GEO_TAGS = {
  "geo.region": "US",
  "geo.placename": "United States",
  "geo.position": "38.9072;-77.0369",
  ICBM: "38.9072, -77.0369",
  language: "English",
  "content-language": "en-US",
} as const

/** Default OG card — zepa logo on a black 1200×630 canvas (Cloudinary pad). */
const OG_IMAGE = {
  url: "https://res.cloudinary.com/dakrfj1oh/image/upload/w_1200,h_630,c_pad,b_rgb:000000/v1781973374/zzepa_fur8kl.png",
  width: 1200,
  height: 630,
  alt: "Zepa UI — React component library",
} as const

type OgImage = {
  url: string
  width: number
  height: number
  alt: string
}

type BuildMetadataOptions = {
  title?: string
  description?: string
  keywords?: string[]
  path?: string
  /** Override the OG/Twitter preview image (1200×630). */
  image?: OgImage
  /** Optional og:video URL (mp4) — plays inline on Discord and other platforms that support it. */
  video?: string
}

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [...SEO_KEYWORDS],
  path = "",
  image = OG_IMAGE,
  video,
}: BuildMetadataOptions = {}): Metadata {
  const pageTitle = title ?? DEFAULT_TITLE
  const canonical = `${SITE_URL}${path}`

  return {
    title: pageTitle,
    description,
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: "Zepa", url: SITE_URL }],
    creator: "Zepa",
    publisher: "Zepa",
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [image],
      ...(video
        ? {
            videos: [
              {
                url: video,
                type: "video/mp4",
                width: 1200,
                height: 630,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image.url],
    },
    other: { ...GEO_TAGS },
  }
}

export function buildComponentKeywords(tags: readonly string[]): string[] {
  const componentTerms = [
    ...tags,
    "react component",
    "ui component",
    "zepa ui",
    "copy paste component",
    "shadcn component",
  ]

  return [...new Set([...componentTerms, ...SEO_KEYWORDS])]
}
