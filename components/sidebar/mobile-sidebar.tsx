"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

import { SidebarPanel } from "./sidebar-panel"

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  counts?: Record<string, number>
}

export function MobileSidebar({
  open,
  onClose,
  categories,
  activeCategory,
  onSelect,
  counts,
}: MobileSidebarProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-[min(100%,280px)] flex-col border-r border-white/10 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <SidebarPanel
          categories={categories}
          activeCategory={activeCategory}
          onSelect={onSelect}
          onNavigate={onClose}
          counts={counts}
        />
      </aside>
    </div>
  )
}
