"use client"

/**
 * NotificationZepa — notification stack.
 *
 * Two notifications are already resting on a plain card; the rest arrive one
 * at a time, landing on top and pushing the stack down, then it loops.
 *
 *   <NotificationZepa />
 *   <NotificationZepa items={myAlerts} interval={2000} />
 *   <NotificationZepa theme="light" variant="bare" />
 *
 * Implementation notes:
 *  - **The push-down needs no FLIP.** Every card is absolutely positioned and
 *    placed by `transform: translateY(index * step)`. A new arrival takes
 *    index 0, everything else shifts by one, and the existing CSS transition
 *    animates the slide. Position comes from transform, not document flow.
 *  - Keys are stable ids, so React only mounts the *new* card — which is what
 *    keeps the entrance animation on the arrival instead of replaying it on
 *    every card in the stack.
 *  - Placement, entrance and hover are three separate concerns: the slot owns
 *    `translateY`, the card owns the drop-in keyframe *and* the pointer
 *    scale. The entrance uses `animation-fill-mode: backwards` so it hands
 *    `transform` back to CSS when it ends — with `both` the hover would never
 *    apply, since a filled animation outranks any specified value.
 *  - Hovering pauses arrivals. Nothing should shift out from under someone
 *    reading, and it makes the stack feel handled rather than scripted.
 *  - Card surfaces are solid, not `backdrop-filter` blurred. Up to five move
 *    at once and blurring each on every frame is the one thing that would make
 *    this stutter — and over a flat background it would look identical anyway.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `nz-`.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

export interface NotificationZepaItem {
  id: string
  /** Emoji or short glyph shown in the app tile. */
  icon: string
  /** Tile background. */
  tint: string
  /** Small label above the title. */
  app: string
  title: string
  message: string
  time: string
}

export interface NotificationZepaProps {
  items?: NotificationZepaItem[]
  /** How many are already on screen before the sequence starts. */
  initial?: number
  /** Milliseconds between arrivals. */
  interval?: number
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

const DEFAULT_ITEMS: NotificationZepaItem[] = [
  {
    id: "calendar",
    icon: "📅",
    tint: "#ff453a",
    app: "Calendar",
    title: "Design review",
    message: "Starts in 15 minutes · Studio room",
    time: "12m ago",
  },
  {
    id: "mail",
    icon: "📬",
    tint: "#0a84ff",
    app: "Mail",
    title: "GitHub",
    message: "PR #42 approved — 6 files changed",
    time: "8m ago",
  },
  {
    id: "aanya",
    icon: "👩🏻",
    tint: "#32d74b",
    app: "Messages",
    title: "Aanya",
    message: "sent you the Figma link 🔗 have a look",
    time: "3m ago",
  },
  {
    id: "zepa",
    icon: "✦",
    tint: "#4f7dff",
    app: "Zepa",
    title: "Install milestone",
    message: "selfie-hero just passed 1,200 installs 🎉",
    time: "1m ago",
  },
  {
    id: "vivek",
    icon: "🧔🏽",
    tint: "#32d74b",
    app: "Messages",
    title: "Vivek",
    message: "the folder illustration looks 🔥",
    time: "now",
  },
]

const CSS = `
.nz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--nz-w);justify-content:center}
.nz-shell *{box-sizing:border-box}
.nz-shell[data-variant="bare"]{max-width:none}
.nz-root{position:relative;width:100%;overflow:hidden;padding:var(--nz-pad);border:1px solid var(--nz-line);border-radius:22px;background:var(--nz-bg);color:var(--nz-fg);-webkit-user-select:none;user-select:none}
.nz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

/* Height is fixed to the full stack so nothing reflows as cards arrive. */
.nz-stack{position:relative;height:calc(var(--nz-card) * var(--nz-max) + var(--nz-gap) * (var(--nz-max) - 1))}

.nz-slot{position:absolute;left:0;right:0;top:0;transform:translateY(calc((var(--nz-card) + var(--nz-gap)) * var(--nz-i)));transition:transform .46s cubic-bezier(.22,1,.28,1)}
/* Fill mode is backwards, not both. An animation with a forwards fill keeps
   its final transform applied forever and outranks any specified value, so
   the hover scale below would never apply. Backwards covers the pre-start
   frame and then hands the property back to CSS. */
.nz-card{display:flex;gap:11px;align-items:flex-start;height:var(--nz-card);padding:11px 13px;border:1px solid var(--nz-card-line);border-radius:18px;background:var(--nz-card-bg);box-shadow:var(--nz-card-shadow);animation:nz-arrive .46s cubic-bezier(.22,1,.28,1) backwards;transition:transform .28s cubic-bezier(.22,1,.28,1),background-color .25s ease,border-color .25s ease,box-shadow .28s ease,opacity .25s ease}

/* Pointer state, borrowed from how a cursor behaves on iPadOS: the target
   grows a little and lifts, and everything else recedes rather than competing. */
.nz-slot:hover .nz-card{transform:scale(1.025);background:var(--nz-card-hover);border-color:var(--nz-card-line-hi);box-shadow:var(--nz-card-shadow-hi)}
.nz-slot:active .nz-card{transform:scale(.995);transition-duration:.09s}
.nz-stack:has(.nz-slot:hover) .nz-slot:not(:hover) .nz-card{opacity:.5}

.nz-icon{display:flex;flex-shrink:0;align-items:center;justify-content:center;width:clamp(32px,9.5cqw,38px);height:clamp(32px,9.5cqw,38px);border-radius:10px;background:var(--nz-tint);font-size:clamp(16px,5cqw,19px);line-height:1;box-shadow:0 2px 6px -2px rgba(0,0,0,.6)}
.nz-body{display:flex;min-width:0;flex:1;flex-direction:column;gap:1px}
.nz-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.nz-app{font-size:clamp(9.5px,2.8cqw,10.5px);font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--nz-muted)}
.nz-time{flex-shrink:0;font-size:clamp(9.5px,2.8cqw,10.5px);color:var(--nz-muted)}
.nz-title{margin:0;font-size:clamp(12px,3.6cqw,13.5px);font-weight:600;letter-spacing:-.005em;line-height:1.3;color:var(--nz-fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nz-text{margin:0;font-size:clamp(11.5px,3.4cqw,13px);line-height:1.35;color:var(--nz-body);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

@keyframes nz-arrive{
  from{opacity:0;transform:translateY(-22px) scale(.94)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
@media (prefers-reduced-motion:reduce){
  .nz-slot{transition-duration:1ms}
  .nz-card{animation-duration:1ms}
}
`

export function NotificationZepa({
  items = DEFAULT_ITEMS,
  initial = 2,
  interval = 1700,
  width = 340,
  theme = "dark",
  variant = "tile",
  className,
}: NotificationZepaProps) {
  const floor = Math.max(0, Math.min(initial, items.length))
  const [visible, setVisible] = useState(floor)
  const [playing, setPlaying] = useState(false)
  const [paused, setPaused] = useState(false)
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
      { threshold: 0.3 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [start])

  useEffect(() => {
    // Arrivals hold while the pointer is over the stack — nothing should shift
    // out from under someone reading a notification.
    if (!playing || paused) return
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // setState from a timer callback, not from the effect body — one commit
    // per arrival, and the loop resets once the stack is full.
    const timer = window.setInterval(() => {
      setVisible((count) => (count >= items.length ? floor : count + 1))
    }, interval)

    return () => window.clearInterval(timer)
  }, [playing, paused, interval, items.length, floor])

  // Newest first: the most recent arrival sits at the top of the stack.
  const shown = items.slice(0, visible).reverse()

  const isDark = theme === "dark"

  const shellStyle = {
    "--nz-w": `${width}px`,
    "--nz-bg": isDark ? "#0e0e11" : "#f4f4f5",
    "--nz-line": isDark ? "#ffffff14" : "#e4e4e7",
    "--nz-card-bg": isDark ? "#1c1c22" : "#ffffff",
    "--nz-card-hover": isDark ? "#26262e" : "#f7f7f9",
    "--nz-card-line": isDark ? "#ffffff14" : "#00000010",
    "--nz-card-line-hi": isDark ? "#ffffff2e" : "#00000020",
    "--nz-card-shadow": isDark
      ? "0 8px 24px -16px rgba(0,0,0,.9)"
      : "0 8px 22px -14px rgba(0,0,0,.28)",
    "--nz-card-shadow-hi": isDark
      ? "0 16px 34px -16px rgba(0,0,0,.95)"
      : "0 16px 32px -14px rgba(0,0,0,.34)",
    "--nz-fg": isDark ? "#f4f4f5" : "#18181b",
    "--nz-body": isDark ? "#d4d4d8" : "#3f3f46",
    "--nz-muted": isDark ? "#8a8a94" : "#71717a",
  } as CSSProperties

  const rootStyle = {
    "--nz-pad": "clamp(16px, 5cqw, 22px)",
    "--nz-card": "clamp(64px, 19cqw, 74px)",
    "--nz-gap": "clamp(7px, 2.2cqw, 9px)",
    "--nz-max": `${items.length}`,
  } as CSSProperties

  return (
    <div
      className={className ? `nz-shell ${className}` : "nz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="nz-root"
        data-variant={variant}
        style={rootStyle}
      >
        <div
          className="nz-stack"
          role="log"
          aria-live="polite"
          aria-label="Notifications"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setPaused(true)
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setPaused(false)
          }}
        >
          {shown.map((item, index) => (
            <div
              key={item.id}
              className="nz-slot"
              style={
                {
                  "--nz-i": `${index}`,
                  zIndex: shown.length - index,
                } as CSSProperties
              }
            >
              <div
                className="nz-card"
                style={{ "--nz-tint": item.tint } as CSSProperties}
              >
                <span className="nz-icon" aria-hidden="true">
                  {item.icon}
                </span>

                <div className="nz-body">
                  <div className="nz-row">
                    <span className="nz-app">{item.app}</span>
                    <span className="nz-time">{item.time}</span>
                  </div>
                  <p className="nz-title">{item.title}</p>
                  <p className="nz-text">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationZepa
