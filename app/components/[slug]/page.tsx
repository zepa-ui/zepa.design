import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComponentDetailClient } from "@/components/showcase/component-detail-client"
import { getComponentCode } from "@/lib/registry/code"
import { highlightCodeFiles } from "@/lib/registry/highlight"
import { getAllSlugs, getRegistryItem } from "@/lib/registry/helpers"
import { buildComponentKeywords, buildMetadata } from "@/lib/seo"
import { getMetaStats } from "@/lib/stats/meta-seeds"

interface ComponentDetailPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: ComponentDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const item = getRegistryItem(slug)

  if (!item) {
    return { title: "Component" }
  }

  return buildMetadata({
    title: item.title,
    description: item.description,
    keywords: buildComponentKeywords(item.tags),
    path: `/components/${slug}`,
  })
}

export default async function ComponentDetailPage({
  params,
}: ComponentDetailPageProps) {
  const { slug } = await params
  const item = getRegistryItem(slug)

  if (!item) {
    notFound()
  }

  const rawCode = await getComponentCode(slug)
  const code = await highlightCodeFiles(rawCode)

  return (
    <ComponentDetailClient
      slug={slug}
      title={item.title}
      description={item.description}
      github={item.github}
      dependencies={[...item.dependencies]}
      code={code}
      initialStats={getMetaStats(slug)}
    />
  )
}
