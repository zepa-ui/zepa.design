"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Lock } from "lucide-react"

/**
 * Blur gate over install commands and source code for signed-out visitors.
 *
 * Per backend.md Part 7 the component page itself stays public and indexable —
 * only the *actions* are gated. This is the visual half of that: the code is
 * visible enough to want, not enough to use.
 *
 * ── WHAT THIS IS AND ISN'T ──
 * A CSS blur is friction, not enforcement. The markup is still in the page, so
 * View Source or devtools defeats it, and the same source sits in the public
 * GitHub repo anyway. It exists to convert at the moment of intent, which is
 * what it's good at. Do not build entitlement on it — real gating means not
 * sending the code until `auth()` says yes, which would cost the static
 * generation these pages currently enjoy.
 */
export function CodeGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  // Render children untouched while auth resolves and once signed in — no
  // flash of a lock for people who are already logged in.
  if (!isLoaded || isSignedIn) return <>{children}</>

  const goToSignIn = () => {
    const path =
      typeof window !== "undefined" ? window.location.pathname : "/components"
    router.push(`/sign-in?redirect_url=${encodeURIComponent(path)}`)
  }

  return (
    <div className="relative">
      {/* inert underneath: blurred, unselectable, and out of the tab order so
          keyboard users can't land inside a locked block */}
      <div
        aria-hidden
        inert
        className="pointer-events-none select-none blur-[5px] saturate-50"
      >
        {children}
      </div>

      {/* the gate itself — one click target over the whole block, so clicking
          a blurred "Copy command" lands here and opens sign-in */}
      <button
        type="button"
        onClick={goToSignIn}
        className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg bg-black/55 backdrop-blur-[2px] transition hover:bg-black/45"
      >
        <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.07]">
          <Lock className="size-4 text-white/80" />
        </span>
        <span className="text-sm font-medium text-white">
          Sign up to get the code
        </span>
        <span className="text-xs text-white/50">
          Free — takes a few seconds
        </span>
      </button>
    </div>
  )
}
