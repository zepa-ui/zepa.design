import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <img
        src="/zzepa.png"
        alt="Zepa UI"
        className="mb-10 h-9 w-auto object-contain"
      />

      <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
        404
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
        The page you&apos;re looking for was moved, renamed, or never shipped.
        The components are still where you left them.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/components"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Browse components
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}
