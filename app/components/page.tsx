"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { registry } from "@/content/registry"
import { featuredSlugs } from "@/content/featured"

import { HeaderAuth } from "@/components/auth/header-auth"
import { CategoryChips } from "@/components/showcase/category-chips"
import { HeaderSearch } from "@/components/showcase/header-search"
import { MobileCategoryMenu } from "@/components/showcase/mobile-category-menu"
import { ShowcaseGrid } from "@/components/showcase/showcase-grid"

// Pseudo-category — not a registry category, only used for the chip row
// and to switch `filteredItems` over to `featuredSlugs`. The label shown
// in the UI is derived from this string by `formatCategory`.
const FEATURED_CATEGORY = "featured-components"

// Explicit chip order. Anything present in the registry but missing from
// this list is appended alphabetically, so adding a new category folder
// can never make it silently disappear.
const CATEGORY_ORDER = [
  "hero-sections",
  "unicorn-section",
  "grid-sections",
  "navbar-sections",
  "interactive-illustrations",
  "animations",
]

export default function ComponentsPage() {
  const [activeCategory, setActiveCategory] = useState(FEATURED_CATEGORY)

  const categories = useMemo(() => {
    // widened to string: registry categories are a narrowed union, which
    // would otherwise reject the plain strings in CATEGORY_ORDER
    const present = new Set<string>(registry.map((item) => item.category))
    const ordered = CATEGORY_ORDER.filter((c) => present.has(c))
    const rest = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort()
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
    <main className="min-h-screen bg-black text-white">
      {/* the chip row pins so switching category never means scrolling
          back to the top of a long grid */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/85 backdrop-blur-md">
        {/* logo, chips and Docs all share one row; the chip strip takes the
            slack and scrolls horizontally when it runs out of space */}
        {/* tight vertical padding — the 44px avatar already sets the row
            height, so py-4 was adding dead space above and below it */}
        {/* Mobile is a different layout, not a squeezed one: hamburger, centred
            logo, auth. The chip strip and search pill are desktop-only — a
            horizontal scroller is a poor way to reach the seventh section on a
            phone, and the search pill has nowhere to go. */}
        <div className="mx-auto flex w-full max-w-[2000px] items-center gap-3 px-4 py-2 lg:gap-5 lg:px-5">
          <MobileCategoryMenu
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            counts={categoryCounts}
          />

          {/* centred on mobile via flex-1 either side; static on desktop */}
          <Link
            href="/"
            className="flex flex-1 shrink-0 items-center justify-center lg:flex-none lg:justify-start"
          >
            <img
              src="/zzepa.png"
              alt="Zepa UI"
              className="h-7 w-auto max-w-[110px] object-contain"
            />
          </Link>

          <div className="hidden lg:block">
            <HeaderSearch />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <CategoryChips
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              counts={categoryCounts}
            />
          </div>

          <HeaderAuth />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[2000px] px-4 py-8 lg:px-5">
        <ShowcaseGrid items={filteredItems} />
      </div>
    </main>
  )
}
