"use client"

import React, { useEffect, useRef } from "react"

/* ─────────────────────────────────────────────
   companion-grid — polaroid card train

   "Zepa is for Everyone" sits behind a train
   of polaroid cards. Scrolling drives the train
   right — zigzag up/down with drifting tilts — so
   the cards clear away one at a time and the line
   underneath is revealed. Starts on the LAST card
   and ends on the first.

   The component owns its own scroll container
   (a tall track under a sticky viewport) so it
   never touches window scroll or position:fixed.
   ───────────────────────────────────────────── */

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/5_bgrt7d.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
]

/* square crop plus a light sepia so every photo shares one warm cast */
const warm = (u: string) =>
  u.replace("/upload/", "/upload/c_fill,w_700,h_700,g_auto,e_sepia:28/")

const CARDS = [
  { title: "For teams drowning in half-finished design systems:", img: IMG[0], zig: -5, rot: -5 },
  { title: "For anyone shipping the same hero for the tenth time:", img: IMG[1], zig: 6, rot: 3 },
  { title: "For builders who want motion without the maintenance:", img: IMG[2], zig: -4, rot: -2 },
  { title: "For people who copy, paste, and expect it to just work:", img: IMG[3], zig: 7, rot: 4 },
  { title: "For everyone still hunting for the right component:", img: IMG[4], zig: -5, rot: -3 },
]

const PITCH = 37 // vw between cards
const START_X = -89 // train offset at p=0 → last cards on screen
const END_X = 108 // train offset at p=1 → first card exits right

export default function CompanionGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // park the train mid-run so the composition still reads as designed
      CARDS.forEach((c, i) => {
        const el = cardRefs.current[i]
        if (el) {
          el.style.transform = `translate3d(${i * PITCH + START_X}vw, ${c.zig}vh, 0) rotate(${c.rot}deg)`
        }
      })
      return
    }

    let raf = 0
    let cur = root.scrollTop

    const tick = () => {
      raf = requestAnimationFrame(tick)

      /* the component's own scroll position, never window's — a registry
         component can be embedded anywhere and must not assume it owns
         the page */
      const target = root.scrollTop
      cur += (target - cur) * 0.08 // lenis-style ease
      if (Math.abs(target - cur) < 0.05) cur = target

      const travel = root.scrollHeight - root.clientHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, cur / travel)) : 0
      const trainX = START_X + (END_X - START_X) * p // vw

      CARDS.forEach((c, i) => {
        const el = cardRefs.current[i]
        if (!el) return
        const x = i * PITCH + trainX // vw, card left edge
        // tilt drifts as the card crosses the screen
        const rot = c.rot + (x - 35) * 0.045
        // gentle bob layered on top of the zigzag
        const bob = Math.sin((x / 30) * Math.PI) * 1.4
        el.style.transform =
          `translate3d(${x}vw, ${c.zig + bob}vh, 0) rotate(${rot}deg)`
      })
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={rootRef} className="cg-root">
      <style>{CSS}</style>

      <div className="cg-track">
        {/* sticky viewport stands in for position:fixed */}
        <div ref={stageRef} className="cg-stage">
          <div className="cg-glow cg-g1" />
          <div className="cg-glow cg-g2" />

          <h1 className="cg-title">Zepa is for Everyone</h1>

          {CARDS.map((c, i) => (
            <div
              key={c.title}
              className="cg-card"
              ref={(el) => {
                cardRefs.current[i] = el
              }}
            >
              <p>{c.title}</p>
              <img src={warm(c.img)} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CSS = `
.cg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #fffaf4;
  color: rgba(62, 26, 1, 1);
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  scrollbar-width: none;
}
.cg-root::-webkit-scrollbar { display: none; }

/* the scroll runway — length here sets how long the train takes */
.cg-track { position: relative; width: 100%; height: 500vh; }

.cg-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #fffaf4;
}

/* warm ambience */
.cg-glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.cg-g1 {
  width: 60vw; height: 44vw; left: -12vw; top: -16vw;
  background: radial-gradient(closest-side, rgba(255, 190, 110, 0.5), transparent 70%);
}
.cg-g2 {
  width: 70vw; height: 56vw; right: -16vw; top: 4vw;
  background: radial-gradient(closest-side, rgba(255, 214, 160, 0.4), transparent 70%);
}

/* the line the cards uncover */
.cg-title {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -56%);
  margin: 0; z-index: 1; white-space: nowrap;
  color: #fa6a17; font-weight: 500; letter-spacing: -0.035em;
  font-size: clamp(44px, 6.4vw, 130px);
}

/* polaroid cards */
.cg-card {
  position: absolute; left: 0; top: 50%; margin-top: -19vw; z-index: 5;
  width: 30vw; padding: 2vw;
  display: flex; flex-direction: column; row-gap: 1.4vw;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 2.2vw;
  box-shadow: 0 2.2vw 5vw rgba(120, 60, 10, 0.1);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  will-change: transform;
}
.cg-card p {
  margin: 0; font-weight: 500; font-size: 1.95vw; line-height: 120%;
  letter-spacing: -0.045em; color: rgba(62, 26, 1, 1);
}
.cg-card img {
  width: 100%; aspect-ratio: 1; object-fit: cover;
  border-radius: 1.5vw; display: block;
}

@media (max-width: 760px) {
  .cg-card { width: 66vw; margin-top: -52vw; padding: 4.4vw; border-radius: 5vw; }
  .cg-card p { font-size: 4.6vw; }
  .cg-title { font-size: 9vw; white-space: normal; text-align: center; width: 88vw; }
}
`
