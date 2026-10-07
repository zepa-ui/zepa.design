"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   crypto-grid — a payments bento that keeps moving

   Seven tiles. The purple hero holds the left column
   above a stack of partner coins, and a ring of tiles
   orbits the integrations heading. The AI card floats
   a report panel; the secure card sits on a field of
   glyphs that keep rewriting themselves; the QR gets
   scanned and the bell rings.

   Everything wakes when the board scrolls into view.
   The component owns its own scroll container, so it
   never touches window scroll or position:fixed.
   ───────────────────────────────────────────── */

const CDN = "https://res.cloudinary.com/dzvffb6vv/image/upload/v1788714262/"

const LOGOS = [
  { src: CDN + "lvisa_wrdbu9.webp", name: "Visa" },
  { src: CDN + "luber_hbstvd.webp", name: "Uber" },
  { src: CDN + "ltwitter_sisucv.webp", name: "Twitter" },
  { src: CDN + "lslack_z8g1tn.webp", name: "Slack" },
  { src: CDN + "Lamazon_pquxmf.webp", name: "Amazon" },
  { src: CDN + "llinkedin_gpnn8z.webp", name: "LinkedIn" },
  { src: CDN + "linstagram_zyqagr.webp", name: "Instagram" },
  { src: CDN + "Lms_yxnrlq.webp", name: "Microsoft" },
]
const QR = CDN + "qr_z1x3xi.png"

/** Twelve evenly spaced seats on the integration ring. The tiles carry no
    tilt at all — every logo stays perfectly upright the whole way round, so
    the arc reads as one line of squares travelling rather than a scatter of
    cocked ones. */
const SEATS = 12

const GLYPHS = "ℵ∀∃∇∏∑√∞∫≈≠≡⊂⊃⊕⊗⋈◇◈◉○●□▣△▽אבגדהוזחטי"
const COLS = 22
const ROWS = 13

export default function CryptoGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<(HTMLSpanElement | null)[]>([])
  const barRef = useRef<HTMLDivElement>(null)

  const [live, setLive] = useState(false)
  const [seed] = useState(() =>
    Array.from({ length: COLS * ROWS }, (_, i) => GLYPHS[(i * 7 + 3) % GLYPHS.length])
  )

  /* ── wake on scroll into view ─────────────────────────────────────── */
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (typeof IntersectionObserver === "undefined") {
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
      { threshold: 0.2 }
    )
    io.observe(grid)
    return () => io.disconnect()
  }, [])

  /* ── the glyph field keeps rewriting itself ───────────────────────── */
  useEffect(() => {
    if (!live) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // a handful of cells per tick, written straight to the DOM — re-rendering
    // 286 spans six times a second would be absurd
    const id = setInterval(() => {
      for (let n = 0; n < 7; n++) {
        const i = Math.floor(Math.random() * cellsRef.current.length)
        const el = cellsRef.current[i]
        if (!el) continue
        el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        el.classList.add("is-lit")
        setTimeout(() => el.classList.remove("is-lit"), 620)
      }
    }, 160)
    return () => clearInterval(id)
  }, [live])

  /* ── the spend bar fills once, on wake ────────────────────────────── */
  useEffect(() => {
    if (!live || !barRef.current) return
    const el = barRef.current
    const id = requestAnimationFrame(() => {
      el.style.width = "75%"
    })
    return () => cancelAnimationFrame(id)
  }, [live])

  const on = live ? " cg-in" : ""

  return (
    <div ref={rootRef} className="cg-root">
      <style>{CSS}</style>

      <div className="cg-content">
        <div className="cg-lead" />

        <div ref={gridRef} className={"cg-grid" + on}>
          {/* ── purple hero ── */}
          <section className="cg-card cg-hero" style={{ ["--d" as string]: "0ms" }}>
            <div className="cg-mesh" aria-hidden />
            <h2>
              Pay With Crypto
              <br />
              Without Hassle
            </h2>
            <span className="cg-shield" aria-hidden>
              <svg viewBox="0 0 24 24" width="55%" height="55%">
                <path
                  d="M12 2.6 4.8 5.4v6c0 4.4 3 8.5 7.2 10 4.2-1.5 7.2-5.6 7.2-10v-6z"
                  fill="none"
                  stroke="#6d3fd4"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m8.6 12.1 2.4 2.4 4.4-4.6"
                  fill="none"
                  stroke="#6d3fd4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p>
              Enjoy quick and secure payments with end-to-end encryption, advanced fraud
              protection, and seamless authentication to keep your transactions safe
            </p>
            <button type="button" className="cg-btn cg-btn--light">
              Learn More
            </button>
          </section>

          {/* ── AI insights, spanning the two right columns ── */}
          <section className="cg-card cg-ai" style={{ ["--d" as string]: "90ms" }}>
            <div className="cg-ai-copy">
              <h3>
                Personalized Financial
                <br />
                Insights With AI
              </h3>
              <p>Experience hassle-free shopping with access to international brands.</p>
            </div>

            <div className="cg-panel">
              <div className="cg-chips">
                <span>Monthly Report</span>
                <span>
                  <svg viewBox="0 0 16 16" width="9" height="9" aria-hidden>
                    <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 6.5h12M5.5 1.6v2.4M10.5 1.6v2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  March
                </span>
              </div>
              <h4>You&apos;ve made a great job!!</h4>
              <p>Your financial habits are improving. Keep tracking your expenses.</p>

              <div className="cg-mini">
                <div className="cg-tile">
                  <span>Most transaction</span>
                  <div className="cg-faces">
                    {LOGOS.slice(0, 4).map((l, i) => (
                      <i key={l.name} style={{ ["--i" as string]: String(i) }}>
                        <img src={l.src} alt="" draggable={false} />
                      </i>
                    ))}
                  </div>
                </div>
                <div className="cg-tile">
                  <span>Spent reduce</span>
                  <div className="cg-bar">
                    <div ref={barRef} className="cg-bar-fill">
                      <em>75%</em>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" className="cg-btn cg-btn--dark">
                View Details
              </button>
            </div>
          </section>

          {/* ── trusted by: stacked partner coins ── */}
          <section className="cg-card cg-trusted" style={{ ["--d" as string]: "180ms" }}>
            <h3>
              Trusted By 100+
              <br />
              Global Companies
            </h3>
            {/* three coins stacked front-to-back, fanning and zooming together */}
            <div className="cg-stack">
              {LOGOS.slice(0, 3).map((l, i) => (
                <span
                  key={l.name}
                  className="cg-stack-coin"
                  title={l.name}
                  style={{ ["--i" as string]: String(i), zIndex: i + 1 }}
                >
                  <img src={l.src} alt="" draggable={false} />
                </span>
              ))}
            </div>
          </section>

          {/* ── pay easy, on the glyph field ── */}
          <section className="cg-card cg-secure" style={{ ["--d" as string]: "270ms" }}>
            <div className="cg-field" aria-hidden>
              {seed.map((g, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    cellsRef.current[i] = el
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
            <span className="cg-print" aria-hidden>
              <svg viewBox="0 0 24 24" width="58%" height="58%">
                <g fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 10.5v4.8" />
                  <path d="M9 9.4a4 4 0 0 1 6 .6v4.6" />
                  <path d="M6.2 8.4a7 7 0 0 1 11.6.9v5.4" />
                  <path d="M9 17.4v1.4M15 17.4v1.4M12 18.2v1.2" />
                </g>
              </svg>
            </span>
            <h3>Pay Easy, Pay Secure</h3>
            <p>
              We offer a range of services and support to ensure your cycling experience is
              smooth and enjoyable
            </p>
            <button type="button" className="cg-btn cg-btn--dark">
              Get Started
            </button>
          </section>

          {/* ── QR ── */}
          <section className="cg-card cg-qr" style={{ ["--d" as string]: "360ms" }}>
            <div className="cg-qr-plate">
              <img src={QR} alt="QR code" draggable={false} />
              <span className="cg-scan" aria-hidden />
            </div>
            <h3>Share With QR</h3>
            <p>Instantly update and share app changes via QR codes</p>
          </section>

          {/* ── integrations ── */}
          <section className="cg-card cg-integrate" style={{ ["--d" as string]: "450ms" }}>
            {/* the same scattered tiles, now riding a circle. three layers:
                the ring turns, the middle unwinds that turn, the inner one
                unwinds the tile's seat angle and re-applies its own tilt —
                so each tile keeps its cocked angle the whole way round */}
            <div className="cg-ring" aria-hidden>
              <div className="cg-ring-spin">
                {Array.from({ length: SEATS }, (_, i) => (
                  <span
                    key={i}
                    className="cg-orb"
                    style={{ ["--a" as string]: (i * 360) / SEATS + "deg" }}
                  >
                    <span className="cg-orb-spin">
                      <span className="cg-orb-tile">
                        <img src={LOGOS[i % LOGOS.length].src} alt="" draggable={false} />
                      </span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <h3>
              Integrate With 230+
              <br />
              Apps And Softwares
            </h3>
          </section>

          {/* ── instant updates ── */}
          <section className="cg-card cg-updates" style={{ ["--d" as string]: "540ms" }}>
            <span className="cg-bell" aria-hidden>
              <svg viewBox="0 0 24 24" width="52%" height="52%">
                <path
                  d="M12 3.2a5.6 5.6 0 0 0-5.6 5.6c0 4.2-1.4 5.6-1.4 5.6h14s-1.4-1.4-1.4-5.6A5.6 5.6 0 0 0 12 3.2z"
                  fill="#fff"
                />
                <path d="M10.3 17.6a2 2 0 0 0 3.4 0" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <em />
            </span>
            <h3>Instant Updates</h3>
            <p>Never miss out any update.</p>
          </section>
        </div>

        <div className="cg-tail" />
      </div>
    </div>
  )
}

const CSS = `
.cg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
  color: #101014;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
.cg-root::-webkit-scrollbar { display: none; }
.cg-root *, .cg-root *::before, .cg-root *::after { box-sizing: border-box; }

.cg-content { position: relative; width: 100%; }
.cg-lead { height: 6vh; }
.cg-tail { height: 10vh; }

.cg-grid {
  width: min(88vw, 1080px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 9fr 9fr 6fr;
  grid-template-rows: minmax(180px, 1.5fr) minmax(96px, 1fr) minmax(96px, 1fr);
  gap: clamp(9px, 0.95vw, 15px);
  height: min(82vh, 730px);
}

.cg-card {
  position: relative;
  overflow: hidden;
  border-radius: clamp(13px, 1.25vw, 20px);
  padding: clamp(12px, 1.25vw, 20px);
  background: #f1f1f3;
  opacity: 0;
  transform: translateY(22px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
}
.cg-grid.cg-in .cg-card {
  animation: cgRise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d);
}
@keyframes cgRise {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* every tile answers the pointer */
.cg-grid.cg-in .cg-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px -18px rgba(20, 12, 60, 0.45);
}

.cg-hero     { grid-column: 1; grid-row: 1; }
.cg-ai       { grid-column: 2 / span 2; grid-row: 1; }
.cg-trusted  { grid-column: 1; grid-row: 2; }
.cg-secure   { grid-column: 2; grid-row: 2 / span 2; }
.cg-qr       { grid-column: 3; grid-row: 2; }
.cg-integrate{ grid-column: 1; grid-row: 3; }
.cg-updates  { grid-column: 3; grid-row: 3; }

.cg-card h2, .cg-card h3, .cg-card h4 { margin: 0; letter-spacing: -0.025em; line-height: 1.16; }
.cg-card p { margin: 0; }

/* ── purple hero ── */
.cg-hero {
  background: linear-gradient(168deg, #7444e0 0%, #6435cf 55%, #5a2cc4 100%);
  color: #fff;
  display: grid;
  align-content: center;
  justify-items: center;
  text-align: center;
  gap: clamp(7px, 0.85vw, 13px);
  padding: clamp(16px, 1.8vw, 28px);
}
.cg-mesh {
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(to top, #000 0%, transparent 62%);
  transform: perspective(340px) rotateX(56deg) scale(1.7);
  transform-origin: 50% 100%;
}
.cg-hero h2 { position: relative; font-size: clamp(17px, min(1.75vw, 3vh), 27px); font-weight: 700; }
.cg-shield {
  position: relative;
  display: grid; place-items: center;
  width: clamp(30px, min(3vw, 5.2vh), 46px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
}
.cg-grid.cg-in .cg-shield { animation: cgHalo 2.8s ease-in-out 1.1s infinite; }
@keyframes cgHalo {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,.5); }
  55%      { box-shadow: 0 0 0 11px rgba(255,255,255,0); }
}
.cg-hero p {
  position: relative;
  max-width: 30ch;
  font-size: clamp(9px, min(0.8vw, 1.45vh), 12.5px);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.86);
}

.cg-btn {
  position: relative;
  font: inherit;
  font-weight: 600;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), background 0.24s ease;
}
.cg-btn:hover { transform: translateY(-1px) scale(1.03); }
.cg-btn--light {
  background: #fff; color: #16121f;
  padding: clamp(7px, 0.72vw, 11px) clamp(16px, 1.7vw, 26px);
  font-size: clamp(10px, 0.82vw, 13px);
}
.cg-btn--dark {
  background: #121216; color: #fff;
  padding: clamp(7px, 0.72vw, 11px) clamp(16px, 1.7vw, 26px);
  font-size: clamp(10px, 0.82vw, 13px);
}
.cg-btn--dark:hover { background: #2a2a33; }

/* ── AI card ── */
.cg-ai {
  background: linear-gradient(120deg, #f4f2fb 0%, #f7f6fa 48%, #f2f1f7 100%);
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: clamp(10px, 1.4vw, 24px);
  padding: clamp(14px, 1.6vw, 26px);
}
.cg-ai::before {
  content: "";
  position: absolute; left: 0; top: 0; width: 46%; height: 62%;
  background-image:
    linear-gradient(rgba(109,63,212,.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(109,63,212,.07) 1px, transparent 1px);
  background-size: 26px 26px;
  mask-image: radial-gradient(70% 70% at 0% 0%, #000, transparent 70%);
}
.cg-ai-copy { position: relative; min-width: 0; }
.cg-ai-copy h3 { font-size: clamp(14px, min(1.5vw, 2.6vh), 23px); font-weight: 700; }
.cg-ai-copy p {
  margin-top: clamp(6px, 0.7vw, 11px);
  font-size: clamp(9px, min(0.82vw, 1.5vh), 13px);
  line-height: 1.5;
  color: #55555f;
  max-width: 30ch;
}

.cg-panel {
  position: relative;
  width: clamp(180px, 20vw, 268px);
  background: #fff;
  border-radius: clamp(10px, 1vw, 15px);
  padding: clamp(9px, 0.95vw, 15px);
  box-shadow: 0 18px 40px -22px rgba(30, 16, 80, 0.35);
  display: grid;
  gap: clamp(5px, 0.55vw, 9px);
}
.cg-chips { display: flex; gap: 5px; }
.cg-chips span {
  display: inline-flex; align-items: center; gap: 3px;
  background: #f2f2f5; color: #45454f;
  border-radius: 6px;
  padding: 3px 7px;
  font-size: clamp(7px, 0.6vw, 9.5px);
  font-weight: 600;
}
.cg-panel h4 { font-size: clamp(11px, min(1.02vw, 1.85vh), 16px); font-weight: 700; }
.cg-panel > p { font-size: clamp(7.5px, 0.63vw, 10px); line-height: 1.45; color: #6d6d78; }

.cg-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.cg-tile {
  border: 1px solid #ececf1;
  border-radius: 8px;
  padding: 6px;
  display: grid;
  gap: 6px;
  align-content: start;
}
.cg-tile > span { font-size: clamp(6.5px, 0.55vw, 8.5px); color: #8a8a95; }

.cg-faces { display: flex; }
.cg-faces i {
  display: grid; place-items: center;
  width: clamp(15px, 1.5vw, 22px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.14);
  overflow: hidden;
  margin-left: -22%;
  /* the overlap stays a fixed margin and the fan is done with transform:
     transitioning margin-left animates layout, which never ran smoothly */
  transform-origin: 50% 65%;
  transition: transform 0.44s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.44s ease;
  transition-delay: calc(var(--i) * 40ms);
}
.cg-faces i:first-child { margin-left: 0; }
.cg-faces i img { width: 100%; height: 100%; object-fit: cover; }
/* 32% per step more than cancels the -22% overlap, so on hover every
   avatar is fully clear of the one in front and the row reads left to right */
.cg-tile:hover .cg-faces i {
  transform: translateX(calc(var(--i) * 32%)) translateY(-2px) scale(1.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}

.cg-bar { height: clamp(13px, 1.3vw, 19px); border-radius: 999px; background: #efeff3; overflow: hidden; }
.cg-bar-fill {
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6, #6d3fd4);
  display: flex; align-items: center;
  transition: width 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.cg-bar-fill em {
  font-style: normal;
  margin-left: 5px;
  background: #fff;
  color: #3c3c46;
  border-radius: 999px;
  padding: 1px 5px;
  font-size: clamp(6px, 0.5vw, 8px);
  font-weight: 700;
}

/* ── trusted / stacked coins ── */
.cg-trusted { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 10px; }
.cg-trusted h3 { font-size: clamp(12px, min(1.15vw, 2vh), 18px); font-weight: 700; }
.cg-stack { display: flex; flex: 0 0 auto; padding-right: 6px; }
.cg-stack-coin {
  position: relative;
  display: block;
  width: clamp(34px, min(3.6vw, 6.4vh), 54px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #fff;
  box-shadow: 0 3px 10px rgba(24, 16, 60, 0.2);
  overflow: hidden;
  margin-left: -24%;
  /* transform only — animating the margin would relayout every frame */
  transform-origin: 50% 60%;
  /* no stagger delay: each coin now answers its own hover, and a delay
     would make the one under the pointer feel unresponsive */
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.32s ease;
}
.cg-stack-coin:first-child { margin-left: 0; }
.cg-stack-coin img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* each coin answers its own hover and jumps to the front, so the one under
   the pointer stands out instead of the whole row moving together */
.cg-stack-coin:hover {
  transform: scale(1.18);
  box-shadow: 0 8px 22px rgba(24, 16, 60, 0.34);
  z-index: 9;
}

/* ── secure / glyph field ── */
.cg-secure {
  display: grid;
  align-content: end;
  justify-items: center;
  text-align: center;
  gap: clamp(6px, 0.7vw, 11px);
  padding: clamp(14px, 1.5vw, 24px);
}
.cg-field {
  position: absolute; inset: 0 0 40% 0;
  display: grid;
  grid-template-columns: repeat(${COLS}, 1fr);
  align-content: start;
  padding: clamp(8px, 1vw, 16px);
  gap: 2px;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, #000 46%, transparent 92%);
}
.cg-field span {
  font-size: clamp(6px, 0.62vw, 10px);
  line-height: 1.15;
  text-align: center;
  color: rgba(20, 16, 40, 0.26);
  transition: color 0.5s ease;
}
.cg-field span.is-lit { color: rgba(109, 63, 212, 0.85); }
.cg-print {
  position: relative;
  display: grid; place-items: center;
  width: clamp(34px, min(3.4vw, 6vh), 52px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(150deg, #7d4ae4, #6132c8);
  margin-bottom: clamp(2px, 0.5vw, 8px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.cg-secure:hover .cg-print { transform: scale(1.09); }
.cg-secure h3 { position: relative; font-size: clamp(14px, min(1.5vw, 2.6vh), 23px); font-weight: 700; }
.cg-secure > p {
  position: relative;
  max-width: 34ch;
  font-size: clamp(9px, min(0.8vw, 1.45vh), 12.5px);
  line-height: 1.5;
  color: #55555f;
}

/* ── QR ── */
/* the plate is pinned to the top and pulled up by a fifth of its own
   height, so the card's overflow clips it — 80% visible, as in the reference */
.cg-qr {
  --qr: clamp(58px, min(6.4vw, 11.5vh), 96px);
  display: grid;
  align-content: start;
  justify-items: center;
  text-align: center;
  gap: clamp(5px, 0.6vw, 9px);
  padding-top: 0;
}
.cg-qr-plate {
  position: relative;
  width: var(--qr);
  aspect-ratio: 1;
  margin-top: calc(var(--qr) * -0.2);
  background: #fff;
  border-radius: clamp(6px, 0.6vw, 10px);
  padding: 7%;
  overflow: hidden;
}
.cg-qr-plate img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cg-scan {
  position: absolute; left: 0; right: 0; height: 34%;
  background: linear-gradient(180deg, transparent, rgba(109, 63, 212, 0.28), transparent);
  opacity: 0;
}
.cg-qr:hover .cg-scan { opacity: 1; animation: cgScan 1.5s ease-in-out infinite; }
@keyframes cgScan {
  from { transform: translateY(-120%); }
  to   { transform: translateY(320%); }
}
.cg-qr h3 { font-size: clamp(12px, min(1.15vw, 2vh), 18px); font-weight: 700; }
.cg-qr p, .cg-updates p {
  font-size: clamp(8px, min(0.72vw, 1.3vh), 11.5px);
  line-height: 1.45;
  color: #6d6d78;
  max-width: 24ch;
}

/* ── integrations / orbiting tiles ── */
.cg-integrate { display: grid; align-content: center; justify-items: center; text-align: center; }
/* The circle the tiles ride. Diameter is 1.7x the card height with its centre
   right on the bottom edge, so only the upper arc is ever on screen. The wider
   radius pushes the side tiles further out horizontally, which is what leaves
   the centred heading room to breathe. */
.cg-ring {
  position: absolute;
  left: 50%; top: 100%;
  height: 170%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.cg-ring-spin { position: absolute; inset: 0; }
.cg-grid.cg-in .cg-ring-spin { animation: cgOrbit 30s linear infinite; }
.cg-grid.cg-in .cg-orb-spin { animation: cgOrbitBack 30s linear infinite; }
/* both halves pause together, so the tiles hold their tilt while stopped */
.cg-integrate:hover .cg-ring-spin,
.cg-integrate:hover .cg-orb-spin { animation-play-state: paused; }
@keyframes cgOrbit {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes cgOrbitBack {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}

.cg-orb {
  position: absolute;
  left: 50%; top: 50%;
  /* sized off the ring, not the viewport: -384.6% of a tile that is 13% of
     the ring puts its centre at exactly 0.5 x the ring — right on the rim */
  width: 13%;
  aspect-ratio: 1;
  margin: -6.5% 0 0 -6.5%;
  transform: rotate(var(--a)) translateY(-384.6%);
}
.cg-orb-spin { display: block; width: 100%; height: 100%; }
.cg-orb-tile {
  display: block;
  width: 100%; height: 100%;
  border-radius: 26%;
  background: #fff;
  box-shadow: 0 4px 14px rgba(24, 16, 60, 0.16);
  overflow: hidden;
  /* undo the seat angle; with the counter-spin above, that leaves the tile
     bolt upright no matter where it is on the circle */
  transform: rotate(calc(var(--a) * -1));
  transition: box-shadow 0.32s ease;
}
.cg-integrate:hover .cg-orb-tile { box-shadow: 0 7px 20px rgba(24, 16, 60, 0.28); }
.cg-orb-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cg-integrate h3 {
  position: relative;
  font-size: clamp(13px, min(1.35vw, 2.35vh), 21px);
  font-weight: 700;
  /* the card colour, so a tile passing behind is masked out cleanly */
  background: #f1f1f3;
  padding: 6px 14px;
  border-radius: 10px;
  /* nudged below centre: the arc crowds the upper half, so the title sits
     better a little low. transform, not margin, so the grid centring the
     card does for everything else is left alone */
  transform: translateY(clamp(16px, 5.4vh, 46px));
}

/* ── updates ── */
.cg-updates { display: grid; align-content: center; justify-items: center; text-align: center; gap: clamp(5px, 0.6vw, 9px); }
.cg-bell {
  position: relative;
  display: grid; place-items: center;
  width: clamp(30px, min(3.1vw, 5.4vh), 47px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: linear-gradient(150deg, #7d4ae4, #6132c8);
}
.cg-bell em {
  position: absolute; top: 6%; right: 6%;
  width: 22%; aspect-ratio: 1;
  border-radius: 50%;
  background: #ff5d5d;
  border: 1.5px solid #fff;
  opacity: 0;
  transform: scale(0.4);
  transition: opacity 0.24s ease, transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.cg-updates:hover .cg-bell em { opacity: 1; transform: scale(1); }
.cg-updates:hover .cg-bell svg { animation: cgRing 0.7s ease-in-out; }
@keyframes cgRing {
  0%, 100% { transform: rotate(0); }
  20% { transform: rotate(13deg); }
  40% { transform: rotate(-11deg); }
  60% { transform: rotate(7deg); }
  80% { transform: rotate(-4deg); }
}
.cg-updates h3 { font-size: clamp(12px, min(1.15vw, 2vh), 18px); font-weight: 700; }

/* ── tablet ── */
@media (max-width: 900px) {
  .cg-grid {
    width: 94vw;
    height: auto;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    gap: 10px;
  }
  .cg-hero      { grid-column: 1; grid-row: auto; min-height: 300px; }
  .cg-ai        { grid-column: 2; grid-row: auto; grid-template-columns: 1fr; align-content: center; }
  .cg-trusted   { grid-column: 1; grid-row: auto; min-height: 108px; }
  .cg-secure    { grid-column: 2; grid-row: auto; min-height: 300px; }
  .cg-qr        { grid-column: 1; grid-row: auto; min-height: 168px; }
  /* the ring's radius is fixed relative to the tile, so this card needs
     enough height for the orbit or the top and bottom tiles clip */
  .cg-integrate { grid-column: 1 / span 2; grid-row: auto; min-height: 212px; }
  .cg-updates   { grid-column: 2; grid-row: auto; min-height: 168px; }
  .cg-panel { width: 100%; }
  .cg-ai-copy p { max-width: none; }
}

/* ── phone ──
   One column. Fixed pixel sizes take over: the desktop clamps are capped on
   vw, which collapses every badge and plate to nothing at 375px. */
@media (max-width: 560px) {
  .cg-lead { height: 3vh; }
  .cg-tail { height: 8vh; }
  .cg-grid { width: 92vw; grid-template-columns: 1fr; gap: 9px; }
  .cg-card { padding: 16px; border-radius: 15px; }
  .cg-hero, .cg-ai, .cg-trusted, .cg-secure, .cg-qr, .cg-integrate, .cg-updates {
    grid-column: 1;
    min-height: 0;
  }

  .cg-hero { padding: 22px 18px; min-height: 0; }
  .cg-hero h2 { font-size: 22px; }
  .cg-hero p { font-size: 12.5px; max-width: 34ch; }
  .cg-shield { width: 42px; }

  .cg-ai { grid-template-columns: 1fr; gap: 14px; }
  .cg-ai-copy h3 { font-size: 20px; }
  .cg-ai-copy p { font-size: 12.5px; }
  .cg-panel { width: 100%; padding: 13px; gap: 8px; }
  .cg-panel h4 { font-size: 15px; }
  .cg-panel > p { font-size: 10.5px; }
  .cg-chips span { font-size: 9.5px; }
  .cg-tile > span { font-size: 9px; }
  .cg-faces i { width: 24px; }
  .cg-bar { height: 20px; }
  .cg-bar-fill em { font-size: 8.5px; }

  .cg-trusted { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 14px; }
  .cg-trusted h3 { font-size: 17px; }
  .cg-stack-coin { width: 58px; }

  .cg-secure { padding: 18px; }
  .cg-secure h3 { font-size: 20px; }
  .cg-secure > p { font-size: 12.5px; }
  .cg-print { width: 48px; }
  .cg-field { inset: 0 0 46% 0; }
  .cg-field span { font-size: 8.5px; }

  .cg-qr { --qr: 104px; }
  .cg-qr h3, .cg-updates h3, .cg-integrate h3 { font-size: 17px; }
  .cg-qr p, .cg-updates p { font-size: 11.5px; max-width: 30ch; }
  .cg-bell { width: 46px; }

  .cg-integrate { min-height: 212px; }
  .cg-orb { width: 15%; margin: -7.5% 0 0 -7.5%; }
  .cg-btn--light, .cg-btn--dark { font-size: 13px; padding: 11px 24px; }

  /* a tap has no hover, so the lift would stick after touch */
  .cg-grid.cg-in .cg-card:hover { transform: none; box-shadow: none; }
}

@media (max-width: 380px) {
  .cg-hero h2 { font-size: 20px; }
  .cg-ai-copy h3, .cg-secure h3 { font-size: 18px; }
  .cg-stack-coin { width: 52px; }
  .cg-field span { font-size: 7.5px; }
}

@media (prefers-reduced-motion: reduce) {
  .cg-grid.cg-in .cg-card { animation: none; opacity: 1; transform: none; }
  .cg-grid.cg-in .cg-ring-spin,
  .cg-grid.cg-in .cg-orb-spin,
  .cg-grid.cg-in .cg-shield,
  .cg-qr:hover .cg-scan,
  .cg-updates:hover .cg-bell svg { animation: none; }
  .cg-bar-fill { transition: none; }
  .cg-card, .cg-btn, .cg-faces i, .cg-print { transition: none; }
}
`
