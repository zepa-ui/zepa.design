"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Menu, X } from "lucide-react"

import { formatCategory } from "@/lib/format-category"

interface MobileCategoryMenuProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  counts?: Record<string, number>
}

/**
 * Mobile-only section menu.
 *
 * The horizontal chip strip works on desktop because there's room to scroll it.
 * On a phone it's a cramped row you have to drag through to reach anything past
 * the third section — so below `lg` the chips are replaced by this drawer and
 * the search pill is dropped entirely.
 */
export function MobileCategoryMenu({
  categories,
  activeCategory,
  onSelect,
  counts,
}: MobileCategoryMenuProps) {
  const [open, setOpen] = useState(false)

  // lock the page behind the drawer, restoring whatever was set before
  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sections menu"
        aria-expanded={open}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Portalled to <body>: the header has its own backdrop-blur, and an
          ancestor with backdrop-filter establishes a new backdrop root — the
          drawer's blur would otherwise stop at the header. Same trap as the
          search palette. */}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Sections"
              className="fixed inset-0 z-[10000] lg:hidden"
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
              />

              <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-[320px] flex-col border-r border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Sections
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="flex size-8 items-center justify-center rounded-md text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                  {categories.map((category) => {
                    const active = category === activeCategory
                    const count = counts?.[category]

                    return (
                      <button
                        key={category}
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          onSelect(category)
                          setOpen(false)
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-white/[0.09] text-white"
                            : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <span className="truncate">{formatCategory(category)}</span>
                        {count !== undefined ? (
                          <span className="shrink-0 rounded-full bg-white/[0.07] px-1.5 py-px text-[11px] tabular-nums text-white/45">
                            {count}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
