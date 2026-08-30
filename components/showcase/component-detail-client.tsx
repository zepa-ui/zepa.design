"use client"

import { useComponentStats } from "@/hooks/use-component-stats"

import { ComponentDetail } from "./component-detail"
import type { ComponentDetailProps } from "./component-detail"
import type { ComponentStats } from "@/lib/stats/types"

type ComponentDetailClientProps = Omit<ComponentDetailProps, "onInstallCopy"> & {
  initialStats: ComponentStats
}

export function ComponentDetailClient({
  slug,
  initialStats,
  ...props
}: ComponentDetailClientProps) {
  const { recordInstall } = useComponentStats(slug, initialStats, {
    trackView: true,
  })

  return (
    <ComponentDetail
      slug={slug}
      onInstallCopy={recordInstall}
      {...props}
    />
  )
}
