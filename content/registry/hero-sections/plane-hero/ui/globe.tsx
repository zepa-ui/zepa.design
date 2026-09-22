"use client"

import { useEffect, useRef, useCallback, useState } from "react"
// vendored beside this file — see ui/cobe.ts for the MIT notice
import createGlobe from "./cobe"

/* arc re-fly loop: each arc is removed briefly and re-added (staggered),
   which re-triggers cobe's own smooth draw-in animation — everywhere,
   including the front of the globe. endpoints are never touched. */
const ARC_CYCLE_MS = 7000 // full loop per arc
const ARC_GAP_MS = 650 // how long an arc is gone before it flies again

/* geographic bearing (deg from north) at the arc midpoint, heading toward `to` —
   used to point the 3D plane along its flight line */
const RAD = Math.PI / 180
function bearingDeg(from: [number, number], to: [number, number]): number {
  const [lat1, lng1] = [from[0] * RAD, from[1] * RAD]
  const [lat2, lng2] = [to[0] * RAD, to[1] * RAD]
  const dLng = lng2 - lng1
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(y, x) / RAD + 360) % 360
}
// tweak if the plane points sideways/backwards (degrees, added to heading)
const ARC_ICON_YAW_OFFSET = 0

export interface Marker {
  id: string
  location: [number, number]
  label: string
}
export interface Arc {
  id: string
  from: [number, number]
  to: [number, number]
  label?: string
}
interface GlobeProps {
  markers?: Marker[]
  arcs?: Arc[]
  arcIcon?: string // path to a .glb — replaces arc text labels with the 3D model
  className?: string
  markerColor?: [number, number, number]
  baseColor?: [number, number, number]
  arcColor?: [number, number, number]
  glowColor?: [number, number, number]
  dark?: number
  mapBrightness?: number
  markerSize?: number
  markerElevation?: number
  arcWidth?: number
  arcHeight?: number
  speed?: number
  theta?: number
  diffuse?: number
  mapSamples?: number
}

export function Globe({
  markers = [],
  arcs = [],
  arcIcon,
  className = "",
  markerColor = [0.3, 0.45, 0.85],
  baseColor = [1, 1, 1],
  arcColor = [0.3, 0.45, 0.85],
  glowColor = [0.94, 0.93, 0.91],
  dark = 0,
  mapBrightness = 10,
  markerSize = 0.025,
  markerElevation = 0.01,
  arcWidth = 0.5,
  arcHeight = 0.25,
  speed = 0.003,
  theta = 0.2,
  diffuse = 1.5,
  mapSamples = 16000,
}: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false) // globe drawn → start entrance animation
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.15
        velocity.current = {
          phi: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3),
          ),
          theta: Math.max(
            -maxVelocity,
            Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08),
          ),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  // load <model-viewer> once if arc icons use a .glb
  useEffect(() => {
    if (!arcIcon) return
    const src =
      "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js"
    if (document.querySelector(`script[src="${src}"]`)) return
    const s = document.createElement("script")
    s.type = "module"
    s.src = src
    document.head.appendChild(s)
  }, [arcIcon])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0
    let lastArcKey = "__init__"

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta,
        dark,
        diffuse,
        mapSamples,
        mapBrightness,
        baseColor,
        markerColor,
        glowColor,
        markerElevation,
        markers: markers.map((m) => ({
          location: m.location,
          size: markerSize,
          id: m.id,
        })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor,
        arcWidth,
        arcHeight,
        opacity: 0.7,
      })

      function animate() {
        if (!isPausedRef.current) {
          phi += speed
          if (
            Math.abs(velocity.current.phi) > 0.0001 ||
            Math.abs(velocity.current.theta) > 0.0001
          ) {
            phiOffsetRef.current += velocity.current.phi
            thetaOffsetRef.current += velocity.current.theta
            velocity.current.phi *= 0.95
            velocity.current.theta *= 0.95
          }
          const thetaMin = -0.4
          const thetaMax = 0.4
          if (thetaOffsetRef.current < thetaMin) {
            thetaOffsetRef.current += (thetaMin - thetaOffsetRef.current) * 0.1
          } else if (thetaOffsetRef.current > thetaMax) {
            thetaOffsetRef.current += (thetaMax - thetaOffsetRef.current) * 0.1
          }
        }
        // staggered re-fly: drop each arc briefly, then re-add it so cobe
        // replays its native draw-in animation. arcs only sent on change.
        const nowMs = performance.now()
        const presentArcs = arcs.filter(
          (_, i) =>
            (nowMs + (i * ARC_CYCLE_MS) / Math.max(arcs.length, 1)) % ARC_CYCLE_MS >
            ARC_GAP_MS,
        )
        const arcKey = presentArcs.map((a) => a.id).join(",")
        const payload: Parameters<NonNullable<typeof globe>["update"]>[0] = {
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: theta + thetaOffsetRef.current + dragOffset.current.theta,
        }
        if (arcKey !== lastArcKey) {
          lastArcKey = arcKey
          payload.arcs = presentArcs.map((a) => ({
            from: a.from,
            to: a.to,
            id: a.id,
          }))
        }
        globe!.update(payload)
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => {
        if (canvas) canvas.style.opacity = "1"
        setReady(true)
      })
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [
    markers,
    arcs,
    markerColor,
    baseColor,
    arcColor,
    glowColor,
    dark,
    mapBrightness,
    markerSize,
    markerElevation,
    arcWidth,
    arcHeight,
    speed,
    theta,
    diffuse,
    mapSamples,
  ])

  return (
    <div className={`ph-globe ${ready ? "is-ready" : ""} ${className}`}>
      <canvas
        ref={canvasRef}
        className="ph-canvas"
        onPointerDown={handlePointerDown}
      />

      {markers.map((m) => (
        <div
          key={m.id}
          className="ph-pin"
          style={
            {
              positionAnchor: `--cobe-${m.id}`,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            } as React.CSSProperties
          }
        >
          {m.label}
          <span className="ph-pin-tip" />
        </div>
      ))}

      {arcs
        .filter((a) => a.label || arcIcon)
        .map((a) =>
          arcIcon ? (
            // 3D plane + route label, stacked at the arc's peak
            <div
              key={a.id}
              className="ph-arc ph-arc--model"
              style={
                {
                  positionAnchor: `--cobe-arc-${a.id}`,
                  opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
                  filter: `blur(calc((1 - var(--cobe-visible-arc-${a.id}, 0)) * 8px))`,
                } as React.CSSProperties
              }
            >
              {/* @ts-expect-error web component */}
              <model-viewer
                src={arcIcon}
                orientation={`0deg 0deg ${-(bearingDeg(a.from, a.to) + ARC_ICON_YAW_OFFSET)}deg`}
                camera-orbit="0deg 72deg 105%"
                interaction-prompt="none"
                disable-zoom
                disable-tap
                shadow-intensity="0"
                style={{ width: 64, height: 64, background: "transparent" }}
              />
              {a.label && <span className="ph-route">{a.label}</span>}
            </div>
          ) : (
            <div
              key={a.id}
              className="ph-arc ph-arc--text"
              style={
                {
                  positionAnchor: `--cobe-arc-${a.id}`,
                  opacity: `var(--cobe-visible-arc-${a.id}, 0)`,
                  filter: `blur(calc((1 - var(--cobe-visible-arc-${a.id}, 0)) * 8px))`,
                } as React.CSSProperties
              }
            >
              {a.label}
              <span className="ph-arc-tip" />
            </div>
          ),
        )}
    </div>
  )
}
