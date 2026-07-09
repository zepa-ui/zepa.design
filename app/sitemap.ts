import type { MetadataRoute } from "next"

import { getAllSlugs } from "@/lib/registry/helpers"
import { SITE_URL } from "@/lib/site-url"

export default function sitemap(): MetadataRoute.Sitemap {
  const componentSlugs = getAllSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/components`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  const componentRoutes: MetadataRoute.Sitemap = componentSlugs.map((slug) => ({
    url: `${SITE_URL}/components/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...componentRoutes]
}
