"use client"

/**
 * ReportZepa — stacked area report card.
 *
 * Three stacked series drawn as smooth areas with gradient fills and glowing
 * top lines. The plot wipes in when it scrolls into view, and moving the
 * pointer across it snaps a marker to the nearest column with a readout.
 *
 *   <ReportZepa />
 *   <ReportZepa title="Installs" series={mySeries} labels={myLabels} />
 *   <ReportZepa variant="bare" />
 *
 * Implementation notes:
 *  - No charting library. Paths are Catmull-Rom splines converted to cubic
 *    beziers; the stack is a running cumulative total per column.
 *  - Data is **static and deterministic**. Generating it with `Math.random()`
 *    or `new Date()` at module scope — as chart snippets usually do — renders
 *    different values on the server and the client and trips a hydration
 *    mismatch on every load.
 *  - The reveal is a `clip-path: inset()` transition gated on an
 *    IntersectionObserver, and the finished state is the default, so the chart
 *    is fully drawn with JS off or motion reduced.
 *  - Hover sets state only when the nearest column actually changes, so a
 *    pointer sweep costs a handful of renders rather than one per frame.
 *  - Gradient and filter ids are namespaced with `useId()`.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `rp-`.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

export interface ReportZepaSeries {
  id: string
  label: string
  color: string
  /** One value per column. All series must be the same length as `labels`. */
  data: number[]
}

export interface ReportZepaProps {
  title?: string
  /** Bottom of the stack first. */
  series?: ReportZepaSeries[]
  labels?: string[]
  /** Plot height in px within the viewBox. */
  height?: number
  /** Max card width in px. */
  width?: number
  /** Horizontal gridline count. */
  gridLines?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

const DEFAULT_LABELS = ["4/8", "5/8", "6/8", "7/8", "8/8", "9/8", "10/8"]

const DEFAULT_SERIES: ReportZepaSeries[] = [
  {
    id: "heroes",
    label: "Heroes",
    color: "#BB015A",
    data: [18, 22, 19, 27, 24, 31, 34],
  },
  {
    id: "grids",
    label: "Grids",
    color: "#EE4094",
    data: [12, 14, 20, 17, 25, 22, 29],
  },
  {
    id: "illustrations",
    label: "Illustrations",
    color: "#FAE5F6",
    data: [4, 6, 5, 9, 12, 18, 23],
  },
]

const VIEW_W = 620
const PAD = { top: 18, right: 18, bottom: 30, left: 18 }

/** Catmull-Rom through the points, emitted as cubic beziers. */
function spline(points: Array<[number, number]>) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0][0]},${points[0][1]}`

  let d = `M ${points[0][0]},${points[0][1]}`

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6

    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(
      2
    )},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }

  return d
}

const CSS = `
.rp-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--rp-w);justify-content:center}
.rp-shell *{box-sizing:border-box}
.rp-shell[data-variant="bare"]{max-width:none}
.rp-root{display:flex;flex-direction:column;width:100%;padding:var(--rp-pad) 0 calc(var(--rp-pad) * .6);border:1px solid var(--rp-line);border-radius:24px;background:var(--rp-bg);color:var(--rp-fg);-webkit-user-select:none;user-select:none;box-shadow:0 11px 3px rgba(0,0,0,.06),0 14px 27px rgba(0,0,0,.14),0 27px 54px rgba(0,0,0,.2),0 55px 110px rgba(0,0,0,.26)}
.rp-root[data-variant="bare"]{padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}

.rp-head{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:0 var(--rp-pad) clamp(14px,4cqw,22px)}
.rp-title{margin:0;font-size:clamp(20px,6cqw,30px);font-weight:700;letter-spacing:-.02em;line-height:1.15}
.rp-total{font-size:clamp(12px,3.2cqw,14px);font-weight:500;color:var(--rp-muted);font-variant-numeric:tabular-nums;white-space:nowrap}

.rp-plot{position:relative;padding:0 clamp(6px,2cqw,10px)}
.rp-plot svg{display:block;width:100%;height:auto;overflow:visible}
.rp-grid{stroke:var(--rp-grid);stroke-width:1}
.rp-tick{fill:var(--rp-tick);font-size:11px;font-weight:500}
.rp-line{fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
/* The cursor group and each knob are always mounted and moved with a CSS
   transform, so they glide between columns instead of snapping. SVG geometry
   attributes (x1, cx, cy) cannot be transitioned — transform can, with
   transform-box pinned to the view box so px means user units. */
.rp-cursor{opacity:0;transition:opacity .2s ease}
.rp-root[data-hover="true"] .rp-cursor{opacity:1}
.rp-cursor-line,.rp-knob-g{transform-box:view-box;transform-origin:0 0;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.rp-marker{stroke:var(--rp-tick);stroke-width:1;stroke-dasharray:3 3}
.rp-knob{stroke:var(--rp-bg);stroke-width:2.5}
@media (prefers-reduced-motion:reduce){
  .rp-cursor-line,.rp-knob-g,.rp-tip{transition-duration:1ms}
}

/* The wipe runs on the whole plot group. Finished state is the default so the
   chart is complete with JS off or motion reduced. */
.rp-layers{clip-path:inset(0 0 0 0)}
@media (prefers-reduced-motion:no-preference){
  .rp-root[data-play="false"] .rp-layers{clip-path:inset(0 100% 0 0)}
  .rp-root[data-play="true"] .rp-layers{transition:clip-path 1.1s cubic-bezier(.16,1,.3,1)}
}

.rp-tip{position:absolute;top:8px;left:0;z-index:2;min-width:0;padding:9px 11px;border:1px solid var(--rp-line-hi);border-radius:11px;background:var(--rp-tip);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);pointer-events:none;opacity:0;transform:translateX(calc(var(--rp-tip-x) - 50%));transition:transform .3s cubic-bezier(.16,1,.3,1),opacity .2s ease}
.rp-root[data-hover="true"] .rp-tip{opacity:1}
.rp-tip-date{margin:0 0 6px;font-size:11px;font-weight:600;color:var(--rp-muted)}
.rp-tip-row{display:flex;align-items:center;gap:7px;font-size:11.5px;line-height:1.6;white-space:nowrap}
.rp-tip-dot{width:7px;height:7px;border-radius:999px;flex-shrink:0}
.rp-tip-val{margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums}
`

export function ReportZepa({
  title = "Install report",
  series = DEFAULT_SERIES,
  labels = DEFAULT_LABELS,
  height = 250,
  width = 420,
  gridLines = 4,
  theme = "dark",
  variant = "tile",
  className,
}: ReportZepaProps) {
  const uid = `rp-${useId().replace(/:/g, "")}`
  const [playing, setPlaying] = useState(false)
  // `active` is always a real column so the marker has somewhere to sit while
  // it fades out; `hovering` controls visibility. Keeping them separate is
  // what lets the cursor glide away rather than vanish and reset to column 0.
  const [active, setActive] = useState(0)
  const [hovering, setHovering] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)

  const columns = labels.length
  const viewH = height + PAD.top + PAD.bottom

  const geometry = useMemo(() => {
    const innerW = VIEW_W - PAD.left - PAD.right
    const step = columns > 1 ? innerW / (columns - 1) : 0

    // Running cumulative totals — the stack.
    const totals = Array.from({ length: columns }, (_, column) =>
      series.reduce((sum, entry) => sum + (entry.data[column] ?? 0), 0)
    )
    const peak = Math.max(1, ...totals)

    const x = (column: number) => PAD.left + column * step
    const y = (value: number) =>
      PAD.top + (1 - value / peak) * height

    // Cumulative height of the stack up to and including `depth`, at `column`.
    // Recomputed rather than accumulated into a mutable running total — three
    // series by seven columns is nothing, and a reassigned accumulator inside
    // a render callback is exactly what `react-hooks/immutability` forbids.
    const stackedTo = (depth: number, column: number) =>
      series
        .slice(0, depth + 1)
        .reduce((sum, entry) => sum + (entry.data[column] ?? 0), 0)

    const bands = series.map((entry, depth) => {
      const upper = Array.from({ length: columns }, (_, column) =>
        stackedTo(depth, column)
      )
      const lower = Array.from({ length: columns }, (_, column) =>
        depth === 0 ? 0 : stackedTo(depth - 1, column)
      )

      const upperPoints = upper.map(
        (value, column) => [x(column), y(value)] as [number, number]
      )
      const lowerPoints = lower.map(
        (value, column) => [x(column), y(value)] as [number, number]
      )

      const area = `${spline(upperPoints)} L ${x(columns - 1)},${y(
        lower[columns - 1]
      )} ${spline([...lowerPoints].reverse()).replace("M", "L")} Z`

      return { entry, line: spline(upperPoints), area, upperPoints }
    })

    return { bands, totals, peak, x, y, step }
  }, [series, columns, height])

  const grandTotal = geometry.totals.reduce((sum, value) => sum + value, 0)

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

  // Only commits when the nearest column changes, so sweeping the pointer
  // across the plot costs a few renders instead of one per frame.
  const handleMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const plot = plotRef.current
      if (!plot) return

      const rect = plot.getBoundingClientRect()
      if (!rect.width) return

      const scale = rect.width / VIEW_W
      const local = (event.clientX - rect.left) / scale
      const index = Math.round((local - PAD.left) / (geometry.step || 1))
      const clamped = Math.max(0, Math.min(columns - 1, index))

      setHovering(true)
      setActive((current) => (current === clamped ? current : clamped))
    },
    [columns, geometry.step]
  )

  const clearActive = useCallback(() => setHovering(false), [])

  const isDark = theme === "dark"

  const shellStyle = {
    "--rp-w": `${width}px`,
    "--rp-bg": isDark ? "#000000" : "#ffffff",
    "--rp-tip": isDark ? "rgba(18,18,22,.92)" : "rgba(255,255,255,.94)",
    "--rp-fg": isDark ? "#ffffff" : "#111114",
    "--rp-muted": isDark ? "#8b8b96" : "#71717a",
    "--rp-tick": isDark ? "#A0AEC0" : "#9A9AAF",
    "--rp-grid": isDark ? "rgba(120,130,150,.28)" : "#7E7E8F55",
    "--rp-line": isDark ? "#ffffff14" : "#e4e4e7",
    "--rp-line-hi": isDark ? "#ffffff24" : "#d4d4d8",
  } as CSSProperties

  const fluidStyle = {
    "--rp-pad": "clamp(18px, 6cqw, 28px)",
  } as CSSProperties

  const activeX = geometry.x(active)
  const tipLeft = `${((activeX / VIEW_W) * 100).toFixed(3)}%`

  return (
    <div
      className={className ? `rp-shell ${className}` : "rp-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        ref={rootRef}
        className="rp-root"
        data-variant={variant}
        data-play={playing}
        data-hover={hovering}
        style={fluidStyle}
      >
        <div className="rp-head">
          {title ? <h3 className="rp-title">{title}</h3> : null}
          <span className="rp-total">{grandTotal.toLocaleString()} total</span>
        </div>

        <div
          ref={plotRef}
          className="rp-plot"
          onPointerMove={handleMove}
          onPointerLeave={clearActive}
        >
          <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} role="img" aria-label={title}>
            <defs>
              {series.map((entry) => (
                <linearGradient
                  key={entry.id}
                  id={`${uid}-${entry.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity="0.34" />
                  <stop offset="80%" stopColor={entry.color} stopOpacity="0.06" />
                  <stop offset="100%" stopColor={entry.color} stopOpacity="0" />
                </linearGradient>
              ))}
              <filter id={`${uid}-glow`} x="-30%" y="-60%" width="160%" height="260%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {Array.from({ length: gridLines + 1 }, (_, row) => {
              const y = PAD.top + (row / gridLines) * height
              return (
                <line
                  key={row}
                  className="rp-grid"
                  x1={PAD.left}
                  x2={VIEW_W - PAD.right}
                  y1={y}
                  y2={y}
                />
              )
            })}

            <g className="rp-layers">
              {geometry.bands.map(({ entry, area }) => (
                <path
                  key={`${entry.id}-area`}
                  d={area}
                  fill={`url(#${uid}-${entry.id})`}
                />
              ))}
              {geometry.bands.map(({ entry, line }) => (
                <path
                  key={`${entry.id}-line`}
                  className="rp-line"
                  d={line}
                  stroke={entry.color}
                  filter={`url(#${uid}-glow)`}
                />
              ))}
            </g>

            <g className="rp-cursor">
              <g
                className="rp-cursor-line"
                style={{ transform: `translateX(${activeX}px)` }}
              >
                <line
                  className="rp-marker"
                  x1={0}
                  x2={0}
                  y1={PAD.top}
                  y2={PAD.top + height}
                />
              </g>

              {geometry.bands.map(({ entry, upperPoints }) => (
                <g
                  key={`${entry.id}-knob`}
                  className="rp-knob-g"
                  style={{
                    transform: `translate(${upperPoints[active][0]}px, ${upperPoints[active][1]}px)`,
                  }}
                >
                  <circle className="rp-knob" r="4.5" fill={entry.color} />
                </g>
              ))}
            </g>

            {labels.map((label, column) => (
              <text
                key={label}
                className="rp-tick"
                x={geometry.x(column)}
                y={PAD.top + height + 20}
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </svg>

          <div
            className="rp-tip"
            style={{ "--rp-tip-x": tipLeft } as CSSProperties}
            aria-hidden="true"
          >
            <p className="rp-tip-date">{labels[active]}</p>
            {[...series].reverse().map((entry) => (
              <div key={entry.id} className="rp-tip-row">
                <span
                  className="rp-tip-dot"
                  style={{ background: entry.color }}
                />
                <span>{entry.label}</span>
                <span className="rp-tip-val">{entry.data[active]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportZepa
