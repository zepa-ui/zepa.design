"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   featured9-grid — next-project rail
   ─ oversized headline that the video row rides
     up and over
   ─ each clip is paused until its own card is
     hovered; the other two dim so nothing
     competes with what is playing
   ───────────────────────────────────────────── */

type Project = { num: string; name: string; src: string }

const PROJECTS: Project[] = [
  {
    num: "01",
    name: "Greenboard Arcade",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786290450/nw1_dvzhjf.mp4",
  },
  {
    num: "02",
    name: "Puma Running",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786290451/nw3_bcdiry.mp4",
  },
  {
    num: "03",
    name: "Planet Paradise",
    src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786290451/nw2_qstwrw.mp4",
  },
]

const Arrow = () => (
  <svg viewBox="0 0 12 12" className="f9g-arrow" aria-hidden>
    <path d="M3.4 8.6 8.6 3.4M4.6 3.4h4v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* each card owns its own video ref, so nothing needs an array of refs
   (a ref-setter factory trips react-hooks/refs) */
function ProjectCard({
  project,
  index,
  active,
  onEnter,
  onLeave,
}: {
  project: Project
  index: number
  active: number | null
  onEnter: (i: number) => void
  onLeave: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const dimmed = active !== null && active !== index

  const handleEnter = () => {
    onEnter(index)
    const v = videoRef.current
    if (v) {
      v.currentTime = 0
      /* play() rejects if the gesture is interrupted — harmless here */
      void v.play().catch(() => {})
    }
  }

  const handleLeave = () => {
    onLeave()
    videoRef.current?.pause()
  }

  return (
    <article
      className={`f9g-card${dimmed ? " f9g-card--dim" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="f9g-frame">
        <video
          ref={videoRef}
          src={project.src}
          muted
          loop
          playsInline
          preload="metadata"
        />
        <span className="f9g-shade" aria-hidden />
      </div>

      <div className="f9g-meta">
        <span className="f9g-num">{project.num}</span>
        <span className="f9g-name">{project.name}</span>
        <Link href="/components" className="f9g-full">
          FULL PROJECT <Arrow />
        </Link>
      </div>
    </article>
  )
}

export default function Featured9Grid() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="f9g-root">
      <style>{CSS}</style>

      <nav className="f9g-nav">
        <Link href="/components" className="f9g-navlink">WORK</Link>
        <Link href="/docs" className="f9g-navlink">INFO</Link>
        <Link href="/docs" className="f9g-navlink">CONTACT US</Link>
      </nav>

      <h2 className="f9g-headline">
        <span className="f9g-line">NEXT</span>
        <span className="f9g-line">PROJECT</span>
      </h2>

      {/* rides up over the headline */}
      <div className="f9g-rail">
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.name}
            project={p}
            index={i}
            active={active}
            onEnter={setActive}
            onLeave={() => setActive(null)}
          />
        ))}
      </div>

      <Link href="/components" className="f9g-back">
        <span className="f9g-back-arrow">←</span> BACK TO ALL
      </Link>

      <footer className="f9g-foot">
        <span>ZEPA</span>
        <span>&amp;</span>
        <span>UI</span>
      </footer>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f9g-root {
  --f9g-blue: #8ec9f5;
  --f9g-dim: #4a4a4d;

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: var(--font-manrope, "Helvetica Neue", Helvetica, ui-sans-serif, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  padding-top: clamp(26px, 3.2vh, 58px);
  box-sizing: border-box;
}

/* ── Nav ── */
.f9g-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 clamp(10px, 1vw, 18px);
  flex-shrink: 0;
}
.f9g-navlink {
  font-size: clamp(11px, .85vw, 17px);
  font-weight: 700;
  letter-spacing: -.01em;
  color: #fff;
  text-decoration: none;
  transition: color .2s ease;
}
.f9g-navlink:hover { color: var(--f9g-blue); }

/* ── Headline ── */
.f9g-headline {
  margin: clamp(74px, 12.5vh, 220px) 0 0;
  text-align: center;
  font-size: clamp(56px, 10.7vw, 224px);
  font-weight: 700;
  /* very tight leading — the reference stacks the two words almost flush */
  line-height: .73;
  letter-spacing: -.035em;
  color: var(--f9g-blue);
  flex-shrink: 0;
}
.f9g-line { display: block; }

/* ── Rail ──
   the negative margin pulls the row up so it crops the second headline
   line. Tuned to leave roughly two-thirds of PROJECT readable — make it
   more negative to bury more of the word, less to expose it. */
.f9g-rail {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  margin-top: clamp(-88px, -2.5vw, -12px);
  flex-shrink: 0;
}

.f9g-card { display: block; }
.f9g-frame {
  position: relative;
  aspect-ratio: 2 / 1;
  overflow: hidden;
  background: #000;
}
.f9g-frame video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.001); /* hides sub-pixel edge seams while scaling */
  transition: transform .6s cubic-bezier(.22,1,.36,1);
}
.f9g-card:hover .f9g-frame video { transform: scale(1.04); }

/* the two cards that are not being hovered fall back */
.f9g-shade {
  position: absolute;
  inset: 0;
  background: #000;
  opacity: 0;
  pointer-events: none;
  transition: opacity .45s ease;
}
.f9g-card--dim .f9g-shade { opacity: .72; }

/* ── Meta row ── */
.f9g-meta {
  display: flex;
  align-items: center;
  gap: clamp(8px, .9vw, 18px);
  padding: clamp(9px, .9vw, 18px) clamp(8px, .75vw, 15px) 0;
  font-size: clamp(10px, .8vw, 16px);
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--f9g-blue);
  transition: color .45s ease;
}
.f9g-num { min-width: 4.2em; }
.f9g-full {
  display: inline-flex;
  align-items: center;
  gap: .35em;
  margin-left: auto;
  color: inherit;
  text-decoration: none;
}
.f9g-arrow { width: .82em; height: .82em; }
.f9g-full:hover { text-decoration: underline; }

/* dimming the card dims its label too, so the eye follows the clip */
.f9g-card--dim .f9g-meta { color: var(--f9g-dim); }

/* ── Back link ── */
.f9g-back {
  display: inline-flex;
  align-items: center;
  gap: .55em;
  align-self: center;
  margin: clamp(26px, 4.5vh, 74px) 0 clamp(26px, 5vh, 86px);
  font-size: clamp(11px, .85vw, 17px);
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--f9g-blue);
  text-decoration: none;
  flex-shrink: 0;
}
.f9g-back-arrow { transition: transform .3s cubic-bezier(.22,1,.36,1); }
.f9g-back:hover .f9g-back-arrow { transform: translateX(-5px); }

/* ── Footer ── */
.f9g-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: clamp(12px, 1.2vw, 22px) clamp(10px, 1vw, 18px);
  border-top: 1px solid #191919;
  font-size: clamp(11px, .85vw, 17px);
  font-weight: 700;
  letter-spacing: -.01em;
  color: var(--f9g-blue);
  flex-shrink: 0;
}

/* ══════════════════════════════════════════
   Entrance
   ══════════════════════════════════════════ */
.f9g-nav { animation: f9gFade .8s ease-out .05s backwards; }
@keyframes f9gFade { from { opacity: 0; } to { opacity: 1; } }

/* the two words push up from under each other */
.f9g-line { animation: f9gWord 1.05s cubic-bezier(.22,1,.36,1) backwards; }
.f9g-line:nth-child(1) { animation-delay: .14s; }
.f9g-line:nth-child(2) { animation-delay: .26s; }
@keyframes f9gWord {
  from { opacity: 0; transform: translateY(.3em) scale(.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* the rail wipes upward, so it appears to slide over the headline */
.f9g-rail { animation: f9gWipe 1.15s cubic-bezier(.22,1,.36,1) .5s backwards; }
@keyframes f9gWipe {
  from { opacity: 0; transform: translateY(52px); clip-path: inset(100% 0 0 0); }
  to   { opacity: 1; transform: translateY(0);    clip-path: inset(0 0 0 0); }
}
/* labels arrive after their clip has landed */
.f9g-meta {
  animation: f9gRise .7s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(1.05s + var(--i) * .09s);
}
@keyframes f9gRise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.f9g-back { animation: f9gRise .8s cubic-bezier(.22,1,.36,1) 1.4s backwards; }
.f9g-foot { animation: f9gFade .8s ease-out 1.55s backwards; }

@media (prefers-reduced-motion: reduce) {
  .f9g-nav, .f9g-line, .f9g-rail, .f9g-meta, .f9g-back, .f9g-foot {
    animation: none;
    opacity: 1;
    transform: none;
    clip-path: none;
  }
  .f9g-frame video, .f9g-shade, .f9g-back-arrow { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .f9g-rail {
    grid-template-columns: 1fr;
    margin-top: clamp(-40px, -3vw, -12px);
  }
  .f9g-num { min-width: 2.6em; }
}
`
