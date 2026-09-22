"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   any-grid — a bento board where every tile is alive

   Seven tiles on black. Nothing in the layout moves:
   the motion is all inside the cards, and it starts
   the moment the board scrolls into view.

   · a scan column sweeps the token chart, a tracker
     dot riding the line beneath it
   · three counters ease to their final figures
   · two more scramble and settle
   · the tool icons, the action list and the version
     chips each cycle an active state
   · the portrait and its badge swap together
   · six hatched bars breathe
   · a collaborator's cursor drags a selection across
     the closing line and lets it go

   The component owns its own scroll container, so it
   never touches window scroll or position:fixed.
   ───────────────────────────────────────────── */

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/c_fill,w_420,h_520,g_face/v1781705172/han_chmdo4.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/c_fill,w_420,h_520,g_face/v1781705172/samevans_hf73xr.jpg",
]

/* the token chart: 44 bars, and a smoother line behind them.
   shape follows the reference — a plateau, a trough, a long
   climb to a peak, then a taper */
const BARS = [
  18, 26, 34, 44, 58, 66, 72, 70, 64, 52, 34, 20, 12, 9, 8, 8, 9, 10, 12, 15,
  22, 36, 50, 58, 62, 66, 63, 68, 72, 70, 74, 78, 76, 82, 88, 96, 84, 62, 48,
  40, 46, 52, 44, 38,
]
const LINE = BARS.map((v, i) => {
  const w = [BARS[i - 1] ?? v, v, BARS[i + 1] ?? v]
  return (w[0] + w[1] * 2 + w[2]) / 4
})

const TOOLS = ["React", "Next.js", "Zepa"]
const ACTIONS = ["Headlines", "Images and fill", "Tools"]
const CHIPS = ["V1.0", "v2.0", "Remaster"]
const BADGES = ["Regenerate", "Rebuild"]

/** eased ramp, fast then settling — used by all three counters */
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

/**
 * The React atom keeps its own cyan; the Next.js mark and the Zepa wordmark
 * are drawn in currentColor so they read correctly against both the dark
 * resting tile and the white active one. The Cloudinary Zepa PNG is white
 * lettering, which would disappear entirely on the active tile.
 */
function ToolMark({ name }: { name: string }) {
  if (name === "React")
    return (
      <svg className="ag-mark" viewBox="-12 -11 24 22" aria-hidden>
        <circle r="2.1" fill="#61dafb" />
        <g fill="none" stroke="#61dafb" strokeWidth="1.1">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    )
  if (name === "Next.js")
    return (
      <svg className="ag-mark" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="10.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8.7 16.6V7.4l7.1 9.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15.5 7.4v6.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  return <b className="ag-wordmark">zepa</b>
}

export default function AnyGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // continuous values written straight to the DOM, never through state
  const statusRef = useRef<HTMLSpanElement>(null)
  const compRef = useRef<HTMLDivElement>(null)
  const visitRef = useRef<HTMLSpanElement>(null)
  const pctARef = useRef<HTMLDivElement>(null)
  const pctBRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const segRef = useRef<SVGPolylineElement>(null)
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const selRef = useRef<HTMLSpanElement>(null)
  const curRef = useRef<HTMLDivElement>(null)

  // discrete cycles — these tick rarely, so state is cheap
  const [live, setLive] = useState(false)
  const [tool, setTool] = useState(0)
  const [action, setAction] = useState(0)
  const [chip, setChip] = useState(0)
  const [shot, setShot] = useState(0)

  /* ── start when the board scrolls into view ───────────────────────── */
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (typeof IntersectionObserver === "undefined") {
      // no observer to subscribe to, so hand the state change to a frame
      // callback rather than setting it synchronously in the effect body
      const id = requestAnimationFrame(() => setLive(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setLive(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(grid)
    return () => io.disconnect()
  }, [])

  /* ── discrete cycles ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!live) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    const a = setInterval(() => setTool((t) => (t + 1) % 3), 900)
    const b = setInterval(() => setAction((t) => (t + 1) % 3), 900)
    const c = setInterval(() => setChip((t) => (t + 1) % 3), 1200)
    const d = setInterval(() => setShot((t) => (t + 1) % 2), 1800)
    return () => {
      clearInterval(a)
      clearInterval(b)
      clearInterval(c)
      clearInterval(d)
    }
  }, [live])

  /* ── one loop for everything continuous ───────────────────────────── */
  useEffect(() => {
    if (!live) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const t0 = performance.now()
    let raf = 0
    // the two scrambling figures keep their own drifting state
    let dA = 0
    let dB = 0

    const paint = (elapsed: number) => {
      // counters — one 2.4s eased ramp, then held
      const k = easeOutQuart(Math.min(1, elapsed / 2400))
      if (statusRef.current)
        statusRef.current.textContent = Math.round(k * 100) + "%"
      if (compRef.current)
        compRef.current.textContent = Math.round(7500 + k * 500).toLocaleString("en-US")
      if (visitRef.current)
        visitRef.current.textContent = Math.round(25439 + k * 1561).toLocaleString("en-US")

      // the two that wander before settling: noise scaled by what's left of the ramp
      const slack = 1 - k
      dA += (Math.random() - 0.5) * 0.4
      dB += (Math.random() - 0.5) * 0.4
      dA = Math.max(-1, Math.min(1, dA))
      dB = Math.max(-1, Math.min(1, dB))
      if (pctARef.current)
        pctARef.current.textContent = Math.round(47 + dA * 24 * slack) + "%"
      if (pctBRef.current)
        pctBRef.current.textContent = Math.round(63 + dB * 22 * slack) + "%"

      // scan column across the token chart, 5s loop
      const p = (elapsed % 5000) / 5000
      if (scanRef.current) scanRef.current.style.left = (p * 100).toFixed(2) + "%"
      const fi = p * (LINE.length - 1)
      const i0 = Math.floor(fi)
      const i1 = Math.min(LINE.length - 1, i0 + 1)
      const v = LINE[i0] + (LINE[i1] - LINE[i0]) * (fi - i0)
      if (dotRef.current) {
        dotRef.current.style.left = (p * 100).toFixed(2) + "%"
        dotRef.current.style.bottom = (v * 0.72).toFixed(2) + "%"
      }
      // the short stretch of line the dot is currently riding
      if (segRef.current) {
        const a = Math.max(0, i0 - 3)
        const b = Math.min(LINE.length - 1, i0 + 3)
        const pts = []
        for (let i = a; i <= b; i++)
          pts.push((i / (LINE.length - 1)) * 100 + "," + (100 - LINE[i] * 0.72))
        segRef.current.setAttribute("points", pts.join(" "))
      }

      // the six audience bars breathe on their own phases
      for (let i = 0; i < 6; i++) {
        const el = barsRef.current[i]
        if (!el) continue
        const h = 46 + Math.sin(elapsed / 900 + i * 1.7) * 26 + Math.sin(elapsed / 430 + i) * 7
        el.style.height = h.toFixed(2) + "%"
      }

      // cursor drags the selection, holds it, lets go — 5s loop
      const q = (elapsed % 5000) / 5000
      let grow = 0
      let fade = 1
      if (q < 0.06) grow = 0
      else if (q < 0.38) grow = (q - 0.06) / 0.32
      else if (q < 0.84) grow = 1
      else {
        grow = 1
        fade = Math.max(0, 1 - (q - 0.84) / 0.16)
      }
      const eased = grow < 1 ? 1 - Math.pow(1 - grow, 3) : 1
      if (selRef.current) {
        selRef.current.style.setProperty("--cut", (100 - eased * 100).toFixed(2) + "%")
        selRef.current.style.opacity = String(fade)
      }
      if (curRef.current) {
        curRef.current.style.left = (12 + eased * 76).toFixed(2) + "%"
        curRef.current.style.opacity = String(q < 0.03 ? q / 0.03 : fade)
      }
    }

    if (reduced) {
      paint(2400) // settled frame, no loop
      return
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      paint(now - t0)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [live])

  const on = live ? " ag-in" : ""

  return (
    <div ref={rootRef} className="ag-root">
      <style>{CSS}</style>

      <div className="ag-content">
        <div className="ag-lead" />

        <div ref={gridRef} className={"ag-grid" + on}>
          {/* ── token chart ── */}
          <section className="ag-card ag-sand ag-a" style={{ ["--d" as string]: "0ms" }}>
            <div className="ag-row">
              <span className="ag-mut">Design token style</span>
              <span className="ag-mut">Status</span>
            </div>
            <div className="ag-row ag-row--big">
              <span>17 Updated</span>
              <span ref={statusRef}>0%</span>
            </div>
            <div className="ag-row ag-row--tiny">
              <span>Pr</span>
              <span>Sec</span>
            </div>

            <div className="ag-chart">
              <svg className="ag-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={LINE.map(
                    (v, i) => (i / (LINE.length - 1)) * 100 + "," + (100 - v * 0.72)
                  ).join(" ")}
                  fill="none"
                  stroke="rgba(0,0,0,.16)"
                  strokeWidth="0.6"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  ref={segRef}
                  points=""
                  fill="none"
                  stroke="rgba(0,0,0,.85)"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div ref={scanRef} className="ag-scan" />
              <div ref={dotRef} className="ag-dot" />
              <div className="ag-bars">
                {BARS.map((h, i) => (
                  <i key={i} style={{ height: h * 0.86 + "%" }} />
                ))}
              </div>
            </div>
          </section>

          {/* ── components counter ── */}
          <section className="ag-card ag-lilac ag-b" style={{ ["--d" as string]: "70ms" }}>
            <div className="ag-diamonds" aria-hidden />
            <div ref={compRef} className="ag-big">7,500</div>
            <div className="ag-sub">Components</div>
          </section>

          {/* ── tool collaborations ── */}
          <section className="ag-card ag-dark ag-c" style={{ ["--d" as string]: "140ms" }}>
            <span className="ag-mut ag-center">Tool collaborations</span>
            <h3 className="ag-h3">Custom AI</h3>
            <div className="ag-tools">
              {TOOLS.map((n, i) => (
                <span key={n} className={"ag-tool" + (tool === i ? " is-on" : "")}>
                  <ToolMark name={n} />
                </span>
              ))}
            </div>
            <span className="ag-more">+ more</span>
          </section>

          {/* ── assistant ── */}
          <section className="ag-card ag-dark ag-d" style={{ ["--d" as string]: "210ms" }}>
            <h3 className="ag-h3 ag-center">
              A assistant to create
              <br />
              your design
            </h3>
            <p className="ag-p">
              Insert blocks, perform powerful actions and leverage the limitless power of
              AI - all without leaving your keyboard
            </p>
            <div className="ag-list">
              {ACTIONS.map((a, i) => (
                <div key={a} className={"ag-item" + (action === i ? " is-on" : "")}>
                  <span className="ag-glyph">
                    {i === 0 ? (
                      <b>T</b>
                    ) : i === 1 ? (
                      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                        <rect x="1" y="2.5" width="14" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="5.5" cy="6.5" r="1.3" fill="currentColor" />
                        <path d="M2 11.5 6 8l3 2.5L11.5 9 14 11.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden>
                        <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    )}
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </section>

          {/* ── image generator ── */}
          <section className="ag-card ag-dark ag-e" style={{ ["--d" as string]: "280ms" }}>
            <h3 className="ag-h3 ag-center">
              AI helps to generate
              <br />
              images free
            </h3>
            <p className="ag-p">
              With endless, all it takes to create professional-grade images is a browser
              and a story to tell—no experience required.
            </p>
            <div className="ag-chips">
              {CHIPS.map((c, i) => (
                <span key={c} className={"ag-chip" + (chip === i ? " is-on" : "")}>
                  {c}
                </span>
              ))}
            </div>
            <div className="ag-shot">
              {/* the rounding clips the photo; the badge overhangs, so it has
                  to live outside the clip or it gets cut off at the corner */}
              <div className="ag-shot-clip">
                {IMG.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    draggable={false}
                    className={shot === i ? "is-on" : ""}
                  />
                ))}
              </div>
              <span className="ag-badge" key={shot}>
                {BADGES[shot]}
              </span>
            </div>
          </section>

          {/* ── audience ── */}
          <section className="ag-card ag-sand ag-f" style={{ ["--d" as string]: "350ms" }}>
            <span className="ag-mut">Get audience</span>
            <h3 className="ag-h3 ag-dark-t">
              Our search engine
              <br />
              optimazation
            </h3>
            <div className="ag-audience">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={"ag-abar" + (i === 4 ? " is-solid" : "")}>
                  <div
                    ref={(el) => {
                      barsRef.current[i] = el
                    }}
                    className="ag-afill"
                  >
                    <span className="ag-cap" />
                  </div>
                </div>
              ))}
            </div>
            <div className="ag-visitors">
              <span ref={visitRef}>25,439</span>
              <em>new visitors</em>
            </div>
          </section>

          {/* ── closing stats ── */}
          <section className="ag-card ag-dark ag-g" style={{ ["--d" as string]: "420ms" }}>
            <div className="ag-stat">
              <div ref={pctARef} className="ag-big ag-big--sm">47%</div>
              <p>of designs build with E-endless Designer</p>
            </div>
            <div className="ag-stat">
              <div ref={pctBRef} className="ag-big ag-big--sm">63%</div>
              <p>of the top AI startups use E-Endless Designer</p>
            </div>

            <div className="ag-quote">
              <p>
                We helped{" "}
                <span className="ag-sel">
                  <span className="ag-sel-base">build marketing</span>
                  <span className="ag-sel-over" ref={selRef} aria-hidden>
                    build marketing
                  </span>
                </span>{" "}
                and portfolio products
              </p>
              <div ref={curRef} className="ag-cursor">
                <svg viewBox="0 0 12 16" width="12" height="16" aria-hidden>
                  <path d="M1 1v13l3.2-3.6h4.5z" fill="#2f6bff" />
                </svg>
                <span>Manager</span>
              </div>
            </div>
          </section>
        </div>

        <div className="ag-tail" />
      </div>
    </div>
  )
}

const CSS = `
.ag-root {
  position: relative;
  width: 100%;
  height: 100vh;
  /* mobile browsers count the collapsing URL bar in 100vh, so the board
     would sit under it; svh is the stable small viewport */
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #070708;
  color: #f4f4f2;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
.ag-root::-webkit-scrollbar { display: none; }
.ag-root *, .ag-root *::before, .ag-root *::after { box-sizing: border-box; }

.ag-content { position: relative; width: 100%; }
.ag-lead { height: 7vh; }
.ag-tail { height: 12vh; }

/* faint arcs behind the board, as in the reference */
.ag-content::before {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  background:
    radial-gradient(120% 60% at 92% 18%, rgba(255,255,255,.045), transparent 60%),
    radial-gradient(90% 50% at 6% 82%, rgba(255,255,255,.035), transparent 60%);
}

.ag-grid {
  position: relative;
  width: min(86vw, 980px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  gap: clamp(8px, 0.85vw, 12px);
}

.ag-card {
  position: relative;
  overflow: hidden;
  border-radius: clamp(11px, 1.1vw, 17px);
  padding: clamp(10px, 1.05vw, 16px);
  opacity: 0;
  transform: translateY(26px);
}
/* entrance runs once, when the board comes into view */
.ag-grid.ag-in .ag-card {
  animation: agRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d);
}
@keyframes agRise {
  from { opacity: 0; transform: translateY(26px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ag-sand { background: #d9d4c3; color: #111; }
.ag-lilac { background: #c9c2fb; color: #12121a; }
.ag-dark { background: #121213; color: #f4f4f2; }

.ag-a { grid-column: span 11; }
.ag-b { grid-column: span 4; display: grid; place-content: center; text-align: center; }
.ag-c { grid-column: span 9; display: grid; align-content: center; justify-items: center; gap: 0.5rem; }
.ag-d { grid-column: span 8; }
.ag-e { grid-column: span 8; }
.ag-f { grid-column: span 8; display: grid; align-content: start; }
.ag-g { grid-column: span 24; display: grid; grid-template-columns: 1fr 1fr 1.5fr; align-items: center; gap: clamp(10px, 1.5vw, 22px); }

.ag-mut { font-size: clamp(10px, 0.85vw, 13px); opacity: 0.55; }
.ag-center { text-align: center; }
.ag-row { display: flex; justify-content: space-between; align-items: baseline; }
.ag-row--big { font-size: clamp(15px, 1.5vw, 23px); font-weight: 500; letter-spacing: -0.02em; margin-top: 1px; }
.ag-row--tiny { font-size: clamp(9px, 0.7vw, 11px); opacity: 0.5; margin-top: clamp(6px, 0.8vw, 12px); }

/* ── token chart ── */
.ag-chart { position: relative; height: clamp(64px, min(8vw, 12.5vh), 118px); margin-top: 3px; }
.ag-line { position: absolute; inset: 0; width: 100%; height: 100%; }
.ag-bars { position: absolute; inset: 0; display: flex; align-items: flex-end; gap: 0.32%; }
.ag-bars i { flex: 1 1 0; background: #16150f; border-radius: 1px; }
.ag-scan {
  position: absolute; top: -6%; bottom: -6%;
  width: clamp(14px, 1.6vw, 26px);
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.42);
  pointer-events: none;
}
.ag-dot {
  position: absolute;
  width: 5px; height: 5px; border-radius: 50%;
  background: #16150f;
  transform: translate(-50%, 50%);
  pointer-events: none;
}

/* ── components ── */
.ag-diamonds {
  position: absolute; inset: 0; opacity: 0.5;
  background-image:
    linear-gradient(45deg, rgba(255,255,255,.5) 1px, transparent 1px),
    linear-gradient(-45deg, rgba(255,255,255,.5) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(80% 70% at 50% 60%, #000, transparent 75%);
}
.ag-big { position: relative; font-size: clamp(22px, 2.6vw, 38px); font-weight: 500; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; }
.ag-big--sm { font-size: clamp(18px, 2vw, 29px); }
.ag-sub { position: relative; font-size: clamp(10px, 0.85vw, 13px); opacity: 0.6; margin-top: 1px; }

/* ── tools ── */
.ag-h3 { margin: 0; font-size: clamp(13px, 1.25vw, 19px); font-weight: 600; letter-spacing: -0.02em; line-height: 1.16; }
.ag-dark-t { color: #111; }
.ag-tools { display: flex; gap: clamp(7px, 0.8vw, 13px); margin-top: clamp(5px, 0.7vw, 11px); }
/* block, not grid: a percentage-sized SVG inside a shrink-to-fit grid item
   has no definite parent width and collapses to nothing */
.ag-tool {
  display: block;
  width: clamp(34px, min(3.6vw, 6.2vh), 56px);
  aspect-ratio: 1;
  border-radius: clamp(8px, 0.9vw, 14px);
  background: #232325;
  padding: 23%;
  color: #f4f4f2;
  transition: background 0.34s ease, transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), color 0.34s ease;
}
.ag-tool.is-on { background: #fff; color: #111; transform: scale(1.09); }
.ag-mark { display: block; width: 100%; height: 100%; overflow: visible; }
.ag-wordmark {
  display: grid; place-items: center;
  width: 100%; height: 100%;
  font-size: clamp(11px, 1.15vw, 18px);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: currentColor;
}
.ag-more { font-size: clamp(9px, 0.78vw, 12px); color: #2f6bff; margin-top: 2px; }

/* ── assistant ── */
.ag-p {
  margin: clamp(5px, 0.6vw, 9px) auto 0;
  max-width: 34ch;
  text-align: center;
  font-size: clamp(9px, 0.78vw, 12px);
  line-height: 1.5;
  opacity: 0.5;
}
.ag-list {
  margin-top: clamp(7px, 0.9vw, 13px);
  background: #191919;
  border-radius: clamp(9px, 1vw, 15px);
  padding: clamp(5px, 0.6vw, 9px);
  display: grid;
  gap: clamp(3px, 0.4vw, 6px);
}
.ag-item {
  display: flex; align-items: center;
  gap: clamp(6px, 0.7vw, 11px);
  padding: clamp(5px, 0.6vw, 9px);
  border-radius: clamp(6px, 0.7vw, 11px);
  font-size: clamp(9px, 0.8vw, 13px);
  color: rgba(244, 244, 242, 0.62);
  transition: background 0.34s ease, color 0.34s ease;
}
.ag-item.is-on { background: #2a2a2b; color: #fff; }
.ag-glyph {
  display: grid; place-items: center;
  width: clamp(18px, 1.9vw, 28px);
  aspect-ratio: 1;
  border-radius: clamp(5px, 0.55vw, 8px);
  background: #2c2c2e;
  color: rgba(244, 244, 242, 0.7);
  font-size: clamp(9px, 0.8vw, 13px);
  transition: background 0.34s ease, color 0.34s ease;
}
.ag-item.is-on .ag-glyph { background: #fff; color: #111; }

/* ── generator ── */
.ag-chips { display: flex; justify-content: center; gap: clamp(4px, 0.5vw, 8px); margin-top: clamp(8px, 1vw, 14px); }
.ag-chip {
  padding: clamp(2px, 0.28vw, 4px) clamp(6px, 0.65vw, 10px);
  border-radius: 999px;
  background: #222224;
  font-size: clamp(8px, 0.66vw, 11px);
  color: rgba(244, 244, 242, 0.5);
  transition: background 0.34s ease, color 0.34s ease;
}
.ag-chip.is-on { background: #35353a; color: #fff; }
.ag-shot {
  position: relative;
  margin: clamp(6px, 0.7vw, 10px) auto 0;
  width: clamp(70px, min(7.6vw, 12vh), 116px);
  aspect-ratio: 0.82;
}
.ag-shot-clip {
  position: absolute;
  inset: 0;
  border-radius: clamp(8px, 0.9vw, 14px);
  overflow: hidden;
}
.ag-shot img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.06);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.ag-shot img.is-on { opacity: 1; transform: scale(1); }
.ag-badge {
  position: absolute;
  top: 8%; right: -6%;
  background: #fff; color: #111;
  border-radius: 999px;
  padding: clamp(2px, 0.3vw, 5px) clamp(6px, 0.7vw, 11px);
  font-size: clamp(7px, 0.62vw, 10px);
  font-weight: 600;
  white-space: nowrap;
  animation: agPop 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes agPop {
  from { opacity: 0; transform: translateY(-5px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── audience ── */
.ag-audience {
  display: grid; grid-template-columns: repeat(6, 1fr);
  gap: clamp(5px, 0.6vw, 9px);
  align-items: end;
  height: clamp(52px, min(6.4vw, 10vh), 92px);
  margin-top: clamp(6px, 0.7vw, 11px);
}
.ag-abar { position: relative; height: 100%; display: flex; align-items: flex-end; }
.ag-afill {
  position: relative;
  width: 100%;
  background-image: repeating-linear-gradient(-45deg, rgba(0,0,0,.16) 0 2px, transparent 2px 6px);
  background-color: rgba(0, 0, 0, 0.05);
}
.ag-abar.is-solid .ag-afill { background-image: none; background-color: rgba(0, 0, 0, 0.32); }
.ag-cap { position: absolute; left: 0; right: 0; top: 0; height: 3px; background: #16150f; }
.ag-visitors { display: flex; align-items: baseline; gap: 6px; margin-top: clamp(6px, 0.8vw, 12px); color: #111; }
.ag-visitors span { font-size: clamp(15px, 1.5vw, 23px); font-weight: 500; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.ag-visitors em { font-style: normal; font-size: clamp(9px, 0.8vw, 13px); }

/* ── closing stats ── */
.ag-stat { text-align: center; }
.ag-stat p { margin: 4px auto 0; max-width: 22ch; font-size: clamp(9px, 0.78vw, 12px); line-height: 1.45; opacity: 0.5; }
.ag-quote {
  position: relative;
  background: #1c1c1e;
  border-radius: clamp(10px, 1.1vw, 17px);
  padding: clamp(10px, 1.15vw, 18px);
}
.ag-quote p { margin: 0; font-size: clamp(11px, 1.1vw, 17px); line-height: 1.35; letter-spacing: -0.01em; }

/* the selection: a dark-on-light copy wiped in over the plain one.
   nowrap sits on the wrapper, not the overlay — if the base were allowed to
   break across two lines while the overlay stayed on one, they would drift
   apart on narrow screens */
.ag-sel { position: relative; display: inline-block; font-weight: 700; white-space: nowrap; }
.ag-sel-base { color: #fff; }
.ag-sel-over {
  position: absolute; inset: 0;
  color: #111;
  background: #f2f2ee;
  clip-path: inset(0 var(--cut, 100%) 0 0);
}
.ag-cursor {
  position: absolute;
  top: 46%;
  display: flex; align-items: flex-start; gap: 2px;
  pointer-events: none;
  transform: translate(-2px, 0);
}
.ag-cursor span {
  background: #2f6bff; color: #fff;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: clamp(7px, 0.6vw, 10px);
  font-weight: 600;
  white-space: nowrap;
  transform: translateY(6px);
}

/* ── tablet ── */
@media (max-width: 900px) {
  .ag-grid { width: 94vw; gap: 10px; }
  .ag-a { grid-column: span 24; }
  .ag-b { grid-column: span 9; }
  .ag-c { grid-column: span 15; }
  .ag-d, .ag-e, .ag-f { grid-column: span 24; }
  .ag-g { grid-template-columns: 1fr 1fr; }
  .ag-quote { grid-column: span 2; }
  .ag-p { max-width: none; }
}

/* ── phone ──
   Everything stacks to full width. The board is taller than the screen here,
   which is fine: the root is its own scroll container, and the entrance still
   fires from the observer as it comes into view. */
@media (max-width: 560px) {
  .ag-lead { height: 4vh; }
  .ag-tail { height: 9vh; }
  .ag-grid { width: 92vw; gap: 8px; }
  .ag-card { padding: 12px; border-radius: 13px; }

  .ag-b { grid-column: span 10; padding-block: 18px; }
  .ag-c { grid-column: span 14; }

  /* the numbers carry the card on a small screen, so they hold their size */
  .ag-big { font-size: 30px; }
  .ag-big--sm { font-size: 24px; }
  .ag-row--big { font-size: 19px; }
  .ag-visitors span { font-size: 19px; }
  .ag-h3 { font-size: 16px; }
  .ag-quote p { font-size: 15px; }
  .ag-mut { font-size: 11px; }
  .ag-p { font-size: 11px; max-width: 40ch; }
  .ag-item, .ag-visitors em { font-size: 12px; }

  /* charts get their height back in px — vw-based caps collapse them here */
  .ag-chart { height: 96px; }
  .ag-audience { height: 78px; }
  .ag-shot { width: 118px; }
  .ag-tool { width: 46px; border-radius: 12px; }
  .ag-tools { gap: 10px; }
  .ag-wordmark { font-size: 15px; }
  .ag-glyph { width: 24px; }

  /* two stats side by side, the quote on its own row beneath */
  .ag-g { grid-template-columns: 1fr 1fr; gap: 14px; }
  .ag-stat p { font-size: 11px; }
  .ag-cursor { top: 52%; }
}

/* very narrow — the tool row is the first thing to run out of room */
@media (max-width: 380px) {
  .ag-b { grid-column: span 24; }
  .ag-c { grid-column: span 24; }
  .ag-big { font-size: 27px; }
  .ag-tool { width: 42px; }
  .ag-quote p { font-size: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .ag-grid.ag-in .ag-card { animation: none; opacity: 1; transform: none; }
  .ag-badge { animation: none; }
  .ag-tool, .ag-item, .ag-glyph, .ag-chip, .ag-shot img { transition: none; }
}
`
