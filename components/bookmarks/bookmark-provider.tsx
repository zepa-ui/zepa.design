"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { useAuth } from "@clerk/nextjs"

interface BookmarkContextValue {
  /** slugs the signed-in user has saved. Readonly — mutate via `toggle`. */
  bookmarks: ReadonlySet<string>
  /** false until the initial fetch settles, so buttons can avoid a wrong flash */
  isLoaded: boolean
  isSignedIn: boolean
  isPending: (slug: string) => boolean
  toggle: (slug: string) => void
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

/**
 * Holds the user's bookmark set for the whole page.
 *
 * The alternative — each card asking the server whether it is bookmarked — is
 * one request per card, so ~40 on the gallery, for data that fits in a single
 * small array. One fetch on mount, shared by every button.
 *
 * Writes are optimistic: the icon fills on click and rolls back if the request
 * fails, because a save that feels instant is the whole point of the control.
 */
/** stable identity, so deriving the signed-out value never retriggers renders */
const EMPTY: ReadonlySet<string> = new Set()

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded: authLoaded, userId } = useAuth()

  /**
   * Stamped with the userId it belongs to. Signing out and back in as someone
   * else would otherwise briefly show the previous account's bookmarks — the
   * stamp makes stale data structurally unusable rather than merely unlikely.
   */
  const [loaded, setLoaded] = useState<{
    userId: string
    slugs: Set<string>
  } | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const isCurrent = Boolean(userId) && loaded?.userId === userId
  // derived, not stored — setState inside an effect body trips
  // react-hooks/set-state-in-effect and causes an extra render pass
  const bookmarks = isSignedIn && isCurrent ? loaded!.slugs : EMPTY
  const isLoaded = authLoaded && (!isSignedIn || isCurrent)

  /**
   * The last state the user asked for, per slug. Rapid clicking produces
   * overlapping requests, and the network can deliver them out of order — so
   * responses are only trusted if they match what the user most recently
   * wanted. This is why the API takes a desired state rather than "toggle".
   */
  const desired = useRef(new Map<string, boolean>())

  useEffect(() => {
    // signed-out needs no fetch at all — `bookmarks` derives to EMPTY
    if (!authLoaded || !isSignedIn || !userId) return
    if (loaded?.userId === userId) return

    let cancelled = false
    fetch("/api/bookmarks")
      .then((r) => (r.ok ? r.json() : { slugs: [] }))
      .then((data: { slugs?: string[] }) => {
        if (!cancelled) setLoaded({ userId, slugs: new Set(data.slugs ?? []) })
      })
      .catch(() => {
        // an empty set is the safe default: buttons render unsaved and a click
        // still writes through, rather than the control staying invisible
        if (!cancelled) setLoaded({ userId, slugs: new Set() })
      })

    return () => {
      cancelled = true
    }
  }, [authLoaded, isSignedIn, userId, loaded?.userId])

  const apply = useCallback((slug: string, on: boolean) => {
    setLoaded((prev) => {
      if (!prev) return prev
      const slugs = new Set(prev.slugs)
      if (on) slugs.add(slug)
      else slugs.delete(slug)
      return { ...prev, slugs }
    })
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      const next = !(desired.current.get(slug) ?? bookmarks.has(slug))
      desired.current.set(slug, next)

      apply(slug, next) // optimistic
      setPending((prev) => new Set(prev).add(slug))

      fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, bookmarked: next }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status))
        })
        .catch(() => {
          // only roll back if the user hasn't since asked for something else
          if (desired.current.get(slug) !== next) return
          apply(slug, !next)
        })
        .finally(() => {
          if (desired.current.get(slug) === next) desired.current.delete(slug)
          setPending((prev) => {
            const copy = new Set(prev)
            copy.delete(slug)
            return copy
          })
        })
    },
    [bookmarks, apply]
  )

  const isPending = useCallback((slug: string) => pending.has(slug), [pending])

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        isPending,
        toggle,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

/** Returns null when no provider is mounted, so buttons can degrade to hidden. */
export function useBookmarks() {
  return useContext(BookmarkContext)
}
