"use client"

import { Globe, type Arc, type Marker } from "./ui/globe"

/* ─────────────────────────────────────────────
   plane-hero — dotted globe with flying routes

   A centred headline over a WebGL globe made of
   ~16k dots sampled off a world map. Ten cities
   carry anchored labels; six great-circle arcs draw
   themselves between them on a staggered loop, and a
   3D plane rides each arc's peak, yawed to the real
   geographic bearing of its own flight line so it
   always points where it is going.

   The labels are placed with CSS anchor positioning
   rather than measured coordinates — cobe exposes a
   --cobe-<id> anchor and a --cobe-visible-<id>
   number per marker, so a chip can be pinned to a
   point on a rotating sphere and faded as it passes
   behind, in CSS alone.

   cobe is vendored into ui/cobe.js rather than
   installed, so the component owns its own source
   and needs no npm install. Its MIT notice travels
   with it.

   Plane model: chroma3d on Sketchfab
   https://sketchfab.com/vendol21
   Adapted from the GlobalCare.ai hero.
   ───────────────────────────────────────────── */

/**
 * Where the 3D plane is served from.
 *
 * The model itself lives at ui/plane.glb so it travels with the component in
 * source control. It cannot be loaded from there at runtime, though: only
 * public/ is served by Next, and scripts/build-registry.ts collects .tsx/.ts/
 * .json and reads them as UTF-8, so a binary in ui/ is skipped by the registry
 * and never reaches anyone installing this.
 *
 * Empty by default, which is a complete component — every arc renders its text
 * route chip and the model-viewer script never loads. Point this at a served
 * copy (public/, or any https URL) and the planes appear.
 */
const PLANE_MODEL = ""

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"

// [lat, lng] — cobe is lat-first
const MARKERS: Marker[] = [
  { id: "sf", location: [37.7749, -122.4194], label: "San Francisco" },
  { id: "nyc", location: [40.7128, -74.006], label: "New York" },
  { id: "london", location: [51.5072, -0.1276], label: "London" },
  { id: "berlin", location: [52.52, 13.405], label: "Berlin" },
  { id: "lagos", location: [6.5244, 3.3792], label: "Lagos" },
  { id: "bangalore", location: [12.9716, 77.5946], label: "Bangalore" },
  { id: "singapore", location: [1.3521, 103.8198], label: "Singapore" },
  { id: "tokyo", location: [35.6762, 139.6503], label: "Tokyo" },
  { id: "saopaulo", location: [-23.5505, -46.6333], label: "São Paulo" },
  { id: "sydney", location: [-33.8688, 151.2093], label: "Sydney" },
]

const ARCS: Arc[] = [
  {
    id: "sf-nyc",
    from: [37.7749, -122.4194],
    to: [40.7128, -74.006],
    label: "SF → NYC",
  },
  {
    id: "nyc-london",
    from: [40.7128, -74.006],
    to: [51.5072, -0.1276],
    label: "NYC → London",
  },
  {
    id: "london-bangalore",
    from: [51.5072, -0.1276],
    to: [12.9716, 77.5946],
    label: "London → Bangalore",
  },
  {
    id: "berlin-lagos",
    from: [52.52, 13.405],
    to: [6.5244, 3.3792],
    label: "Berlin → Lagos",
  },
  {
    id: "singapore-tokyo",
    from: [1.3521, 103.8198],
    to: [35.6762, 139.6503],
    label: "Singapore → Tokyo",
  },
  {
    id: "saopaulo-sydney",
    from: [-23.5505, -46.6333],
    to: [-33.8688, 151.2093],
    label: "São Paulo → Sydney",
  },
]

export default function PlaneHero() {
  return (
    <section className="ph-root">
      <style>{CSS}</style>

      {/* soft fade at the bottom */}
      <div className="ph-fade" />

      <header className="ph-nav">
        <img className="ph-logo" src={LOGO} alt="Zepa" draggable={false} />
        <a
          className="ph-nav-link"
          href="https://zepa.design/components"
          target="_blank"
          rel="noreferrer noopener"
        >
          Browse components
        </a>
      </header>

      <div className="ph-copy">
        <p className="ph-eyebrow">Open source · no build step</p>
        <h1 className="ph-title">
          Components
          <br />
          without borders.
        </h1>
        <div className="ph-cta-row">
          <a
            className="ph-cta"
            href="https://zepa.design/components"
            target="_blank"
            rel="noreferrer noopener"
          >
            Start building
            <span className="ph-cta-arrow">→</span>
          </a>
        </div>
      </div>

      <div className="ph-stage">
        {/* light-blue glow — sized to hug the sphere (sphere ≈ 85% of the canvas) */}
        <div className="ph-glow" />
        {/* soft horizon accent at the top edge of the sphere */}
        <div className="ph-horizon" />
        <Globe
          markers={MARKERS}
          arcs={ARCS}
          arcIcon={PLANE_MODEL || undefined}
          markerColor={[0.15, 0.39, 0.92]}
          baseColor={[0.91, 0.91, 0.91]}
          arcColor={[0.15, 0.39, 0.92]}
          glowColor={[0.82, 0.85, 0.9]}
          dark={0}
          mapBrightness={10}
          markerSize={0.04}
          markerElevation={0.01}
        />
      </div>

      <div className="ph-meta ph-meta--left">Copy the source · own it outright</div>
      <div className="ph-meta ph-meta--right">
        Heroes · grids · animations — one registry
      </div>
    </section>
  )
}

const CSS = `
.ph-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  padding-bottom: 40px;
  background-color: #f6f9ff;
  color: #020617;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.ph-root *, .ph-root *::before, .ph-root *::after { box-sizing: border-box; }

.ph-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 128px;
  z-index: 6;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff, transparent);
}

.ph-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}
.ph-logo {
  height: 36px;
  width: auto;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}
.ph-nav-link {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(255, 255, 255, 0.7);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  transition: color 0.2s, border-color 0.2s;
}
.ph-nav-link:hover { color: #020617; border-color: rgba(100, 116, 139, 0.6); }

.ph-copy {
  position: relative;
  z-index: 10;
  margin-top: 0.5vh;
  padding: 0 24px;
  text-align: center;
  pointer-events: none;
}
.ph-eyebrow {
  pointer-events: auto;
  display: inline-block;
  margin: 0 auto 12px;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(191, 219, 254, 0.8);
  background: rgba(255, 255, 255, 0.7);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.35);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: #64748b;
}
.ph-title {
  pointer-events: auto;
  margin: 0;
  font-size: clamp(2.5rem, 8.5vw, 7.5rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: #020617;
}
.ph-cta-row { display: flex; justify-content: center; margin-top: 20px; }
.ph-cta {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 999px;
  background: #020617;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
}
.ph-cta:hover { background: #2563eb; }
.ph-cta-arrow { transition: transform 0.2s; }
.ph-cta:hover .ph-cta-arrow { transform: translateX(2px); }

/* ── the globe ── */
.ph-stage {
  position: relative;
  z-index: 5;
  width: 92vw;
  max-width: 820px;
  margin: 24px auto 0;
}
.ph-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
  filter: blur(40px);
  background: radial-gradient(circle,
    rgba(96, 165, 250, 0.35) 0%,
    rgba(147, 197, 253, 0.22) 38%,
    rgba(191, 219, 254, 0.12) 52%,
    transparent 66%);
}
.ph-horizon {
  position: absolute;
  left: 50%;
  top: 9%;
  width: 70%;
  height: 80px;
  transform: translateX(-50%);
  border-radius: 100%;
  pointer-events: none;
  filter: blur(64px);
  background: rgba(56, 189, 248, 0.25);
}

.ph-globe {
  position: relative;
  aspect-ratio: 1;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  opacity: 0;
}
/* entrance: starts at 200% and eases down to its normal size */
.ph-globe.is-ready { animation: ph-globe-appear 2000ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes ph-globe-appear {
  from { scale: 2; opacity: 0; }
  to   { scale: 1; opacity: 1; }
}
.ph-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  opacity: 0;
  transition: opacity 1.2s ease;
  border-radius: 50%;
  touch-action: none;
}

/* ── anchored labels ──
   cobe publishes a --cobe-<id> anchor name and a --cobe-visible-<id> number
   for every marker and arc, so these chips ride the sphere and fade as their
   point rotates out of view without a single measured coordinate. */
.ph-pin, .ph-arc {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  pointer-events: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: opacity 0.8s, filter 0.8s;
}
.ph-pin {
  margin-bottom: 8px;
  padding: 2px 6px;
  background: #1a1a2e;
  color: #ffffff;
}
.ph-pin-tip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate3d(-50%, -1px, 0);
  border: 5px solid transparent;
  border-top-color: #1a1a2e;
}

.ph-arc--text {
  margin-bottom: 8px;
  padding: 2px 6px;
  background: #ffffff;
  color: #1a1a2e;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s, filter 0.3s;
}
.ph-arc-tip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translate3d(-50%, -1px, 0);
  border: 5px solid transparent;
  border-top-color: #ffffff;
}

.ph-arc--model {
  margin-bottom: -6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: opacity 0.3s, filter 0.3s;
}
.ph-route {
  padding: 2px 6px;
  border-radius: 3px;
  background: #ffffff;
  color: #1a1a2e;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

/* ── corner meta ── */
.ph-meta {
  position: absolute;
  bottom: 24px;
  z-index: 10;
  display: none;
  pointer-events: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #94a3b8;
}
.ph-meta--left { left: 32px; }
.ph-meta--right { right: 32px; }

@media (min-width: 640px) {
  .ph-nav { padding: 20px 40px; }
  .ph-logo { height: 40px; }
  .ph-stage { margin-top: -56px; }
  .ph-meta { display: block; }
}

@media (max-width: 639px) {
  .ph-nav-link { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ph-globe.is-ready { animation: none; opacity: 1; }
  .ph-canvas { transition: none; }
  .ph-pin, .ph-arc { transition: none; }
}
`
