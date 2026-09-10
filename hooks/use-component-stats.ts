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

/**
 * View throttle — backend.md Part 7b.
 *
 * Views are event-based (four opens = four views), but "open" has to mean a
 * person. A public gallery is crawled constantly, and holding F5 would
 * otherwise inflate any number you like. Two cheap defences:
 *
 *  1. fire from a client effect after a delay — crawlers rarely execute it,
 *     and a bounce or a prefetch never reaches the timer
 *  2. throttle per slug per session, so refresh spam collapses while a genuine
 *     revisit later still counts
 */
const VIEW_DELAY_MS = 2500
const VIEW_THROTTLE_MS = 30 * 60 * 1000

function viewThrottleKey(slug: string) {
  return `zepa:viewed:${slug}`
}

function shouldCountView(slug: string) {
  if (typeof window === "undefined") return false
  try {
    const last = Number(sessionStorage.getItem(viewThrottleKey(slug)) ?? 0)
    return Date.now() - last > VIEW_THROTTLE_MS
  } catch {
    // private mode / storage disabled — counting once is better than never
    return true
  }
}

function markViewCounted(slug: string) {
  try {
    sessionStorage.setItem(viewThrottleKey(slug), String(Date.now()))
  } catch {
    // ignore — the throttle is an optimisation, not a correctness requirement
  }
}

interface UseComponentStatsOptions {
  /**
   * Record a view for this component. Throttled per session — see the
   * constants above. Replaces the old `trackViewOnReload`, which only counted
   * full browser refreshes and so missed every client-side navigation.
   */
  trackView?: boolean
}

export function useComponentStats(
  slug: string,
  initialStats: ComponentStats,
  options?: UseComponentStatsOptions
) {
  const trackView = options?.trackView ?? false
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

  useEffect(() => {
    let cancelled = false

    // setState has to sit inside the async callback, not the effect body —
    // react-hooks/set-state-in-effect flags the direct call
    async function load() {
      try {
        const response = await fetch(`/api/stats/${slug}`)
        if (!response.ok || cancelled) return
        setStats((await response.json()) as ComponentStats)
      } catch {
        // keep the server-rendered initial stats
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!trackView || viewRecorded.current) return
    if (!shouldCountView(slug)) return

    // the delay is the point: a bounce or a prefetch never reaches it
    const timer = window.setTimeout(async () => {
      viewRecorded.current = true
      markViewCounted(slug)

      try {
        const response = await fetch(`/api/view/${slug}`, { method: "POST" })
        if (response.ok) {
          setStats((await response.json()) as ComponentStats)
        }
      } catch {
        // a dropped view is not worth surfacing to the user
      }
    }, VIEW_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [slug, trackView])

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
