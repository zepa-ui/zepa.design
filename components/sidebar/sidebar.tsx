"use client"

import { SidebarPanel } from "./sidebar-panel"

interface SidebarProps {
  categories: string[]
  activeCategory: string
  onSelect: (category: string) => void
  counts?: Record<string, number>
}

export function Sidebar({
  categories,
  activeCategory,
  onSelect,
  counts,
}: SidebarProps) {
  return (
    <aside className="w-sidebar hidden shrink-0 flex-col border-r border-white/10 bg-zinc-900/40 p-4 lg:flex lg:h-screen lg:sticky lg:top-0">
      <SidebarPanel
        categories={categories}
        activeCategory={activeCategory}
        onSelect={onSelect}
        counts={counts}
      />
    </aside>
  )
}
