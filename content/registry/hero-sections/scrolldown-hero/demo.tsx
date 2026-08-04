"use client"

import React, { useEffect, useRef } from "react"

/* ─────────────────────────────────────────────
   scrolldown-hero — trading-card portfolio
   Cards float up on buttery lenis-style easing
   while the giant background name marquee drifts
   sideways and SPEEDS UP with scroll velocity.

   The component owns its own scroll container
   (a tall track under a sticky viewport) so it
   never touches window scroll or position:fixed.
   ───────────────────────────────────────────── */

const IMG = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781876069/5_bgrt7d.jpg",
]
const crop = (u: string, w: number, h: number) =>
  u.replace("/upload/", `/upload/c_fill,w_${w},h_${h},g_auto/`)

type Card = {
  bg?: string
  holo?: boolean
  name: string
  year?: string
  num?: string
  icon?: string
  img?: string
  label: string
  featured?: boolean
  x: number
}

const CARDS: Card[] = [
  { bg: "linear-gradient(160deg,#5a0fbe,#3c0787)", name: "Konfiture", year: "2021", num: "08/10", icon: "K",  label: "(PROJECT)", x: 72 },
  { bg: "linear-gradient(160deg,#ec4046,#d42f36)", name: "Belin",     year: "2022", num: "10/10", icon: "📕", label: "(PROJECT)", x: 39 },
  { bg: "linear-gradient(160deg,#1d2432,#10151f)", name: "Chanel",    year: "2022", num: "05/10", img: crop(IMG[0], 420, 520), label: "(PROJECT)", x: 68 },
  { holo: true, name: "DIGITAL DESIGNER", img: crop(IMG[1], 560, 760), label: "(PROFILE)", x: 45 },
  { bg: "linear-gradient(160deg,#2a7bf0,#1257d8)", name: "Playmobil", year: "2023", num: "01/10", icon: "🤖", label: "(PROJECT)", featured: true, x: 70 },
  { bg: "linear-gradient(160deg,#c2272e,#9e1b22)", name: "Vinyle",    year: "2024", num: "03/10", icon: "💿", label: "(PROJECT)", featured: true, x: 39 },
]

const STEP  = 110 // vh between cards
const START = 42  // vh offset of the first card
const TOTAL = START + CARDS.length * STEP + 40

export default function ScrolldownHero() {
  const rootRef  = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const marqRef  = useRef<HTMLDivElement>(null)
  const pctRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let raf: number
    let cur   = root.scrollTop
    let marqX = 0

    const tick = () => {
      /* read the component's own scroll position, never the window's */
      const target = root.scrollTop
      const prev   = cur
      cur += (target - cur) * 0.085 // lenis-style ease
      if (Math.abs(target - cur) < 0.05) cur = target
      const vel = cur - prev

      /* cards ride the smoothed scroll */
      if (stageRef.current) {
        stageRef.current.style.transform = `translate3d(0, ${-cur}px, 0)`
      }

      /* marquee: constant drift + a boost from scroll velocity */
      marqX -= 1.1 + Math.min(38, Math.abs(vel)) * 1.15
      const m = marqRef.current
      if (m) {
        const w = m.scrollWidth / 2 || 1
        const x = ((marqX % w) + w) % w
        m.style.transform = `translate3d(${-x}px, 0, 0)`
      }

      /* progress percent */
      if (pctRef.current) {
        const max = Math.max(1, root.scrollHeight - root.clientHeight)
        pctRef.current.textContent = `${Math.round((cur / max) * 100)}%`
      }

      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="sd-root" ref={rootRef}>
      <style>{CSS}</style>

      {/* tall track supplies the scroll length */}
      <div className="sd-track" style={{ height: `${TOTAL}vh` }}>
        {/* sticky viewport stands in for position:fixed */}
        <div className="sd-viewport">

          {/* background marquee */}
          <div className="sd-marq-wrap">
            <div className="sd-marq" ref={marqRef}>
              <span>EVAN FASQUELLE &nbsp;⇤®&nbsp; </span>
              <span>EVAN FASQUELLE &nbsp;⇤®&nbsp; </span>
            </div>
          </div>

          {/* cards layer */}
          <div className="sd-stage" ref={stageRef}>
            {CARDS.map((c, i) => (
              <div
                key={i}
                className={`sd-card${c.holo ? " sd-card--holo" : ""}`}
                style={{
                  top: `${START + i * STEP}vh`,
                  left: `${c.x}%`,
                  background: c.holo
                    ? "linear-gradient(120deg,#e8e8ec 0%,#f6f4f8 30%,#cfd4de 55%,#f0eef4 80%,#dcdae4 100%)"
                    : c.bg,
                }}
              >
                <div className="sd-card-top">
                  <span className="sd-logo">⇤®</span>
                  {c.featured && <span className="sd-feat">🔥FEATURED🔥</span>}
                  <span className="sd-lbl">{c.label}</span>
                </div>

                {c.holo ? (
                  <>
                    <img className="sd-photo" src={c.img} alt="" draggable={false} />
                    <div className="sd-holo-name">DIGITAL<br />DESIGNER</div>
                  </>
                ) : (
                  <>
                    <div className="sd-icon">
                      {c.img ? (
                        <img src={c.img} alt="" draggable={false} />
                      ) : c.icon === "K" ? (
                        <div className="sd-k">K</div>
                      ) : (
                        <span className="sd-emoji">{c.icon}</span>
                      )}
                    </div>
                    <div className="sd-name">{c.name}</div>
                    <div className="sd-meta">
                      <div><label>Year</label><b>{c.year}</b></div>
                      <div><label>Number</label><b>{c.num}</b></div>
                    </div>
                  </>
                )}

                <div className="sd-foot">©2025 EVAN FASQUELLE / TRADING CARDS PORTFOLIO</div>
              </div>
            ))}
          </div>

          {/* overlay UI */}
          <div className="sd-slot"><div className="sd-mini" /></div>
          <div className="sd-row">
            <span>0 / 12&nbsp;&nbsp;&nbsp;CARDS</span>
            <span className="sd-mid">COLLECTED</span>
            <span>(HOMEPAGE)</span>
          </div>
          <div className="sd-pct" ref={pctRef}>0%</div>
          <button className="sd-pill">✦&nbsp;&nbsp;Open to new opportunities</button>
          <button className="sd-deck">🂠</button>

        </div>
      </div>
    </div>
  )
}

const CSS = `
/* ── Root: its own scroll container ── */
.sd-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #d8d6d2;
  color: #232323;
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  user-select: none;
}
.sd-track { position: relative; width: 100%; }

/* sticky stands in for position:fixed inside the component */
.sd-viewport {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* ── Background marquee ── */
.sd-marq-wrap {
  position: absolute;
  left: 0; right: 0;
  top: 50%;
  transform: translateY(-46%);
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}
.sd-marq {
  white-space: nowrap;
  will-change: transform;
  font-size: clamp(200px, 38vh, 480px);
  font-weight: 500;
  letter-spacing: -.01em;
  color: #262626;
  line-height: 1;
}

/* ── Cards ── */
.sd-stage {
  position: absolute;
  left: 0; top: 0; right: 0;
  z-index: 5;
  will-change: transform;
  /* gives the cards real depth as they flip in from the deck */
  perspective: 1500px;
}
.sd-card {
  position: absolute;
  transform: translateX(-50%);
  width: clamp(300px, 28vw, 560px);
  aspect-ratio: .72;
  border-radius: 26px;
  padding: 26px 30px;
  box-sizing: border-box;
  color: #fff;
  box-shadow:
    0 40px 80px -30px rgba(0,0,0,.45),
    inset 0 0 0 1px rgba(255,255,255,.14),
    inset 0 2px 8px rgba(255,255,255,.12);
}
.sd-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  letter-spacing: .05em;
}
.sd-logo { font-size: 19px; }
.sd-feat {
  background: #fff;
  color: #111;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 4px 10px;
}
.sd-lbl { opacity: .9; font-size: 12.5px; }

.sd-icon { display: grid; place-items: center; height: 42%; margin-top: 6%; }
.sd-k {
  width: 9.5vw; height: 9.5vw;
  min-width: 130px; min-height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 30%, #ffd9dd, #f7a8b4);
  color: #5a0fbe;
  display: grid;
  place-items: center;
  font-size: clamp(56px, 4.6vw, 92px);
  font-weight: 700;
  box-shadow: 0 18px 34px rgba(0,0,0,.3), inset 0 -8px 18px rgba(214,120,140,.55);
}
.sd-emoji {
  font-size: clamp(90px, 8vw, 150px);
  filter: drop-shadow(0 16px 24px rgba(0,0,0,.35));
}
.sd-icon img { width: 52%; border-radius: 6px; box-shadow: 0 18px 40px rgba(0,0,0,.5); }

/* script face — system cursive, no webfont import */
.sd-name {
  text-align: center;
  font-family: "Snell Roundhand", "Apple Chancery", "Segoe Script",
               "Brush Script MT", cursive;
  font-size: clamp(48px, 4.6vw, 84px);
  line-height: 1;
  margin-top: 2%;
}
.sd-meta { display: flex; justify-content: center; gap: 16%; margin-top: 5%; }
.sd-meta label {
  display: block;
  text-align: center;
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
  opacity: .85;
}
.sd-meta b {
  display: block;
  text-align: center;
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
  font-size: clamp(34px, 3vw, 56px);
  margin-top: 6px;
}
.sd-foot {
  position: absolute;
  left: 50%; bottom: 14px;
  transform: translateX(-50%);
  font-size: 8.5px;
  letter-spacing: .08em;
  opacity: .85;
  white-space: nowrap;
  border-top: 1px solid rgba(255,255,255,.25);
  padding-top: 8px;
  width: 66%;
  text-align: center;
}

/* ── Holo profile card ── */
.sd-card--holo { color: #fff; overflow: hidden; }
.sd-card--holo .sd-card-top { color: #666; }
.sd-photo {
  position: absolute;
  inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: .94;
}
.sd-holo-name {
  position: absolute;
  left: 26px; bottom: 44px;
  z-index: 2;
  font-size: clamp(34px, 3.2vw, 60px);
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: .01em;
  color: #fff;
  text-shadow: 0 2px 18px rgba(0,0,0,.18);
}
.sd-card--holo::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(115deg,
    rgba(255,255,255,0) 0 6px,
    rgba(255,180,220,.14) 6px 9px,
    rgba(160,220,255,.14) 9px 12px,
    rgba(255,255,200,.12) 12px 15px);
  mix-blend-mode: screen;
  pointer-events: none;
}
.sd-card--holo .sd-foot { color: #555; border-color: rgba(0,0,0,.2); z-index: 2; }

/* ── Overlay UI ── */
.sd-slot {
  position: absolute;
  top: 20px; left: 20px;
  z-index: 20;
  width: 17.5vw;
  height: 46vh;
  border: 1px dashed #9a9892;
  border-radius: 10px;
}
.sd-mini {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%,-50%);
  width: 44px; height: 60px;
  border: 1.5px solid #232323;
  border-radius: 7px;
}
.sd-row {
  position: absolute;
  left: 20px; right: 20px;
  top: 50.5%;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  letter-spacing: .04em;
  pointer-events: none;
}
.sd-mid { margin-left: 18vw; }
.sd-pct {
  position: absolute;
  left: 26px; bottom: 22px;
  z-index: 20;
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-size: 30px;
}
.sd-pill {
  position: absolute;
  left: 50%; bottom: 26px;
  transform: translateX(-50%);
  z-index: 20;
  background: #fff;
  border: none;
  border-radius: 999px;
  padding: 20px 30px;
  font-family: inherit;
  font-size: 17px;
  color: #111;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0,0,0,.12);
}
.sd-deck {
  position: absolute;
  top: 22px; right: 22px;
  z-index: 20;
  width: 66px; height: 66px;
  border-radius: 50%;
  background: #fff;
  border: none;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0,0,0,.12);
}

/* ═══════════════════════════════════════════
   Entrance choreography — the deck deals the hand
   The deck button lands first, then each card
   flies out of it, spinning face-up on the way.
   ═══════════════════════════════════════════ */

/* 1 — the giant name wipes up from the baseline */
.sd-marq-wrap {
  animation: sdMarqIn 1.25s cubic-bezier(.22,1,.36,1) .08s backwards;
}
@keyframes sdMarqIn {
  from { opacity: 0; clip-path: inset(0 0 100% 0); }
  to   { opacity: 1; clip-path: inset(0 0 0 0); }
}

/* 2 — the deck arrives, so there is something to deal from */
.sd-deck {
  animation: sdDeckIn .75s cubic-bezier(.34,1.56,.64,1) .3s backwards;
}
@keyframes sdDeckIn {
  from { opacity: 0; transform: scale(.4) rotate(-140deg); }
  to   { opacity: 1; transform: scale(1)  rotate(0deg); }
}

/* 3 — cards launch from the deck's corner and flip face-up.
   Every keyframe restates translateX(-50%) so the animation
   never clobbers the card's own centring transform. */
.sd-card {
  animation: sdDeal 1.15s cubic-bezier(.2,.9,.25,1) backwards;
}
.sd-card:nth-child(1) { animation-delay: .52s; }
.sd-card:nth-child(2) { animation-delay: .64s; }
.sd-card:nth-child(3) { animation-delay: .76s; }
.sd-card:nth-child(4) { animation-delay: .88s; }
.sd-card:nth-child(5) { animation-delay: 1.00s; }
.sd-card:nth-child(6) { animation-delay: 1.12s; }
@keyframes sdDeal {
  from {
    opacity: 0;
    transform: translateX(-50%) translate(22vw, -34vh)
               rotate(18deg) rotateY(-68deg) scale(.62);
    box-shadow: 0 10px 20px -12px rgba(0,0,0,.4);
  }
  60% { opacity: 1; }
  to {
    opacity: 1;
    transform: translateX(-50%) translate(0, 0)
               rotate(0deg) rotateY(0deg) scale(1);
  }
}

/* the holographic card keeps catching the light forever */
.sd-card--holo::after {
  background-size: 220% 100%;
  animation: sdShimmer 7s ease-in-out 1.6s infinite;
}
@keyframes sdShimmer {
  0%, 100% { background-position:   0% 0; }
  50%      { background-position: 100% 0; }
}

/* 4 — the surrounding UI settles in last */
.sd-slot { animation: sdFade .8s cubic-bezier(.22,1,.36,1) .82s backwards; }
.sd-row  { animation: sdFade .7s cubic-bezier(.22,1,.36,1) .95s backwards; }
.sd-pct  { animation: sdFade .7s cubic-bezier(.22,1,.36,1) 1.04s backwards; }
@keyframes sdFade {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* pill keeps its centring translate through the animation */
.sd-pill { animation: sdPillIn .8s cubic-bezier(.34,1.5,.6,1) 1.12s backwards; }
@keyframes sdPillIn {
  from { opacity: 0; transform: translateX(-50%) translateY(26px) scale(.86); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .sd-marq-wrap, .sd-deck, .sd-card, .sd-slot,
  .sd-row, .sd-pct, .sd-pill, .sd-card--holo::after {
    animation: none;
    opacity: 1;
    clip-path: none;
  }
  .sd-card  { transform: translateX(-50%); }
  .sd-pill  { transform: translateX(-50%); }
  .sd-marq-wrap { transform: translateY(-46%); }
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .sd-slot { display: none; }
  .sd-card { width: 76vw; }
  .sd-marq { font-size: 26vh; }
  .sd-mid { margin-left: 0; }
}
`
