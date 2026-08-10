"use client"

/**
 * ZepaDiagram — interactive data-viz illustration.
 *
 * At rest: a caption chip on top, a half-visible donut rising from the bottom.
 * On hover: the chip drops away, the donut lifts to centre and fills, six
 * labelled nodes fly out around it, and a gradient rises from the floor.
 *
 *   <ZepaDiagram />
 *   <ZepaDiagram color="#4f7dff" secondaryColor="#38bdf8" items={myNodes} />
 *   <ZepaDiagram variant="bare" />   inside your own tile
 *
 * Embed-safety notes (see dev-journal "Recurring gotchas"):
 *  - no network fonts, no `window` measurement for layout, no per-frame setState
 *  - every class and keyframe is prefixed `zd-`
 *  - sizing is container-query based (`cqw`/`cqh`), so it is fluid inside a
 *    bento cell instead of being pinned to the reference's 356x180
 *  - no SVG `<defs>` at all — both gradients are CSS, so there are no
 *    document-global ids to collide between instances
 */

import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

export interface ZepaDiagramNode {
  id: string
  label: string
  /** Horizontal offset on hover, in % of the visual width. */
  x: number
  /** Vertical offset on hover, in % of the visual height. */
  y: number
  /** Which of the two colours the node dot uses. */
  tone?: "main" | "secondary"
}

export interface ZepaDiagramProps {
  title?: string
  description?: string
  /** Chip shown at rest, above the donut. */
  captionTitle?: string
  captionDescription?: string
  /** Primary blue. Every derived shade comes from it. */
  color?: string
  /** Second blue, for the outer ring and the trailing nodes. */
  secondaryColor?: string
  gridColor?: string
  /** Donut value at rest and on hover, 0–100. */
  restProgress?: number
  hoverProgress?: number
  /** Outer ring value on hover, 0–100. */
  secondaryHoverProgress?: number
  /** Nodes that fly out on hover. Six reads best. */
  items?: ZepaDiagramNode[]
  /** Max card width in px. The visual keeps a 356:180 ratio below it. */
  width?: number
  theme?: "dark" | "light"
  /** "card" has the bordered surface and the title block. "bare" is the visual only. */
  variant?: "card" | "bare"
  className?: string
}

const DEFAULT_ITEMS: ZepaDiagramNode[] = [
  { id: "heroes", label: "Heroes", x: 28, y: 28, tone: "main" },
  { id: "bento", label: "Bento grids", x: 28, y: -28, tone: "main" },
  { id: "navbars", label: "Navbars", x: 35, y: 0, tone: "main" },
  { id: "illustrations", label: "Illustrations", x: -35, y: 0, tone: "secondary" },
  { id: "templates", label: "Templates", x: -28, y: 28, tone: "secondary" },
  { id: "unicorn", label: "Unicorn", x: -28, y: -28, tone: "secondary" },
]

const CSS = `
.zd-root{position:relative;display:flex;flex-direction:column;width:100%;max-width:var(--zd-w);overflow:hidden;border:1px solid var(--zd-line);border-radius:14px;background:var(--zd-bg);font-family:var(--font-manrope),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-user-select:none;user-select:none;transition:border-color .45s ease,box-shadow .45s ease}
.zd-root *{box-sizing:border-box}
.zd-root[data-hover="true"]{border-color:var(--zd-line-hi);box-shadow:0 30px 70px -44px var(--zd-color)}
.zd-root[data-variant="bare"]{max-width:none;border:0;border-radius:0;background:transparent;box-shadow:none}

.zd-visual{position:relative;width:100%;aspect-ratio:356 / 180;overflow:hidden;container-type:size}

.zd-grid{position:absolute;inset:0;z-index:4;pointer-events:none;background-image:linear-gradient(to right,var(--zd-grid) 1px,transparent 1px),linear-gradient(to bottom,var(--zd-grid) 1px,transparent 1px);background-size:20px 20px;background-position:center;opacity:.7;-webkit-mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 60%,transparent 100%);mask-image:radial-gradient(ellipse 50% 50% at 50% 50%,#000 60%,transparent 100%)}
.zd-ellipse{position:absolute;inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse 50% 54% at 50% 50%,color-mix(in oklab,var(--zd-color) 26%,transparent) 0%,color-mix(in oklab,var(--zd-color) 15%,transparent) 34%,transparent 100%)}
.zd-rise{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;transform:translateY(100%);transition:transform .5s var(--zd-ease),opacity .5s var(--zd-ease);background:linear-gradient(to bottom,transparent 35%,color-mix(in oklab,var(--zd-color) 32%,transparent) 100%)}
.zd-root[data-hover="true"] .zd-rise{opacity:1;transform:translateY(0)}

.zd-donut{position:absolute;top:0;left:0;z-index:7;display:flex;width:100%;height:200cqh;align-items:center;justify-content:center;transform:translateY(-14cqh);transition:transform .5s var(--zd-ease)}
.zd-root[data-hover="true"] .zd-donut{transform:translateY(-50cqh) scale(1.1)}
.zd-dial{position:relative;width:34cqw;height:34cqw}
.zd-dial svg{display:block;width:100%;height:100%}
.zd-ring{transition:stroke-dashoffset .5s var(--zd-ease) .2s}
.zd-root[data-hover="false"] .zd-ring{transition-delay:0ms}
.zd-value{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(13px,5.6cqw,21px);font-weight:600;letter-spacing:-.01em;color:var(--zd-fg);font-variant-numeric:tabular-nums}

.zd-chip-wrap{position:absolute;inset:0;z-index:6;display:flex;align-items:flex-start;justify-content:center;padding:14px;transition:transform .5s var(--zd-ease)}
.zd-root[data-hover="true"] .zd-chip-wrap{transform:translateY(100%)}
.zd-chip{padding:6px 9px;border:1px solid var(--zd-line);border-radius:8px;background:var(--zd-veil);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:1;transition:opacity .5s var(--zd-ease)}
.zd-root[data-hover="true"] .zd-chip{opacity:0}
.zd-chip-head{display:flex;align-items:center;gap:7px}
.zd-chip-head p{margin:0;font-size:11.5px;color:var(--zd-fg)}
.zd-chip-sub{margin:4px 0 0;font-size:11.5px;color:var(--zd-muted)}
.zd-dot{flex-shrink:0;width:7px;height:7px;border-radius:999px;background:var(--zd-color)}

.zd-nodes{position:absolute;inset:0;z-index:7;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .5s var(--zd-ease)}
.zd-root[data-hover="true"] .zd-nodes{opacity:1}
.zd-node{position:absolute;display:flex;align-items:center;gap:5px;padding:3px 8px 3px 6px;border:1px solid var(--zd-line);border-radius:999px;background:var(--zd-veil);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);white-space:nowrap;transform:translate(0,0);transition:transform .5s var(--zd-ease)}
.zd-root[data-hover="true"] .zd-node{transform:var(--zd-to)}
.zd-node span{font-size:10.5px;color:var(--zd-fg)}
.zd-node i{display:block;flex-shrink:0;width:6px;height:6px;border-radius:999px}

.zd-body{display:flex;flex-direction:column;gap:5px;padding:15px 16px 17px;border-top:1px solid var(--zd-line)}
.zd-title{margin:0;font-size:17px;font-weight:600;letter-spacing:-.012em;line-height:1.25;color:var(--zd-fg)}
.zd-desc{margin:0;font-size:13.5px;line-height:1.5;color:var(--zd-muted)}

@media (prefers-reduced-motion:reduce){
  .zd-root *{transition-duration:1ms!important}
}
`

function formatPct(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function ZepaDiagram({
  title = "Every block ships from one registry",
  description = "Paste one command and the component lands in your project, ready to edit.",
  captionTitle = "Zepa registry",
  captionDescription = "Installs across the component library.",
  color = "#4f7dff",
  secondaryColor = "#38bdf8",
  gridColor,
  restProgress = 12.5,
  hoverProgress = 66,
  secondaryHoverProgress = 100,
  items = DEFAULT_ITEMS,
  width = 356,
  theme = "dark",
  variant = "card",
  className,
}: ZepaDiagramProps) {
  const [hovered, setHovered] = useState(false)
  const valueRef = useRef<HTMLSpanElement>(null)

  // The ring animates with a CSS transition; the readout is tweened on a rAF
  // loop that writes textContent directly. No per-frame setState, and no
  // setState inside an effect body.
  useEffect(() => {
    const element = valueRef.current
    if (!element) return

    const from = Number(element.dataset.value ?? restProgress)
    const to = hovered ? hoverProgress : restProgress
    if (from === to) return

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const delay = hovered && !reduce ? 200 : 0
    const duration = reduce ? 0 : 500

    let frame = 0
    let startedAt = 0

    const step = (now: number) => {
      if (!startedAt) startedAt = now
      const elapsed = now - startedAt - delay

      if (elapsed < 0) {
        frame = requestAnimationFrame(step)
        return
      }

      const t = duration === 0 ? 1 : Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = from + (to - from) * eased

      element.dataset.value = String(value)
      element.textContent = t < 1 ? `${Math.round(value)}%` : `${formatPct(to)}%`

      if (t < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [hovered, restProgress, hoverProgress])

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offsetFor = (progress: number) =>
    circumference - (progress / 100) * circumference

  const isDark = theme === "dark"

  const rootStyle = {
    "--zd-w": `${width}px`,
    "--zd-ease": "cubic-bezier(0.6, 0.6, 0, 1)",
    "--zd-color": color,
    "--zd-secondary": secondaryColor,
    "--zd-grid": gridColor ?? (isDark ? "#ffffff12" : "#80808015"),
    "--zd-bg": isDark ? "#000000" : "#ffffff",
    "--zd-fg": isDark ? "#ffffff" : "#09090b",
    "--zd-muted": isDark ? "#a1a1aa" : "#71717a",
    "--zd-line": isDark ? "#ffffff1f" : "#e4e4e7",
    "--zd-line-hi": `color-mix(in oklab, ${color} 42%, transparent)`,
    "--zd-veil": isDark ? "rgba(0,0,0,.55)" : "rgba(255,255,255,.6)",
    "--zd-track": isDark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.14)",
  } as CSSProperties

  return (
    <div
      className={className ? `zd-root ${className}` : "zd-root"}
      data-variant={variant}
      data-hover={hovered}
      style={rootStyle}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovered(false)
      }}
      onClick={(event) => {
        // Touch and pen have no hover — a tap plays the transition.
        const native = event.nativeEvent
        if (
          typeof PointerEvent !== "undefined" &&
          native instanceof PointerEvent &&
          native.pointerType !== "mouse"
        ) {
          setHovered((value) => !value)
        }
      }}
    >
      <style>{CSS}</style>

      <div className="zd-visual">
        <div className="zd-donut">
          <div className="zd-dial">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="var(--zd-track)"
                strokeWidth="10"
              />
              <circle
                className="zd-ring"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={secondaryColor}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={offsetFor(hovered ? secondaryHoverProgress : 0)}
                transform="rotate(-90 50 50)"
              />
              <circle
                className="zd-ring"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={offsetFor(hovered ? hoverProgress : restProgress)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span
              ref={valueRef}
              className="zd-value"
              data-value={restProgress}
            >
              {formatPct(restProgress)}%
            </span>
          </div>
        </div>

        <div className="zd-chip-wrap">
          <div className="zd-chip">
            <div className="zd-chip-head">
              <i className="zd-dot" />
              <p>{captionTitle}</p>
            </div>
            <p className="zd-chip-sub">{captionDescription}</p>
          </div>
        </div>

        <div className="zd-nodes">
          {items.map((item) => (
            <div
              key={item.id}
              className="zd-node"
              style={
                {
                  "--zd-to": `translate(${item.x}cqw, ${item.y}cqh)`,
                } as CSSProperties
              }
            >
              <i
                style={{
                  backgroundColor:
                    item.tone === "secondary" ? secondaryColor : color,
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="zd-rise" />
        <div className="zd-ellipse" />
        <div className="zd-grid" />
      </div>

      {variant === "card" && (title || description) ? (
        <div className="zd-body">
          {title ? <h3 className="zd-title">{title}</h3> : null}
          {description ? <p className="zd-desc">{description}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export default ZepaDiagram
