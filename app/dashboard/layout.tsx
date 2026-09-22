import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { HeaderAuth } from "@/components/auth/header-auth"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
}

/**
 * Dashboard 2 of 2 — the full page.
 *
 * `auth.protect()` here rather than relying on proxy.ts alone. The CLI's
 * generated proxy leaves routes public by default (which is what Part 7 wants
 * for the gallery), so protection is explicit and local to the thing being
 * protected. That is also more robust: a route added later can't accidentally
 * inherit the wrong default.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await auth.protect()

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-5 px-4 py-4 lg:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/zzepa.png"
              alt="Zepa UI"
              className="h-7 w-auto max-w-[110px] object-contain"
            />
          </Link>

          <Link
            href="/components"
            className="text-sm text-white/50 transition hover:text-white"
          >
            Browse components
          </Link>

          <div className="ml-auto">
            <HeaderAuth />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1400px] gap-10 px-4 py-8 lg:flex lg:px-5">
        <DashboardNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
