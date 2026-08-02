"use client"

import React, { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   scroll1-hero — voku.studio style gallery
   Infinite image track drifts right → left.
   Items rise + scale into a Gaussian arch as
   they pass center. Project name crossfades in
   the nav. Wheel / drag scrubs with momentum.
   ───────────────────────────────────────────── */

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t1_hx4eay.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691409/t2_h0g5z7.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t3_rivnpe.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t4_hytpjp.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t6_m1lzuj.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1785691408/t7_vtrhao.png",
]

type Item = { img: string; name: string; w: number; h: number }

const BASE_ITEMS: Item[] = [
  { img: IMG[0], name: "S. Ingrosso & S. Angello", w: 210, h: 280 },
  { img: IMG[1], name: "Helena Rubinstein®",        w: 155, h: 210 },
  { img: IMG[2], name: "The Weeknd",                w: 170, h: 225 },
  { img: IMG[3], name: "No Enemies",                w: 135, h: 180 },
  { img: IMG[4], name: "Loro Piana",                w: 195, h: 260 },
  { img: IMG[5], name: "Månsson",                   w: 145, h: 195 },
  { img: IMG[0], name: "Aqua Vitae",                w: 180, h: 240 },
  { img: IMG[1], name: "Judas Priest",              w: 160, h: 215 },
  { img: IMG[2], name: "Salomé",                    w: 130, h: 175 },
  { img: IMG[3], name: "Fragmentos",                w: 185, h: 250 },
  { img: IMG[4], name: "Icarus Falls",              w: 140, h: 190 },
  { img: IMG[5], name: "Vantablack",                w: 165, h: 220 },
]

const GAP = -14
/* double the sequence so the loop is always wider than the viewport */
const ITEMS: Item[] = [...BASE_ITEMS, ...BASE_ITEMS.map((it) => ({ ...it }))]

export default function Scroll1Hero() {
  const rootRef  = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [name, setName] = useState(ITEMS[0].name)
  const nameRef = useRef(ITEMS[0].name)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let raf: number

    /* pre-compute static layout */
    const baseX: number[] = []
    let acc = 0
    ITEMS.forEach((it) => {
      baseX.push(acc)
      acc += it.w + GAP
    })
    const total = acc

    let offset   = 0     // eased position
    let target   = 0     // raw position
    const DRIFT  = 0.75  // constant drift speed
    let dragging = false
    let lastX    = 0

    /* on-appear: seed the same momentum a hard scroll-down would produce.
       Decays at 0.94/frame → ~1500-2000ms of motion at 60fps. */
    let vel = 110        // wheel / drag momentum

    /* ── input handlers ── */
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      vel += (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * 0.25
      vel = Math.max(-60, Math.min(60, vel))
    }
    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX    = e.clientX
      vel      = 0
      root.classList.add("scr1-grabbing")
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      target  -= dx
      vel      = -dx * 0.6
      lastX    = e.clientX
    }
    const onUp = () => {
      dragging = false
      root.classList.remove("scr1-grabbing")
    }

    /* wheel on root, pointer on window so drag outside still tracks */
    root.addEventListener("wheel",        onWheel, { passive: false })
    root.addEventListener("pointerdown",  onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup",   onUp)

    /* ── helpers ── */
    const mod     = (n: number, m: number) => ((n % m) + m) % m
    const clamp01      = (v: number) => Math.min(1, Math.max(0, v))

    /* ── rAF loop ── */
    const tick = () => {
      /* use container dimensions — safe inside embed */
      const W  = root.clientWidth
      const H  = root.clientHeight
      const cx = W / 2
      const sigma = W * 0.2

      /* drift + momentum + lenis-style easing */
      target += DRIFT + (dragging ? 0 : vel)
      if (!dragging) vel *= 0.94
      offset += (target - offset) * 0.09

      const bandL = W * 0.13
      const bandR = W * 0.87

      let best: Item | null  = null
      let bestD              = 1e9

      ITEMS.forEach((it, i) => {
        const el = itemRefs.current[i]
        if (!el) return

        /* wrap: items queue at the right edge, exit at the left */
        const p  = mod(baseX[i] - offset, total)
        const sx = bandL + p - 260
        const c  = sx + it.w / 2

        /* hide items outside the active band */
        if (c < bandL - 160 || c > bandR + 160) {
          el.style.opacity   = "0"
          el.style.transform = `translate3d(${sx}px, ${0.5 * H}px, 0) scale(.7)`
          return
        }

        const d = c - cx

        /* Gaussian arch: rise + scale toward center */
        const g = Math.exp(-(d * d) / (2 * sigma * sigma))
        const y = 0.42 * H - g * 0.17 * H
        const s = 0.8 + g * 0.35

        /* fade at band edges */
        const edge = Math.min(
          clamp01((bandR + 60 - c) / 150),
          clamp01((c - (bandL - 60)) / 150),
        )

        el.style.transform = `translate3d(${sx}px, ${y - it.h / 2}px, 0) scale(${s})`
        el.style.opacity   = edge.toFixed(3)
        el.style.zIndex    = String(100 + Math.round(g * 100))

        const ad = Math.abs(d)
        if (ad < bestD) { bestD = ad; best = it }
      })

      /* crossfade nav name when center image changes */
      if (best && (best as Item).name !== nameRef.current) {
        nameRef.current = (best as Item).name
        setName((best as Item).name)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      root.removeEventListener("wheel",        onWheel)
      root.removeEventListener("pointerdown",  onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup",   onUp)
      root.classList.remove("scr1-grabbing")
    }
  }, [])

  return (
    <div className="scr1-root" ref={rootRef}>
      <style>{CSS}</style>

      {/* ── image track ── */}
      <div className="scr1-track">
        {ITEMS.map((it, i) => (
          <div
            key={i}
            className="scr1-item"
            ref={(el) => { itemRefs.current[i] = el }}
            style={{ width: it.w, height: it.h }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.img} alt="" draggable={false} />
          </div>
        ))}
      </div>

      {/* ── centered nav ── */}
      <nav className="scr1-nav">
        <span className="scr1-brand">Zepa.UI™</span>
        <span className="scr1-name" key={name}>{name}.</span>
        <a className="scr1-link">Components</a>
        <a className="scr1-link">Templates</a>
        <a className="scr1-link">About</a>
        <a className="scr1-link">Contact</a>
      </nav>
    </div>
  )
}

const CSS = `
/* ── Root ── */
.scr1-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fffdfc;
  color: #0a0a0a;
  font-family: var(--font-manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  letter-spacing: .01em;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  cursor: grab;
}
.scr1-grabbing { cursor: grabbing !important; }

/* ── Track ── */
.scr1-track {
  position: absolute;
  inset: 0;
}
.scr1-item {
  position: absolute;
  left: 0; top: 0;
  opacity: 0;
  will-change: transform;
  transform-origin: center;
}
.scr1-item img {
  width: 100%;
  height: 105%;
  object-fit: cover;
  object-position: center top;
  display: block;
  pointer-events: none;
}

/* ── Nav ── */
.scr1-nav {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translateX(-50%);
  z-index: 300;
  display: flex;
  gap: 1.6em;
  align-items: baseline;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 400;
}
.scr1-brand { font-weight: 500; }
.scr1-link  { cursor: pointer; transition: opacity .15s; }
.scr1-link:hover { opacity: .5; }
.scr1-name {
  display: inline-block;
  animation: scr1Fade .6s cubic-bezier(.215,.61,.355,1);
}
@keyframes scr1Fade {
  from { opacity: 0; transform: translateY(8px); }
}

/* ── Responsive ── */
@media (max-width: 760px) {
  .scr1-nav { font-size: 13px; gap: 1em; top: 56%; }
}
`
