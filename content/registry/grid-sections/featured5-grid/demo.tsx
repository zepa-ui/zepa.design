"use client"

import React, { useId, useState } from "react"

/* ─────────────────────────────────────────────
   featured5-grid — six-column highlights grid
   Row 1: 4 + 2   ·   Row 2: 2 + 4

   ─ card 3 is a pure-SVG concentric arc mark
   ─ card 4 is a command palette whose rows select
     on hover, click, and arrow keys
   ───────────────────────────────────────────── */

const IMG = {
  keyboard: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1786122817/fg_gsuefb.webp",
  lightning: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1782376374/z1_iulawo.png",
}

/* the four arcs, shared by every layer of the mark */
const ARCS = [
  "M113.68 319.368c-.932-3.783 3.561-6.164 6.316-3.409l121.045 121.045c2.755 2.755.374 7.248-3.409 6.316-60.948-15.028-108.924-63.004-123.952-123.952z",
  "M109.104 267.645a3.947 3.947 0 001.157 3.041l176.053 176.053a3.947 3.947 0 003.041 1.157 169.91 169.91 0 0022.262-2.906c3.061-.608 4.124-4.362 1.917-6.569L118.579 243.466c-2.207-2.207-5.961-1.144-6.569 1.917a169.91 169.91 0 00-2.906 22.262z",
  "M123.521 209.3a3.94 3.94 0 00.828 4.397l218.954 218.955a3.942 3.942 0 004.397.827 168.862 168.862 0 0016.539-8.539c2.214-1.302 2.554-4.336.738-6.152L138.212 192.023c-1.816-1.816-4.85-1.476-6.152.738a169.081 169.081 0 00-8.539 16.539z",
  "M152.384 170.657c-1.48-1.48-1.572-3.855-.173-5.412C183.262 130.715 228.284 109 278.377 109 372.057 109 448 184.943 448 278.623c0 50.093-21.715 95.115-56.245 126.166-1.557 1.399-3.931 1.307-5.412-.173L152.384 170.657z",
]

function ArcMark() {
  /* namespaced so two instances on a page can't steal each other's defs */
  const uid = useId().replace(/:/g, "")
  const g = (n: string) => `${uid}-${n}`

  return (
    <svg viewBox="0 0 557 557" width="557" height="557" fill="none" aria-hidden>
      <defs>
        <linearGradient id={g("a")} x1="278.5" x2="278.5" y1="109" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6663F6" />
          <stop offset="1" stopColor="#6663F6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("b")} x1="278.5" x2="278.5" y1="109" y2="299" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6663F6" />
          <stop offset="1" stopColor="#6663F6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("c")} x1="278.5" x2="278.5" y1="109" y2="350.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7877C6" />
          <stop offset="1" stopColor="#7877C6" stopOpacity="0" />
        </linearGradient>
        <radialGradient
          id={g("d")}
          cx="0" cy="0" r="1"
          gradientTransform="rotate(90 67.03 211.47) scale(233.062)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={g("blur")} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="50" />
        </filter>
      </defs>

      {/* thick, heavily blurred glow underneath */}
      <g strokeWidth={18} filter={`url(#${g("blur")})`} opacity={0.4}>
        {ARCS.map((d, i) => <path key={i} d={d} stroke={`url(#${g("a")})`} />)}
      </g>

      {/* hairline pass */}
      <g strokeWidth={2} strokeOpacity={0.2} opacity={0.4}>
        {ARCS.map((d, i) => <path key={i} d={d} stroke={`url(#${g("b")})`} />)}
      </g>

      {/* mid-weight body */}
      {ARCS.map((d, i) => (
        <path key={i} d={d} stroke={`url(#${g("c")})`} strokeOpacity={0.2} strokeWidth={8} />
      ))}

      {/* white highlight riding on top */}
      {ARCS.map((d, i) => <path key={i} d={d} stroke={`url(#${g("d")})`} />)}
    </svg>
  )
}

/* ── 16px icons for the command palette ── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <circle cx="8" cy="5" r="3" />
    <path d="M2.5 14a5.5 5.5 0 0111 0z" />
  </svg>
)
const IconStatus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden>
    <circle cx="8" cy="8" r="6.2" strokeWidth="1.6" strokeDasharray="2.6 2.2" />
    <circle cx="8" cy="8" r="2.4" fill="currentColor" stroke="none" />
  </svg>
)
const IconPriority = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
    <rect x="1" y="8" width="3" height="6" rx="1" />
    <rect x="6.5" y="5" width="3" height="9" rx="1" />
    <rect x="12" y="2" width="3" height="12" rx="1" opacity="0.4" />
  </svg>
)
const IconLabel = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M2 7V2.8c0-.44.36-.8.8-.8H7l7 7-5.2 5.2L2 7z" strokeLinejoin="round" />
    <circle cx="5" cy="5" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const COMMANDS = [
  { label: "Copy component…", Icon: IconUser },
  { label: "Change category...", Icon: IconStatus },
  { label: "Filter by tag...", Icon: IconPriority },
  { label: "Add to project...", Icon: IconLabel },
]

/* a real palette: rows highlight on hover, click, or keyboard focus,
   and arrow keys walk the list the way a command menu should */
function CommandMenu() {
  const [active, setActive] = useState(0)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (i + 1) % COMMANDS.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (i - 1 + COMMANDS.length) % COMMANDS.length)
    }
  }

  return (
    <div className="f5g-menu">
      <div className="f5g-menu-inner">
        <div className="f5g-menu-label">ZEP-111 Hero sections</div>
        <div className="f5g-menu-input">Type a command or search...</div>
        <div
          className="f5g-menu-list"
          role="listbox"
          aria-label="Commands"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {COMMANDS.map(({ label, Icon }, i) => (
            <div
              key={label}
              role="option"
              aria-selected={i === active}
              className={`f5g-menu-option${i === active ? " f5g-menu-option--active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
              <span className="f5g-menu-icon"><Icon /></span>
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Featured5Grid() {
  return (
    <section className="f5g-root">
      <style>{CSS}</style>

      <div className="f5g-container">
        <header className="f5g-header">
          <h2 className="f5g-heading">
            Unlike any library
            <br />
            you&rsquo;ve used before
          </h2>
          <p className="f5g-sub">
            Designed to the last pixel and engineered with unforgiving precision,
            Zepa combines UI elegance with world-class performance.
          </p>
        </header>

        <div className="f5g-wrap">
          {/* ── 1 · keyboard (span 4) ── */}
          <article className="f5g-card f5g-card--4">
            <img className="f5g-keyboard" src={IMG.keyboard} alt="" loading="lazy" />
            <div className="f5g-content">
              <h3 className="f5g-card-heading">Built for your editor</h3>
              <div>
                Paste any section straight into your project with zero config.
                Every component. Literally every one.
              </div>
            </div>
          </article>

          {/* ── 2 · lightning (span 2) ── */}
          <article className="f5g-card f5g-card--2">
            <img className="f5g-lightning" src={IMG.lightning} alt="" loading="lazy" />
            <div className="f5g-content">
              <h3 className="f5g-card-heading">Breathtakingly fast</h3>
              <div>Plain React and CSS — no runtime, no bundle bloat.</div>
            </div>
          </article>

          {/* ── 3 · arc mark (span 2) ── */}
          <article className="f5g-card f5g-card--2">
            <div className="f5g-logo"><ArcMark /></div>
            <div className="f5g-content">
              <h3 className="f5g-card-heading">Designed for modern product teams</h3>
              <div>Every section ships responsive, accessible, and ready to theme.</div>
            </div>
          </article>

          {/* ── 4 · command line (span 4) ── */}
          <article className="f5g-card f5g-card--4 f5g-card--command">
            <div className="f5g-content f5g-content--command">
              <h3 className="f5g-card-heading">Meet your command line</h3>
              <div>
                Find and install any section in seconds, without lifting your
                hands off the keyboard.
              </div>
            </div>
            <CommandMenu />
          </article>
        </div>
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f5g-root {
  --f5g-secondary: #b4bcd0;

  position: relative;
  z-index: 10;
  background: #000212;
  color: #fff;
  font-family: var(--font-manrope, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  padding: 96px 0;
  overflow: hidden;
}
.f5g-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  box-sizing: border-box;
}

/* ── Header ── */
.f5g-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}
.f5g-heading {
  margin: 0 0 28px;
  font-size: 54px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -.04em;
  color: #fff;
}
.f5g-sub {
  margin: 0 0 48px;
  font-size: 21px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -.025em;
  color: var(--f5g-secondary);
}

/* ── Grid: 6 columns, rows of 4+2 then 2+4 ── */
.f5g-wrap {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: auto;
  gap: 24px;
}
.f5g-card--4 { grid-column: span 4; }
.f5g-card--2 { grid-column: span 2; }

/* ── Card ── */
.f5g-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 480px;
  padding: 56px;
  box-sizing: border-box;
  border: 1px solid #ffffff1a;
  border-radius: 48px;
  background-image: linear-gradient(#fff0, #ffffff0d);
  overflow: hidden;
}
.f5g-card--command { justify-content: flex-start; }

.f5g-content {
  max-width: 420px;
  color: var(--f5g-secondary);
  text-align: center;
  line-height: 1.3;
}
.f5g-content--command { transition: opacity .12s; }
.f5g-card-heading {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -.02em;
  color: #fff;
}

/* ── Art ── */
/* max-height keeps the whole keyboard inside the 480px card — without it
   the image overflows and the card's overflow:hidden clips its top.
   margin-top:auto drops it to sit right above the heading. */
.f5g-keyboard {
  width: 100%;
  height: auto;
  max-height: 258px;
  margin-top: auto;
  margin-bottom: 14px;
  display: block;
  object-fit: contain;
}
/* absolutely positioned, so the card's align-items:center
   still resolves its static horizontal position */
.f5g-lightning {
  position: absolute;
  top: 52px;
  width: 78%;
  height: auto;
  display: block;
  object-fit: contain;
  pointer-events: none;
}

/* ── Arc mark ── */
.f5g-logo {
  position: absolute;
  top: -80px;
  width: 130%;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.f5g-logo svg { width: 100%; height: auto; }

/* ── Command palette ── */
/* sits in normal flow under the copy — the source slid the whole panel
   up on hover, which moved the rows out from under the cursor */
.f5g-menu {
  width: 100%;
  margin-top: 28px;
  display: flex;
  justify-content: center;
}
.f5g-menu-inner {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  min-height: 278px;
  border: 1px solid #ffffff1a;
  border-radius: 8px;
  background-color: #ffffff1a;
  box-shadow: 0 7px 32px #00000059;
  overflow: hidden;
}
.f5g-menu-label {
  align-self: flex-start;
  margin: 8px 0 0 16px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #ffffff0d;
  color: #ffffff80;
  font-size: 12px;
}
.f5g-menu-input {
  display: flex;
  align-items: center;
  height: 62px;
  padding: 0 22px;
  color: #81808e;
  font-size: 18px;
}
.f5g-menu-list {
  box-shadow: 0 -1px #ffffff1a;
  outline: none;
}
.f5g-menu-list:focus-visible { box-shadow: 0 -1px #ffffff1a, inset 0 0 0 1px #ffffff40; }

/* only the row under the cursor / selection highlights */
.f5g-menu-option {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  padding: 0 20px;
  font-size: 14px;
  color: #ffffffb3;
  cursor: pointer;
  transition: background-color .14s ease, color .14s ease;
}
.f5g-menu-option--active {
  background-color: #ffffff26;
  color: #fff;
}
.f5g-menu-option--active .f5g-menu-icon { color: #fff; }
.f5g-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffffb3;
}

/* ══════════════════════════════════════════
   Entrance — cards land, then each card's own
   contents settle into it
   ══════════════════════════════════════════ */

.f5g-heading { animation: f5gFocus .9s cubic-bezier(.22,1,.36,1) .05s backwards; }
@keyframes f5gFocus {
  from { opacity: 0; transform: translateY(22px); letter-spacing: .01em; filter: blur(8px); }
  to   { opacity: 1; transform: translateY(0);    letter-spacing: -.04em; filter: blur(0); }
}
.f5g-sub { animation: f5gRise .85s cubic-bezier(.22,1,.36,1) .2s backwards; }
@keyframes f5gRise {
  from { opacity: 0; transform: translateY(16px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* the frame arrives first, still empty */
.f5g-card {
  animation: f5gCard .95s cubic-bezier(.22,1,.36,1) backwards;
}
.f5g-wrap > .f5g-card:nth-child(1) { animation-delay: .32s; }
.f5g-wrap > .f5g-card:nth-child(2) { animation-delay: .42s; }
.f5g-wrap > .f5g-card:nth-child(3) { animation-delay: .52s; }
.f5g-wrap > .f5g-card:nth-child(4) { animation-delay: .62s; }
@keyframes f5gCard {
  from {
    opacity: 0;
    transform: translateY(30px) scale(.985);
    border-color: #ffffff00;
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    border-color: #ffffff1a;
  }
}

/* the keyboard is set down onto the card */
.f5g-keyboard { animation: f5gDrop .95s cubic-bezier(.22,1,.36,1) .58s backwards; }
@keyframes f5gDrop {
  from { opacity: 0; transform: translateY(44px) scale(.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* the mark blooms rather than slides */
.f5g-lightning { animation: f5gBloom 1.1s cubic-bezier(.22,1,.36,1) .68s backwards; }
.f5g-logo      { animation: f5gBloom 1.3s cubic-bezier(.22,1,.36,1) .78s backwards; }
@keyframes f5gBloom {
  from { opacity: 0; transform: scale(.82); filter: blur(6px); }
  to   { opacity: 1; transform: scale(1);   filter: blur(0); }
}

/* card copy settles once its frame exists */
.f5g-content { animation: f5gRise .7s cubic-bezier(.22,1,.36,1) backwards; }
.f5g-wrap > .f5g-card:nth-child(1) .f5g-content { animation-delay: .70s; }
.f5g-wrap > .f5g-card:nth-child(2) .f5g-content { animation-delay: .80s; }
.f5g-wrap > .f5g-card:nth-child(3) .f5g-content { animation-delay: .90s; }
.f5g-wrap > .f5g-card:nth-child(4) .f5g-content { animation-delay: .84s; }

/* the palette fills in the way a real command menu populates:
   chrome first, then the results cascade one row at a time */
.f5g-menu-inner { animation: f5gRise .7s cubic-bezier(.22,1,.36,1) .96s backwards; }
.f5g-menu-option { animation: f5gRow .5s cubic-bezier(.22,1,.36,1) backwards; }
.f5g-menu-option:nth-child(1) { animation-delay: 1.20s; }
.f5g-menu-option:nth-child(2) { animation-delay: 1.27s; }
.f5g-menu-option:nth-child(3) { animation-delay: 1.34s; }
.f5g-menu-option:nth-child(4) { animation-delay: 1.41s; }
@keyframes f5gRow {
  from { opacity: 0; transform: translateY(9px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .f5g-heading, .f5g-sub, .f5g-card, .f5g-keyboard, .f5g-lightning,
  .f5g-logo, .f5g-content, .f5g-menu-inner, .f5g-menu-option {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
  .f5g-heading { letter-spacing: -.04em; }
  .f5g-card { border-color: #ffffff1a; }
  .f5g-keyboard { margin-top: auto; }
}

/* ── Responsive — matches the source breakpoints ── */
@media (max-width: 991px) {
  .f5g-heading { font-size: 50px; }
  .f5g-wrap {
    display: flex;
    gap: 12px;
    margin: 0 -32px;
    padding: 0 32px;
    overflow: auto;
  }
  .f5g-card {
    min-width: 100%;
    height: auto;
    min-height: 420px;
    padding: 32px;
  }
}
@media (max-width: 767px) {
  .f5g-heading { margin-bottom: 18px; font-size: 36px; }
  .f5g-sub { font-size: 18px; }
}
`
