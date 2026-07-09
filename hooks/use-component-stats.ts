"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

import type { ComponentStats } from "@/lib/stats/types"

function likeSessionKey(slug: string) {
  return `zepa:liked:${slug}`
}

function readLikedFromSession(slug: string) {
  if (typeof window === "undefined") {
    return false
  }
  return sessionStorage.getItem(likeSessionKey(slug)) === "1"
}

const likedListeners = new Set<() => void>()

function subscribeLiked(onStoreChange: () => void) {
  likedListeners.add(onStoreChange)
  return () => {
    likedListeners.delete(onStoreChange)
  }
}

function emitLikedChange() {
  likedListeners.forEach((listener) => listener())
}

function isPageReload() {
  if (typeof window === "undefined") {
    return false
  }

  const entry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined

  return entry?.type === "reload"
}

interface UseComponentStatsOptions {
  /** Count a view only on full browser refresh (not client navigation). */
  trackViewOnReload?: boolean
}

export function useComponentStats(
  slug: string,
  initialStats: ComponentStats,
  options?: UseComponentStatsOptions
) {
  const trackViewOnReload = options?.trackViewOnReload ?? false
  const [stats, setStats] = useState<ComponentStats>(initialStats)
  const [liking, setLiking] = useState(false)
  const viewRecorded = useRef(false)

  const getLikedSnapshot = useCallback(
    () => readLikedFromSession(slug),
    [slug]
  )

  const liked = useSyncExternalStore(
    subscribeLiked,
    getLikedSnapshot,
    () => false
  )

  const refreshStats = useCallback(async () => {
    const response = await fetch(`/api/stats/${slug}`)
    if (!response.ok) return
    setStats((await response.json()) as ComponentStats)
  }, [slug])

  useEffect(() => {
    async function load() {
      await refreshStats()

      if (!trackViewOnReload || !isPageReload() || viewRecorded.current) {
        return
      }

      viewRecorded.current = true
      const response = await fetch(`/api/view/${slug}`, { method: "POST" })
      if (response.ok) {
        setStats((await response.json()) as ComponentStats)
      }
    }

    void load()
  }, [slug, trackViewOnReload, refreshStats])

  const like = useCallback(async () => {
    if (liked) {
      return
    }

    setLiking(true)
    try {
      const response = await fetch(`/api/like/${slug}`, { method: "POST" })
      if (response.ok) {
        setStats((await response.json()) as ComponentStats)
        sessionStorage.setItem(likeSessionKey(slug), "1")
        emitLikedChange()
      }
    } finally {
      setLiking(false)
    }
  }, [slug, liked])

  const recordInstall = useCallback(async () => {
    // Fire GA4 event so we can track install copies in analytics
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "install_copy", {
        component_slug: slug,
        event_category: "engagement",
      })
    }

    const response = await fetch(`/api/install/${slug}`, { method: "POST" })
    if (response.ok) {
      setStats((await response.json()) as ComponentStats)
    }
  }, [slug])

  return {
    stats,
    liking,
    liked,
    like,
    recordInstall,
  }
}
