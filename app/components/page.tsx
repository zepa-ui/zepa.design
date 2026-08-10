"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { registry } from "@/content/registry"
import { featuredSlugs } from "@/content/featured"
import { formatCategory } from "@/lib/format-category"

import { MobileSidebar } from "@/components/sidebar/mobile-sidebar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { ShowcaseGrid } from "@/components/showcase/showcase-grid"

// Pseudo-category — not a registry category, only used for the sidebar
// entry and to switch `filteredItems` over to `featuredSlugs`. The label
// shown in the UI is derived from this string by `formatCategory`.
const FEATURED_CATEGORY = "featured-components"

// Explicit sidebar order. Anything present in the registry but missing
// from this list is appended alphabetically, so adding a new category
// folder can never make it silently disappear from the sidebar.
const CATEGORY_ORDER = [
  "hero-sections",
  "unicorn-section",
  "grid-sections",
  "navbar-sections",
  "interactive-illustrations",
]

export default function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState(FEATURED_CATEGORY)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const categories = useMemo(() => {
    // widened to string: registry categories are a narrowed union, which
    // would otherwise reject the plain strings in CATEGORY_ORDER
    const present = new Set<string>(registry.map((item) => item.category))
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c))
    const rest = [...present]
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .sort()
    return [FEATURED_CATEGORY, ...ordered, ...rest]
  }, [])

  // Components per category — derived from the registry, so it updates
  // automatically after `npm run build:registry`. Featured intentionally
  // has no count.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of registry) {
      counts[item.category] = (counts[item.category] ?? 0) + 1
    }
    return counts
  }, [])

  const filteredItems =
    activeCategory === FEATURED_CATEGORY
      ? featuredSlugs
          .map((slug) => registry.find((item) => item.slug === slug))
          .filter((item) => item !== undefined)
      : registry.filter((item) => item.category === activeCategory)

  return (
    <main className="flex min-h-screen bg-black text-white">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        counts={categoryCounts}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        counts={categoryCounts}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open categories menu"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <Menu className="size-5" />
          </button>

          <p className="text-xs font-medium uppercase tracking-wider text-white/50">
            {formatCategory(activeCategory)}
          </p>

          <Link
            href="/"
            className="flex items-center rounded-lg p-1 transition hover:bg-white/5"
          >
            <img
              src="/zzepa.png"
              alt="Zepa UI"
              className="h-7 w-auto max-w-[100px] object-contain"
            />
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <ShowcaseGrid items={filteredItems} />
        </div>
      </div>
    </main>
  )
}
