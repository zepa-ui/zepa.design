"use client"

import React from "react"

/* ─────────────────────────────────────────────
   featured8-grid — 3-column dashboard grid
   Left and right columns are single tall cards
   with the copy above the artwork; the middle
   column stacks two cards that lead with theirs.
   ───────────────────────────────────────────── */

type Card = {
  title: string
  body: string
  img: string
  /* tall cards read copy-first, the stacked pair leads with artwork */
  media: "below" | "above"
  area: "left" | "midTop" | "midBottom" | "right"
}

const CARDS: Card[] = [
  {
    area: "left",
    media: "below",
    title: "Sales Overview",
    body: "Get a clear snapshot of your sales performance in one place",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286222/nw5_xc4kr7.avif",
  },
  {
    area: "midTop",
    media: "above",
    title: "Schedule payment",
    body: "Gain clear insights into your revenue with monthly",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286222/nw6_uw40dc.avif",
  },
  {
    area: "midBottom",
    media: "above",
    title: "Total revenue",
    body: "Gain clear insights into your revenue with monthly",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286222/nw7_pwnldx.avif",
  },
  {
    area: "right",
    media: "below",
    title: "Performance Summary",
    body: "It's provides a quick snapshot of your company's key financial metrics",
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1786286222/nw8_v6ae1d.avif",
  },
]

export default function Featured8Grid() {
  return (
    <section className="f8g-root">
      <style>{CSS}</style>

      {/* ── blueprint frame ── */}
      <div className="f8g-frame" aria-hidden>
        <span className="f8g-rail f8g-rail--left" />
        <span className="f8g-rail f8g-rail--right" />
        <span className="f8g-rule f8g-rule--top" />
        <span className="f8g-rule f8g-rule--bottom" />
        <span className="f8g-plus f8g-plus--tl" />
        <span className="f8g-plus f8g-plus--tr" />
        <span className="f8g-plus f8g-plus--bl" />
        <span className="f8g-plus f8g-plus--br" />
      </div>

      <div className="f8g-inner">
        <header className="f8g-head">
          <div className="f8g-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="f8g-badge-icon" aria-hidden>
              <circle cx="12" cy="12" r="3.1" />
              <path d="M12 2.6v2.8M12 18.6v2.8M2.6 12h2.8M18.6 12h2.8M5.4 5.4l2 2M16.6 16.6l2 2M18.6 5.4l-2 2M7.4 16.6l-2 2" strokeLinecap="round" />
            </svg>
            Sales AI Copilot
            <span className="f8g-pro">PRO</span>
          </div>

          <h2 className="f8g-title">
            Real-Time Insights for
            <br />
            Smarter Decisions
          </h2>
        </header>

        <div className="f8g-grid">
          {CARDS.map((c, i) => (
            <article
              key={c.title}
              className={`f8g-card f8g-card--${c.area}`}
              style={{ "--i": i } as React.CSSProperties}
            >
              {c.media === "above" && (
                <div className="f8g-media f8g-media--above">
                  <img src={c.img} alt="" loading="lazy" />
                </div>
              )}

              <div className="f8g-copy">
                <h3 className="f8g-card-title">{c.title}</h3>
                <p className="f8g-card-body">{c.body}</p>
              </div>

              {c.media === "below" && (
                <div className="f8g-media">
                  <img src={c.img} alt="" loading="lazy" />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f8g-root {
  --f8g-ink: #0f0f10;
  --f8g-muted: #5f6067;
  --f8g-line: #e9e8e4;
  --f8g-card-line: #ececea;
  /* rails and the bottom rule both anchor the crosshairs */
  --f8g-rail-x: 8.75%;
  --f8g-rule-y: clamp(28px, 4vh, 62px);

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #faf9f7;
  color: var(--f8g-ink);
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  align-items: center;
  padding: clamp(46px, 7vh, 108px) clamp(16px, 3vw, 56px);
  box-sizing: border-box;
}

/* ── Blueprint frame ── */
.f8g-frame { position: absolute; inset: 0; pointer-events: none; }
.f8g-rail {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--f8g-line);
}
.f8g-rail--left  { left: var(--f8g-rail-x); }
.f8g-rail--right { right: var(--f8g-rail-x); }
.f8g-rule {
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: var(--f8g-line);
}
.f8g-rule--top    { top: var(--f8g-rule-y); }
.f8g-rule--bottom { bottom: var(--f8g-rule-y); }

/* a crosshair on each of the four rail/rule intersections */
.f8g-plus {
  position: absolute;
  width: 13px; height: 13px;
  transform: translate(-50%, -50%);
}
.f8g-plus::before,
.f8g-plus::after { content: ""; position: absolute; background: #c9c8c3; }
.f8g-plus::before { left: 0; right: 0; top: 50%; height: 1px; }
.f8g-plus::after  { top: 0; bottom: 0; left: 50%; width: 1px; }
.f8g-plus--tl { left: var(--f8g-rail-x);              top: var(--f8g-rule-y); }
.f8g-plus--tr { left: calc(100% - var(--f8g-rail-x)); top: var(--f8g-rule-y); }
.f8g-plus--bl { left: var(--f8g-rail-x);              top: calc(100% - var(--f8g-rule-y)); }
.f8g-plus--br { left: calc(100% - var(--f8g-rail-x)); top: calc(100% - var(--f8g-rule-y)); }

/* ── Content ── */
.f8g-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1290px;
  margin: 0 auto;
}

/* ── Header ── */
.f8g-head { text-align: center; }
.f8g-badge {
  display: inline-flex;
  align-items: center;
  gap: clamp(6px, .5vw, 10px);
  background: #fff;
  border: 1px solid #e8e7e3;
  border-radius: 999px;
  padding: clamp(5px, .42vw, 9px) clamp(6px, .48vw, 10px) clamp(5px, .42vw, 9px) clamp(10px, .85vw, 17px);
  font-size: clamp(11px, .8vw, 16px);
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(15,15,16,.04);
}
.f8g-badge-icon { width: 1.15em; height: 1.15em; color: #4a4a50; }
.f8g-pro {
  background: #fdeceb;
  color: #ef4444;
  border-radius: 999px;
  padding: .25em .6em;
  font-size: .82em;
  font-weight: 600;
  letter-spacing: .02em;
}
.f8g-title {
  margin: clamp(16px, 2.2vh, 34px) 0 0;
  font-size: clamp(28px, 3.1vw, 64px);
  font-weight: 800;
  line-height: 1.07;
  letter-spacing: -.035em;
}

/* ── Grid ──
   left / middle / right; the outer two span both rows so their height
   is driven by the stacked pair in the centre */
.f8g-grid {
  display: grid;
  grid-template-columns: 0.88fr 1.13fr 1fr;
  grid-template-rows: auto auto;
  gap: clamp(12px, 1.3vw, 26px);
  margin-top: clamp(30px, 4.6vh, 74px);
}
.f8g-card--left      { grid-column: 1; grid-row: 1 / span 2; }
.f8g-card--midTop    { grid-column: 2; grid-row: 1; }
.f8g-card--midBottom { grid-column: 2; grid-row: 2; }
.f8g-card--right     { grid-column: 3; grid-row: 1 / span 2; }

/* ── Card ── */
.f8g-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid var(--f8g-card-line);
  border-radius: clamp(11px, .78vw, 16px);
  padding: clamp(16px, 1.7vw, 33px);
  overflow: hidden;
  transition: border-color .3s ease, box-shadow .3s ease, transform .3s cubic-bezier(.22,1,.36,1);
}
.f8g-card:hover {
  transform: translateY(-4px);
  border-color: #dcdad4;
  box-shadow: 0 18px 40px -22px rgba(15,15,16,.26);
}

.f8g-card-title {
  margin: 0;
  font-size: clamp(13px, .9vw, 18px);
  font-weight: 700;
  letter-spacing: -.018em;
}
.f8g-card-body {
  margin: clamp(5px, .55vw, 11px) 0 0;
  font-size: clamp(11px, .78vw, 15.5px);
  line-height: 1.5;
  color: var(--f8g-muted);
}

/* artwork — contain, never cover: these are UI mockups and cropping
   them would cut off numbers and labels */
.f8g-media { margin-top: clamp(12px, 1.5vw, 29px); overflow: hidden; }
.f8g-media--above { margin-top: 0; margin-bottom: clamp(12px, 1.5vw, 29px); }
.f8g-media img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  transition: transform .45s cubic-bezier(.22,1,.36,1);
}
.f8g-card:hover .f8g-media img { transform: scale(1.022); }

/* ── Entrance ── */
.f8g-rail, .f8g-rule { animation: f8gFade 1.1s ease-out .05s backwards; }
.f8g-plus { animation: f8gFade .6s ease-out .95s backwards; }
@keyframes f8gFade { from { opacity: 0; } to { opacity: 1; } }

.f8g-badge { animation: f8gPop .72s cubic-bezier(.34,1.5,.6,1) .08s backwards; }
@keyframes f8gPop {
  from { opacity: 0; transform: translateY(-11px) scale(.94); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}
.f8g-title { animation: f8gFocus 1s cubic-bezier(.22,1,.36,1) .2s backwards; }
@keyframes f8gFocus {
  from { opacity: 0; transform: translateY(26px); filter: blur(10px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* the two tall columns swing in from their own outer edge, the stacked
   pair rises — so the composition closes inward */
.f8g-card {
  animation-duration: .95s;
  animation-timing-function: cubic-bezier(.22,1,.36,1);
  animation-fill-mode: backwards;
  animation-delay: calc(.48s + var(--i) * .12s);
}
.f8g-card--left  { animation-name: f8gFromLeft; }
.f8g-card--right { animation-name: f8gFromRight; }
.f8g-card--midTop,
.f8g-card--midBottom { animation-name: f8gRise; }
@keyframes f8gFromLeft {
  from { opacity: 0; transform: translateX(-34px) translateY(14px); }
  to   { opacity: 1; transform: translateX(0)     translateY(0); }
}
@keyframes f8gFromRight {
  from { opacity: 0; transform: translateX(34px) translateY(14px); }
  to   { opacity: 1; transform: translateX(0)    translateY(0); }
}
@keyframes f8gRise {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .f8g-rail, .f8g-rule, .f8g-plus, .f8g-badge, .f8g-title, .f8g-card {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
  .f8g-plus { transform: translate(-50%, 50%); }
  .f8g-card, .f8g-media img { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 1000px) {
  .f8g-root { --f8g-rail-x: 3.5%; }
  .f8g-grid { grid-template-columns: 1fr; max-width: 520px; margin-inline: auto; }
  .f8g-card--left,
  .f8g-card--midTop,
  .f8g-card--midBottom,
  .f8g-card--right { grid-column: 1; grid-row: auto; }
}
`
