"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   featured10-grid — engineering-blueprint layout
   ─ grid-paper backdrop with bordered cells laid
     over it, like a technical drawing
   ─ dotted sphere and a rotating gear train,
     both drawn rather than imaged
   ─ testimonial carousel under the visuals
   ───────────────────────────────────────────── */

const WORDS = ["RELIABLE", "CREATIVE", "VERSATILE"]

/* one entry per step square — the indicator and the copy are the same
   piece of state, so they can never fall out of sync */
const SLIDES = [
  {
    a: "front end",
    b: "development",
    body: "The interactive layer of your product — striking visual experiences translated into code, without compromising performance or usability.",
  },
  {
    a: "motion &",
    b: "interaction",
    body: "Entrances, hovers and transitions tuned by hand. Every curve earns its place, and every one of them respects reduced-motion.",
  },
  {
    a: "design",
    b: "systems",
    body: "Tokens, spacing and type that hold together across a hundred screens — so the tenth section still looks like the first.",
  },
  {
    a: "component",
    b: "architecture",
    body: "Sections that drop in with one paste. No config, no provider wrapping, no dependency you did not ask for.",
  },
  {
    a: "performance",
    b: "engineering",
    body: "Plain React and CSS, no runtime. Animations run on transforms, and nothing re-renders on pointer move.",
  },
  {
    a: "accessible",
    b: "interfaces",
    body: "Real semantics, visible focus, keyboard paths that work. Shipped in the component, not left as an exercise.",
  },
]

const ROTATE_MS = 5000

const QUOTES = [
  {
    body: "Zepa thinks along proactively, is very open to feedback, comes up with new ideas, and communicates them clearly. Because the team takes a genuine interest in our product strategy, they ship sections that truly fit our business. In short: a great …",
    name: "Maurits Willenbroek",
    role: "CEO · Macada Innovision",
  },
  {
    body: "Very happy with Zepa's support. Professional, fast, and it also makes you think about aspects you hadn't considered yet. The final result is ten times better than a template-based website.",
    name: "Simon van Koppen",
    role: "Co-founder · Arithma",
  },
  {
    body: "We dropped three sections in on a Friday and shipped Monday. No config, no dependency sprawl, and the motion held up under review. It reads like something we built ourselves.",
    name: "Priya Raghunathan",
    role: "Head of Design · Northbeam",
  },
  {
    body: "The details are what sold us — reduced-motion handling, sane focus states, and markup we didn't have to rewrite. That is rare in a component library.",
    name: "Tomás Ferreira",
    role: "Principal Engineer · Halcyon",
  },
]

/* doubled so translateX(-50%) lands exactly one full set along and the
   loop is seamless */
const QUOTE_LOOP = [...QUOTES, ...QUOTES]

/* a gear outline: alternating outer/inner radius around the circle */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth: number) {
  const pts: string[] = []
  const step = Math.PI / teeth
  for (let i = 0; i < teeth * 2; i++) {
    const rad = i % 2 === 0 ? r : r - depth
    const a = i * step
    pts.push(`${(cx + Math.cos(a) * rad).toFixed(2)} ${(cy + Math.sin(a) * rad).toFixed(2)}`)
  }
  return `M${pts.join("L")}Z`
}

const GEARS = [
  { cx: 132, cy: 118, r: 74, teeth: 34, depth: 8, dur: "38s", dir: "normal" },
  { cx: 196, cy: 176, r: 52, teeth: 24, depth: 7, dur: "26s", dir: "reverse" },
  { cx: 96, cy: 190, r: 34, teeth: 16, depth: 6, dur: "18s", dir: "reverse" },
  { cx: 172, cy: 92, r: 22, teeth: 11, depth: 5, dur: "13s", dir: "normal" },
]

export default function Featured10Grid() {
  /* the arrows flip the marquee's direction rather than stepping it —
     stepping would fight the CSS animation driving the track */
  const [dir, setDir] = useState<"normal" | "reverse">("normal")

  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  /* the very first render still needs the staggered entrance delay;
     every change after that should swap instantly */
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length)
      setTouched(true)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [paused])

  const pick = (i: number) => {
    setSlide(i)
    setTouched(true)
  }

  const s = SLIDES[slide]
  const sd = touched ? "0s" : ".82s"

  return (
    <section className="fa-root">
      <style>{CSS}</style>

      {/* graph-paper backdrop */}
      <div className="fa-paper" aria-hidden />

      {/* ── top bar ── */}
      <div className="fa-top">
        <div className="fa-top-l">
          <Link href="/" className="fa-cell fa-logo">
            <span className="fa-logo-a">ZEPA</span>
            <span className="fa-logo-b">UI</span>
          </Link>
          <span className="fa-cell fa-cell--sq">M</span>
        </div>

        <div className="fa-top-r">
          <span className="fa-cell fa-cell--sq" aria-label="Language">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <path d="M3 6h9M7.5 4v2M10 6c0 4-3 7-6.5 8M6 10.5c1 2 2.8 3.6 5 4.4" strokeLinecap="round" />
              <path d="M12.5 20l4-10 4 10M14 17h5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="fa-cell fa-cell--sq">AM</span>
        </div>
      </div>

      {/* ── intro ── */}
      <div className="fa-intro">
        <div className="fa-intro-copy">
          <p className="fa-kicker">
            Code, performance, and design working together. Without compromise.
          </p>
          <div className="fa-words">
            {WORDS.map((w, i) => (
              <span key={w} className="fa-word" style={{ "--i": i } as React.CSSProperties}>
                {w}
              </span>
            ))}
          </div>
        </div>
        <Link href="/docs" className="fa-cell fa-touch">Get in touch</Link>
      </div>

      {/* ── main plate ── */}
      <div className="fa-main">
        {/* left: copy */}
        <div
          className="fa-copy"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="fa-steps" role="tablist" aria-label="Disciplines">
            {SLIDES.map((item, n) => (
              <button
                key={item.b}
                type="button"
                role="tab"
                aria-selected={n === slide}
                aria-label={`${item.a} ${item.b}`}
                className={`fa-step${n === slide ? " fa-step--on" : ""}`}
                onClick={() => pick(n)}
              >
                {/* fills while this slide is showing, so the square doubles
                    as the auto-advance progress bar */}
                <span
                  className="fa-step-fill"
                  style={{
                    animationDuration: `${ROTATE_MS}ms`,
                    animationPlayState: n === slide && !paused ? "running" : "paused",
                  }}
                />
              </button>
            ))}
          </div>

          {/* keyed so the type replays its animation on every change */}
          <div className="fa-slide" key={slide} style={{ "--sd": sd } as React.CSSProperties}>
            <h2 className="fa-title">
              <span className="fa-title-a">{s.a}</span>
              <span className="fa-title-b">{s.b}</span>
            </h2>
            <p className="fa-body">{s.body}</p>
          </div>
        </div>

        {/* middle: dotted sphere */}
        <div className="fa-plate fa-plate--sphere">
          <div className="fa-sphere" aria-hidden />
        </div>

        {/* right: gear train */}
        <div className="fa-plate fa-plate--gears">
          <svg viewBox="0 0 264 264" className="fa-gears" aria-hidden>
            <circle cx="132" cy="132" r="128" fill="none" stroke="#dcdfe5" strokeWidth="1" />
            {GEARS.map((g, i) => (
              <g
                key={i}
                style={{
                  transformOrigin: `${g.cx}px ${g.cy}px`,
                  animationDuration: g.dur,
                  animationDirection: g.dir as React.CSSProperties["animationDirection"],
                }}
                className="fa-gear"
              >
                <path d={gearPath(g.cx, g.cy, g.r, g.teeth, g.depth)} fill="none" stroke="#c3c8d1" strokeWidth="1" />
                <circle cx={g.cx} cy={g.cy} r={g.r * 0.28} fill="none" stroke="#d3d7de" strokeWidth="1" />
              </g>
            ))}
          </svg>
          <code className="fa-debug">
            transform: translate3d(53px, 198px, 0) rotate(-1862deg)
          </code>
        </div>

        {/* quotes */}
        <div className="fa-quotes">
          <div className="fa-arrows">
            <button
              className={`fa-arrow${dir === "reverse" ? " fa-arrow--on" : ""}`}
              onClick={() => setDir("reverse")}
              aria-label="Scroll testimonials right"
            >
              ‹
            </button>
            <button
              className={`fa-arrow${dir === "normal" ? " fa-arrow--on" : ""}`}
              onClick={() => setDir("normal")}
              aria-label="Scroll testimonials left"
            >
              ›
            </button>
          </div>

          <div className="fa-qview">
            <div className="fa-qtrack" style={{ animationDirection: dir }}>
              {QUOTE_LOOP.map((q, i) => (
                <figure className="fa-quote" key={i}>
                  <blockquote>{q.body}</blockquote>
                  <figcaption>
                    <span className="fa-quote-name">{q.name}</span>
                    <span className="fa-quote-role">{q.role}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <code className="fa-debug fa-debug--q">translateX: -2484px</code>
          </div>
        </div>
      </div>

      {/* ── ruler ── */}
      <div className="fa-ruler" aria-hidden>
        <span className="fa-ruler-cursor" />
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.fa-root {
  --fa-line: #e3e6ec;
  --fa-ink: #1b1b1d;
  --fa-muted: #8b8d93;
  --fa-teal: #4bc8bd;
  --fa-cell: clamp(48px, 5.1vw, 104px);

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #fbfbfc;
  color: var(--fa-ink);
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* graph paper — two axes of hairlines, kept very faint so the
   structural borders on top of it still read as the real layout */
.fa-paper {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(to right,  rgba(120,155,215,.11) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(120,155,215,.11) 1px, transparent 1px);
  background-size: clamp(38px, 4.3vw, 88px) clamp(38px, 4.3vw, 88px);
}

/* ── Shared cell ── */
.fa-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--fa-line);
  background: rgba(255,255,255,.55);
  color: var(--fa-ink);
  text-decoration: none;
  font-size: clamp(11px, .78vw, 16px);
  letter-spacing: .04em;
}
.fa-cell--sq { width: var(--fa-cell); }

/* ── Top bar ── */
.fa-top {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  height: var(--fa-cell);
  margin: clamp(10px, 1.2vw, 24px) clamp(10px, 1.6vw, 33px) 0;
  flex-shrink: 0;
}
.fa-top-l, .fa-top-r { display: flex; }
.fa-top-l .fa-cell + .fa-cell,
.fa-top-r .fa-cell + .fa-cell { border-left: 0; }

.fa-logo {
  padding: 0 clamp(14px, 1.6vw, 34px);
  gap: .12em;
  font-size: clamp(13px, .95vw, 20px);
  font-weight: 500;
  letter-spacing: .12em;
}
.fa-logo-a { color: var(--fa-teal); }
.fa-logo-b { color: var(--fa-ink); }
.fa-cell--sq svg { width: 1.35em; height: 1.35em; color: #5c5f66; }

/* ── Intro ── */
.fa-intro {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin: clamp(24px, 4vw, 82px) clamp(10px, 1.6vw, 33px) 0;
  flex-shrink: 0;
}
.fa-kicker {
  margin: 0 0 clamp(6px, .7vw, 14px);
  font-size: clamp(10px, .74vw, 16px);
  color: var(--fa-muted);
}
.fa-words {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 1.5vw, 31px);
}
.fa-word {
  font-size: clamp(19px, 2.3vw, 48px);
  font-weight: 200;
  letter-spacing: .03em;
  color: #3a3c41;
}
.fa-touch {
  width: clamp(120px, 9.5vw, 196px);
  height: clamp(52px, 4.8vw, 98px);
  flex-shrink: 0;
  font-size: clamp(11px, .84vw, 18px);
  letter-spacing: 0;
  transition: background .2s ease, color .2s ease;
}
.fa-touch:hover { background: var(--fa-ink); color: #fff; }

/* ── Main plate ──
   one bordered rectangle split into cells; each child paints only its
   own left/top edge so interior rules never double up */
.fa-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.18fr 1fr 1.17fr;
  grid-template-rows: auto auto;
  margin: clamp(14px, 1.4vw, 28px) clamp(10px, 1.6vw, 33px) 0;
  border: 1px solid var(--fa-line);
  flex-shrink: 0;
}
.fa-copy   { grid-column: 1; grid-row: 1 / span 2; padding: clamp(18px, 2.4vw, 50px); }
.fa-plate--sphere { grid-column: 2; grid-row: 1; }
.fa-plate--gears  { grid-column: 3; grid-row: 1; }
.fa-quotes { grid-column: 2 / span 2; grid-row: 2; }

.fa-plate {
  position: relative;
  display: grid;
  place-items: center;
  border-left: 1px solid var(--fa-line);
  min-height: clamp(200px, 22vw, 452px);
  padding: clamp(12px, 1.6vw, 34px);
}

/* ── Left copy ── */
.fa-steps { display: flex; gap: clamp(3px, .38vw, 8px); }
.fa-step {
  position: relative;
  width: clamp(11px, 1.3vw, 27px);
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: #c4c7cc;
  overflow: hidden;
  transition: background .25s ease, transform .25s cubic-bezier(.34,1.5,.6,1);
}
.fa-step:hover { background: #9a9da3; transform: translateY(-2px); }
.fa-step--on { background: #d5d7db; }
.fa-step--on:hover { transform: none; }

/* sweeps left→right over the life of the slide, so the indicator is
   also the countdown to the next one */
.fa-step-fill {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  transform: scaleX(0);
  background: #0d0d0f;
}
.fa-step--on .fa-step-fill {
  animation-name: faStepFill;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes faStepFill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

.fa-title { margin: clamp(16px, 2.1vw, 44px) 0 0; }
.fa-title-a,
.fa-title-b {
  display: block;
  font-size: clamp(26px, 3.1vw, 64px);
  font-weight: 300;
  line-height: 1.12;
  letter-spacing: -.012em;
}
.fa-title-a { color: var(--fa-ink); }
/* the highlight block is inline-block so it hugs the word, not the column */
.fa-title-b {
  display: inline-block;
  margin-top: clamp(6px, .8vw, 16px);
  padding: clamp(4px, .5vw, 11px) clamp(8px, .9vw, 19px);
  background: #0d0d0f;
  color: #fff;
}
.fa-body {
  margin: clamp(16px, 2vw, 42px) 0 0;
  max-width: 34ch;
  font-size: clamp(11px, .85vw, 18px);
  line-height: 1.75;
  color: #4a4c52;
}

/* ── Sphere ──
   a dot field clipped to a circle, then masked so the dots thin out
   toward the middle — that density gradient is what reads as a globe */
.fa-sphere {
  width: min(100%, clamp(150px, 16.5vw, 340px));
  aspect-ratio: 1;
  border-radius: 50%;
  background-image: radial-gradient(circle, #c2a892 .85px, transparent .95px);
  background-size: 4px 4px;
  -webkit-mask-image: radial-gradient(circle, transparent 26%, #000 58%, #000 93%, transparent 100%);
          mask-image: radial-gradient(circle, transparent 26%, #000 58%, #000 93%, transparent 100%);
  animation: faSpin 44s linear infinite;
}
@keyframes faSpin { to { transform: rotate(360deg); } }

/* ── Gears ── */
.fa-gears { width: min(100%, clamp(160px, 17.5vw, 360px)); height: auto; }
.fa-gear {
  animation-name: faSpin;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.fa-debug {
  position: absolute;
  right: clamp(8px, .8vw, 17px);
  bottom: clamp(6px, .55vw, 12px);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(7px, .52vw, 11px);
  color: #a9acb3;
  white-space: nowrap;
}

/* ── Quotes ── */
.fa-quotes {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  border-top: 1px solid var(--fa-line);
  border-left: 1px solid var(--fa-line);
}
.fa-arrows {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--fa-line);
}
.fa-arrow {
  flex: 1;
  width: clamp(38px, 3.4vw, 70px);
  border: 0;
  background: none;
  cursor: pointer;
  font-family: inherit;
  font-size: clamp(14px, 1.1vw, 23px);
  color: #6d7076;
  transition: background .18s ease, color .18s ease;
}
.fa-arrow + .fa-arrow { border-top: 1px solid var(--fa-line); }
.fa-arrow:hover { background: #f2f3f5; color: var(--fa-ink); }
.fa-arrow--on { color: var(--fa-ink); background: #f2f3f5; }

/* ── Testimonial marquee ── */
.fa-qview {
  position: relative;
  overflow: hidden;
  /* the strip runs under the borders, so fade both ends rather than
     letting cards pop in and out at a hard edge */
  -webkit-mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
}
.fa-qtrack {
  display: flex;
  width: max-content;
  animation: faMarquee 52s linear infinite;
}
/* stop it while someone is actually reading */
.fa-qview:hover .fa-qtrack { animation-play-state: paused; }
@keyframes faMarquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.fa-quote {
  flex: 0 0 auto;
  width: clamp(230px, 25vw, 520px);
  margin: 0;
  padding: clamp(14px, 1.5vw, 32px);
  border-right: 1px solid var(--fa-line);
  box-sizing: border-box;
}
.fa-quote blockquote {
  margin: 0;
  font-size: clamp(10px, .8vw, 17px);
  font-style: italic;
  line-height: 1.62;
  color: #3f4147;
}
.fa-quote figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: .5em;
  margin-top: clamp(10px, 1.1vw, 23px);
  font-size: clamp(10px, .8vw, 17px);
}
.fa-quote-name { color: var(--fa-ink); }
.fa-quote-role { color: var(--fa-muted); }
.fa-debug--q { right: clamp(8px, .8vw, 17px); bottom: clamp(4px, .4vw, 9px); z-index: 1; }

/* ── Ruler ── */
.fa-ruler {
  position: relative;
  height: clamp(22px, 2.2vw, 46px);
  margin: auto clamp(10px, 1.6vw, 33px) clamp(14px, 1.5vw, 30px);
  /* short ticks every 10px, a taller one every 100 */
  background-image:
    repeating-linear-gradient(to right, #c8cbd1 0 1px, transparent 1px 10px),
    repeating-linear-gradient(to right, #9ba0a8 0 1px, transparent 1px 100px);
  background-size: 100% 34%, 100% 62%;
  background-position: left bottom, left bottom;
  background-repeat: repeat-x;
  flex-shrink: 0;
}
.fa-ruler-cursor {
  position: absolute;
  left: 21%;
  bottom: 0;
  width: 1px;
  height: 100%;
  background: var(--fa-ink);
}

/* ══════════════════════════════════════════
   Entrance
   ══════════════════════════════════════════ */
.fa-paper { animation: faFade 1.2s ease-out backwards; }
.fa-top   { animation: faFade .8s ease-out .1s backwards; }
@keyframes faFade { from { opacity: 0; } to { opacity: 1; } }

.fa-kicker { animation: faRise .8s cubic-bezier(.22,1,.36,1) .2s backwards; }
.fa-word {
  animation: faRise .9s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.3s + var(--i) * .09s);
}
.fa-touch { animation: faRise .8s cubic-bezier(.22,1,.36,1) .56s backwards; }
@keyframes faRise {
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* the plate draws itself, then its contents arrive */
.fa-main { animation: faPlate 1s cubic-bezier(.22,1,.36,1) .6s backwards; }
@keyframes faPlate {
  from { opacity: 0; transform: translateY(24px); border-color: transparent; }
  to   { opacity: 1; transform: translateY(0);    border-color: var(--fa-line); }
}
.fa-steps { animation: faRise .7s cubic-bezier(.22,1,.36,1) .84s backwards; }

/* --sd is .82s on first paint and 0s afterwards, so the type gets the
   staggered entrance once and then swaps instantly on every change */
.fa-title-a {
  animation: faLine .62s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: var(--sd, 0s);
}
@keyframes faLine {
  from { opacity: 0; transform: translateY(14px); filter: blur(6px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
/* the highlight sweeps open from the left, like a marker stroke */
.fa-title-b {
  animation: faSwipe .68s cubic-bezier(.65,0,.35,1) backwards;
  animation-delay: calc(var(--sd, 0s) + .1s);
}
@keyframes faSwipe {
  from { opacity: 0; clip-path: inset(0 100% 0 0); }
  to   { opacity: 1; clip-path: inset(0 0 0 0); }
}
.fa-body {
  animation: faRise .6s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(var(--sd, 0s) + .22s);
}
.fa-sphere { animation: faBloom 1.3s cubic-bezier(.22,1,.36,1) 1.0s backwards,
                        faSpin 44s linear infinite; }
.fa-gears  { animation: faBloom 1.3s cubic-bezier(.22,1,.36,1) 1.12s backwards; }
@keyframes faBloom {
  from { opacity: 0; transform: scale(.86); }
  to   { opacity: 1; transform: scale(1); }
}
.fa-quotes { animation: faRise .9s cubic-bezier(.22,1,.36,1) 1.3s backwards; }
.fa-ruler  { animation: faFade 1s ease-out 1.5s backwards; }

@media (prefers-reduced-motion: reduce) {
  .fa-paper, .fa-top, .fa-kicker, .fa-word, .fa-touch, .fa-main,
  .fa-steps, .fa-title-a, .fa-title-b, .fa-body, .fa-sphere,
  .fa-gears, .fa-gear, .fa-quotes, .fa-ruler, .fa-quote,
  .fa-step-fill, .fa-qtrack {
    animation: none;
    opacity: 1;
    transform: none;
    clip-path: none;
    filter: none;
  }
  .fa-main { border-color: var(--fa-line); }
  .fa-step--on { background: #0d0d0f; }
  .fa-step, .fa-step-fill { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 1000px) {
  .fa-main { grid-template-columns: 1fr; }
  .fa-copy, .fa-plate--sphere, .fa-plate--gears, .fa-quotes {
    grid-column: 1;
    grid-row: auto;
  }
  .fa-plate { border-left: 0; border-top: 1px solid var(--fa-line); }
  .fa-quotes { border-left: 0; }
  .fa-words { gap: 12px; }
}
`
