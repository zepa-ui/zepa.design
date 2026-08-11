"use client"

/**
 * BeamZepa — integration-beam illustration.
 *
 * Six satellite nodes wired into a central hub, with a lit segment travelling
 * along each curve. Left nodes feed inward, right nodes feed outward, so the
 * whole thing reads as traffic converging on one place.
 *
 *   <BeamZepa />
 *   <BeamZepa color="#4f7dff" speed={5} nodes={myNodes} />
 *   <BeamZepa variant="bare" />   inside your own tile
 *
 * Implementation notes:
 *  - The beam is a travelling `stroke-dashoffset` on a dashed path, not an
 *    animated gradient. One CSS animation per path, no animation library, and
 *    nothing re-renders while it runs.
 *  - Geometry is recomputed inside a ResizeObserver callback and written
 *    straight onto the DOM through refs — no state, so no `setState` in an
 *    effect body and no re-render on resize.
 *  - Gradient ids are namespaced with `useId()`; SVG ids are document-global
 *    and two instances on a page would otherwise collide.
 *  - Every class and keyframe is prefixed `zb-`.
 */

import { Fragment, useCallback, useEffect, useId, useRef } from "react"
import type { CSSProperties, ReactNode } from "react"

export interface BeamZepaNode {
  id: string
  label: string
  /** Image logo. Takes precedence over `icon` — use a transparent PNG or SVG. */
  logo?: string
  /** Inline glyph, used when no `logo` is given. */
  icon?: ReactNode
}

export interface BeamZepaProps {
  /** Three nodes down the left edge, feeding into the hub. */
  leftNodes?: BeamZepaNode[]
  /** Three nodes down the right edge, fed from the hub. */
  rightNodes?: BeamZepaNode[]
  /** What sits in the middle. Defaults to the Zepa mark. */
  hub?: ReactNode
  hubLabel?: string
  /** Beam head colour. */
  color?: string
  /** Beam tail colour — the segment fades from one to the other as it travels. */
  secondaryColor?: string
  /** The dim resting line under each beam. */
  trackColor?: string
  /** Seconds for one pass along a beam. */
  speed?: number
  /** How far the curves bow away from the straight line, in px. */
  curvature?: number
  /** Satellite diameter in px. The hub is 1.35x this. */
  nodeSize?: number
  /** Max illustration width in px. */
  width?: number
  /** Height of the node rail in px. The stage adds room for the bow on top. */
  railHeight?: number
  /** Hub image logo. Falls back to the Zepa mark. */
  hubLogo?: string
  theme?: "dark" | "light"
  /** "tile" has the bordered surface. "bare" is the diagram only. */
  variant?: "tile" | "bare"
  className?: string
}

const CSS = `
/* The shell is the query container. An element with container-type is a
   container for its DESCENDANTS, not itself — cqw written on .zb-root would
   resolve against whatever contains the shell, so the fluid custom properties
   have to be declared one level in. */
.zb-shell{container-type:inline-size;display:flex;width:100%;max-width:var(--zb-w);justify-content:center}
.zb-shell *{box-sizing:border-box}
.zb-shell[data-variant="bare"]{max-width:none}
.zb-root{position:relative;display:flex;width:100%;align-items:center;justify-content:center;overflow:hidden;border:1px solid var(--zb-line);border-radius:16px;background:var(--zb-bg);padding:var(--zb-pad);font-family:var(--font-manrope),ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-user-select:none;user-select:none}
.zb-root[data-variant="bare"]{border:0;border-radius:0;background:transparent;padding:0}

/* Bow room is padding, not a fixed height: a quadratic bow reaches half the
   control offset away from its chord, and the rail itself grows with the node
   size. Height that is computed rather than declared cannot be overflowed. */
.zb-stage{position:relative;display:flex;align-items:center;width:100%;padding:var(--zb-bow) 0}
.zb-svg{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;transform:translateZ(0)}
.zb-track{fill:none;stroke:var(--zb-track);stroke-width:var(--zb-stroke);stroke-linecap:round}
.zb-beam{fill:none;stroke-width:var(--zb-stroke);stroke-linecap:round;stroke-dasharray:var(--zb-d) calc(var(--zb-l) + var(--zb-d));animation:zb-travel var(--zb-dur) linear var(--zb-delay) infinite}
.zb-beam[data-reverse="true"]{animation-name:zb-travel-back}

.zb-halo{position:absolute;left:50%;top:50%;z-index:0;width:calc(var(--zb-n) * 6);height:calc(var(--zb-n) * 6);transform:translate(-50%,-50%);pointer-events:none;background:radial-gradient(circle,color-mix(in oklab,var(--zb-color) 22%,transparent) 0%,transparent 62%);opacity:.5}

/* min-height, never height — three nodes plus two gaps can exceed --zb-h at a
   large nodeSize, and a fixed height would just spill them out of the box. */
.zb-rail{position:relative;z-index:1;display:grid;width:100%;grid-template-columns:auto 1fr auto;align-items:center;justify-items:center;row-gap:var(--zb-gap);min-height:var(--zb-h)}
.zb-node{position:relative;display:flex;align-items:center;justify-content:center;width:var(--zb-n);height:var(--zb-n);border:1px solid var(--zb-node-line);border-radius:999px;background:var(--zb-node-bg);color:var(--zb-fg);box-shadow:0 1px 0 rgba(255,255,255,.06) inset,0 12px 28px -16px rgba(0,0,0,.95);transition:border-color .35s ease,transform .35s ease,box-shadow .35s ease}
.zb-node:hover{transform:translateY(-2px);border-color:var(--zb-hub-line);box-shadow:0 1px 0 rgba(255,255,255,.08) inset,0 16px 32px -14px rgba(0,0,0,.95),0 0 0 4px color-mix(in oklab,var(--zb-color) 10%,transparent)}
.zb-node svg{display:block;width:58%;height:58%}
.zb-node img{display:block;width:62%;height:62%;object-fit:contain}
.zb-hub{width:calc(var(--zb-n) * 1.4);height:calc(var(--zb-n) * 1.4);border-color:var(--zb-hub-line);background:var(--zb-hub-bg);box-shadow:0 0 0 1px color-mix(in oklab,var(--zb-color) 22%,transparent),0 0 0 7px color-mix(in oklab,var(--zb-color) 8%,transparent),0 16px 38px -14px var(--zb-color)}
.zb-hub:hover{transform:none}
.zb-hub svg{width:50%;height:50%}
.zb-hub img{width:56%;height:56%}
.zb-left{grid-column:1}
.zb-right{grid-column:3}
.zb-mid{grid-column:2;grid-row:2}

@keyframes zb-travel{
  from{stroke-dashoffset:var(--zb-d)}
  to{stroke-dashoffset:calc(0px - var(--zb-l))}
}
@keyframes zb-travel-back{
  from{stroke-dashoffset:calc(0px - var(--zb-l))}
  to{stroke-dashoffset:var(--zb-d)}
}
@media (prefers-reduced-motion:reduce){
  .zb-beam{animation:none;stroke-dasharray:none;opacity:.5}
}
`

function IconHeroes() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18M8 14h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconBento() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3" y="16" width="8" height="5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13" y="11" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconNavbars() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="8" rx="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7" cy="10" r="1.3" fill="currentColor" />
      <path d="M11 10h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 19h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity=".45" />
    </svg>
  )
}

function IconCards() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="6" y="3" width="15" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M17 19H6a3 3 0 0 1-3-3V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconMotion() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 15c3.5 0 4-9 7.5-9S13 15 16.5 15 21 9 22 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="19" cy="17" r="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconTemplates() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

/** The Zepa mark — a three-by-three dot grid. */
function ZepaMark() {
  return (
    <svg viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {[3, 9, 15].map((cx) =>
        [3, 9, 15].map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.7" fill="currentColor" />
        ))
      )}
    </svg>
  )
}

const DEFAULT_LEFT: BeamZepaNode[] = [
  { id: "heroes", label: "Heroes", icon: <IconHeroes /> },
  { id: "bento", label: "Bento grids", icon: <IconBento /> },
  { id: "navbars", label: "Navbars", icon: <IconNavbars /> },
]

const DEFAULT_RIGHT: BeamZepaNode[] = [
  { id: "cards", label: "Cards", icon: <IconCards /> },
  { id: "motion", label: "Motion", icon: <IconMotion /> },
  { id: "templates", label: "Templates", icon: <IconTemplates /> },
]

export function BeamZepa({
  leftNodes = DEFAULT_LEFT,
  rightNodes = DEFAULT_RIGHT,
  hub,
  hubLogo,
  hubLabel = "Zepa",
  color = "#4f7dff",
  secondaryColor = "#38bdf8",
  trackColor,
  speed = 4.5,
  curvature = 75,
  nodeSize = 48,
  width = 560,
  railHeight = 200,
  theme = "dark",
  variant = "tile",
  className,
}: BeamZepaProps) {
  const gradientId = `zb-${useId().replace(/:/g, "")}`

  const stageRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const hubRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Array<HTMLDivElement | null>>([])
  const trackRefs = useRef<Array<SVGPathElement | null>>([])
  const beamRefs = useRef<Array<SVGPathElement | null>>([])

  const leftCount = leftNodes.length
  const rightCount = rightNodes.length

  const beams = [
    ...leftNodes.map((node) => ({ node, reverse: false })),
    ...rightNodes.map((node) => ({ node, reverse: true })),
  ]

  // Recomputed only when something actually resizes. Written straight to the
  // DOM, so nothing re-renders and the running animations are untouched
  // except for their dash length. Deps are primitives on purpose — depending
  // on the `beams` array would rebuild the callback every render and tear the
  // ResizeObserver down with it.
  const measure = useCallback(() => {
    const stage = stageRef.current
    const svg = svgRef.current
    const hubEl = hubRef.current
    if (!stage || !svg || !hubEl) return

    const stageRect = stage.getBoundingClientRect()
    if (stageRect.width === 0 || stageRect.height === 0) return

    // The svg is sized to the stage in CSS; only the viewBox has to follow the
    // measured pixel box so path coordinates map 1:1.
    svg.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`)

    const hubRect = hubEl.getBoundingClientRect()
    const endX = hubRect.left - stageRect.left + hubRect.width / 2
    const endY = hubRect.top - stageRect.top + hubRect.height / 2

    for (let index = 0; index < leftCount + rightCount; index += 1) {
      const nodeEl = nodeRefs.current[index]
      const track = trackRefs.current[index]
      const path = beamRefs.current[index]
      if (!nodeEl || !track || !path) continue

      const row = index < leftCount ? index : index - leftCount
      const nodeRect = nodeEl.getBoundingClientRect()
      const startX = nodeRect.left - stageRect.left + nodeRect.width / 2
      const startY = nodeRect.top - stageRect.top + nodeRect.height / 2

      // Top row bows up, bottom row bows down, middle row runs straight —
      // and each outer beam lands slightly off the hub centre so the three
      // arrivals stay visually separate.
      //
      // `curvature` is a ceiling, not a constant. A 75px bow across a 300px
      // run reads elegant; the same bow across a 90px run reads like a
      // balloon, which is exactly what happens on a phone or in a narrow
      // tile. Capping it at half the horizontal run keeps the shape honest at
      // every width. The landing offset scales off the node for the same
      // reason.
      const run = Math.abs(endX - startX)
      const bowSize = Math.min(curvature, run * 0.5)
      const nodeHeight = nodeRect.height || 1
      const bow = row === 0 ? bowSize : row === 2 ? -bowSize : 0
      const landingSize = nodeHeight * 0.18
      const landing = row === 0 ? -landingSize : row === 2 ? landingSize : 0

      const controlX = (startX + endX) / 2
      const controlY = startY - bow
      const d = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${
        endY + landing
      }`

      track.setAttribute("d", d)
      path.setAttribute("d", d)

      const length = path.getTotalLength()
      path.style.setProperty("--zb-l", `${length}px`)
      path.style.setProperty("--zb-d", `${length * 0.2}px`)
    }
  }, [leftCount, rightCount, curvature])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    // ResizeObserver fires once on observe(), which is what performs the
    // initial measurement — calling measure() here directly would be a DOM
    // write during the effect body for no reason.
    const observer = new ResizeObserver(() => measure())
    observer.observe(stage)
    return () => observer.disconnect()
  }, [measure])

  const isDark = theme === "dark"

  // Props are the *maximum*. Everything scales down with the container so the
  // illustration works in a 360px phone and a 360px bento cell alike — a media
  // query would get the first right and the second wrong.
  const fluidStyle = {
    "--zb-h": `clamp(150px, 46cqw, ${railHeight}px)`,
    "--zb-n": `clamp(36px, 10.5cqw, ${nodeSize}px)`,
    "--zb-gap": `clamp(18px, 5.5cqw, ${Math.max(26, Math.round(railHeight * 0.16))}px)`,
    "--zb-pad": `clamp(16px, 5.5cqw, ${Math.round(nodeSize * 0.62)}px)`,
    // A quadratic bow deviates half its control offset from the chord; the
    // extra 24px keeps the round stroke cap clear of the border.
    "--zb-bow": `clamp(24px, 9cqw, ${Math.round(curvature * 0.5 + 24)}px)`,
    "--zb-stroke": "2px",
  } as CSSProperties

  const shellStyle = {
    "--zb-w": `${width}px`,
    "--zb-color": color,
    "--zb-bg": isDark ? "#08080a" : "#ffffff",
    "--zb-fg": isDark ? "#e4e4e7" : "#18181b",
    "--zb-line": isDark ? "#ffffff1f" : "#e4e4e7",
    "--zb-node-bg": isDark ? "#121216" : "#ffffff",
    "--zb-node-line": isDark ? "#ffffff26" : "#e4e4e7",
    "--zb-hub-bg": isDark ? "#16161c" : "#ffffff",
    "--zb-hub-line": `color-mix(in oklab, ${color} 46%, transparent)`,
    "--zb-track": trackColor ?? (isDark ? "#ffffff1c" : "#0000001f"),
  } as CSSProperties

  return (
    <div
      className={className ? `zb-shell ${className}` : "zb-shell"}
      data-variant={variant}
      style={shellStyle}
    >
      <style>{CSS}</style>

      <div className="zb-root" data-variant={variant} style={fluidStyle}>

      <div className="zb-stage" ref={stageRef}>
        <div className="zb-halo" />
        <svg
          className="zb-svg"
          ref={svgRef}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={secondaryColor} />
            </linearGradient>
          </defs>

          {beams.map((beam, index) => (
            <path
              key={`track-${beam.node.id}`}
              className="zb-track"
              ref={(element) => {
                trackRefs.current[index] = element
              }}
            />
          ))}


          {beams.map((beam, index) => (
            <path
              key={`beam-${beam.node.id}`}
              className="zb-beam"
              data-reverse={beam.reverse}
              stroke={`url(#${gradientId})`}
              ref={(element) => {
                beamRefs.current[index] = element
              }}
              style={
                {
                  "--zb-dur": `${speed}s`,
                  "--zb-delay": `${index * (speed / beams.length) * -1}s`,
                } as CSSProperties
              }
            />
          ))}
        </svg>

        <div className="zb-rail">
          {[0, 1, 2].map((row) => {
            const left = leftNodes[row]
            const right = rightNodes[row]

            return (
              <Fragment key={row}>
                {left ? (
                  <div
                    className="zb-node zb-left"
                    style={{ gridRow: row + 1 }}
                    role="img"
                    aria-label={left.label}
                    ref={(element) => {
                      nodeRefs.current[row] = element
                    }}
                  >
                    {left.logo ? (
                      <img src={left.logo} alt="" draggable={false} />
                    ) : (
                      left.icon
                    )}
                  </div>
                ) : null}

                {row === 1 ? (
                  <div
                    className="zb-node zb-hub zb-mid"
                    role="img"
                    aria-label={hubLabel}
                    ref={hubRef}
                  >
                    {hub ??
                      (hubLogo ? (
                        <img src={hubLogo} alt="" draggable={false} />
                      ) : (
                        <ZepaMark />
                      ))}
                  </div>
                ) : null}

                {right ? (
                  <div
                    className="zb-node zb-right"
                    style={{ gridRow: row + 1 }}
                    role="img"
                    aria-label={right.label}
                    ref={(element) => {
                      nodeRefs.current[leftNodes.length + row] = element
                    }}
                  >
                    {right.logo ? (
                      <img src={right.logo} alt="" draggable={false} />
                    ) : (
                      right.icon
                    )}
                  </div>
                ) : null}
              </Fragment>
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}

export default BeamZepa
