"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   selfie-hero — editorial marquee over video
   A giant word loop runs across the screen in
   black, and turns white exactly where it
   crosses the centred video. Two identical
   marquees are stacked: one behind the video,
   one clipped to the video's box. Same markup,
   same keyframes, mounted together — so they
   stay frame-perfect in sync.
   Video plays in full colour, muted and looping.
   ───────────────────────────────────────────── */

const VIDEO =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1785865877/pgraph2024_storygrab.io_1785865658_jsc8r6.mp4"

const WORDS = ["aesthetics", "minimalism", "zepa ui", "motion", "craft"]

/* one run of the loop; rendered twice inside the strip so the
   translateX(-50%) wrap is seamless */
function Run() {
  return (
    <span className="slf-run">
      {WORDS.map((w) => (
        <React.Fragment key={w}>
          {w}
          <i className="slf-dot" />
        </React.Fragment>
      ))}
    </span>
  )
}

function Marquee({ variant }: { variant: "black" | "white" }) {
  return (
    <div className={`slf-marq slf-marq--${variant}`} aria-hidden={variant === "white"}>
      <div className="slf-strip">
        <Run />
        <Run />
      </div>
    </div>
  )
}

export default function SelfieHero() {
  const [clock, setClock] = useState("")
  const frameRef = useRef<HTMLDivElement>(null)

  /* pointer-tracked tilt written straight to the DOM — no state, so
     moving the mouse never re-renders the component */
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    /* scale(1.035) keeps the frame covering the marquee's clip rect
       even at the corners while it is rotated */
    el.style.transform =
      `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) ` +
      `rotateY(${(px * 5).toFixed(2)}deg) scale(1.035)`
  }
  const handleLeave = () => {
    if (frameRef.current) frameRef.current.style.transform = ""
  }

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="slf-root">
      <style>{CSS}</style>

      {/* ── top bar ── */}
      <div className="slf-bar">
        <Link href="/docs" className="slf-touch">
          <i className="slf-bullet" />
          get in touch
        </Link>

        <button className="slf-menu">
          <span>[ ]</span>
          <span>menu</span>
        </button>

        <button className="slf-lang">
          <i className="slf-bullet slf-bullet--w" />
          en
        </button>
      </div>

      {/* ── marquee behind the video ── */}
      <Marquee variant="black" />

      {/* ── centred media ── */}
      <div className="slf-media">
        <div className="slf-meta">
          <span>{clock || "--:--:--"}</span>
          <span className="slf-ear"><i className="slf-ring" />lend an ear</span>
        </div>

        <div
          className="slf-frame"
          ref={frameRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
        >
          <video
            className="slf-video"
            src={VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>

        <div className="slf-cap">[zepa • ui]</div>
      </div>

      {/* ── same marquee, clipped to the video box, in white ── */}
      <Marquee variant="white" />
    </div>
  )
}

const CSS = `
/* ── Root ── */
.slf-root {
  --mw: min(36vw, 700px);   /* video edge length; drives the clip too */

  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f7f7f5;
  color: #111;
  /* geometric grotesque — single-storey a, like the reference */
  font-family: "Century Gothic", Futura, "Avenir Next", "Trebuchet MS",
               var(--font-manrope, system-ui), sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Top bar ── */
.slf-bar {
  position: absolute;
  top: clamp(12px, 1.5vw, 26px);
  left: clamp(12px, 1.4vw, 24px);
  right: clamp(12px, 1.4vw, 24px);
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.slf-bullet {
  width: .62em; height: .62em;
  border-radius: 50%;
  background: #111;
  flex-shrink: 0;
}
.slf-bullet--w { background: #fff; }

.slf-touch {
  display: inline-flex;
  align-items: center;
  gap: .6em;
  background: #ececea;
  color: #111;
  text-decoration: none;
  border-radius: 999px;
  padding: clamp(7px, .62vw, 12px) clamp(13px, 1.05vw, 21px);
  font-size: clamp(11px, .78vw, 16px);
}
.slf-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2em;
  width: clamp(180px, 17vw, 300px);
  background: #111;
  color: #fff;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  padding: clamp(9px, .78vw, 15px) clamp(15px, 1.25vw, 25px);
  font-size: clamp(11px, .78vw, 16px);
}
.slf-lang {
  display: inline-flex;
  align-items: center;
  gap: .55em;
  background: #f79cc0;
  color: #fff;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  border-radius: 999px;
  padding: clamp(7px, .62vw, 12px) clamp(12px, .95vw, 19px);
  font-size: clamp(11px, .78vw, 16px);
}

/* ── Marquee ──
   Both copies are siblings of the root with identical geometry, so
   their strips animate in lockstep. The white one is clipped to the
   exact box the video occupies. */
.slf-marq {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  overflow: hidden;
  pointer-events: none;
  line-height: .92;
  font-size: clamp(56px, 8vw, 176px);
  font-weight: 700;
  letter-spacing: -.015em;
}
.slf-marq--black { z-index: 1; color: #111; }
.slf-marq--white {
  z-index: 3;
  color: #fff;
  /* inset(vertical horizontal) — lands exactly on the centred media */
  clip-path: inset(calc(50% - var(--mw) / 2) calc(50% - var(--mw) / 2));
}

.slf-strip {
  display: flex;
  width: max-content;
  animation: slfScroll 24s linear infinite;
}
.slf-run {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}
.slf-dot {
  display: inline-block;
  width: .13em; height: .13em;
  border-radius: 50%;
  background: currentColor;
  margin: 0 .34em;
  flex-shrink: 0;
  vertical-align: middle;
}
@keyframes slfScroll {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Media ── */
.slf-media {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: var(--mw);
  aspect-ratio: 1;
  z-index: 2;
}
/* tilting frame — the glow lives on it so the halo tilts too */
.slf-frame {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform .5s cubic-bezier(.22,1,.36,1),
              box-shadow .45s ease;
  box-shadow:
    0 0 0 1px rgba(255,255,255,.34),
    0 16px 44px -18px rgba(0,0,0,.28);
  /* aperture reveal on appear — clip-path, so it never collides with
     the transform the pointer tilt writes */
  animation: slfAperture 1.1s cubic-bezier(.7,0,.2,1) .3s backwards;
}
.slf-frame:hover {
  box-shadow:
    0 0 0 1px rgba(255,255,255,.6),
    0 30px 70px -22px rgba(0,0,0,.36);
}
@keyframes slfAperture {
  from { clip-path: inset(50% 50%); }
  to   { clip-path: inset(0% 0%); }
}

/* soft colour halo bleeding out from behind the frame */
.slf-frame::before {
  content: "";
  position: absolute;
  inset: -3px;
  z-index: -1;
  background: linear-gradient(130deg, #f79cc0, #b7c8ff, #ffd7a3, #f79cc0);
  background-size: 300% 300%;
  filter: blur(17px);
  opacity: .45;
  transition: opacity .45s ease;
  animation: slfGlow 11s ease-in-out infinite;
}
.slf-frame:hover::before { opacity: .82; }
@keyframes slfGlow {
  0%, 100% { background-position:   0% 50%; }
  50%      { background-position: 100% 50%; }
}

.slf-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slf-meta {
  position: absolute;
  bottom: calc(100% + clamp(10px, 1.1vw, 22px));
  left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  font-size: clamp(10px, .72vw, 15px);
  color: #8d8d88;
}
.slf-ear { display: inline-flex; align-items: center; gap: .5em; }
.slf-ring {
  width: .58em; height: .58em;
  border-radius: 50%;
  border: 1px solid #a5a5a0;
}
.slf-cap {
  position: absolute;
  top: calc(100% + clamp(12px, 1.3vw, 26px));
  left: 0; right: 0;
  text-align: center;
  font-size: clamp(10px, .72vw, 15px);
  color: #8d8d88;
}

/* ══ Entrance ══
   bar drops → media settles → aperture opens → marquee unsqueezes
   → the metadata lines fade last */
.slf-touch { animation: slfDrop .65s cubic-bezier(.34,1.5,.6,1) .05s backwards; }
.slf-menu  { animation: slfDrop .65s cubic-bezier(.34,1.5,.6,1) .14s backwards; }
.slf-lang  { animation: slfDrop .65s cubic-bezier(.34,1.5,.6,1) .23s backwards; }
@keyframes slfDrop {
  from { opacity: 0; transform: translateY(-22px) scale(.9); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}

.slf-media { animation: slfMedia 1s cubic-bezier(.22,1,.36,1) .16s backwards; }
@keyframes slfMedia {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.94); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

/* the type springs open vertically, as if it had been compressed */
.slf-marq { animation: slfWipe 1.15s cubic-bezier(.22,1.15,.36,1) .5s backwards; }
@keyframes slfWipe {
  from { opacity: 0; transform: translateY(-50%) scaleY(.34); }
  to   { opacity: 1; transform: translateY(-50%) scaleY(1); }
}

.slf-meta { animation: slfFade .7s ease-out .95s backwards; }
.slf-cap  { animation: slfFade .7s ease-out 1.05s backwards; }
@keyframes slfFade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .slf-touch, .slf-menu, .slf-lang, .slf-media, .slf-marq,
  .slf-meta, .slf-cap, .slf-frame, .slf-frame::before, .slf-strip {
    animation: none;
    opacity: 1;
    transform: none;
    clip-path: none;
  }
  .slf-media { transform: translate(-50%, -50%); }
  .slf-marq  { transform: translateY(-50%); }
  .slf-frame::before { opacity: .45; }
  .slf-frame { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .slf-root { --mw: min(74vw, 460px); }
  .slf-menu { width: auto; gap: 1em; }
  .slf-touch { display: none; }
}
`
