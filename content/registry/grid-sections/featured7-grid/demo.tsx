"use client"

import React from "react"

/* ─────────────────────────────────────────────
   featured7-grid — three feature cards on a
   blueprint frame
   ─ full-bleed top/bottom rules crossed by two
     inset vertical rails, with a crosshair at
     each of the four intersections
   ─ cards: icon tile, title, copy, then artwork
   ───────────────────────────────────────────── */

const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M14 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.6L14 3Z" strokeLinejoin="round" />
    <path d="M13.8 3.2v4.6h4.6M8.8 13h6.4M8.8 16.6h4.4" strokeLinecap="round" />
  </svg>
)
const IconSync = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M20 12a8 8 0 0 1-13.7 5.6M4 12a8 8 0 0 1 13.7-5.6" strokeLinecap="round" />
    <path d="M17.4 2.9v3.7h-3.7M6.6 21.1v-3.7h3.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconChip = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="6.6" y="6.6" width="10.8" height="10.8" rx="2.2" />
    <rect x="10.2" y="10.2" width="3.6" height="3.6" rx="1" />
    <path d="M10 3v3.4M14 3v3.4M10 17.6V21M14 17.6V21M3 10h3.4M3 14h3.4M17.6 10H21M17.6 14H21" strokeLinecap="round" />
  </svg>
)

const CARDS = [
  {
    Icon: IconDoc,
    title: "Task & Activity Management",
    body: "Assign, schedule, and track daily sales tasks effortlessly.",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286222/nw3_rfuf8b.avif",
  },
  {
    Icon: IconSync,
    title: "Connect tools",
    body: "Assign, schedule, and track daily sales tasks effortlessly.",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286221/nw1_wsyvdj.webp",
  },
  {
    Icon: IconChip,
    title: "Role-Based Access Control",
    body: "Assign, schedule, and track daily sales tasks effortlessly.",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286221/nw2_qrswtj.avif",
  },
]

export default function Featured7Grid() {
  return (
    <section className="f7g-root">
      <style>{CSS}</style>

      {/* ── blueprint frame ── */}
      <div className="f7g-frame" aria-hidden>
        <span className="f7g-rule f7g-rule--top" />
        <span className="f7g-rule f7g-rule--bottom" />
        <span className="f7g-rail f7g-rail--left" />
        <span className="f7g-rail f7g-rail--right" />
        <span className="f7g-plus f7g-plus--tl" />
        <span className="f7g-plus f7g-plus--tr" />
        <span className="f7g-plus f7g-plus--bl" />
        <span className="f7g-plus f7g-plus--br" />
      </div>

      <div className="f7g-inner">
        {/* ── header ── */}
        <header className="f7g-head">
          <div className="f7g-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="f7g-badge-icon" aria-hidden>
              <circle cx="12" cy="12" r="3.1" />
              <path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.4 5.4l2 2M16.6 16.6l2 2M18.6 5.4l-2 2M7.4 16.6l-2 2" strokeLinecap="round" />
            </svg>
            Sales AI Copilot
            <span className="f7g-free">FREE</span>
          </div>

          <h2 className="f7g-title">Sales Made Simple with AI</h2>
          <p className="f7g-sub">
            Sales made simple with AI means smarter decisions, faster results
          </p>
        </header>

        {/* ── cards ── */}
        <div className="f7g-grid">
          {CARDS.map(({ Icon, title, body, img }, i) => (
            <article className="f7g-card" key={title} style={{ "--i": i } as React.CSSProperties}>
              <span className="f7g-tile"><Icon /></span>
              <h3 className="f7g-card-title">{title}</h3>
              <p className="f7g-card-body">{body}</p>
              <div className="f7g-media">
                <img src={img} alt="" loading="lazy" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f7g-root {
  --f7g-ink: #0f0f10;
  --f7g-muted: #6b6b70;
  --f7g-line: #e9e8e4;
  --f7g-card-line: #ececea;
  /* the rails and rules both anchor the crosshairs, so nudging either
     value moves the whole frame and all four markers together */
  --f7g-rail-x: 13.8%;
  --f7g-rule-y: clamp(26px, 4.2vh, 62px);

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #faf9f7;
  color: var(--f7g-ink);
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  align-items: center;
  padding: clamp(46px, 7vh, 110px) clamp(16px, 3vw, 56px);
  box-sizing: border-box;
}

/* ── Blueprint frame ── */
.f7g-frame { position: absolute; inset: 0; pointer-events: none; }
.f7g-rule {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: var(--f7g-line);
}
.f7g-rule--top    { top: var(--f7g-rule-y); }
.f7g-rule--bottom { bottom: var(--f7g-rule-y); }
.f7g-rail {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--f7g-line);
}
.f7g-rail--left  { left: var(--f7g-rail-x); }
.f7g-rail--right { right: var(--f7g-rail-x); }

/* crosshair sitting on each rule/rail intersection */
.f7g-plus {
  position: absolute;
  width: 13px;
  height: 13px;
  transform: translate(-50%, -50%);
}
.f7g-plus::before,
.f7g-plus::after {
  content: "";
  position: absolute;
  background: #c9c8c3;
}
.f7g-plus::before { left: 0; right: 0; top: 50%; height: 1px; }
.f7g-plus::after  { top: 0; bottom: 0; left: 50%; width: 1px; }
.f7g-plus--tl { left: var(--f7g-rail-x);            top: var(--f7g-rule-y); }
.f7g-plus--tr { left: calc(100% - var(--f7g-rail-x)); top: var(--f7g-rule-y); }
.f7g-plus--bl { left: var(--f7g-rail-x);            top: calc(100% - var(--f7g-rule-y)); }
.f7g-plus--br { left: calc(100% - var(--f7g-rail-x)); top: calc(100% - var(--f7g-rule-y)); }

/* ── Content ── */
.f7g-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1190px;
  margin: 0 auto;
}

/* ── Header ── */
.f7g-head { text-align: center; }
.f7g-badge {
  display: inline-flex;
  align-items: center;
  gap: clamp(6px, .5vw, 10px);
  background: #fff;
  border: 1px solid #e8e7e3;
  border-radius: 999px;
  padding: clamp(5px, .4vw, 8px) clamp(6px, .45vw, 9px) clamp(5px, .4vw, 8px) clamp(10px, .8vw, 16px);
  font-size: clamp(11px, .75vw, 15px);
  font-weight: 500;
  color: var(--f7g-ink);
  box-shadow: 0 1px 2px rgba(15,15,16,.04);
}
.f7g-badge-icon { width: 1.15em; height: 1.15em; color: #4a4a50; }
.f7g-free {
  background: #e4f8ea;
  color: #16a34a;
  border-radius: 999px;
  padding: .25em .6em;
  font-size: .82em;
  font-weight: 600;
  letter-spacing: .02em;
}

.f7g-title {
  margin: clamp(16px, 2vh, 30px) 0 0;
  font-size: clamp(28px, 2.7vw, 56px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -.033em;
  color: var(--f7g-ink);
}
.f7g-sub {
  margin: clamp(10px, 1.3vh, 20px) auto 0;
  max-width: 46ch;
  font-size: clamp(13px, .95vw, 19px);
  line-height: 1.5;
  color: var(--f7g-muted);
}

/* ── Cards ── */
.f7g-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, 1.15vw, 23px);
  margin-top: clamp(30px, 4.5vh, 70px);
}
.f7g-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--f7g-card-line);
  border-radius: clamp(12px, .8vw, 17px);
  padding: clamp(18px, 1.6vw, 32px);
  transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
}
.f7g-card:hover {
  border-color: #dedcd7;
  box-shadow: 0 10px 30px -18px rgba(15,15,16,.22);
  transform: translateY(-2px);
}

.f7g-tile {
  display: grid;
  place-items: center;
  width: clamp(40px, 2.9vw, 58px);
  height: clamp(40px, 2.9vw, 58px);
  border-radius: clamp(9px, .6vw, 13px);
  background: #f3f2ef;
  color: var(--f7g-ink);
}
.f7g-tile svg { width: 52%; height: 52%; }

.f7g-card-title {
  margin: clamp(16px, 1.9vw, 38px) 0 0;
  font-size: clamp(14px, .95vw, 19px);
  font-weight: 700;
  letter-spacing: -.018em;
  color: var(--f7g-ink);
}
.f7g-card-body {
  margin: clamp(6px, .55vw, 11px) 0 0;
  font-size: clamp(12px, .78vw, 16px);
  line-height: 1.55;
  color: var(--f7g-muted);
}

/* artwork sits flush at the bottom of the card */
.f7g-media {
  margin-top: clamp(14px, 1.6vw, 32px);
  aspect-ratio: 1.19;
  overflow: hidden;
}
.f7g-media img {
  width: 100%;
  height: 100%;
  /* contain, not cover — these are UI mockups and must not be cropped */
  object-fit: contain;
  object-position: center top;
  display: block;
}

/* ── Entrance ── */
.f7g-badge { animation: f7gPop .7s cubic-bezier(.34,1.5,.6,1) .06s backwards; }
@keyframes f7gPop {
  from { opacity: 0; transform: translateY(-10px) scale(.94); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}
.f7g-title { animation: f7gFocus .95s cubic-bezier(.22,1,.36,1) .18s backwards; }
@keyframes f7gFocus {
  from { opacity: 0; transform: translateY(24px); filter: blur(9px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
.f7g-sub { animation: f7gRise .85s cubic-bezier(.22,1,.36,1) .32s backwards; }
.f7g-card {
  animation: f7gRise .9s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.48s + var(--i) * .11s);
}
@keyframes f7gRise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* the frame draws itself in behind everything */
.f7g-rule, .f7g-rail { animation: f7gFade 1.1s ease-out .05s backwards; }
.f7g-plus { animation: f7gFade .6s ease-out .9s backwards; }
@keyframes f7gFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .f7g-badge, .f7g-title, .f7g-sub, .f7g-card,
  .f7g-rule, .f7g-rail, .f7g-plus {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
  .f7g-plus { transform: translate(-50%, -50%); }
  .f7g-card { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .f7g-root { --f7g-rail-x: 4%; }
  .f7g-grid { grid-template-columns: 1fr; max-width: 460px; margin-inline: auto; }
}
`
