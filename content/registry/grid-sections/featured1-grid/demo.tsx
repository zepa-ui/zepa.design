"use client"

import React from "react"

/* ─────────────────────────────────────────────
   featured1-grid — dark three-up feature grid
   ─ eyebrow pill + headline with a Figma-style
     selection box around one outlined word
   ─ blueprint grid backdrop that fades downward
   ─ three ruled columns, each with a panelled
     screenshot card and a caption underneath
   ───────────────────────────────────────────── */

const CARDS = [
  {
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1785950189/f2_mwwyk1.webp",
    title: "AI protection",
    body: "Guaranteed controlled assurance for AI content, with your approval before anything goes live.",
  },
  {
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1785950190/f1_qddeaz.webp",
    title: "SOC 2 Type II",
    body: "We are committed to the highest standard of security and are SOC 2 certified.",
  },
  {
    img: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1785950189/f3_frf4n4.webp",
    title: "Risk-free fallbacks",
    body: "Built for scale with automatic fallbacks — so you can move fast with confidence.",
  },
]

export default function Featured1Grid() {
  return (
    <section className="fg1-root">
      <style>{CSS}</style>

      {/* blueprint grid, masked so it dissolves toward the cards */}
      <div className="fg1-blueprint" aria-hidden />

      {/* ── heading ── */}
      <header className="fg1-head">
        <span className="fg1-eyebrow">SECURITY</span>

        <h2 className="fg1-title">
          <span className="fg1-sel">
            <span className="fg1-outline">Scalable</span>
            <i className="fg1-h fg1-h--tl" />
            <i className="fg1-h fg1-h--tr" />
            <i className="fg1-h fg1-h--bl" />
            <i className="fg1-h fg1-h--br" />
          </span>{" "}
          and secure.
          <br />
          Enterprise grade.
        </h2>

        <p className="fg1-sub">
          Engineered for performance and reliability, handling your
          <br />
          most demanding needs with ease
        </p>
      </header>

      {/* ── ruled columns ── */}
      <div className="fg1-cols">
        {CARDS.map((c, i) => (
          <article className="fg1-col" key={c.title} style={{ "--i": i } as React.CSSProperties}>
            <div className="fg1-panel">
              {/* corner screws sit above the artwork */}
              <i className="fg1-screw fg1-screw--tl" />
              <i className="fg1-screw fg1-screw--tr" />
              <i className="fg1-screw fg1-screw--bl" />
              <i className="fg1-screw fg1-screw--br" />
              <img src={c.img} alt={c.title} loading="lazy" />
            </div>

            <h3 className="fg1-card-title">{c.title}</h3>
            <p className="fg1-card-body">{c.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.fg1-root {
  --line: rgba(255,255,255,.055);   /* column rules */
  --grid: rgba(255,255,255,.028);   /* blueprint squares — dimmer than the rules */
  --blue: #6f92f7;

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #0f111e;
  color: #fff;
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  /* centre the whole block vertically instead of letting it stack from
     the top, and keep the padding symmetric so it sits true */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(44px, 6vh, 96px) 0;
  box-sizing: border-box;
}

/* ── Blueprint backdrop ── */
.fg1-blueprint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right,  var(--grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
  background-size: clamp(90px, 9.25vw, 190px) clamp(90px, 9.25vw, 190px);
  /* dissolve before it reaches the cards so the ruled columns read clearly */
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 26%, transparent 46%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 26%, transparent 46%);
}

/* ── Heading ── */
.fg1-head {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 1.5rem;
}
.fg1-eyebrow {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(9px, .55vw, 12px);
  letter-spacing: .18em;
  color: #c3cbdd;
  background: rgba(255,255,255,.035);
  border: 1px solid rgba(255,255,255,.09);
  border-radius: 6px;
  padding: 5px 11px;
}
.fg1-title {
  margin: clamp(14px, 1.9vh, 28px) 0 0;
  font-size: clamp(26px, 2.3vw, 50px);
  font-weight: 600;
  line-height: 1.34;
  letter-spacing: -.015em;
  color: #fff;
}

/* Figma-style selection around the first word */
.fg1-sel {
  position: relative;
  display: inline-block;
  padding: .1em .34em .12em;
  outline: 1.4px solid var(--blue);
  outline-offset: 0;
}
.fg1-outline {
  /* hollow type — stroke only, no fill */
  color: transparent;
  -webkit-text-stroke: 1.1px #86a4f9;
}
.fg1-h {
  position: absolute;
  width: 7px; height: 7px;
  background: var(--blue);
  border-radius: 1px;
}
.fg1-h--tl { left: 0;    top: 0;    transform: translate(-50%,-50%); }
.fg1-h--tr { right: 0;   top: 0;    transform: translate( 50%,-50%); }
.fg1-h--bl { left: 0;    bottom: 0; transform: translate(-50%, 50%); }
.fg1-h--br { right: 0;   bottom: 0; transform: translate( 50%, 50%); }

.fg1-sub {
  margin: clamp(14px, 2vh, 30px) auto 0;
  font-size: clamp(13px, .9vw, 19px);
  line-height: 1.62;
  color: #93a0b8;
}
.fg1-sub br { display: none; }
@media (min-width: 900px) { .fg1-sub br { display: inline; } }

/* ── Ruled columns ── */
.fg1-cols {
  position: relative;
  z-index: 2;
  width: min(92%, 1660px);
  margin: clamp(40px, 6.5vh, 108px) auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--line);
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.fg1-col {
  border-left: 1px solid var(--line);
  /* balanced top/bottom so the cards sit centred between the rules */
  padding: clamp(32px, 5vh, 90px) clamp(16px, 2vw, 42px);
  text-align: center;
}

/* ── Panelled card ── */
.fg1-panel {
  position: relative;
  /* narrower than the column so it sits over the caption, not the rules */
  width: 100%;
  max-width: clamp(230px, 20vw, 420px);
  margin: 0 auto;
  aspect-ratio: 1.87;
  border-radius: clamp(9px, .72vw, 15px);
  overflow: hidden;
  background: rgba(255,255,255,.02);
  /* faint cool halo bleeding outward */
  box-shadow: 0 0 30px -8px rgba(125,158,255,.16);
  transition: transform .45s cubic-bezier(.22,1,.36,1),
              box-shadow .45s ease;
}
.fg1-panel img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* glowing hairline edge — a gradient ring rather than a flat border, so it
   catches light at the top and fades toward the bottom.
   The double mask keeps only the 1px padding ring visible. */
.fg1-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    170deg,
    rgba(255,255,255,.20) 0%,
    rgba(160,185,255,.10) 34%,
    rgba(255,255,255,.035) 68%,
    rgba(255,255,255,.02) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  transition: background .45s ease;
}
.fg1-col:hover .fg1-panel {
  transform: translateY(-4px);
  box-shadow:
    0 0 34px -6px rgba(125,158,255,.26),
    0 22px 48px -22px rgba(0,0,0,.75);
}
.fg1-col:hover .fg1-panel::after {
  background: linear-gradient(
    170deg,
    rgba(255,255,255,.34) 0%,
    rgba(160,185,255,.18) 34%,
    rgba(255,255,255,.06) 68%,
    rgba(255,255,255,.03) 100%);
}

/* corner screws — above the artwork */
.fg1-screw {
  position: absolute;
  z-index: 2;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,.22);
}
.fg1-screw--tl { left: 11px;  top: 11px; }
.fg1-screw--tr { right: 11px; top: 11px; }
.fg1-screw--bl { left: 11px;  bottom: 11px; }
.fg1-screw--br { right: 11px; bottom: 11px; }

/* ── Caption ── */
.fg1-card-title {
  margin: clamp(22px, 3.4vh, 56px) 0 0;
  font-size: clamp(17px, 1.3vw, 28px);
  font-weight: 500;
  letter-spacing: -.01em;
  color: #fff;
}
.fg1-card-body {
  /* tracks the panel width so the caption reads as one block with it */
  margin: clamp(9px, 1.3vh, 20px) auto 0;
  max-width: clamp(230px, 20vw, 420px);
  font-size: clamp(12px, .76vw, 16px);
  line-height: 1.72;
  color: #8b93a7;
}

/* ── Entrance ── */
.fg1-eyebrow { animation: fg1Rise .7s cubic-bezier(.22,1,.36,1) .05s backwards; }
.fg1-title   { animation: fg1Rise .85s cubic-bezier(.22,1,.36,1) .14s backwards; }
.fg1-sub     { animation: fg1Rise .8s cubic-bezier(.22,1,.36,1) .26s backwards; }
.fg1-col     { animation: fg1Rise .85s cubic-bezier(.22,1,.36,1) backwards;
               animation-delay: calc(.4s + var(--i) * .11s); }
@keyframes fg1Rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* the selection handles pop in after the word has settled */
.fg1-h { animation: fg1Pop .5s cubic-bezier(.34,1.56,.64,1) backwards; }
.fg1-h--tl { animation-delay: .62s; }
.fg1-h--tr { animation-delay: .68s; }
.fg1-h--bl { animation-delay: .74s; }
.fg1-h--br { animation-delay: .80s; }
@keyframes fg1Pop {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .fg1-eyebrow, .fg1-title, .fg1-sub, .fg1-col, .fg1-h {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .fg1-h--tl { transform: translate(-50%,-50%); }
  .fg1-h--tr { transform: translate( 50%,-50%); }
  .fg1-h--bl { transform: translate(-50%, 50%); }
  .fg1-h--br { transform: translate( 50%, 50%); }
  .fg1-panel { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .fg1-cols {
    grid-template-columns: 1fr;
    border-right: none;
    border-left: 1px solid var(--line);
  }
  .fg1-col {
    border-left: none;
    border-bottom: 1px solid var(--line);
    padding-bottom: clamp(32px, 5vh, 56px);
  }
  .fg1-col:last-child { border-bottom: none; }
}
`
