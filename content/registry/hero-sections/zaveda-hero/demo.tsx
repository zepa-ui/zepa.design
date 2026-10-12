"use client"

import React, { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   zaveda-hero — savings-app landing hero

   Sticky nav over a lilac gradient stage, a
   staggered entrance, and three phones fanned
   with the centre one raised in front. A live
   earnings odometer sits over the middle phone:
   real digit wheels that roll, so the trailing
   decimals blur along while the leading ones
   barely move.

   Scrolling insets the stage and rounds its
   corners. The component owns its own scroll
   container so it never touches window scroll
   or position:fixed.
   ───────────────────────────────────────────── */

const PHONE = {
  left: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1788288156/3_gwnkaf.png",
  centre: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1788288155/2_dfaruh.png",
  right: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1788288156/12_huvmir.png",
}

const NAV = ["Products", "Solutions", "Developers", "Resources", "About"]

/* Slots run 9 → 0, so the strip for digit d shifts up by (9 - d) slots.
   That ordering is what makes an increment roll the wheel downward. */
const SLOTS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

const START = 10.002891
const DECIMALS = 6

/** Six decimal places as individual digits, zero-padded. */
function decimalDigits(value: number) {
  const frac = value - Math.floor(value)
  return Math.round(frac * 10 ** DECIMALS)
    .toString()
    .padStart(DECIMALS, "0")
    .slice(-DECIMALS)
    .split("")
    .map(Number)
}

function Odometer({ value }: { value: number }) {
  const digits = decimalDigits(value)

  return (
    <span className="zv-odometer">
      <span className="zv-odoStatic">${Math.floor(value)}</span>
      <span className="zv-odoDot">.</span>
      {digits.map((d, i) => (
        <span key={i} className="zv-wheel">
          <span className="zv-wheelClip">
            <span
              className="zv-wheelStrip"
              /* the further right the wheel, the faster it turns — a shorter
                 transition keeps the trailing digits from lagging behind */
              style={{
                transform: `translateY(calc(var(--slot-h) * -${9 - d}))`,
                transitionDuration: `${0.45 - i * 0.05}s`,
              }}
            >
              {SLOTS.map((s) => (
                <span key={s} className="zv-wheelSlot">
                  {s}
                </span>
              ))}
            </span>
          </span>
        </span>
      ))}
    </span>
  )
}

export default function ZavedaHero() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [earned, setEarned] = useState(START)

  /* the counter — paid every second, so it never stops climbing */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setEarned((v) => v + 0.000001 + Math.random() * 0.000004)
    }, 90)
    return () => window.clearInterval(id)
  }, [])

  /* scroll insets the stage and rounds its corners */
  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return

    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        // normalised against the component's own box, never the window
        const p = Math.min(1, root.scrollTop / (root.clientHeight * 0.55))
        stage.style.setProperty("--p", p.toFixed(3))
      })
    }

    onScroll()
    root.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      root.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={rootRef} className="zv-root">
      <style>{CSS}</style>

      <header className="zv-nav">
        <div className="zv-navInner">
          <span className="zv-logo">
            <span className="zv-logoMark" aria-hidden />
            zaveda
          </span>

          <nav className="zv-links">
            {NAV.map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()}>
                {l}
              </a>
            ))}
          </nav>

          <a href="#" onClick={(e) => e.preventDefault()} className="zv-cta">
            Use Zaveda
          </a>
        </div>
      </header>

      <div ref={stageRef} className="zv-stage">
        <div className="zv-copy">
          <p className="zv-badge">
            <span className="zv-badgeIcon" aria-hidden />
            Zaveda App
          </p>

          <h1 className="zv-title">The World&apos;s Savings App</h1>

          <p className="zv-sub">
            Get paid every second with global rates and Balance Protection.
          </p>

          <div className="zv-buttons">
            <a href="#" onClick={(e) => e.preventDefault()} className="zv-btn zv-btnPrimary">
              <svg viewBox="0 0 384 512" aria-hidden className="zv-apple">
                <path
                  fill="currentColor"
                  d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                />
              </svg>
              Download on iOS
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="zv-btn zv-btnGhost">
              Learn More
            </a>
          </div>
        </div>

        <div className="zv-phones">
          <img
            src={PHONE.left}
            alt=""
            className="zv-phone zv-phoneSide zv-phoneLeft"
            draggable={false}
          />

          <div className="zv-centre">
            <img src={PHONE.centre} alt="" className="zv-phone zv-phoneCentre" draggable={false} />

            {/* live earnings readout, positioned over the middle screen */}
            <div className="zv-earning" aria-hidden>
              <span className="zv-dot" />
              <span className="zv-amount">
                <Odometer value={earned} />
                <span>&nbsp;Earned</span>
              </span>
              <span className="zv-earnDate">Past Week</span>
            </div>

            <span className="zv-axis zv-axisStart" aria-hidden>
              Aug 27
            </span>
            <span className="zv-axis zv-axisEnd" aria-hidden>
              Today
            </span>
          </div>

          <img
            src={PHONE.right}
            alt=""
            className="zv-phone zv-phoneSide zv-phoneRight"
            draggable={false}
          />
        </div>
      </div>

      {/* a little runway so the stage inset has something to react to */}
      <div className="zv-after">
        <h2>Stay Updated</h2>
        <p>Be the first to hear about news from Zepa Labs.</p>
      </div>
    </div>
  )
}

const CSS = `
.zv-root {
  --purple: #978eff;
  --purple-deep: #8673ff;
  --ink: #211d1d;
  --ink-2: #636161;
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff;
  color: var(--ink);
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
.zv-root::-webkit-scrollbar { display: none; }
.zv-root * { box-sizing: border-box; }

/* ── nav ── */
.zv-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.zv-navInner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  gap: 28px;
}
.zv-logo {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 22px; font-weight: 600; letter-spacing: -0.03em;
}
.zv-logoMark {
  width: 26px; height: 18px; border-radius: 999px;
  background: radial-gradient(circle at 30% 50%, #fff 0 2px, transparent 2px),
              radial-gradient(circle at 70% 50%, #fff 0 2px, transparent 2px),
              var(--ink);
}
.zv-links {
  display: flex; gap: 26px; margin-left: auto;
  font-size: 14px; color: var(--ink-2);
}
.zv-links a { color: inherit; text-decoration: none; transition: color .2s; }
.zv-links a:hover { color: var(--ink); }
.zv-cta {
  background: #1a1618; color: #fff; text-decoration: none;
  font-size: 14px; font-weight: 500;
  padding: 10px 20px; border-radius: 999px;
  transition: transform .2s var(--ease, cubic-bezier(.19,1,.22,1));
}
.zv-cta:hover { transform: translateY(-1px); }

/* ── stage ── */
.zv-stage {
  --p: 0;
  position: relative;
  /* Always inset with rounded bottom corners — the panel is a card sitting
     on the page, not a full-bleed band. Scroll deepens both slightly. */
  margin: 0 calc(18px + var(--p) * 10px);
  border-radius: 0 0 calc(30px + var(--p) * 10px) calc(30px + var(--p) * 10px);
  padding: 64px 24px 0;
  overflow: hidden;
  background:
    radial-gradient(125% 85% at 50% 108%, #cfc6ff 0%, #e4dfff 40%, #f4f2ff 68%, #ffffff 88%);
}

.zv-copy { text-align: center; max-width: 820px; margin: 0 auto; }

.zv-badge {
  display: inline-flex; align-items: center; gap: 10px;
  margin: 0 0 22px; font-size: 22px; font-weight: 500; color: var(--ink-2);
  opacity: 0; animation: zv-rise .7s cubic-bezier(.19,1,.22,1) .15s forwards;
}
.zv-badgeIcon {
  width: 34px; height: 34px; border-radius: 10px;
  background: radial-gradient(circle at 34% 46%, #fff 0 2.4px, transparent 2.4px),
              radial-gradient(circle at 66% 46%, #fff 0 2.4px, transparent 2.4px),
              var(--purple);
}
.zv-title {
  margin: 0; font-size: clamp(38px, 5.6vw, 78px); font-weight: 600;
  letter-spacing: -0.045em; line-height: 1.02;
  opacity: 0; animation: zv-rise .8s cubic-bezier(.19,1,.22,1) .3s forwards;
}
.zv-sub {
  margin: 18px 0 0; font-size: clamp(15px, 1.5vw, 20px); color: var(--ink-2);
  opacity: 0; animation: zv-rise .8s cubic-bezier(.19,1,.22,1) .45s forwards;
}
.zv-buttons {
  margin-top: 34px; display: flex; gap: 12px; justify-content: center;
  opacity: 0; animation: zv-rise .8s cubic-bezier(.19,1,.22,1) .6s forwards;
}
.zv-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 15px 28px; border-radius: 999px; text-decoration: none;
  font-size: 16px; font-weight: 500;
  transition: transform .25s cubic-bezier(.19,1,.22,1), filter .25s;
}
.zv-btn:hover { transform: translateY(-2px); }
.zv-btnPrimary { background: var(--purple); color: #fff; }
.zv-btnPrimary:hover { filter: brightness(1.05); }
.zv-btnGhost { background: rgba(151, 142, 255, 0.18); color: var(--purple-deep); }
.zv-apple { width: 16px; height: 16px; }

/* ── phones ── */
.zv-phones {
  --phone-w: clamp(178px, 20.5vw, 288px);
  /* how far the side phones tuck under the centre one */
  --overlap: calc(var(--phone-w) * 0.17);
  position: relative;
  /* how much lower the centre phone sits than the outer two */
  --centre-drop: calc(var(--phone-w) * 0.04);
  margin-top: 52px;
  display: flex;
  justify-content: center;
  /* flex-end, not flex-start: the bottoms are what must line up with the
     panel edge. Computing a top offset from the height ratio only works if
     all three PNGs share an aspect and internal padding — they don't. */
  align-items: flex-end;
  /* no trailing space — the phones run into the panel's rounded bottom */
  margin-bottom: 0;
}
.zv-phone { display: block; width: var(--phone-w); height: auto; }

/* The outer two slide UNDER the centre via negative margin, not a negative
   gap — the gap property rejects negative values outright. Their vertical
   placement comes from align-items: flex-end on the row. */
.zv-phoneSide {
  position: relative;
  z-index: 1;
}
.zv-phoneLeft {
  margin-right: calc(var(--overlap) * -1);
  opacity: 0;
  animation: zv-phoneInLeft .95s cubic-bezier(.19,1,.22,1) .95s forwards;
}
.zv-phoneRight {
  margin-left: calc(var(--overlap) * -1);
  opacity: 0;
  animation: zv-phoneInRight .95s cubic-bezier(.19,1,.22,1) 1.05s forwards;
}

.zv-centre {
  position: relative;
  z-index: 3;
  margin-bottom: calc(var(--centre-drop) * -1);
}
.zv-phoneCentre {
  width: calc(var(--phone-w) * 1.1);
  opacity: 0;
  transform: translateY(10%) scale(.975);
  animation: zv-riseCentre .9s cubic-bezier(.19,1,.22,1) 1.2s forwards;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 22px 40px rgba(76, 62, 140, 0.18));
}

/* ── earnings readout ── */
.zv-earning {
  --slot-h: 1.05em;
  position: absolute;
  /* sits UNDER the balance figure on the phone screen, not across it —
     the reference stacks rate, balance, then this line */
  left: 50%; top: 37.5%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  font-size: calc(var(--phone-w) * 0.047);
  white-space: nowrap;
  opacity: 0; animation: zv-fade .6s ease 1.95s forwards;
}
.zv-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #01d062; position: absolute; left: -9px; top: 6px;
}
.zv-amount {
  display: inline-flex; align-items: center;
  font-weight: 600; color: #01a04c;
}
.zv-earnDate { color: #8f8e8e; font-weight: 500; }

/* the odometer — one clipped strip per digit */
.zv-odometer { display: inline-flex; align-items: center; }
.zv-odoStatic, .zv-odoDot { display: inline-block; }
.zv-wheel { display: inline-block; height: var(--slot-h); overflow: hidden; }
.zv-wheelClip { display: block; height: var(--slot-h); overflow: hidden; }
.zv-wheelStrip {
  display: flex; flex-direction: column;
  transition-property: transform;
  transition-timing-function: cubic-bezier(.19, 1, .22, 1);
  will-change: transform;
}
.zv-wheelSlot {
  height: var(--slot-h); line-height: var(--slot-h);
  font-variant-numeric: tabular-nums;
}

.zv-axis {
  position: absolute; bottom: 16%; z-index: 4;
  font-size: calc(var(--phone-w) * 0.042); color: #8f8e8e;
  opacity: 0; animation: zv-fade .6s ease 1.9s forwards;
}
.zv-axisStart { left: 12%; }
.zv-axisEnd { right: 12%; }

/* ── trailing section ── */
.zv-after {
  padding: 88px 24px 120px; text-align: center;
}
.zv-after h2 {
  margin: 0; font-size: clamp(26px, 3vw, 40px); font-weight: 600;
  letter-spacing: -0.035em;
}
.zv-after p { margin: 10px 0 0; color: var(--ink-2); font-size: 16px; }

@keyframes zv-rise {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes zv-riseCentre {
  from { opacity: 0; transform: translateY(14%) scale(.955); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
/* the outer phones fan outward into place, so the trio assembles rather
   than simply fading in together */
@keyframes zv-phoneInLeft {
  from { opacity: 0; transform: translateX(16%) translateY(6%) rotate(3deg) scale(.94); }
  to   { opacity: 1; transform: translateX(0) translateY(0) rotate(0) scale(1); }
}
@keyframes zv-phoneInRight {
  from { opacity: 0; transform: translateX(-16%) translateY(6%) rotate(-3deg) scale(.94); }
  to   { opacity: 1; transform: translateX(0) translateY(0) rotate(0) scale(1); }
}
@keyframes zv-fade { to { opacity: 1; } }

@media (max-width: 900px) {
  .zv-links { display: none; }
  .zv-phones { --phone-w: clamp(140px, 27vw, 200px); }
}
@media (max-width: 560px) {
  .zv-navInner { padding: 12px 18px; }
  .zv-cta { margin-left: auto; }
  .zv-phones { --phone-w: 40vw; --overlap: calc(var(--phone-w) * 0.22); }
  .zv-buttons { flex-direction: column; align-items: center; }
  .zv-btn { width: 100%; max-width: 280px; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .zv-badge, .zv-title, .zv-sub, .zv-buttons,
  .zv-phoneSide, .zv-phoneLeft, .zv-phoneRight,
  .zv-phoneCentre, .zv-earning, .zv-axis {
    animation: none;
    opacity: 1;
    transform: none;
  }
  .zv-wheelStrip { transition: none; }
}
`
