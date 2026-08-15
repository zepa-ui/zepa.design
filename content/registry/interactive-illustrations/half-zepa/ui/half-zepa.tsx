"use client"

/**
 * HalfZepa — report card: horizontal bars over a divided metrics list.
 *
 * Bars grow from the left when the card scrolls into view, the metric rows
 * rise in behind them, and hovering a row reveals its value at the bar's end.
 *
 *   <HalfZepa />
 *   <HalfZepa title="Registry report" bars={myBars} metrics={myMetrics} />
 *   <HalfZepa variant="bare" />
 *
 * Implementation notes:
 *  - No charting library. A horizontal bar chart is a two-column grid: labels
 *    in column one, tracks in column two, and a gridline layer explicitly
 *    placed at `grid-column: 2; grid-row: 1 / -1` so it spans every row
 *    without disturbing placement.
 *  - Bars animate with `transform: scaleX()` from a left origin, never
 *    `width` — a transform is composited, a width change is layout on every
 *    frame for every row.
 *  - Reveal is gated on an IntersectionObserver and the finished state is the
 *    default, so the card reads correctly with JS off or motion reduced.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `hz-`.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, ReactNode } from "react"

export interface HalfZepaBar {
  id: string
  label: string
  value: number
  /** Overrides the position in the palette. */
  color?: string
}

export interface HalfZepaMetric {
  id: string
  label: string
  value: string
  /** "up" is drawn as a rise, "down" as a fall. */
  trend?: "up" | "down"
  /** Colours the trend badge. "good" reads as an improvement. */
  tone?: "good" | "bad"
  icon?: ReactNode
}

export interface HalfZepaProps {
  title?: string
  bars?: HalfZepaBar[]
  metrics?: HalfZepaMetric[]
  /** Bar palette, applied in order. */
  palette?: string[]
  /** Truncate category labels to this many characters. 0 disables it. */
  labelMaxChars?: number
  /** Vertical gridline count. */
  gridLines?: number
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

function IconDiamond() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.2 17.8 10 10 17.8 2.2 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 6.4v4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.7" r="0.95" fill="currentColor" />
    </svg>
  )
}

function IconCircle() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.1v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="0.95" fill="currentColor" />
    </svg>
  )
}

function IconTriangle() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.9 18.1 16.6H1.9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 7.6v4.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.2" r="0.95" fill="currentColor" />
    </svg>
  )
}

const FALLBACK_ICONS = [<IconDiamond key="d" />, <IconCircle key="c" />, <IconTriangle key="t" />]

const DEFAULT_PALETTE = ["#9152EE", "#40D3F4", "#40E5D1", "#4C86FF"]

const DEFAULT_BARS: HalfZepaBar[] = [
  { id: "heroes", label: "Heroes", value: 120 },
  { id: "grids", label: "Grids", value: 90 },
  { id: "navbars", label: "Navbars", value: 75 },
  { id: "illustrations", label: "Illustrations", value: 110 },
]

const DEFAULT_METRICS: HalfZepaMetric[] = [
  { id: "ship", label: "Mean time to ship", value: "6 Hours", trend: "up", tone: "bad" },
  { id: "review", label: "Review turnaround", value: "4 Hours", trend: "up", tone: "bad" },
  { id: "rework", label: "Rework rate", value: "10%", trend: "down", tone: "good" },
]

const CSS = `
.hz-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--hz-w);justify-content:center}
.hz-shell *{box-sizing:border-box}
.hz-shell[data-variant="bare"]{max-width:none}
.hz-root{display:flex;flex-direction:column;width:100%;padding:var(--hz-pad) 0;border:1px solid var(--hz-line);border-radius:24px;background:var(--hz-bg);color:var(--hz-fg);-webkit-user-select:none;user-select:none;box-shadow:0 14px 27px rgba(0,0,0,.14),0 27px 54px rgba(0,0,0,.2),0 55px 110px rgba(0,0,0,.26)}
.hz-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}

.hz-title{margin:0 0 clamp(20px,6cqw,30px);padding:0 var(--hz-pad);font-size:clamp(20px,6cqw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15}

/* Two columns: labels, then tracks. The gridline layer is placed explicitly
   so it spans every row without taking part in auto-placement. */
.hz-chart{display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:12px;row-gap:clamp(10px,3cqw,14px);padding:0 var(--hz-pad)}
.hz-grid{position:relative;z-index:0;grid-column:2;grid-row:1 / -1;pointer-events:none}
.hz-gridline{position:absolute;top:calc(var(--hz-bar) * -.45);bottom:calc(var(--hz-bar) * -.45);width:1px;background:var(--hz-grid)}
.hz-cat{grid-column:1;font-size:clamp(11px,3cqw,12.5px);color:var(--hz-tick);white-space:nowrap;text-align:right}
.hz-track{position:relative;z-index:1;grid-column:2;display:flex;align-items:center;height:var(--hz-bar)}
.hz-bar{height:100%;border-radius:6px;background:var(--hz-c);width:var(--hz-pct);transform-origin:left center;box-shadow:0 0 18px -2px var(--hz-c)}
.hz-value{margin-left:8px;font-size:clamp(10px,2.8cqw,12px);font-weight:600;color:var(--hz-fg);font-variant-numeric:tabular-nums;opacity:0;transition:opacity .22s ease}
.hz-row:hover .hz-value,.hz-track:hover .hz-value{opacity:1}

.hz-metrics{display:flex;flex-direction:column;margin-top:clamp(22px,6cqw,34px);padding:0 var(--hz-pad)}
.hz-metric{display:flex;align-items:center;gap:10px;padding:clamp(11px,3.4cqw,16px) 0;border-top:1px solid var(--hz-line)}
.hz-metric:first-child{border-top:0}
.hz-metric-label{display:flex;align-items:center;gap:9px;min-width:0;flex:1;font-size:clamp(12px,3.4cqw,15px);color:var(--hz-muted)}
.hz-metric-label span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hz-metric-icon{display:flex;flex-shrink:0;width:20px;height:20px;color:var(--hz-alert)}
.hz-metric-icon svg{width:100%;height:100%}
.hz-metric-value{display:flex;align-items:center;gap:9px;flex-shrink:0}
.hz-metric-num{font-size:clamp(15px,4.4cqw,20px);font-weight:600;letter-spacing:-.01em;color:var(--hz-fg)}
.hz-badge{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:999px;background:color-mix(in oklab,var(--hz-t) 40%,transparent);color:var(--hz-t)}
.hz-badge svg{width:16px;height:16px}

@keyframes hz-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes hz-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* Finished state is the default; the empty state only exists where motion is
   welcome, so the card is complete with JS off. */
@media (prefers-reduced-motion:no-preference){
  .hz-root[data-play="false"] .hz-bar{transform:scaleX(0)}
  .hz-root[data-play="true"] .hz-bar{animation:hz-grow .85s cubic-bezier(.16,1,.3,1) var(--hz-delay) both}
  .hz-root[data-play="false"] .hz-metric{opacity:0}
  .hz-root[data-play="true"] .hz-metric{animation:hz-rise .5s ease var(--hz-delay) both}
}
`

function TrendGlyph({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={
          direction === "up"
            ? "M12 19V5M6 11l6-6 6 6"
            : "M12 5v14M6 13l6 6 6-6"
        }
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
    </svg>
  )
}

export function HalfZepa({
  title = "Registry report",
  bars = DEFAULT_BARS,
  metrics = DEFAULT_METRICS,
  palette = DEFAULT_PALETTE,
  labelMaxChars = 5,
  gridLines = 4,
  width = 448,
  theme = "dark",
  variant = "tile",
  className,
}: HalfZepaProps) {
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

  const peak = Math.max(1, ...bars.map((bar) => bar.value))
  const isDark = theme === "dark"

  const shellStyle = {
    "--hz-w": `${width}px`,
    "--hz-bg": isDark ? "#000000" : "#ffffff",
    "--hz-fg": isDark ? "#ffffff" : "#111114",
    "--hz-muted": isDark ? "#9096a4" : "#6b7280",
    "--hz-tick": isDark ? "#A0AEC0" : "#9A9AAF",
    "--hz-grid": isDark ? "rgba(120,130,150,.3)" : "#7E7E8F55",
    "--hz-line": isDark ? "#262631" : "#e5e7eb",
    "--hz-alert": "#E84045",
  } as CSSProperties

  const fluidStyle = {
    "--hz-pad": "clamp(20px, 6.5cqw, 30px)",
    "--hz-bar": "clamp(20px, 6cqw, 26px)",
  } as CSSProperties

  return (
    <div
      className={className ? `hz-shell ${className}` : "hz-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="hz-root"
        data-variant={variant}
        data-play={playing}
        style={fluidStyle}
      >
        {title ? <h3 className="hz-title">{title}</h3> : null}

        <div className="hz-chart">
          <div className="hz-grid" aria-hidden="true">
            {Array.from({ length: gridLines + 1 }, (_, index) => (
              <span
                key={index}
                className="hz-gridline"
                style={{ left: `${(index / gridLines) * 100}%` }}
              />
            ))}
          </div>

          {bars.map((bar, index) => {
            const shortened =
              labelMaxChars > 0 && bar.label.length > labelMaxChars
                ? `${bar.label.slice(0, labelMaxChars)}...`
                : bar.label

            return (
              <div key={bar.id} style={{ display: "contents" }}>
                <span
                  className="hz-cat"
                  style={{ gridRow: index + 1 }}
                  title={bar.label}
                >
                  {shortened}
                </span>

                <div className="hz-track" style={{ gridRow: index + 1 }}>
                  <div
                    className="hz-bar"
                    style={
                      {
                        "--hz-pct": `${(bar.value / peak) * 100}%`,
                        "--hz-c": bar.color ?? palette[index % palette.length],
                        "--hz-delay": `${index * 0.08}s`,
                      } as CSSProperties
                    }
                  />
                  <span className="hz-value">{bar.value}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hz-metrics">
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className="hz-metric"
              style={{ "--hz-delay": `${index * 0.06}s` } as CSSProperties}
            >
              <div className="hz-metric-label">
                <span className="hz-metric-icon">
                  {metric.icon ?? FALLBACK_ICONS[index % FALLBACK_ICONS.length]}
                </span>
                <span title={metric.label}>{metric.label}</span>
              </div>

              <div className="hz-metric-value">
                <span className="hz-metric-num">{metric.value}</span>
                <span
                  className="hz-badge"
                  style={
                    {
                      "--hz-t": metric.tone === "good" ? "#40E5D1" : "#E84045",
                    } as CSSProperties
                  }
                >
                  <TrendGlyph direction={metric.trend ?? "up"} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HalfZepa
