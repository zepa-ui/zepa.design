"use client"

import { PaperSheets, type SheetContent } from "./ui/paper-sheets"

/* ─────────────────────────────────────────────
   paper-grid — three certificates printed on glass

   Three translucent sheets hang side by side over
   a single giant wordmark. Each one bends like real
   paper: the curl is integrated along the sheet
   rather than pushed in Z, so the silhouette pulls
   in where the page turns away from the light.

   Drag a sheet to turn it — the throw carries and
   settles on the nearest whole rotation. Hover to
   light it; the hovered sheet lifts toward the
   camera so it wins the overlap.

   All three share one WebGL context, one renderer
   and one environment map. The component measures
   its own container and binds pointer events to it,
   so it never touches window scroll or position:fixed.

   3D scene ported from ThreeUI's <ThreeDPaper />
   (MIT — Meng To / Design+Code).
   ───────────────────────────────────────────── */

/** the same credits are printed on every sheet */
const CREDITS = ["By Zepa Studios", "Sameer Shaik", "George Hastings", "Frank Adl"]

const CARDS: SheetContent[] = [
  {
    kicker: "Component of the Week.",
    date: "Feb 14, 2026",
    title: "selfie-hero.",
    names: CREDITS,
    body: "The Zepa jury is proud to declare this component pick of the week in recognition of the craft and restraint invested in its making.",
    mark: "zepa.",
    markSuffix: " winners",
    badge: "2026 Official Certificate",
    tag: "COTW",
  },
  {
    kicker: "Studio of the Month.",
    date: "Mar 02, 2026",
    title: "Zepa Studio.",
    names: CREDITS,
    body: "Awarded for a body of work that treats motion as structure rather than decoration, and ships it without the maintenance tax.",
    mark: "zepa.",
    markSuffix: " studios",
    badge: "2026 Official Certificate",
    tag: "SOTM",
  },
  {
    kicker: "Featured Build.",
    date: "Apr 21, 2026",
    title: "zepa.design",
    names: CREDITS,
    body: "Recognised for an interface that stays legible at speed, and for proving that a registry component can carry a whole product.",
    mark: "zepa.",
    markSuffix: " featured",
    badge: "2026 Official Certificate",
    tag: "BUILD",
  },
]

export default function PaperGrid() {
  return (
    <div className="pg-root">
      <style>{CSS}</style>

      {/* one giant word, nothing else */}
      <div className="pg-bg">
        <h1>NOCTURNE</h1>
      </div>

      {/* a touch of defocus so the wordmark sits behind glass */}
      <div className="pg-dof" />

      <PaperSheets cards={CARDS} />

      <div className="pg-grain" />
      <div className="pg-vig" />

      <p className="pg-hint">
        <b>Drag</b> to turn one<span className="pg-ptr"> &nbsp;·&nbsp; <b>Hover</b> to light it</span>
      </p>
    </div>
  )
}

const CSS = `
.pg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #08080a;
  color: #f2f2f0;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

/* the word the sheets hang in front of */
.pg-bg { position: absolute; inset: 0; z-index: 1; overflow: hidden; }
.pg-bg h1 {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-weight: 600; letter-spacing: -0.055em;
  font-size: clamp(96px, 18.6vw, 420px);
  line-height: 0.8; white-space: nowrap;
  color: rgba(242, 242, 240, 0.125);
}

.pg-dof {
  position: absolute; inset: -30px; z-index: 2; pointer-events: none;
  backdrop-filter: blur(2.4px);
  -webkit-backdrop-filter: blur(2.4px);
  background: rgba(8, 8, 10, 0.05);
}

/* the WebGL stage owns pointer input, so it sits above the backdrop */
.pg-stage { position: absolute; inset: 0; z-index: 3; }
.pg-gl { display: block; width: 100%; height: 100%; }

.pg-grain {
  position: absolute; inset: 0; z-index: 4; pointer-events: none;
  opacity: 0.05; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat; background-size: 160px 160px;
}

.pg-vig {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.52) 100%);
}

.pg-hint {
  position: absolute; left: 0; right: 0; bottom: 48px; z-index: 6;
  margin: 0; pointer-events: none; text-align: center;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(242, 242, 240, 0.3);
  opacity: 0; transition: opacity 0.8s ease;
}
.pg-hint b { font-weight: 500; color: rgba(242, 242, 240, 0.58); }
.pg-stage[data-ready="true"] ~ .pg-hint { opacity: 1; }

@media (hover: none) { .pg-ptr { display: none; } }

@media (max-width: 760px) {
  .pg-bg h1 { font-size: 22vw; }
  .pg-hint { bottom: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .pg-hint { transition: none; }
}
`
