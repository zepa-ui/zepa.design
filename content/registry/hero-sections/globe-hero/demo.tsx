"use client"

import { GlobeCdn } from "./ui/globe-cdn"
import { TextRotate } from "./ui/text-rotate"

/* ─────────────────────────────────────────────
   globe-hero — rotating headline beside an edge globe

   Two columns under a slim navbar. On the left a
   three-line headline whose middle line swaps every
   two seconds, each character its own spring so the
   outgoing word slides up while the incoming one
   rises from below. That line is a block of its own,
   so a longer word widens it without ever rewrapping
   the lines above or below. On the right a dotted
   WebGL globe with
   a spinning tetrahedron at every edge region and a
   request counter drifting over every arc.

   Both sets of chips ride the sphere on CSS anchor
   positioning — cobe publishes an anchor name and a
   visibility number per point, so they track and
   fade in CSS with no measured coordinates.

   cobe is vendored into ui/cobe.js under its MIT
   licence rather than installed, so the globe needs
   no npm package. The word rotation uses motion,
   which the project already ships.

   Adapted from the CohortData.com hero.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"

const NAV = [
  { label: "Components", href: "https://zepa.design/components" },
  { label: "Heroes", href: "https://zepa.design/components" },
  { label: "Grids", href: "https://zepa.design/components" },
  { label: "Animations", href: "https://zepa.design/components" },
  { label: "Docs", href: "https://zepa.design/docs" },
]

/** the word that swaps in the middle of the headline */
const ROTATING = ["Heroes", "Grids", "Animations", "Illustrations"]

export default function GlobeHero() {
  return (
    <section className="gh-root">
      <style>{CSS}</style>

      <header className="gh-nav">
        <div className="gh-nav-inner">
          <img className="gh-logo" src={LOGO} alt="Zepa" draggable={false} />

          <nav className="gh-links">
            {NAV.map((item) => (
              <a
                key={item.label}
                className="gh-link"
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            className="gh-nav-cta"
            href="https://zepa.design/components"
            target="_blank"
            rel="noreferrer noopener"
          >
            Browse the registry
          </a>
        </div>
      </header>

      <div className="gh-inner">
        {/* ── left ── */}
        <div className="gh-copy">
          {/* Three fixed lines. The rotating word gets the middle one to
              itself, so a longer word can never rewrap "Building" or "for the
              Next Interface" onto a different line the way it did when all
              three shared one flowing block. */}
          <h1 className="gh-title">
            <span className="gh-line">Building</span>
            <span className="gh-line gh-line--rotating gh-accent">
              <TextRotate texts={ROTATING} />
            </span>
            <span className="gh-line">for the Next Interface</span>
          </h1>

          <p className="gh-lede">
            Zepa ships production-ready React sections, interactive
            illustrations and scroll systems you paste straight into your repo —
            source you own outright, with no package standing between you and a
            fix.
          </p>

          <div className="gh-actions">
            <a
              className="gh-btn"
              href="https://zepa.design/components"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>Browse Components</span>
              <span className="gh-btn-arrow">→</span>
            </a>
            <a
              className="gh-btn gh-btn--secondary"
              href="https://zepa.design/docs"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>Read the Docs</span>
              <span className="gh-btn-arrow">→</span>
            </a>
          </div>
        </div>

        {/* ── right ── */}
        <div className="gh-stage">
          <div className="gh-glow" />
          <div className="gh-globe-wrap">
            <GlobeCdn />
          </div>
        </div>
      </div>
    </section>
  )
}

const CSS = `
.gh-root {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background-color: #f3f3f3;
  color: #131313;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.gh-root *, .gh-root *::before, .gh-root *::after { box-sizing: border-box; }

/* ── navbar ── */
.gh-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(19, 19, 19, 0.07);
  background: rgba(243, 243, 243, 0.82);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.gh-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px;
}
.gh-logo { height: 30px; width: auto; display: block; user-select: none; -webkit-user-select: none; }

.gh-links { display: none; align-items: center; gap: 28px; }
.gh-link {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #131313;
  text-decoration: none;
  transition: color 0.2s;
}
.gh-link:hover { color: #0048b0; }

.gh-nav-cta {
  display: none;
  padding: 9px 18px;
  border: 1px solid #0048b0;
  border-radius: 999px;
  background: transparent;
  color: #131313;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s, color 0.2s;
}
.gh-nav-cta:hover { background: #0048b0; color: #ffffff; }

/* ── layout ── */
.gh-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 112px 24px 48px;
}

/* ── headline ── */
.gh-title {
  margin: 0;
  font-size: 42px;
  line-height: 46px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #131313;
}
/* each line is its own block, so the middle one can change width freely */
.gh-line { display: block; }
.gh-line--rotating {
  /* hold the row open at exactly one line so nothing shifts as words swap */
  min-height: 1em;
}
.gh-accent { color: #0048b0; }

/* the rotating word sits inline and keeps the line reflowing around it */
.gh-rotate {
  display: inline-flex;
  flex-wrap: wrap;
  white-space: pre-wrap;
  vertical-align: bottom;
  /* the characters translate past the baseline, so the box has to clip */
  overflow: hidden;
  padding-bottom: 0.08em;
}
.gh-rotate-row { display: inline-flex; flex-wrap: wrap; }
.gh-rotate-row--lines { flex-direction: column; width: 100%; }
.gh-rotate-word { display: inline-flex; }
.gh-rotate-char { display: inline-block; }
.gh-rotate-gap { white-space: pre; }
.gh-sr {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.gh-lede {
  margin: 28px 0 0;
  font-size: 18px;
  line-height: 32px;
  color: #555555;
  max-width: 42rem;
}

/* ── buttons ──
   square, with the arrow in its own tinted cell like the reference */
.gh-actions { display: none; flex-wrap: wrap; gap: 16px; margin-top: 36px; }
.gh-btn {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid #131313;
  background: #131313;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  overflow: hidden;
}
.gh-btn > span:first-child { padding: 16px 22px; }
.gh-btn-arrow {
  display: grid;
  place-items: center;
  width: 54px;
  background: #0048b0;
  transition: transform 0.25s ease;
}
.gh-btn:hover .gh-btn-arrow { transform: translateX(3px); }

.gh-btn--secondary {
  border-color: rgba(19, 19, 19, 0.16);
  background: #ffffff;
  color: #131313;
}
.gh-btn--secondary .gh-btn-arrow { background: #e4e4e4; }

/* ── globe ── */
.gh-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.gh-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  max-width: 120%;
  max-height: 120%;
  border-radius: 50%;
  background: rgba(0, 72, 176, 0.1);
  filter: blur(120px);
  pointer-events: none;
}
.gh-globe-wrap { position: relative; z-index: 10; width: 100%; }

.gh-globe { position: relative; aspect-ratio: 1; user-select: none; -webkit-user-select: none; }
.gh-canvas {
  width: 100%;
  height: 100%;
  cursor: grab;
  opacity: 0;
  transition: opacity 1.2s ease;
  border-radius: 50%;
  touch-action: none;
}

/* region chip + its spinning marker */
.gh-node {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  transition: opacity 0.3s, filter 0.3s;
}
.gh-pyramid {
  position: relative;
  width: 12px;
  height: 12px;
  transform-style: preserve-3d;
  animation: gh-pyramid-spin 4s linear infinite;
}
@keyframes gh-pyramid-spin {
  0%   { transform: rotateX(20deg) rotateY(0deg); }
  100% { transform: rotateX(20deg) rotateY(360deg); }
}
.gh-region {
  padding: 2px 6px;
  border-radius: 3px;
  background: #ffffff;
  color: #000000;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.55rem;
  letter-spacing: 0.05em;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.gh-traffic {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% 0;
  padding: 3px 8px;
  border-radius: 4px;
  background: #0048b0;
  color: #ffffff;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.5rem;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.3s, filter 0.3s;
}

/* ── breakpoints, tracking the reference's steps ── */
@media (min-width: 640px) {
  .gh-title { font-size: 56px; line-height: 60px; }
  .gh-lede { font-size: 20px; line-height: 34px; }
  .gh-nav-inner { padding: 16px 32px; }
  .gh-inner { padding: 120px 32px 56px; }
}

@media (min-width: 768px) {
  .gh-title { font-size: 72px; line-height: 74px; }
}

@media (min-width: 1024px) {
  .gh-inner {
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    padding: 104px 48px 56px;
  }
  .gh-links, .gh-nav-cta { display: flex; }
  .gh-actions { display: flex; }
  .gh-title { font-size: 84px; line-height: 84px; }
  .gh-lede { font-size: 22px; line-height: 38px; margin-top: 36px; }
  .gh-stage { justify-content: flex-end; }
  .gh-globe-wrap { transform: scale(1.08); }
}

@media (min-width: 1280px) {
  .gh-inner { gap: 64px; padding-left: 56px; padding-right: 56px; }
  .gh-globe-wrap { transform: scale(1.15); }
}

@media (min-width: 1536px) {
  .gh-globe-wrap { transform: scale(1.22); }
}

@media (prefers-reduced-motion: reduce) {
  .gh-pyramid { animation: none; }
  .gh-canvas { transition: none; }
  .gh-node, .gh-traffic { transition: none; }
}
`
