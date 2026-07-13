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

const FEATURED_CATEGORY = "featured-section"

export default function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState(FEATURED_CATEGORY)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const categories = useMemo(() => {
    return [FEATURED_CATEGORY, ...new Set(registry.map((item) => item.category))]
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
