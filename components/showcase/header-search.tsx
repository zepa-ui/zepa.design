"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, X } from "lucide-react"

import { registryItems } from "@/content/registry"
import { formatCategory } from "@/lib/format-category"

/**
 * Command-palette search.
 *
 * The header pill is only a trigger; the search itself is a modal over a
 * blurred backdrop. An inline dropdown was the earlier version and it fought
 * the header — the panel had nowhere to grow, and grouped results with
 * thumbnails need far more room than a 168px pill can anchor.
 */
export function HeaderSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K opens; "/" opens when not already typing somewhere
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable

      const isCmdK =
        event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)

      if (isCmdK || (event.key === "/" && !isTyping)) {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // lock the page behind the modal, and restore whatever was there before
  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = previous
    }
  }, [open])

  /** grouped once, not per keystroke — cmdk does the filtering itself */
  const groups = useMemo(() => {
    // registryItems is a readonly tuple, so the accumulator needs its own
    // mutable element type rather than `typeof registryItems`
    type Item = (typeof registryItems)[number]
    const byCategory = new Map<string, Item[]>()
    for (const item of registryItems) {
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return [...byCategory.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [])

  function handleSelect(slug: string) {
    setOpen(false)
    setQuery("")
    router.push(`/components/${slug}`)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search components"
        className="flex w-[190px] shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-left transition hover:border-white/25 hover:bg-white/[0.07]"
      >
        <Search className="size-3.5 shrink-0 text-white/40" aria-hidden />
        <span className="flex-1 truncate text-[13px] text-white/40">
          Search components
        </span>
        <kbd className="pointer-events-none hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/40 lg:inline-block">
          ⌘K
        </kbd>
      </button>

      {/*
        Portalled to <body> on purpose. This component lives inside <header>,
        which has its own `backdrop-blur` — and an ancestor with backdrop-filter
        establishes a new *backdrop root*, so a descendant's backdrop-filter can
        only blur content within that ancestor. Rendered in place, only the
        header strip blurred and the grid behind it stayed sharp.

        `open` is always false on the server, so the document check can't cause
        a hydration mismatch.
      */}
      {open && typeof document !== "undefined"
        ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search components"
          className="fixed inset-0 z-[10000] flex items-start justify-center px-4 pt-[12vh]"
        >
          {/* backdrop: dim + blur the page behind, click anywhere to dismiss */}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default bg-black/65 backdrop-blur-md"
          />

          <Command
            label="Search components"
            loop
            shouldFilter
            className="relative w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/80"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
              <Search className="size-4 shrink-0 text-white/40" aria-hidden />
              <Command.Input
                ref={inputRef}
                autoFocus
                value={query}
                onValueChange={setQuery}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setOpen(false)
                }}
                placeholder="Search the whole library..."
                className="w-full bg-transparent text-[15px] text-white placeholder:text-white/35 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    inputRef.current?.focus()
                  }}
                  aria-label="Clear search"
                  className="shrink-0 text-white/40 transition hover:text-white"
                >
                  <X className="size-4" />
                </button>
              ) : null}
              <kbd className="pointer-events-none shrink-0 rounded border border-white/12 px-1.5 py-0.5 font-mono text-[10px] text-white/40">
                Esc
              </kbd>
            </div>

            <Command.List className="zepa-scroll max-h-[min(60vh,480px)] overflow-y-auto p-2">
              {!query ? (
                <p className="px-3 py-8 text-center text-sm text-white/35">
                  Tip: search by what it does, not what it&apos;s called.
                </p>
              ) : null}

              <Command.Empty className="px-3 py-8 text-center text-sm text-white/35">
                No components found.
              </Command.Empty>

              {groups.map(([category, items]) => (
                <Command.Group
                  key={category}
                  heading={
                    <span className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white/35">
                      {formatCategory(category)}
                      <span className="rounded-full bg-white/[0.07] px-1.5 py-px text-[10px] tabular-nums text-white/45">
                        {items.length}
                      </span>
                    </span>
                  }
                >
                  {items.map((item) => (
                    <Command.Item
                      key={item.slug}
                      value={item.title}
                      keywords={[item.category, ...(item.tags ?? [])]}
                      onSelect={() => handleSelect(item.slug)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-white/70 data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white"
                    >
                      {/* first frame of the existing preview — no extra assets,
                          and cmdk drops non-matching items from the DOM so only
                          visible rows ever request metadata */}
                      {item.preview ? (
                        <video
                          src={item.preview}
                          muted
                          playsInline
                          preload="metadata"
                          aria-hidden
                          className="h-9 w-14 shrink-0 rounded-md bg-black object-cover"
                        />
                      ) : (
                        <span className="h-9 w-14 shrink-0 rounded-md bg-white/[0.06]" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </div>,
            document.body
          )
        : null}
    </>
  )
}
