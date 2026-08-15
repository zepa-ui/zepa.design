"use client"

/**
 * ThreatZepa — detection card.
 *
 * A status banner with a spinning scanner, a signal beam curving down a rail,
 * and a list of flagged entries. At rest the entries sit blurred behind grey
 * markers; on hover the beam runs, each marker flips to an alert badge and the
 * rows resolve in sequence.
 *
 *   <ThreatZepa />
 *   <ThreatZepa title="Registry integrity" items={myItems} />
 *   <ThreatZepa variant="bare" />
 *
 * Implementation notes:
 *  - The beam is a travelling `stroke-dashoffset` on a dashed path, the same
 *    technique as `beam-zepa`. No animation library.
 *  - The rail path is measured and rebuilt in a ResizeObserver rather than
 *    drawn in a fixed viewBox, so the curve keeps its proportions instead of
 *    being stretched by `preserveAspectRatio="none"`.
 *  - Stagger is `transition-delay: var(--th-delay)` per row — what a variants
 *    API compiles to anyway.
 *  - **The banner time is a prop, not `new Date()`.** Formatting a clock
 *    during render gives a different string on the server and the client and
 *    trips a hydration mismatch on every load.
 *  - No `font-family`; typography inherits from the host app.
 *  - Every class and keyframe is prefixed `th-`.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

export interface ThreatZepaItem {
  id: string
  label: string
  meta: string
}

export interface ThreatZepaProps {
  title?: string
  description?: string
  /** Banner message beside the scanner. */
  status?: string
  /** Pre-formatted clock string. See the hydration note above. */
  time?: string
  items?: ThreatZepaItem[]
  /** Alert colour for the beam and badges. */
  accent?: string
  /** Seconds for one pass of the beam. */
  speed?: number
  width?: number
  theme?: "dark" | "light"
  variant?: "tile" | "bare"
  className?: string
}

const DEFAULT_ITEMS: ThreatZepaItem[] = [
  { id: "a", label: "selfie-hero · grep.app", meta: "Flagged 9 Aug, 14:09" },
  { id: "b", label: "featured9-grid · github", meta: "Flagged 10 Aug, 11:23" },
  { id: "c", label: "zepa-folder · publicwww", meta: "Flagged 11 Aug, 09:45" },
  { id: "d", label: "beam-zepa · codepen", meta: "Flagged 12 Aug, 16:02" },
]

const CSS = `
.th-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--th-w);justify-content:center}
.th-shell *{box-sizing:border-box}
.th-shell[data-variant="bare"]{max-width:none}
.th-root{position:relative;display:flex;flex-direction:column;width:100%;min-height:var(--th-h);overflow:hidden;border:1px solid var(--th-line);border-radius:16px;background:var(--th-bg);color:var(--th-fg);cursor:pointer;-webkit-user-select:none;user-select:none;box-shadow:0 18px 40px -26px rgba(0,0,0,.9)}
.th-root[data-variant="bare"]{min-height:0;border:0;border-radius:0;background:transparent;box-shadow:none}

.th-head{display:flex;flex-direction:column;gap:8px;padding:clamp(16px,5cqw,20px) clamp(16px,5cqw,20px) 0}
.th-title{margin:0;font-size:clamp(14px,4.3cqw,16.5px);font-weight:700;letter-spacing:-.01em;color:var(--th-accent)}
.th-desc{margin:0;font-size:clamp(11.5px,3.4cqw,13px);line-height:1.6;color:var(--th-muted)}

.th-banner{position:relative;z-index:2;margin:clamp(20px,6cqw,28px) clamp(14px,4.5cqw,18px) 0;padding:2px;border-radius:8px;background:var(--th-banner-out);box-shadow:0 6px 18px -10px rgba(0,0,0,.9)}
.th-banner-in{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px;border-radius:6px;background:var(--th-banner-in)}
.th-banner-left{display:flex;align-items:center;gap:12px;min-width:0}
.th-scan{flex-shrink:0;width:15px;height:15px;color:var(--th-accent)}
.th-scan svg{display:block;width:100%;height:100%}
.th-root[data-open="true"] .th-scan{animation:th-spin 2.4s linear infinite}
.th-status{font-size:clamp(10.5px,3.1cqw,11.5px);letter-spacing:.01em;color:var(--th-muted);transition:color .3s ease}
.th-root[data-open="true"] .th-status{color:var(--th-fg)}
.th-time{flex-shrink:0;font-size:clamp(10.5px,3.1cqw,11.5px);color:var(--th-muted);font-variant-numeric:tabular-nums}

.th-body{position:relative;flex:1;padding:clamp(26px,8cqw,34px) clamp(16px,5cqw,20px) clamp(18px,5cqw,22px)}
.th-rail{position:absolute;left:clamp(16px,5cqw,20px);top:0;bottom:0;width:var(--th-rail);pointer-events:none}
.th-rail svg{display:block;width:100%;height:100%;overflow:visible}
.th-track{fill:none;stroke:var(--th-line-hi);stroke-width:1}
.th-beam{fill:none;stroke:var(--th-accent);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:var(--th-d) calc(var(--th-l) + var(--th-d));stroke-dashoffset:var(--th-d);opacity:0;transition:opacity .3s ease}
.th-root[data-open="true"] .th-beam{opacity:1;animation:th-run var(--th-dur) linear infinite}

.th-list{position:relative;z-index:1;display:flex;flex-direction:column;gap:clamp(22px,7cqw,30px);margin:0;padding:0;list-style:none}
.th-item{display:flex;gap:11px;align-items:flex-start}
.th-marker{position:relative;flex-shrink:0;width:22px;height:22px;margin-top:1px}
.th-dot,.th-cross{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:999px}
.th-dot{background:var(--th-dot-bg);color:var(--th-muted)}
.th-cross{background:var(--th-accent);color:var(--th-bg);opacity:0;transform:scale(.85);transition:opacity .3s ease var(--th-delay),transform .3s ease var(--th-delay)}
.th-root[data-open="true"] .th-cross{opacity:1;transform:scale(1)}
.th-dot svg{width:9px;height:9px}
.th-cross svg{width:12px;height:12px}

.th-copy{display:flex;min-width:0;flex-direction:column;gap:3px}
.th-label{margin:0;font-size:clamp(11.5px,3.5cqw,13.5px);font-weight:600;color:var(--th-fg);opacity:0;filter:blur(8px);transform:translateY(5px);transition:opacity .32s ease var(--th-delay),filter .32s ease var(--th-delay),transform .32s ease var(--th-delay)}
.th-meta{margin:0;font-size:clamp(10px,3cqw,11.5px);color:var(--th-muted);opacity:0;filter:blur(4px);transform:translateY(9px);transition:opacity .32s ease var(--th-delay),filter .32s ease var(--th-delay),transform .32s ease var(--th-delay)}
.th-root[data-open="true"] .th-label,.th-root[data-open="true"] .th-meta{opacity:1;filter:blur(0);transform:none}

@keyframes th-spin{to{transform:rotate(360deg)}}
@keyframes th-run{
  from{stroke-dashoffset:var(--th-d)}
  to{stroke-dashoffset:calc(0px - var(--th-l))}
}
@media (prefers-reduced-motion:reduce){
  .th-root[data-open="true"] .th-scan,.th-root[data-open="true"] .th-beam{animation:none}
  .th-label,.th-meta,.th-cross{transition-duration:1ms;transition-delay:0ms}
}
`

function ScannerGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="0.1 5.2"
      />
    </svg>
  )
}

function DotGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
    </svg>
  )
}

function CrossGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 6.5l11 11M17.5 6.5l-11 11"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ThreatZepa({
  title = "Registry integrity",
  description = "Every distributed component carries a hidden fingerprint. Copies that surface outside the registry are matched and flagged automatically.",
  status = "Fingerprint match detected",
  time = "16:02",
  items = DEFAULT_ITEMS,
  accent = "#4f7dff",
  speed = 2.6,
  width = 340,
  theme = "dark",
  variant = "tile",
  className,
}: ThreatZepaProps) {
  const [open, setOpen] = useState(false)
  const railRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const trackRef = useRef<SVGPathElement>(null)
  const beamRef = useRef<SVGPathElement>(null)

  // Measured rather than drawn in a fixed viewBox: a tall card would stretch a
  // fixed viewBox and turn the bend into a smear. Rebuilding on resize keeps
  // the curve's proportions and the stroke width honest.
  const measure = useCallback(() => {
    const rail = railRef.current
    const svg = svgRef.current
    const track = trackRef.current
    const beam = beamRef.current
    if (!rail || !svg || !track || !beam) return

    const rect = rail.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`)

    // Enters top-left, eases over to the marker column, then runs straight
    // down through every marker — a single cubic instead of a hard elbow.
    const entry = rect.width * 0.24
    const spine = rect.width * 0.5
    const bend = Math.min(58, rect.height * 0.16)

    const d = `M ${entry.toFixed(2)},0 C ${entry.toFixed(2)},${(
      bend * 0.55
    ).toFixed(2)} ${spine.toFixed(2)},${(bend * 0.42).toFixed(
      2
    )} ${spine.toFixed(2)},${bend.toFixed(2)} L ${spine.toFixed(
      2
    )},${rect.height.toFixed(2)}`

    track.setAttribute("d", d)
    beam.setAttribute("d", d)

    const length = beam.getTotalLength()
    beam.style.setProperty("--th-l", `${length}px`)
    beam.style.setProperty("--th-d", `${length * 0.26}px`)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    // observe() fires once immediately, which performs the first measurement.
    const observer = new ResizeObserver(() => measure())
    observer.observe(rail)
    return () => observer.disconnect()
  }, [measure])

  const isDark = theme === "dark"

  const shellStyle = {
    "--th-w": `${width}px`,
    "--th-h": `${Math.round(width * 1.5)}px`,
    "--th-rail": "26px",
    "--th-accent": accent,
    "--th-dur": `${speed}s`,
    "--th-bg": isDark ? "#0e0e11" : "#fafafa",
    "--th-banner-out": isDark ? "#000000" : "#ffffff",
    "--th-banner-in": isDark ? "#1c1c22" : "#f1f1f3",
    "--th-dot-bg": isDark ? "#ffffff17" : "#0000000f",
    "--th-fg": isDark ? "#f4f4f5" : "#18181b",
    "--th-muted": isDark ? "#8a8a94" : "#71717a",
    "--th-line": isDark ? "#ffffff14" : "#e4e4e7",
    "--th-line-hi": isDark ? "#ffffff26" : "#d4d4d8",
  } as CSSProperties

  const setOpenFromPointer = (
    event: ReactPointerEvent<HTMLDivElement>,
    next: boolean
  ) => {
    if (event.pointerType === "mouse") setOpen(next)
  }

  return (
    <div
      className={className ? `th-shell ${className}` : "th-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div
        className="th-root"
        data-variant={variant}
        data-open={open}
        role="button"
        tabIndex={0}
        aria-pressed={open}
        aria-label={`${title} — ${items.length} flagged`}
        onPointerEnter={(event) => setOpenFromPointer(event, true)}
        onPointerLeave={(event) => setOpenFromPointer(event, false)}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setOpen((value) => !value)
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <div className="th-head">
          <h3 className="th-title">{title}</h3>
          <p className="th-desc">{description}</p>
        </div>

        <div className="th-banner">
          <div className="th-banner-in">
            <div className="th-banner-left">
              <span className="th-scan">
                <ScannerGlyph />
              </span>
              <span className="th-status">{status}</span>
            </div>
            <span className="th-time">{time}</span>
          </div>
        </div>

        <div className="th-body">
          <div className="th-rail" ref={railRef} aria-hidden="true">
            <svg ref={svgRef} fill="none" xmlns="http://www.w3.org/2000/svg">
              <path ref={trackRef} className="th-track" />
              <path ref={beamRef} className="th-beam" />
            </svg>
          </div>

          <ul className="th-list">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="th-item"
                style={
                  { "--th-delay": `${0.14 + index * 0.08}s` } as CSSProperties
                }
              >
                <span className="th-marker">
                  <span className="th-dot">
                    <DotGlyph />
                  </span>
                  <span className="th-cross">
                    <CrossGlyph />
                  </span>
                </span>

                <span className="th-copy">
                  <p className="th-label">{item.label}</p>
                  <p className="th-meta">{item.meta}</p>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ThreatZepa
