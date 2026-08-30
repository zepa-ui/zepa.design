import type { Metadata } from "next"
import Link from "next/link"

import { requireAdmin } from "@/lib/auth/admin"
import { AdminNav } from "@/components/admin/admin-nav"
import { HeaderAuth } from "@/components/auth/header-auth"

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
}

/**
 * Layer one of three. Every admin page re-checks, and so does every admin
 * route handler — because a route added later that forgets to check would
 * otherwise inherit nothing. Middleware alone is never the guard.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-5 px-4 py-2 lg:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/zzepa.png"
              alt="Zepa UI"
              className="h-7 w-auto max-w-[110px] object-contain"
            />
          </Link>

          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            Admin
          </span>

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

      <div className="mx-auto w-full max-w-[1500px] gap-10 px-4 py-8 lg:flex lg:px-5">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
