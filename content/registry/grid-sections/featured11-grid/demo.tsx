"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   featured11-grid — project switcher
   ─ a stack of project names on the left; hover
     or focus one and the media cross-fades and
     the panel on the right swaps with it
   ─ every clip is mounted but only the active
     one plays, so switching never re-buffers
   ───────────────────────────────────────────── */

type Project = {
  name: string
  blurb: string
  stat: string
  statLabel: string
  kind: string
  client: string
  src: string
  video?: boolean
}

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"

const PROJECTS: Project[] = [
  {
    name: "Hero Sections",
    blurb: "Full-bleed video, WebGL scenes and editorial layouts — every one ready to paste.",
    stat: "32",
    statLabel: "components shipped",
    kind: "Category",
    client: "Zepa Hero Sections",
    src: "https://res.cloudinary.com/dakrfj1oh/video/upload/v1781518638/samples/elephants.mp4",
    video: true,
  },
  {
    name: "Grid Sections",
    blurb: "Bento layouts, feature grids and showcase rails for any product page.",
    stat: "11",
    statLabel: "components shipped",
    kind: "Category",
    client: "Zepa Grid Sections",
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518637/samples/imagecon-group.jpg",
  },
  {
    name: "Navbar Sections",
    blurb: "Pill navs, clipped headers and scroll-aware bars that behave on every route.",
    stat: "6",
    statLabel: "components shipped",
    kind: "Category",
    client: "Zepa Navbar Sections",
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518635/samples/people/jazz.jpg",
  },
  {
    name: "Unicorn Section",
    blurb: "Interactive 3D scenes that drop straight into a React page, no setup required.",
    stat: "15",
    statLabel: "components shipped",
    kind: "Category",
    client: "Zepa Unicorn Section",
    src: "https://res.cloudinary.com/dakrfj1oh/video/upload/v1781518639/samples/dance-2.mp4",
    video: true,
  },
]

const NAV = ["Components", "Templates", "Docs", "Playground", "About"]

/* each layer owns its own ref, so no ref array is needed */
function MediaLayer({ item, active }: { item: Project; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (active) void v.play().catch(() => {})
    else v.pause()
  }, [active])

  return (
    <div className={`f11-layer${active ? " f11-layer--on" : ""}`} aria-hidden={!active}>
      {item.video ? (
        <video ref={videoRef} src={item.src} muted loop playsInline preload="auto" />
      ) : (
        <img src={item.src} alt="" loading="lazy" />
      )}
    </div>
  )
}

export default function Featured11Grid() {
  const [active, setActive] = useState(1)
  const p = PROJECTS[active]

  return (
    <section className="f11-root">
      <style>{CSS}</style>

      {/* ── nav ── */}
      <header className="f11-nav">
        <Link href="/" className="f11-brand">
          <img src={LOGO} alt="Zepa UI" />
        </Link>

        <div className="f11-navpill">
          {NAV.map((n) => (
            <Link key={n} href="/components" className="f11-navlink">{n}</Link>
          ))}
          <Link href="/components" className="f11-talk">Get Started</Link>
        </div>

        <svg viewBox="0 0 24 30" className="f11-mark" aria-hidden>
          <path d="M3 0h5v30H3z" />
          <path d="M13 9c5 0 8 3.4 8 8.2S18 30 13 30z" />
        </svg>
      </header>

      {/* ── stage ── */}
      <div className="f11-stage">
        <div className="f11-media">
          {PROJECTS.map((item, i) => (
            <MediaLayer key={item.name} item={item} active={i === active} />
          ))}
          <span className="f11-scrim" aria-hidden />
        </div>

        <Link href="/components" className="f11-all">View All Components</Link>

        {/* project list */}
        <div className="f11-list" role="tablist" aria-label="Projects">
          {PROJECTS.map((item, i) => (
            <button
              key={item.name}
              role="tab"
              aria-selected={i === active}
              className={`f11-item${i === active ? " f11-item--on" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* info — keyed so it re-animates on every switch */}
        <div className="f11-info" key={active}>
          <p className="f11-blurb">{p.blurb}</p>

          <div className="f11-row">
            <div className="f11-stat">
              <span className="f11-stat-n">{p.stat}</span>
              <span className="f11-stat-l">{p.statLabel}</span>
            </div>

            <div className="f11-meta">
              <span className="f11-kind">{p.kind}</span>
              <span className="f11-client">{p.client}</span>

              <button className="f11-more" type="button">
                <span className="f11-more-plus">+</span>
                <span className="f11-more-label">Discover More</span>
                <span className="f11-more-arrow" aria-hidden>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3.4 8.6 8.6 3.4M4.6 3.4h4v4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f11-root {
  --f11-ink: #14161c;
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
  color: var(--f11-ink);
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  padding: clamp(18px, 2.2vw, 46px) clamp(12px, 2.6vw, 54px) clamp(20px, 2.6vw, 54px);
  box-sizing: border-box;
}

/* ── Nav ── */
.f11-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-shrink: 0;
}
.f11-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
}
/* the mark ships light-on-transparent; brightness(0) makes it read
   on this white bar without needing a second asset */
.f11-brand img {
  height: clamp(38px, 3.6vw, 78px);
  width: auto;
  display: block;
  filter: brightness(0);
}
.f11-navpill {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.1vw, 23px);
  background: #d6d6d8;
  border-radius: 999px;
  padding: clamp(5px, .42vw, 9px);
  padding-left: clamp(14px, 1.5vw, 31px);
}
.f11-navlink {
  font-size: clamp(11px, .85vw, 18px);
  color: #3e4048;
  text-decoration: none;
  white-space: nowrap;
  transition: color .18s ease;
}
.f11-navlink:hover { color: #0b0c10; }
.f11-talk {
  background: #101420;
  color: #fff;
  border-radius: 999px;
  padding: clamp(9px, .85vw, 18px) clamp(14px, 1.4vw, 30px);
  font-size: clamp(11px, .85vw, 18px);
  text-decoration: none;
  white-space: nowrap;
  transition: background .2s ease;
}
.f11-talk:hover { background: #262c3d; }
.f11-mark { width: clamp(14px, 1.1vw, 24px); height: auto; fill: #101420; }

/* ── Stage ── */
.f11-stage {
  position: relative;
  margin-top: clamp(20px, 3.4vw, 72px);
  aspect-ratio: 2.04;
  min-height: clamp(360px, 47vw, 950px);
  border-radius: clamp(14px, 1.2vw, 26px);
  overflow: hidden;
  flex-shrink: 0;
}

/* every layer stays mounted; only opacity changes, so a switch never
   re-decodes an image or re-buffers a clip */
.f11-media { position: absolute; inset: 0; background: #0b0c10; }
.f11-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .8s cubic-bezier(.4,0,.2,1);
}
.f11-layer--on { opacity: 1; }
.f11-layer video,
.f11-layer img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
/* darkened at the edges so the type holds against any frame */
.f11-scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(8,9,12,.62) 0%, rgba(8,9,12,.14) 42%, rgba(8,9,12,.40) 100%),
    linear-gradient(to top, rgba(8,9,12,.52) 0%, rgba(8,9,12,0) 48%);
}

/* ── View all ── */
.f11-all {
  position: absolute;
  top: clamp(14px, 1.9vw, 40px);
  right: clamp(14px, 1.9vw, 40px);
  z-index: 3;
  border: 1px solid rgba(255,255,255,.55);
  border-radius: 999px;
  padding: clamp(10px, 1.05vw, 22px) clamp(18px, 1.9vw, 40px);
  font-size: clamp(11px, .88vw, 19px);
  color: #fff;
  text-decoration: none;
  transition: background .25s ease, border-color .25s ease;
}
.f11-all:hover { background: rgba(255,255,255,.14); border-color: #fff; }

/* ── Project list ── */
.f11-list {
  position: absolute;
  left: clamp(12px, 1.6vw, 34px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: clamp(4px, .95vw, 20px);
  max-width: 62%;
}
.f11-item {
  border: 0;
  background: none;
  cursor: pointer;
  padding: 0;
  text-align: left;
  font-family: inherit;
  font-size: clamp(20px, 3.2vw, 66px);
  font-weight: 400;
  letter-spacing: -.022em;
  line-height: 1.18;
  color: rgba(255,255,255,.34);
  transition: color .45s cubic-bezier(.4,0,.2,1), transform .45s cubic-bezier(.22,1,.36,1);
}
.f11-item:hover { color: rgba(255,255,255,.62); }
.f11-item--on,
.f11-item--on:hover {
  color: #fff;
  transform: translateX(clamp(2px, .5vw, 10px));
}

/* ── Info ── */
.f11-info {
  position: absolute;
  right: clamp(12px, 1.9vw, 40px);
  bottom: clamp(14px, 1.9vw, 40px);
  z-index: 3;
  width: min(46%, 640px);
  color: #fff;
  animation: f11Swap .55s cubic-bezier(.22,1,.36,1);
}
@keyframes f11Swap {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.f11-blurb {
  margin: 0 0 clamp(14px, 1.6vw, 34px);
  font-size: clamp(12px, 1.05vw, 22px);
  line-height: 1.45;
}
.f11-row {
  display: flex;
  align-items: flex-start;
  gap: clamp(12px, 1.5vw, 32px);
}
.f11-stat { flex: 1; min-width: 0; }
.f11-stat-n {
  display: block;
  font-size: clamp(24px, 2.7vw, 56px);
  font-weight: 700;
  letter-spacing: -.03em;
  line-height: 1;
}
.f11-stat-l {
  display: block;
  margin-top: .45em;
  font-size: clamp(10px, .8vw, 17px);
  line-height: 1.35;
  color: rgba(255,255,255,.88);
}
.f11-meta {
  flex: 1;
  min-width: 0;
  padding-left: clamp(12px, 1.5vw, 32px);
  border-left: 1px solid rgba(255,255,255,.42);
}
.f11-kind {
  display: block;
  font-size: clamp(10px, .78vw, 16px);
  color: rgba(255,255,255,.82);
}
.f11-client {
  display: block;
  margin-top: .22em;
  font-size: clamp(15px, 1.5vw, 32px);
  letter-spacing: -.02em;
  line-height: 1.15;
}

/* ── Discover more ──
   a bare circle + label at rest; on hover the whole thing becomes a
   filled pill and the arrow expands into place */
.f11-more {
  display: inline-flex;
  align-items: center;
  gap: clamp(8px, .8vw, 17px);
  margin-top: clamp(12px, 1.4vw, 30px);
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: clamp(11px, .88vw, 19px);
  transition: background .38s cubic-bezier(.22,1,.36,1), padding .38s cubic-bezier(.22,1,.36,1);
}
.f11-more-plus {
  display: grid;
  place-items: center;
  width: clamp(30px, 2.5vw, 52px);
  height: clamp(30px, 2.5vw, 52px);
  border-radius: 50%;
  background: #101420;
  font-size: 1.1em;
  flex-shrink: 0;
  transition: background .3s ease;
}
/* max-width, not width — it animates cleanly from nothing */
.f11-more-arrow {
  display: grid;
  place-items: center;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width .38s cubic-bezier(.22,1,.36,1), opacity .3s ease;
}
.f11-more-arrow svg { width: 1.15em; height: 1.15em; }
.f11-more:hover {
  background: #101420;
  padding-right: clamp(12px, 1.1vw, 24px);
}
.f11-more:hover .f11-more-arrow { max-width: 2em; opacity: 1; }
.f11-more:hover .f11-more-plus { background: transparent; }

/* ══════════════════════════════════════════
   Entrance
   ══════════════════════════════════════════ */
.f11-nav { animation: f11Drop .85s cubic-bezier(.22,1,.36,1) .05s backwards; }
@keyframes f11Drop {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* the card opens upward before anything inside it appears */
.f11-stage { animation: f11Open 1.05s cubic-bezier(.22,1,.36,1) .18s backwards; }
@keyframes f11Open {
  from { opacity: 0; transform: translateY(34px) scale(.985); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.f11-all { animation: f11Fade .7s ease-out .8s backwards; }
@keyframes f11Fade { from { opacity: 0; } to { opacity: 1; } }

.f11-item {
  animation: f11Slide .85s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.62s + var(--i) * .09s);
}
@keyframes f11Slide {
  from { opacity: 0; transform: translateX(-26px); }
  to   { opacity: 1; transform: translateX(0); }
}
.f11-info {
  animation:
    f11Swap .55s cubic-bezier(.22,1,.36,1),
    f11Rise .9s cubic-bezier(.22,1,.36,1) .92s backwards;
}
@keyframes f11Rise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .f11-nav, .f11-stage, .f11-all, .f11-item, .f11-info {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .f11-item--on { transform: none; }
  .f11-layer, .f11-more, .f11-more-arrow, .f11-more-plus { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .f11-navpill { display: none; }
  .f11-stage { aspect-ratio: 1 / 1.15; min-height: 0; }
  .f11-list {
    top: clamp(70px, 16vw, 140px);
    transform: none;
    max-width: 82%;
  }
  .f11-info { width: calc(100% - clamp(24px, 3.8vw, 80px)); }
  .f11-row { flex-direction: column; gap: 14px; }
  .f11-meta { padding-left: 0; border-left: 0; }
}
`
