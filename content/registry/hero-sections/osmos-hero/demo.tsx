/*
 This zepa component is adapted from the Osmos design pattern.
 Pure CSS infinite card-wheel hero — zero JS animation, zero npm deps.
*/

"use client";

/* ─────────────────────────────────────────────
   osmos-hero — curved infinite card wheel hero
   Pure CSS animation — no rAF / setState / refs
   ───────────────────────────────────────────── */

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/03_sceom4.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/5_bgrt7d.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876068/2_jogaln.jpg",
];

const LABELS = [
  "WebGL Hero Sections",
  "Smooth Scroll Layouts",
  "3D Card Carousels",
  "Cursor Trail Effects",
  "Animated Typography",
  "Bento Grid Systems",
  "Navbar Components",
  "Motion Hover Effects",
  "Copy-Paste Registry",
];

/* 16 cards × 22.5° = perfect 360° wheel that loops seamlessly */
const N = 16;
const SPACING = 360 / N;

type Card = { label: string; img: string };
const CARDS: Card[] = Array.from({ length: N }, (_, i) => ({
  label: LABELS[i % LABELS.length],
  img: IMG[i % IMG.length],
}));

/* Wrapped in span so transform/animation works reliably on inline context */
const Asterisk = () => (
  <span className="os-ast" aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none">
      <g stroke="#6B5CFF" strokeWidth="16">
        <line x1="50" y1="5" x2="50" y2="95" transform="rotate(10 50 50)" />
        <line x1="50" y1="5" x2="50" y2="95" transform="rotate(70 50 50)" />
        <line x1="50" y1="5" x2="50" y2="95" transform="rotate(130 50 50)" />
      </g>
    </svg>
  </span>
);

export default function OsmosHero() {
  return (
    <div className="os-root">
      <style>{css}</style>
      <div className="os-vline" />

      {/* top bar */}
      <div className="os-topbar">
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
          alt="Zepa"
          className="os-logo"
        />
        <span className="os-tag">Open Source · MIT</span>
      </div>

      {/* hero */}
      <div className="os-hero">
        <h1>
          Copy <Asterisk /> Paste <Asterisk /> Ship
        </h1>
        <p className="os-sub">
          A growing library of <span className="pill">hero sections</span>,{" "}
          <span className="pill">WebGL</span> &amp; <span className="pill">navbars</span>,
          <br />
          <span className="pill">animations</span> and{" "}
          <span className="pill">motion</span> — built for modern web.
        </p>
      </div>

      {/* curved card wheel — spins forever via pure CSS */}
      <div className="os-wheel">
        <div className="os-spin">
          {CARDS.map((c, i) => (
            <div
              key={i}
              className="os-card"
              style={{
                transform: `rotate(${i * SPACING}deg) translateY(calc(var(--R) * -1))`,
              }}
            >
              <div className="os-card-inner">
                <img src={c.img} alt="" draggable={false} />
                <span>{c.label}</span>
              </div>
            </div>
          ))}
          {CARDS.map((_, i) => (
            <div
              key={`t${i}`}
              className="os-tick"
              style={{
                transform: `rotate(${i * SPACING + SPACING / 2}deg) translateY(calc(140px - var(--R)))`,
              }}
            />
          ))}
        </div>
      </div>

      {/* scroll-reveal about section */}
      <section className="os-about">
        <p>
          Zepa is an ever-growing open-source library of hero sections,
          WebGL effects, and motion components. Copy, paste, and ship
          production-ready UI in seconds — no config, no lock-in.
        </p>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Scoped styles — NO html/body overrides.
   All rules prefixed .os-* to avoid collisions.
   height:158vh allows scroll to the about section.
   overflow-x:hidden only — Y scroll is intentional.
   ───────────────────────────────────────────── */
const css = `
.os-root {
  position: relative;
  width: 100%;
  height: 158vh;
  overflow: hidden;
  background: #efeeec;
  font-family: var(--font-manrope), system-ui, Arial, sans-serif;
  color: rgb(32, 29, 29);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}

/* centre rule */
.os-vline {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(32, 29, 29, 0.07);
  pointer-events: none;
}

/* top bar */
.os-topbar {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 40px;
  z-index: 100;
  pointer-events: none;
}
/* white logo inverted for light bg */
.os-logo { height: 40px; width: auto; object-fit: contain; }
.os-tag {
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(32, 29, 29, 0.35);
}

/* hero */
.os-hero {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  padding-top: 17vh;
  text-align: center;
  pointer-events: none;
  select-none: none;
}
.os-hero h1 {
  margin: 0;
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1;
  font-size: clamp(52px, 8.6vw, 168px);
  white-space: nowrap;
  /* text reveals AFTER asterisks spin in — uses color not opacity
     so SVG stroke="#6B5CFF" stays visible during the delay */
  animation: os-title-in 600ms ease-out 1100ms both;
}
@keyframes os-title-in {
  from { color: transparent; transform: translateY(12px); }
  to   { color: #201d1d;     transform: translateY(0); }
}

/* Asterisk span — inline-block so transform works reliably */
.os-ast {
  display: inline-block;
  width: 0.6em;
  height: 0.6em;
  vertical-align: -2%;
  margin: 0 0.04em;
  animation: os-asterisk-in 800ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
/* second asterisk — 250ms stagger */
.os-ast:nth-child(2) {
  animation-delay: 250ms;
}
.os-ast svg {
  display: block;
  width: 100%;
  height: 100%;
}
@keyframes os-asterisk-in {
  from { opacity: 0; transform: rotate(-270deg) scale(0.2); }
  to   { opacity: 1; transform: rotate(0deg) scale(1); }
}

.os-sub {
  margin: 8vh auto 0;
  max-width: 780px;
  font-weight: 400;
  font-size: 26px;
  line-height: 31px;
  color: rgb(32, 29, 29);
  animation: os-fade-up 600ms ease-out 1800ms both;
}
@keyframes os-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pill {
  background: rgba(32, 29, 29, 0.08);
  border-radius: 8px;
  padding: 1px 10px;
  display: inline-block;
}

/* wheel container — wheel centre sits below the viewport;
   only the top arc of cards is visible (the visual trick) */
.os-wheel {
  position: absolute;
  left: 50%;
  --R: max(780px, 64vw);
  --cw: clamp(230px, 19vw, 330px);
  top: calc(62vh + var(--R));
  width: 0;
  height: 0;
}
.os-spin {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  animation: os-rotate 90s linear infinite;
  will-change: transform;
}
@keyframes os-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}

/* card */
.os-card {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--cw);
  margin-left: calc(var(--cw) / -2);
  transform-origin: 50% 0;
}
.os-card-inner {
  background: #131212;
  border-radius: 16px;
  padding: 10px 10px 0;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.16);
}
.os-card-inner img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}
.os-card-inner span {
  display: block;
  color: #efeeec;
  font-size: 13px;
  letter-spacing: 0.01em;
  padding: 9px 4px 11px;
}

/* tick marks between cards */
.os-tick {
  position: absolute;
  left: 0;
  top: 0;
  width: 44px;
  margin-left: -22px;
  transform-origin: 50% 0;
  border-top: 1px dashed rgba(32, 29, 29, 0.28);
}

/* about section — revealed on scroll */
.os-about {
  position: absolute;
  left: 50%;
  top: 118vh;
  transform: translateX(-50%);
  width: min(92vw, 1080px);
  text-align: center;
  z-index: 5;
}
.os-about p {
  margin: 0;
  font-weight: 500;
  font-size: clamp(30px, 3.3vw, 54px);
  line-height: 1.16;
  letter-spacing: -0.015em;
  color: #201d1d;
}

/* accessibility */
@media (prefers-reduced-motion: reduce) {
  .os-spin { animation: none; }
  .os-ast  { animation: none; opacity: 1; transform: none; }
  .os-hero h1 { animation: none; color: #201d1d; }
  .os-sub  { animation: none; opacity: 1; }
}

/* mobile */
@media (max-width: 700px) {
  .os-hero h1 { white-space: normal; font-size: clamp(38px, 9vw, 72px); }
  .os-sub { font-size: 15px; padding: 0 20px; }
  .os-topbar { padding: 20px 24px; }
}
`;
