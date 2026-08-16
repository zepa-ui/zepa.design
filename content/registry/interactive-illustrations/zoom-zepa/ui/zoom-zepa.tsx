"use client"

/**
 * ZoomZepa — catalog loupe.
 *
 * Three rivers of tags scroll past each other. A glass sits on top; drag it
 * and the chips under the aperture sharpen, pick up colour, and enlarge
 * around the point you are looking at.
 *
 *   <ZoomZepa />
 *   <ZoomZepa rows={myRows} magnify={1.28} />
 *   <ZoomZepa variant="bare" />
 *
 * Implementation notes:
 *  - Two stacked copies of the same marquee. The lower one is masked with a
 *    hole; the upper one is clipped to that hole and scaled from the same
 *    point, so the glass reads as a real optic rather than a larger chip
 *    with a leftover margin.
 *  - The rivers are CSS, not an animation library. Identical keyframes on
 *    both copies stay in lockstep because they mount together.
 *  - Lens position is written to custom properties through a ref while the
 *    pointer moves, so a drag never re-renders.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `zz-`.
 */

import { useCallback, useRef } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react"

export interface ZoomZepaTag {
  id: string
  label: string
  icon?: ReactNode
}

export interface ZoomZepaProps {
  rows?: ZoomZepaTag[][]
  title?: string
  description?: string
  /** Scale applied under the glass. 1 is a window with no zoom. */
  magnify?: number
  accent?: string
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const DEFAULT_ROWS: ZoomZepaTag[][] = [
  [
    { id: "heroes", label: "Heroes", icon: <Glyph d="M4 7h16v10H4zM4 11h16" /> },
    { id: "grids", label: "Grids", icon: <Glyph d="M5 5h6v6H5zM13 5h6v4H13zM5 15h6v4H5zM13 11h6v8H13z" /> },
    { id: "navbars", label: "Navbars", icon: <Glyph d="M5 7h14M5 12h14M5 17h10" /> },
    { id: "illustrations", label: "Illustrations", icon: <Glyph d="M12 4l1.7 4.8L18.5 10l-4.8 1.5L12 16.5l-1.7-5L5.5 10l4.8-1.2z" /> },
    { id: "footers", label: "Footers", icon: <Glyph d="M5 6h14v8H5zM5 17h14" /> },
  ],
  [
    { id: "marquee", label: "Marquee", icon: <Glyph d="M8 12H4l3-3M4 12l3 3M16 12h4l-3-3M20 12l-3 3" /> },
    { id: "lightbox", label: "Lightbox", icon: <Glyph d="M7 8h8v8H7zM10 6h8v8" /> },
    { id: "bento", label: "Bento", icon: <Glyph d="M5 5h6v14H5zM13 5h6v6H13zM13 13h6v6H13z" /> },
    { id: "timeline", label: "Timeline", icon: <Glyph d="M6 6v12M6 8h8M6 12h11M6 16h7" /> },
    { id: "command", label: "Command", icon: <Glyph d="M8 9l-3 3 3 3M12 16h5" /> },
  ],
  [
    { id: "video", label: "Video", icon: <Glyph d="M6 8h8v8H6zM14 11l4-2.5v7L14 13z" /> },
    { id: "hover", label: "Hover", icon: <Glyph d="M8 5v11l3-2 2 4 2-1-2-4h4z" /> },
    { id: "charts", label: "Charts", icon: <Glyph d="M6 16V10M12 16V6M18 16v-4" /> },
    { id: "stack", label: "Stack", icon: <Glyph d="M12 5l8 4-8 4-8-4zM4 13l8 4 8-4" /> },
    { id: "folder", label: "Folder", icon: <Glyph d="M4 8h5l2 2h9v8H4z" /> },
  ],
]

function Loupe() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M44.7 44.7 61 61"
        stroke="var(--zz-stem)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M46.4 46.4 60 60"
        stroke="var(--zz-stem-hi)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="18" fill="var(--zz-glass)" stroke="var(--zz-rim)" strokeWidth="4.5" />
      <circle cx="32" cy="32" r="15.2" fill="none" stroke="var(--zz-rim-hi)" strokeWidth="1.1" />
      <path
        d="M24 24c3.4-4 9.2-5.2 13.4-2.4"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.42"
      />
    </svg>
  )
}

function TagRows({
  rows,
  copies,
}: {
  rows: ZoomZepaTag[][]
  copies: number
}) {
  return (
    <>
      {rows.map((row, rowIndex) => {
        const strip = Array.from({ length: copies }, () => row).flat()
        return (
          <div
            key={row[0]?.id ?? rowIndex}
            className="zz-row"
            data-dir={rowIndex % 2 === 0 ? "fwd" : "rev"}
          >
            {strip.map((tag, copy) => (
              <span key={`${tag.id}-${copy}`} className="zz-chip">
                <span className="zz-ico">{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>
        )
      })}
    </>
  )
}

const CSS = `
.zz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--zz-w);justify-content:center}
.zz-shell *{box-sizing:border-box}
.zz-shell[data-variant="bare"]{max-width:none}
.zz-root{width:100%;padding:var(--zz-pad);border:1px solid var(--zz-line);border-radius:24px;background:var(--zz-bg);color:var(--zz-fg);-webkit-user-select:none;user-select:none}
.zz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

.zz-stage{position:relative;width:100%;height:var(--zz-stage-h);overflow:hidden;border-radius:18px;background:var(--zz-stage);touch-action:none}
.zz-flow{display:flex;flex-direction:column;justify-content:center;gap:var(--zz-gap);height:100%;padding-block:var(--zz-gap)}
.zz-row{display:flex;gap:var(--zz-gap);width:max-content;animation:zz-fwd 28s linear infinite}
.zz-row[data-dir="rev"]{animation-name:zz-rev}

.zz-chip{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border:1px solid var(--zz-chip-line);border-radius:999px;background:var(--zz-chip);color:var(--zz-muted);font-size:clamp(11px,3.2cqw,12.5px);font-weight:500;letter-spacing:-.01em;white-space:nowrap;line-height:1}
.zz-ico{display:flex;width:14px;height:14px;flex-shrink:0}
.zz-ico svg{width:100%;height:100%}

.zz-base{position:absolute;inset:0;mask-image:radial-gradient(circle var(--zz-hole) at calc(50% + var(--zz-x)) calc(50% + var(--zz-y)),#0000 100%,#000 100%);-webkit-mask-image:radial-gradient(circle var(--zz-hole) at calc(50% + var(--zz-x)) calc(50% + var(--zz-y)),#0000 100%,#000 100%)}
.zz-reveal{position:absolute;inset:0;z-index:1;pointer-events:none;clip-path:circle(var(--zz-hole) at calc(50% + var(--zz-x)) calc(50% + var(--zz-y)));-webkit-clip-path:circle(var(--zz-hole) at calc(50% + var(--zz-x)) calc(50% + var(--zz-y)))}
.zz-zoom{height:100%;transform:scale(var(--zz-mag));transform-origin:calc(50% + var(--zz-x)) calc(50% + var(--zz-y))}
.zz-reveal .zz-chip{background:var(--zz-chip-hi);border-color:var(--zz-chip-line-hi);color:var(--zz-accent);font-weight:600;box-shadow:0 8px 18px -12px var(--zz-accent)}
.zz-reveal .zz-ico{color:var(--zz-accent)}

.zz-edge{position:absolute;z-index:2;top:0;bottom:0;width:22%;pointer-events:none}
.zz-edge[data-side="l"]{left:0;background:linear-gradient(to right,var(--zz-stage),transparent)}
.zz-edge[data-side="r"]{right:0;background:linear-gradient(to left,var(--zz-stage),transparent)}

.zz-lens{position:absolute;z-index:3;left:calc(50% + var(--zz-x) - var(--zz-lens) / 2);top:calc(50% + var(--zz-y) - var(--zz-lens) / 2);width:var(--zz-lens);height:var(--zz-lens);padding:0;border:0;background:transparent;cursor:grab;color:inherit;filter:drop-shadow(0 10px 16px rgba(0,0,0,.35))}
.zz-lens:active,.zz-lens[data-drag="true"]{cursor:grabbing}
.zz-lens:focus-visible{outline:2px solid var(--zz-accent);outline-offset:4px;border-radius:999px}
.zz-lens svg{display:block;width:100%;height:100%;overflow:visible;pointer-events:none}

.zz-copy{padding:clamp(16px,5cqw,22px) clamp(6px,1.6cqw,8px) clamp(8px,2.4cqw,12px)}
.zz-title{margin:0;font-size:clamp(17px,5.2cqw,20px);font-weight:600;letter-spacing:-.03em;line-height:1.2;color:var(--zz-fg)}
.zz-desc{margin:8px 0 0;font-size:clamp(12.5px,3.6cqw,13.5px);line-height:1.55;color:var(--zz-muted)}

@keyframes zz-fwd{from{transform:translateX(0)}to{transform:translateX(-33.333%)}}
@keyframes zz-rev{from{transform:translateX(-33.333%)}to{transform:translateX(0)}}

@media (prefers-reduced-motion:reduce){
  .zz-row{animation-play-state:paused}
  .zz-zoom{transform:none}
}
`

export function ZoomZepa({
  rows = DEFAULT_ROWS,
  title = "Catalog",
  description = "Drag the glass across the registry. Whatever sits under it comes into focus.",
  magnify = 1.22,
  accent = "#8eb4ff",
  width = 420,
  theme = "dark",
  variant = "tile",
  className,
}: ZoomZepaProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: 0, y: 0 })
  const drag = useRef<{
    pointer: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const apply = useCallback((x: number, y: number) => {
    const stage = stageRef.current
    if (!stage) return

    const rect = stage.getBoundingClientRect()
    const pad = Math.min(28, rect.width * 0.12)
    const nx = Math.max(-rect.width / 2 + pad, Math.min(rect.width / 2 - pad, x))
    const ny = Math.max(-rect.height / 2 + pad, Math.min(rect.height / 2 - pad, y))
    pos.current = { x: nx, y: ny }
    stage.style.setProperty("--zz-x", `${nx}px`)
    stage.style.setProperty("--zz-y", `${ny}px`)
  }, [])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId)
      drag.current = {
        pointer: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: pos.current.x,
        originY: pos.current.y,
      }
      event.currentTarget.dataset.drag = "true"
    },
    []
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>) => {
      const session = drag.current
      if (!session || session.pointer !== event.pointerId) return
      apply(
        session.originX + (event.clientX - session.startX),
        session.originY + (event.clientY - session.startY)
      )
    },
    [apply]
  )

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag.current?.pointer !== event.pointerId) return
    drag.current = null
    delete event.currentTarget.dataset.drag
  }, [])

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const step = event.shiftKey ? 18 : 8
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        apply(pos.current.x - step, pos.current.y)
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        apply(pos.current.x + step, pos.current.y)
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        apply(pos.current.x, pos.current.y - step)
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        apply(pos.current.x, pos.current.y + step)
      }
    },
    [apply]
  )

  const isDark = theme === "dark"

  const shellStyle = {
    "--zz-w": `${width}px`,
    "--zz-accent": accent,
    "--zz-mag": String(magnify),
    "--zz-x": "0px",
    "--zz-y": "0px",
    "--zz-bg": isDark ? "#121214" : "#f7f7f8",
    "--zz-fg": isDark ? "#f2f2f4" : "#16161a",
    "--zz-muted": isDark ? "#8b8b96" : "#6d6d76",
    "--zz-line": isDark ? "#26262e" : "#e6e6ea",
    "--zz-stage": isDark ? "#0c0c0e" : "#ececf0",
    "--zz-chip": isDark ? "rgba(255,255,255,.045)" : "rgba(255,255,255,.7)",
    "--zz-chip-hi": isDark ? "#1c1c22" : "#ffffff",
    "--zz-chip-line": isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)",
    "--zz-chip-line-hi": isDark ? "color-mix(in oklab,var(--zz-accent) 35%,transparent)" : "color-mix(in oklab,var(--zz-accent) 40%,#fff)",
    "--zz-rim": isDark ? "#c5cdd4" : "#d5dbe0",
    "--zz-rim-hi": isDark ? "#eef3f6" : "#f6f8fa",
    "--zz-glass": isDark ? "rgba(180,200,220,.16)" : "rgba(255,255,255,.28)",
    "--zz-stem": isDark ? "#6f767c" : "#8b9298",
    "--zz-stem-hi": isDark ? "#c4ccd2" : "#dfe5ea",
  } as CSSProperties

  const fluidStyle = {
    "--zz-pad": "clamp(6px, 1.8cqw, 8px)",
    "--zz-gap": "clamp(10px, 3.2cqw, 14px)",
    "--zz-stage-h": "clamp(188px, 56cqw, 236px)",
    "--zz-lens": "clamp(76px, 22cqw, 96px)",
    "--zz-hole": "calc(var(--zz-lens) * 0.245)",
  } as CSSProperties

  return (
    <div
      className={className ? `zz-shell ${className}` : "zz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div className="zz-root" data-variant={variant} style={fluidStyle}>
        <div ref={stageRef} className="zz-stage">
          <div className="zz-base">
            <div className="zz-flow">
              <TagRows rows={rows} copies={3} />
            </div>
          </div>

          <div className="zz-reveal">
            <div className="zz-zoom">
              <div className="zz-flow">
                <TagRows rows={rows} copies={3} />
              </div>
            </div>
          </div>

          <div className="zz-edge" data-side="l" />
          <div className="zz-edge" data-side="r" />

          <button
            type="button"
            className="zz-lens"
            aria-label="Magnifying glass, drag or use arrow keys"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
          >
            <Loupe />
          </button>
        </div>

        {title || description ? (
          <div className="zz-copy">
            {title ? <h3 className="zz-title">{title}</h3> : null}
            {description ? <p className="zz-desc">{description}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ZoomZepa
