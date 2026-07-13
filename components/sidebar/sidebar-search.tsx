"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search } from "lucide-react"

import { registryItems } from "@/content/registry"
import { formatCategory } from "@/lib/format-category"

interface SidebarSearchProps {
  onNavigate?: () => void
}

export function SidebarSearch({ onNavigate }: SidebarSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

  const open = focused && query.trim().length > 0

  // Cmd+K (or Ctrl+K) and "/" focus the search input.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const input = inputRef.current
      // Skip if this instance is not visible (e.g. hidden desktop sidebar on mobile).
      if (!input || input.offsetParent === null) return

      const target = event.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      const isCmdK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)
      const isSlash = event.key === "/" && !isTyping

      if (isCmdK || isSlash) {
        event.preventDefault()
        input.focus()
        input.select()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  function handleSelect(slug: string) {
    setQuery("")
    setFocused(false)
    inputRef.current?.blur()
    onNavigate?.()
    router.push(`/components/${slug}`)
  }

  return (
    <div ref={containerRef} className="relative mb-4">
      <Command label="Search components" className="w-full" loop>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition focus-within:border-white/25 focus-within:bg-white/[0.07]">
          <Search
            className="size-4 shrink-0 text-white/40"
            aria-hidden="true"
          />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            onFocus={() => setFocused(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("")
                setFocused(false)
                inputRef.current?.blur()
              }
            }}
            placeholder="Search components"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <kbd className="pointer-events-none hidden shrink-0 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/40 lg:inline-block">
            ⌘K
          </kbd>
        </div>

        <Command.List
          className={`absolute inset-x-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950 p-1.5 shadow-2xl shadow-black/60 ${
            open ? "block" : "hidden"
          }`}
        >
          <Command.Empty className="px-3 py-6 text-center text-xs text-white/40">
            No components found.
          </Command.Empty>

          {registryItems.map((item) => (
            <Command.Item
              key={item.slug}
              value={item.title}
              keywords={[item.category, ...(item.tags ?? [])]}
              onSelect={() => handleSelect(item.slug)}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-white/70 data-[selected=true]:bg-white/10 data-[selected=true]:text-white"
            >
              <span className="truncate">{item.title}</span>
              <span className="shrink-0 text-[10px] uppercase tracking-wider text-white/35">
                {formatCategory(item.category)}
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
