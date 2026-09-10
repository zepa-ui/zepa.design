"use client"

import Link from "next/link"
import { Bookmark, LayoutGrid, Settings, Shield, User } from "lucide-react"
import { Show, UserButton, useUser } from "@clerk/nextjs"

/**
 * Dashboard 1 of 2 — the avatar popup.
 *
 * `<UserButton>` is the panel that drops from the top-right: Clerk ships the
 * trigger, the popover, account management and sign-out. The links below are
 * injected into that same panel.
 *
 * Deliberately reads Clerk only and never the database, so it opens instantly
 * with nothing to fetch. Counts and lists live on /dashboard (Dashboard 2).
 *
 * `<Show when="…">` is the v7 API — the older `<SignedIn>` / `<SignedOut>`
 * pair still exists but Clerk's own setup guidance now uses Show.
 */
export function HeaderAuth() {
  const { user } = useUser()

  /* Convenience only — this hides a menu entry, it does not protect anything.
     /admin is guarded server-side in its layout, every page and every route
     handler. A client-side role check is never a security boundary. */
  const isAdmin =
    (user?.publicMetadata as { role?: string } | undefined)?.role === "admin"

  return (
    <div className="flex shrink-0 items-center">
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="group flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 transition group-hover:bg-white/15">
            <User className="size-3.5" />
          </span>
          Sign in
        </Link>
      </Show>

      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              // sizing lives in globals.css (.cl-userButtonTrigger) — Clerk's
              // own stylesheet overrides a size-* utility here. This only
              // carries the ring.
              avatarBox: "ring-1 ring-white/25",
              // popover sizing/spacing lives in globals.css — Clerk's runtime
              // stylesheet overrides utility classes on these elements
              userButtonPopoverCard: "rounded-xl",
            },
          }}
          userProfileMode="navigation"
          userProfileUrl="/dashboard/settings"
        >
          <UserButton.MenuItems>
            <UserButton.Link
              label="Dashboard"
              href="/dashboard"
              labelIcon={<LayoutGrid className="size-3.5" />}
            />
            <UserButton.Link
              label="Bookmarks"
              href="/dashboard/bookmarks"
              labelIcon={<Bookmark className="size-3.5" />}
            />
            <UserButton.Link
              label="Settings"
              href="/dashboard/settings"
              labelIcon={<Settings className="size-3.5" />}
            />
            {/* must be `null`, not a Fragment — Clerk validates the children of
                MenuItems and rejects anything that isn't Action or Link, and an
                empty <></> counts as "anything" */}
            {isAdmin ? (
              <UserButton.Link
                label="Admin"
                href="/admin"
                labelIcon={<Shield className="size-3.5" />}
              />
            ) : null}
          </UserButton.MenuItems>
        </UserButton>
      </Show>
    </div>
  )
}
