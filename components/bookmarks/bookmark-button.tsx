"use client"

import { useRouter } from "next/navigation"
import { Bookmark } from "lucide-react"

import { useBookmarks } from "./bookmark-provider"

interface BookmarkButtonProps {
  slug: string
  /**
   * "overlay"  — on a preview card; hidden until the card is hovered
   * "inline"   — bordered button, e.g. beside a page title
   * "toolbar"  — bare icon matching DemoToolbar's other controls
   */
  variant?: "overlay" | "inline" | "toolbar"
  className?: string
}

/**
 * Outline bookmark → solid when saved.
 *
 * Same lucide glyph in both states, switched with `fill`, so the two icons are
 * pixel-identical in shape and only the ink changes. Two separate SVGs would
 * drift apart the moment either is edited.
 *
 * Per backend.md Part 7 this is a gated action: signed-out users get sent to
 * sign-in rather than the control being hidden. Hiding it would mean the
 * feature is invisible to exactly the people who need a reason to sign up.
 */
export function BookmarkButton({
  slug,
  variant = "overlay",
  className = "",
}: BookmarkButtonProps) {
  const ctx = useBookmarks()
  const router = useRouter()

  // no provider mounted — render nothing rather than a dead control
  if (!ctx) return null

  const { bookmarks, isLoaded, isSignedIn, isPending, toggle } = ctx
  const saved = bookmarks.has(slug)
  const busy = isPending(slug)

  const handleClick = (event: React.MouseEvent) => {
    // the card is a link; don't navigate when the button is hit
    event.preventDefault()
    event.stopPropagation()

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    toggle(slug)
  }

  /* No background plate — the icon sits directly on the media with a drop
     shadow for legibility, which reads cleaner than a black pill.
     Hidden until the card is hovered, EXCEPT when saved: a bookmark you
     can't see until you hover isn't much of a bookmark. */
  const visibility =
    variant === "overlay"
      ? saved
        ? "opacity-100"
        : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      : "opacity-100"

  const base = {
    overlay:
      "absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-md text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] transition hover:text-white",
    inline:
      "flex size-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/30 hover:text-white",
    toolbar:
      "flex size-8 items-center justify-center rounded-md text-white/45 transition hover:bg-white/10 hover:text-white",
  }[variant]

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${slug} from bookmarks` : `Bookmark ${slug}`}
      title={saved ? "Saved" : "Save"}
      className={`${base} ${visibility} ${
        // hold back until the set has loaded, so a saved item never flashes
        // empty on first paint
        isLoaded ? "" : "!opacity-0"
      } ${busy ? "cursor-wait" : ""} ${className}`}
    >
      <Bookmark
        className={`size-4 transition-transform duration-200 ${
          saved ? "scale-110" : "scale-100"
        }`}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={saved ? 1.5 : 2}
      />
    </button>
  )
}
