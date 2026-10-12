import { NextResponse } from "next/server"

import { getRegistryItem } from "@/lib/registry/helpers"
import { bumpCounter, getStats as getStatsRow } from "@/lib/db/queries"
import { getMetaStats } from "@/lib/stats/meta-seeds"
import type { ComponentStats } from "@/lib/stats/types"

/**
 * Counters now live in Neon, not `data/component-stats.json`.
 *
 * The old file store wrote to a serverless container's throwaway filesystem, so
 * every view, like and install recorded in production was silently discarded —
 * its own catch block admitted as much. See backend.md Part 5.
 *
 * Route signatures are unchanged, so nothing above this file had to move.
 */

export function statsJson(stats: ComponentStats) {
  return NextResponse.json(stats)
}

export async function assertRegistrySlug(slug: string) {
  if (!getRegistryItem(slug)) {
    return NextResponse.json({ error: "Component not found" }, { status: 404 })
  }
  return null
}

/**
 * Public read: the stored count, floored at the component's launch seed.
 *
 * The floor is display-only and deliberate — it keeps the numbers already shown
 * on the site from dropping to zero now that the source of truth has changed.
 * Admin analytics reads the raw rows instead, so the real figures stay visible
 * where they matter.
 */
async function readStats(slug: string): Promise<ComponentStats> {
  const [row, seed] = [await getStatsRow(slug), getMetaStats(slug)]

  return {
    views: Math.max(row?.views ?? 0, seed.views),
    likes: Math.max(row?.likes ?? 0, seed.likes),
    installs: Math.max(row?.installs ?? 0, seed.installs),
  }
}

export async function handleGetStats(slug: string) {
  const notFound = await assertRegistrySlug(slug)
  if (notFound) return notFound
  return statsJson(await readStats(slug))
}

export async function handleIncrement(
  slug: string,
  field: keyof ComponentStats
) {
  const notFound = await assertRegistrySlug(slug)
  if (notFound) return notFound

  // upsert, not update — a brand-new component has no row yet and a plain
  // UPDATE would silently affect nothing (or throw, depending on the client)
  await bumpCounter(slug, field, 1)
  return statsJson(await readStats(slug))
}
