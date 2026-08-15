"use client"

/**
 * RingZepa — concentric progress rings.
 *
 * Three nested arcs that sweep to their values when the illustration scrolls
 * into view, with the readouts counting up alongside them.
 *
 *   <RingZepa />
 *   <RingZepa metrics={myMetrics} size={220} />
 *   <RingZepa variant="bare" layout="column" />
 *
 * Implementation notes:
 *  - One SVG holding three concentric circles, not three stacked SVGs. Radii
 *    are derived from `size`, `thickness` and `ringGap`, so any ring count
 *    works and nothing has to be hand-positioned.
 *  - The sweep is a CSS `stroke-dashoffset` animation gated on an
 *    IntersectionObserver — a mount animation would play while the component
 *    is still below the fold.
 *  - The resting state is the *finished* state, and the pre-play state only
 *    exists inside `prefers-reduced-motion: no-preference`. With JS off or
 *    motion reduced, the rings simply render at their real values.
 *  - Readouts count up on a rAF loop writing textContent through refs; no
 *    per-frame state.
 *  - Gradient ids are namespaced with `useId()`. Hardcoded ids derived from a
 *    label are document-global and collide between instances.
 *  - Every class and keyframe is prefixed `rz-`.
 *  - No `font-family` is declared. Typography inherits from the host app, so
 *    this renders in Manrope on Zepa and in the consumer's own font after
 *    install. The type *scale* is fixed: title 24/500, label 14/500,
 *    value 24/600, unit 16/400, each clamped to scale with the container.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { CSSProperties } from "react"

export interface RingZepaMetric {
  id: string
  label: string
  /** Ring fill, 0–100. Defaults to current/target. */
  value?: number
  current: number
  target: number
  unit?: string
  color: string
}

export interface RingZepaProps {
  title?: string
  metrics?: RingZepaMetric[]
  /** Outer ring diameter in px — the maximum; it scales down with the container. */
  size?: number
  /** Ring stroke width in px. */
  thickness?: number
  /** Space between rings in px. */
  ringGap?: number
  /** Seconds for the sweep. */
  duration?: number
  /** "row" puts the readouts beside the rings, "column" stacks them. */
  layout?: "row" | "column"
  /** Max illustration width in px. */
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

const DEFAULT_METRICS: RingZepaMetric[] = [
  {
    id: "components",
    label: "COMPONENTS",
    current: 64,
    target: 80,
    unit: "SHIPPED",
    color: "#FF2E55",
  },
  {
    id: "categories",
    label: "CATEGORIES",
    current: 5,
    target: 8,
    unit: "LIVE",
    color: "#A5F70C",
  },
  {
    id: "templates",
    label: "TEMPLATES",
    current: 3,
    target: 12,
    unit: "BUILT",
    color: "#12C8DE",
  },
]

const CSS = `
.rz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--rz-w);justify-content:center}
.rz-shell *{box-sizing:border-box}
.rz-shell[data-variant="bare"]{max-width:none}
/* No font-family on purpose — typography is inherited from the host app, so
   the illustration reads in Manrope on Zepa and in the consumer's own font
   after install. Hardcoding var(--font-manrope) would fall back to a system
   stack in anyone else's project, which is worse than inheriting. */
.rz-root{display:flex;flex-direction:column;align-items:center;gap:clamp(18px,5cqw,30px);width:100%;padding:var(--rz-pad);border:1px solid var(--rz-line);border-radius:20px;background:var(--rz-bg);color:var(--rz-fg);-webkit-user-select:none;user-select:none}
.rz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent}

/* Type scale matches the reference brief exactly at full width:
   title 24/500, label 14/500, value 24/600, unit 16/400. Each is clamped so it
   scales down with the container rather than being pinned. */
.rz-title{margin:0;font-size:clamp(18px,5.2cqw,24px);font-weight:500;letter-spacing:-.01em;line-height:1.2}

.rz-body{display:flex;align-items:center;justify-content:center;gap:clamp(20px,7cqw,44px);width:100%}
.rz-root[data-layout="column"] .rz-body{flex-direction:column}
@container (max-width: 430px){
  .rz-body{flex-direction:column}
}

.rz-dial{position:relative;flex-shrink:0;width:var(--rz-size);height:var(--rz-size)}
.rz-dial svg{display:block;width:100%;height:100%}
.rz-track{fill:none;stroke:var(--rz-track);stroke-width:var(--rz-t)}
.rz-ring{fill:none;stroke-width:var(--rz-t);stroke-linecap:round;stroke-dasharray:var(--rz-len);stroke-dashoffset:var(--rz-to)}

.rz-stats{display:flex;flex-direction:column;gap:clamp(16px,5cqw,24px);min-width:0}
.rz-stat{display:flex;flex-direction:column;align-items:flex-start;gap:1px}
.rz-label{font-size:clamp(11px,3cqw,14px);font-weight:500;letter-spacing:.01em;color:var(--rz-muted);line-height:1.4}
.rz-value{display:flex;align-items:baseline;font-size:clamp(19px,5.6cqw,24px);font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums;line-height:1.3}
.rz-unit{margin-left:4px;font-size:clamp(12px,3.4cqw,16px);font-weight:400;letter-spacing:0;color:var(--rz-muted)}
.rz-total{font-weight:600}

@keyframes rz-fill{from{stroke-dashoffset:var(--rz-len)}to{stroke-dashoffset:var(--rz-to)}}
@keyframes rz-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

/* The resting state is the FINISHED state. The pre-play state only exists when
   motion is welcome, so with JS off or reduced motion the rings still render
   at their real values instead of sitting empty. */
@media (prefers-reduced-motion:no-preference){
  .rz-root[data-play="false"] .rz-ring{stroke-dashoffset:var(--rz-len)}
  .rz-root[data-play="true"] .rz-ring{animation:rz-fill var(--rz-dur) cubic-bezier(.16,1,.3,1) var(--rz-delay) both}
  .rz-root[data-play="false"] .rz-stat{opacity:0}
  .rz-root[data-play="true"] .rz-stat{animation:rz-rise .5s ease var(--rz-delay) both}
}
`

export function RingZepa({
  title = "Library progress",
  metrics = DEFAULT_METRICS,
  size = 200,
  thickness = 16,
  ringGap = 6,
  duration = 1.5,
  layout = "row",
  width = 520,
  theme = "dark",
  variant = "tile",
  className,
}: RingZepaProps) {
  const gradientBase = `rz-${useId().replace(/:/g, "")}`
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const valueRefs = useRef<Array<HTMLSpanElement | null>>([])

  const start = useCallback(() => setPlaying(true), [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    // A mount animation plays while the illustration is still below the fold.
    // Fire once, on first intersection, then stop observing.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [start])

  // Readouts count up alongside the sweep. rAF + textContent, so the numbers
  // never trigger a React render.
  useEffect(() => {
    if (!playing) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const frames: number[] = []

    metrics.forEach((metric, index) => {
      const element = valueRefs.current[index]
      if (!element) return

      if (reduce) {
        element.textContent = String(metric.current)
        return
      }

      const delay = index * 180
      const span = duration * 1000
      let startedAt = 0

      const step = (now: number) => {
        if (!startedAt) startedAt = now
        const elapsed = now - startedAt - delay

        if (elapsed < 0) {
          frames[index] = requestAnimationFrame(step)
          return
        }

        const t = Math.min(1, elapsed / span)
        const eased = 1 - Math.pow(1 - t, 3)
        element.textContent = String(Math.round(metric.current * eased))
        if (t < 1) frames[index] = requestAnimationFrame(step)
      }

      frames[index] = requestAnimationFrame(step)
    })

    return () => frames.forEach((frame) => cancelAnimationFrame(frame))
  }, [playing, metrics, duration])

  const isDark = theme === "dark"
  const centre = size / 2

  const shellStyle = {
    "--rz-w": `${width}px`,
    "--rz-bg": isDark ? "#08080a" : "#ffffff",
    "--rz-fg": isDark ? "#f4f4f5" : "#18181b",
    "--rz-muted": isDark ? "#8b8b94" : "#71717a",
    "--rz-line": isDark ? "#ffffff1f" : "#e4e4e7",
    "--rz-track": isDark ? "#ffffff14" : "#00000012",
  } as CSSProperties

  const fluidStyle = {
    "--rz-size": `clamp(140px, 42cqw, ${size}px)`,
    "--rz-pad": `clamp(18px, 5.5cqw, 32px)`,
    "--rz-t": `${thickness}`,
    "--rz-dur": `${duration}s`,
  } as CSSProperties

  return (
    <div
      className={className ? `rz-shell ${className}` : "rz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="rz-root"
        data-variant={variant}
        data-layout={layout}
        data-play={playing}
        style={fluidStyle}
      >
        {title ? <p className="rz-title">{title}</p> : null}

        <div className="rz-body">
          <div className="rz-dial">
            <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
              <defs>
                {metrics.map((metric) => (
                  <linearGradient
                    key={metric.id}
                    id={`${gradientBase}-${metric.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={metric.color} />
                    <stop
                      offset="100%"
                      stopColor={`color-mix(in oklab, ${metric.color} 62%, #ffffff)`}
                    />
                  </linearGradient>
                ))}
              </defs>

              <g transform={`rotate(-90 ${centre} ${centre})`}>
                {metrics.map((metric, index) => {
                  const radius =
                    (size - thickness) / 2 - index * (thickness + ringGap)
                  if (radius <= 0) return null

                  const length = 2 * Math.PI * radius
                  const ratio =
                    metric.value ??
                    (metric.target > 0
                      ? (metric.current / metric.target) * 100
                      : 0)
                  const offset = length * (1 - Math.min(100, ratio) / 100)

                  return (
                    <g key={metric.id}>
                      <circle
                        className="rz-track"
                        cx={centre}
                        cy={centre}
                        r={radius}
                      />
                      <circle
                        className="rz-ring"
                        cx={centre}
                        cy={centre}
                        r={radius}
                        stroke={`url(#${gradientBase}-${metric.id})`}
                        style={
                          {
                            "--rz-len": `${length}`,
                            "--rz-to": `${offset}`,
                            "--rz-delay": `${index * 0.18}s`,
                          } as CSSProperties
                        }
                      />
                    </g>
                  )
                })}
              </g>
            </svg>
          </div>

          <div className="rz-stats">
            {metrics.map((metric, index) => (
              <div
                key={metric.id}
                className="rz-stat"
                style={{ "--rz-delay": `${index * 0.18}s` } as CSSProperties}
              >
                <span className="rz-label">{metric.label}</span>
                <span className="rz-value" style={{ color: metric.color }}>
                  <span
                    ref={(element) => {
                      valueRefs.current[index] = element
                    }}
                  >
                    {metric.current}
                  </span>
                  <span className="rz-total">/{metric.target}</span>
                  {metric.unit ? (
                    <span className="rz-unit">{metric.unit}</span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RingZepa
