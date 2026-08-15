"use client"

/**
 * TimelineZepa — status timeline.
 *
 * A rail of status nodes joined by connectors, with a timestamp, title,
 * description and optional content block per entry. Steps reveal in sequence
 * when the timeline scrolls into view, connectors draw down behind them, and
 * the active node keeps a soft pulse.
 *
 *   <TimelineZepa />
 *   <TimelineZepa items={mySteps} density="spacious" />
 *   <TimelineZepa items={mySteps} orientation="horizontal" />
 *
 * Implementation notes:
 *  - No `cva`. Variants are `data-` attributes on the root with plain CSS
 *    selectors, which is what a class-variance helper compiles down to anyway.
 *  - No scroll-area primitive. Horizontal mode is native `overflow-x: auto`
 *    with a styled scrollbar — a scrollbar is not worth a dependency.
 *  - Icons are inline SVG on `currentColor`, so status colour drives them.
 *  - **Timestamps are strings, never Date objects.** `toLocaleDateString()`
 *    resolves against the runtime's locale and timezone, so formatting during
 *    render gives different output on the server and the client and trips a
 *    hydration mismatch. Formatting is the caller's job.
 *  - The reveal is gated on an IntersectionObserver and the finished state is
 *    the default, so with JS off or motion reduced the timeline is fully
 *    visible rather than blank.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `tz-`.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"

export type TimelineZepaStatus =
  | "default"
  | "completed"
  | "active"
  | "pending"
  | "error"

export interface TimelineZepaItem {
  id: string
  title: string
  description?: string
  /** Pre-formatted string. See the note on hydration above. */
  timestamp?: string
  status?: TimelineZepaStatus
  /** Overrides the status glyph. */
  icon?: ReactNode
  /** Extra block rendered under the description. */
  content?: ReactNode
}

export interface TimelineZepaProps {
  items?: TimelineZepaItem[]
  title?: string
  density?: "compact" | "default" | "spacious"
  orientation?: "vertical" | "horizontal"
  showConnectors?: boolean
  showTimestamps?: boolean
  timestampPosition?: "top" | "inline" | "bottom"
  /** Colour for completed and active states. */
  accent?: string
  /** Colour for the error state. */
  danger?: string
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconCross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconDot() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
}

function statusGlyph(status: TimelineZepaStatus) {
  if (status === "completed") return <IconCheck />
  if (status === "error") return <IconCross />
  if (status === "active" || status === "pending") return <IconClock />
  return <IconDot />
}

const DEFAULT_ITEMS: TimelineZepaItem[] = [
  {
    id: "category",
    title: "Category created",
    description: "interactive-illustrations opened alongside the four section categories.",
    timestamp: "10 Aug, 09:20",
    status: "completed",
  },
  {
    id: "first",
    title: "First components shipped",
    description: "Folder, diagram and beam landed with zero runtime dependencies.",
    timestamp: "10 Aug, 14:05",
    status: "completed",
  },
  {
    id: "previews",
    title: "Previews recording",
    description: "Clips captured and compressed to under 250 KB each.",
    timestamp: "10 Aug, 21:16",
    status: "active",
  },
  {
    id: "registry",
    title: "Published to the registry",
    description: "npx shadcn@latest add — pending the next build.",
    timestamp: "Scheduled",
    status: "pending",
  },
]

const CSS = `
.tz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--tz-w);justify-content:center}
.tz-shell *{box-sizing:border-box}
.tz-shell[data-variant="bare"]{max-width:none}
.tz-root{width:100%;padding:var(--tz-pad);border:1px solid var(--tz-line);border-radius:20px;background:var(--tz-bg);color:var(--tz-fg);-webkit-user-select:none;user-select:none}
.tz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

.tz-heading{margin:0 0 clamp(16px,4.4cqw,24px);font-size:clamp(15px,4.2cqw,18px);font-weight:600;letter-spacing:-.012em}

/* Density replaces the variant helper — three values on one custom property. */
.tz-root[data-density="compact"]{--tz-gap:14px}
.tz-root[data-density="default"]{--tz-gap:22px}
.tz-root[data-density="spacious"]{--tz-gap:38px}

.tz-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.tz-root[data-orientation="horizontal"] .tz-list{flex-direction:row;overflow-x:auto;padding-bottom:12px;scrollbar-width:thin;scrollbar-color:var(--tz-line-hi) transparent}
.tz-root[data-orientation="horizontal"] .tz-list::-webkit-scrollbar{height:8px}
.tz-root[data-orientation="horizontal"] .tz-list::-webkit-scrollbar-thumb{border-radius:999px;background:var(--tz-line-hi)}
.tz-root[data-orientation="horizontal"] .tz-list::-webkit-scrollbar-track{background:transparent}

.tz-item{position:relative;display:flex;gap:12px;padding-bottom:var(--tz-gap)}
.tz-item:last-child{padding-bottom:0}
.tz-root[data-orientation="horizontal"] .tz-item{flex-direction:column;flex-shrink:0;width:min(248px,66cqw);padding-bottom:0;padding-right:var(--tz-gap)}
.tz-root[data-orientation="horizontal"] .tz-item:last-child{padding-right:0}

/* Absolute positioning resolves against the padding box, so bottom:0 reaches
   the far edge of the gap and the connector bridges cleanly to the next node
   without any height maths. */
.tz-connector{position:absolute;left:calc(var(--tz-node) / 2 - 1px);top:var(--tz-node);bottom:0;width:2px;border-radius:2px;background:var(--tz-line-hi);transform-origin:top center}
.tz-root[data-orientation="horizontal"] .tz-connector{left:var(--tz-node);right:0;top:calc(var(--tz-node) / 2 - 1px);bottom:auto;width:auto;height:2px;transform-origin:left center}
.tz-item[data-status="completed"] .tz-connector,
.tz-item[data-status="active"] .tz-connector{background:var(--tz-accent)}
.tz-item[data-status="error"] .tz-connector{background:var(--tz-danger)}

.tz-node{position:relative;z-index:1;display:flex;flex-shrink:0;align-items:center;justify-content:center;width:var(--tz-node);height:var(--tz-node);border:2px solid var(--tz-line-hi);border-radius:999px;background:var(--tz-bg);color:var(--tz-muted)}
.tz-node svg{width:58%;height:58%}
.tz-item[data-status="completed"] .tz-node{border-color:var(--tz-accent);background:var(--tz-accent);color:var(--tz-on-accent)}
.tz-item[data-status="active"] .tz-node{border-color:var(--tz-accent);color:var(--tz-accent)}
.tz-item[data-status="error"] .tz-node{border-color:var(--tz-danger);background:var(--tz-danger);color:var(--tz-on-accent)}

/* The pulse is a separate ring rather than opacity on the node, so the glyph
   never dims and the halo can grow past the border. */
.tz-item[data-status="active"] .tz-node::after{content:"";position:absolute;inset:-2px;border:2px solid var(--tz-accent);border-radius:999px;animation:tz-pulse 2s cubic-bezier(.16,1,.3,1) infinite}

.tz-content{display:flex;min-width:0;flex:1;flex-direction:column;gap:5px;padding-top:2px}
.tz-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.tz-time{font-size:clamp(10px,2.8cqw,12px);color:var(--tz-muted);white-space:nowrap}
.tz-title{margin:0;font-size:clamp(13px,3.6cqw,15px);font-weight:600;line-height:1.35;letter-spacing:-.008em}
.tz-desc{margin:0;font-size:clamp(12px,3.2cqw,13.5px);line-height:1.55;color:var(--tz-muted)}
.tz-extra{margin-top:7px;padding:11px 13px;border:1px solid var(--tz-line);border-radius:11px;background:var(--tz-panel);font-size:clamp(11px,3cqw,12.5px);line-height:1.5}

@keyframes tz-pulse{
  0%{opacity:.55;transform:scale(1)}
  70%{opacity:0;transform:scale(1.75)}
  100%{opacity:0;transform:scale(1.75)}
}
@keyframes tz-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes tz-draw{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes tz-draw-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}

/* Finished state is the default; the hidden state only exists where motion is
   welcome, so the timeline reads correctly with JS off. */
@media (prefers-reduced-motion:no-preference){
  .tz-root[data-play="false"] .tz-item{opacity:0}
  .tz-root[data-play="true"] .tz-item{animation:tz-enter .5s cubic-bezier(.16,1,.3,1) var(--tz-delay) both}
  .tz-root[data-play="false"] .tz-connector{transform:scaleY(0)}
  .tz-root[data-play="true"] .tz-connector{animation:tz-draw .45s ease-out calc(var(--tz-delay) + .18s) both}
  .tz-root[data-play="false"][data-orientation="horizontal"] .tz-connector{transform:scaleX(0)}
  .tz-root[data-play="true"][data-orientation="horizontal"] .tz-connector{animation-name:tz-draw-x}
}
@media (prefers-reduced-motion:reduce){
  .tz-item[data-status="active"] .tz-node::after{animation:none;opacity:.4}
}
`

export function TimelineZepa({
  items = DEFAULT_ITEMS,
  title = "Release timeline",
  density = "default",
  orientation = "vertical",
  showConnectors = true,
  showTimestamps = true,
  timestampPosition = "top",
  accent = "#4f7dff",
  danger = "#FF2E55",
  width = 460,
  theme = "dark",
  variant = "tile",
  className,
}: TimelineZepaProps) {
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const start = useCallback(() => setPlaying(true), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [start])

  const isDark = theme === "dark"

  const shellStyle = {
    "--tz-w": `${width}px`,
    "--tz-accent": accent,
    "--tz-danger": danger,
    "--tz-on-accent": "#ffffff",
    "--tz-bg": isDark ? "#08080a" : "#ffffff",
    "--tz-panel": isDark ? "#ffffff08" : "#00000006",
    "--tz-fg": isDark ? "#f4f4f5" : "#18181b",
    "--tz-muted": isDark ? "#8b8b96" : "#71717a",
    "--tz-line": isDark ? "#ffffff14" : "#e4e4e7",
    "--tz-line-hi": isDark ? "#ffffff2e" : "#d4d4d8",
  } as CSSProperties

  const fluidStyle = {
    "--tz-pad": "clamp(18px, 5.5cqw, 30px)",
    "--tz-node": "clamp(24px, 6.5cqw, 28px)",
  } as CSSProperties

  return (
    <div
      className={className ? `tz-shell ${className}` : "tz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="tz-root"
        data-variant={variant}
        data-density={density}
        data-orientation={orientation}
        data-play={playing}
        style={fluidStyle}
      >
        {title ? <p className="tz-heading">{title}</p> : null}

        <ol className="tz-list">
          {items.map((item, index) => {
            const status = item.status ?? "default"
            const isLast = index === items.length - 1
            const stamp =
              showTimestamps && item.timestamp ? item.timestamp : null

            return (
              <li
                key={item.id}
                className="tz-item"
                data-status={status}
                style={{ "--tz-delay": `${index * 0.11}s` } as CSSProperties}
              >
                {showConnectors && !isLast ? (
                  <span className="tz-connector" aria-hidden="true" />
                ) : null}

                <span className="tz-node" aria-hidden="true">
                  {item.icon ?? statusGlyph(status)}
                </span>

                <div className="tz-content">
                  {stamp && timestampPosition === "top" ? (
                    <time className="tz-time">{stamp}</time>
                  ) : null}

                  <div className="tz-row">
                    <h3 className="tz-title">{item.title}</h3>
                    {stamp && timestampPosition === "inline" ? (
                      <time className="tz-time">{stamp}</time>
                    ) : null}
                  </div>

                  {item.description ? (
                    <p className="tz-desc">{item.description}</p>
                  ) : null}

                  {item.content ? (
                    <div className="tz-extra">{item.content}</div>
                  ) : null}

                  {stamp && timestampPosition === "bottom" ? (
                    <time className="tz-time">{stamp}</time>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

export default TimelineZepa
