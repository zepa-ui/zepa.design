"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import { formatCategory } from "@/lib/format-category"

import { SidebarSearch } from "./sidebar-search"

interface SidebarPanelProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  onNavigate?: () => void
  showLogo?: boolean
  counts?: Record<string, number>
}

export function SidebarPanel({
  categories,
  activeCategory,
  onSelect,
  onNavigate,
  showLogo = true,
  counts,
}: SidebarPanelProps) {
  return (
    <>
      {showLogo ? (
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-6 flex items-center rounded-lg px-2 py-2 transition hover:bg-white/5"
        >
          <img
            src="/zzepa.png"
            alt="Zepa UI"
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        </Link>
      ) : null}

      <SidebarSearch onNavigate={onNavigate} />

      <div className="space-y-1">
        {categories.map((category) => {
          const active = activeCategory === category
          const count = counts?.[category]

          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                onSelect(category)
                onNavigate?.()
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                active
                  ? "bg-white font-medium text-black"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{formatCategory(category)}</span>
              {count !== undefined ? (
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    active ? "text-black/50" : "text-white/30"
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <div className="mt-auto flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2.5 pb-4 text-sm text-white/40">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" />
        </svg>
        <span>
          Hover on a card to preview
          <br />
          the video of the component
        </span>
      </div>
    </>
  )
}
