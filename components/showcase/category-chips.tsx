"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { formatCategory } from "@/lib/format-category"

interface CategoryChipsProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  counts?: Record<string, number>
}

export function CategoryChips({
  categories,
  activeCategory,
  onSelect,
  counts,
}: CategoryChipsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  /* which edges are still hiding content — drives the fades so the row
     never looks like it ends when it doesn't */
  const [edges, setEdges] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({
      start: el.scrollLeft > 4,
      end: el.scrollLeft < max - 4,
    })
  }, [])

  useEffect(() => {
    measure()
    const el = scrollerRef.current
    if (!el) return

    // ResizeObserver covers the container shrinking; scroll covers the rest
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [measure, categories.length])

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={measure}
        role="tablist"
        aria-label="Component categories"
        className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => {
          const active = category === activeCategory
          const count = counts?.[category]

          return (
            <button
              key={category}
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(category)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                active
                  ? "border-white bg-white text-black"
                  : "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {formatCategory(category)}
              {count !== undefined ? (
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                    active ? "bg-black/10 text-black/60" : "bg-white/10 text-white/50"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* fades sit above the row and ignore pointer events so they never
          block a chip underneath them */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent transition-opacity duration-200 ${
          edges.start ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent transition-opacity duration-200 ${
          edges.end ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
