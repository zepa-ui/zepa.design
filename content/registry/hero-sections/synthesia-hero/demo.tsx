"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   synthesia-hero — AI video platform hero
   ─ oversized two-tone headline
   ─ gradient card with a translucent pill tab bar
   ─ one video, split into 5 equal segments: each
     tab owns a slice and the tabs advance in sync
     with playback (segment length is derived from
     the real duration, not hardcoded)
   ───────────────────────────────────────────── */

const VIDEO =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1785156782/Best_SaaS_Product_Launch_Ad_Video___LangEase_eekhd9.mp4"

const TABS = ["CREATE", "EDIT", "COLLABORATE", "TRANSLATE", "PUBLISH"]

export default function SynthesiaHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  /* seconds per tab — replaced with duration/5 once metadata lands */
  const segRef = useRef(6.6)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pillRef = useRef<HTMLSpanElement>(null)
  const [active, setActive] = useState(0)
  const [muted, setMuted] = useState(true)

  /* the white pill is one element that slides between tabs rather than
     five backgrounds toggling on and off */
  const layoutPill = useCallback(() => {
    const el = btnRefs.current[active]
    const pill = pillRef.current
    if (!el || !pill) return
    pill.style.width = `${el.offsetWidth}px`
    pill.style.transform = `translateX(${el.offsetLeft}px)`
  }, [active])

  useEffect(() => {
    layoutPill()
    window.addEventListener("resize", layoutPill)
    return () => window.removeEventListener("resize", layoutPill)
  }, [layoutPill])

  /* playback position is the single source of truth for the active tab,
     so the two can never drift apart or fight each other */
  const handleMeta = useCallback(() => {
    const v = videoRef.current
    if (v?.duration && Number.isFinite(v.duration)) {
      segRef.current = v.duration / TABS.length
    }
  }, [])

  const handleTime = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const seg = segRef.current
    setActive(Math.min(TABS.length - 1, Math.floor(v.currentTime / seg)))
    /* segment progress written straight to the DOM — updating state here
       would re-render the whole hero several times a second */
    pillRef.current?.style.setProperty("--p", `${((v.currentTime % seg) / seg) * 100}%`)
  }, [])

  /* clicking a tab seeks to the head of its segment */
  const pick = (i: number) => {
    const v = videoRef.current
    if (v) v.currentTime = i * segRef.current
    setActive(i)
  }

  useEffect(() => {
    const v = videoRef.current
    if (v) v.muted = muted
  }, [muted])

  return (
    <div className="syn-root">
      <style>{CSS}</style>

      {/* ── navbar ── */}
      <nav className="syn-nav">
        <div className="syn-nav-in">
          <Link href="/" className="syn-logo">
            <svg viewBox="0 0 32 32" className="syn-logo-mark" aria-hidden>
              <rect width="32" height="32" rx="9" fill="#4a4fe6" />
              <path
                d="M22 12.5c-1.6-1.5-4.2-1.6-6-1.1-1.9.6-2.3 2.6-.4 3.2 1.7.5 4.6.1 6 1.1 1.6 1.1 1 3.3-1 3.9-1.9.6-4.5.3-6-1"
                fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"
              />
            </svg>
            <span className="syn-logo-txt">synthesia</span>
          </Link>

          <div className="syn-nav-links">
            {["Platform", "Solutions", "Resources"].map((l) => (
              <Link key={l} href="/components" className="syn-nav-link">
                {l}
                <svg viewBox="0 0 12 12" className="syn-caret" aria-hidden>
                  <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
            <Link href="/components" className="syn-nav-link">Pricing</Link>
            <Link href="/components" className="syn-nav-link">Enterprise</Link>
          </div>

          <div className="syn-nav-right">
            <svg viewBox="0 0 24 24" className="syn-globe" aria-hidden>
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"
                    fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="syn-divider" />
            <Link href="/login" className="syn-nav-link">Log in</Link>
            <Link href="/docs"  className="syn-nav-link">Book demo</Link>
            <Link href="/components" className="syn-btn syn-btn--sm">
              Get started <span className="syn-arrow">→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── hero copy ── */}
      <div className="syn-copy">
        <div className="syn-reviews">
          <span className="syn-g2 syn-g2--lg">G2</span>
          Over 2,000 five-star reviews on g2
          <span className="syn-rv-div" />
          <svg viewBox="0 0 24 24" className="syn-info" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="12" cy="7.9" r="1.05" fill="currentColor" />
          </svg>
        </div>

        <h1 className="syn-headline">
          <span className="syn-hl-line">All-in-one <em>AI Video</em></span>
          <span className="syn-hl-line"><em>platform</em> for business</span>
        </h1>

        <p className="syn-sub">
          Create studio-quality videos with AI avatars and voiceovers in 160+
          <br />
          languages. Save up to 90% of time and cost on video production.
        </p>

        <Link href="/components" className="syn-btn syn-btn--lg">
          Get started for FREE <span className="syn-arrow">→</span>
        </Link>

        <div className="syn-trust">
          <span>No credit card required</span>
          <span className="syn-g2">G2</span>
          <span>Rated 4.7/5 on G2</span>
        </div>
      </div>

      {/* ── gradient card ── */}
      <div className="syn-card">
        <div className="syn-cardtop">
          <div className="syn-tabs" role="tablist">
            <span className="syn-pill" ref={pillRef} aria-hidden>
              <i className="syn-pill-fill" />
            </span>
            {TABS.map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={i === active}
                ref={(el) => { btnRefs.current[i] = el }}
                onClick={() => pick(i)}
                className={`syn-tab${i === active ? " syn-tab--on" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            className="syn-mute"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute video" : "Mute video"}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" />
              {muted ? (
                <path d="m16 9.5 4.5 5m0-5-4.5 5" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M15.5 9a4 4 0 0 1 0 6M18 7a7.5 7.5 0 0 1 0 10" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        <div className="syn-window">
          <video
            ref={videoRef}
            src={VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadedMetadata={handleMeta}
            onTimeUpdate={handleTime}
          />
        </div>
      </div>

      <p className="syn-footnote">Trusted by over 90% of Fortune 100 companies</p>
    </div>
  )
}

const CSS = `
/* ── Root ── */
.syn-root {
  position: relative;
  width: 100%;
  min-height: 100vh;
  /* clip BOTH axes: the decorative arcs below are ~190vw circles, and
     leaving vertical overflow visible let them extend the document by
     thousands of pixels. clip contains them without turning the root
     into a scroll container the way overflow:hidden would. */
  overflow: clip;
  /* solid base under the gradient so no part of the section can ever
     fall through to whatever sits behind it.
     Not white — a pale periwinkle wash with a soft white bloom toward
     the upper right, which is what gives the reference its blue cast. */
  background-color: #fafbfe;
  background-image:
    /* one faint blue pool behind the headline — the only place the
       tint is really readable, everything else stays near-white */
    radial-gradient(62% 42% at 50% 27%,
      rgba(168,188,240,.26) 0%,
      rgba(178,196,242,.11) 45%,
      rgba(255,255,255,0)   78%),
    linear-gradient(118deg, #f5f7fd 0%, #fbfcfe 46%, #f6f8fd 100%);
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  color: #0d0d26;
}

/* faint sweeping arcs behind the copy */
.syn-root::before,
.syn-root::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(150,172,232,.15);
  pointer-events: none;
}
.syn-root::before { width: 150vw; height: 150vw; left: -14vw; top: 12vh; }
.syn-root::after  { width: 190vw; height: 190vw; left: -34vw; top:  4vh; }

/* ── Navbar ── */
.syn-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
  flex-shrink: 0;
}
.syn-nav-in {
  display: flex;
  align-items: center;
  gap: clamp(14px, 2.2vw, 44px);
  height: clamp(52px, 3.9vw, 78px);
  padding: 0 clamp(16px, 2.4vw, 48px);
}
.syn-logo { display: inline-flex; align-items: center; gap: .5em; text-decoration: none; }
.syn-logo-mark { width: clamp(20px, 1.55vw, 31px); height: clamp(20px, 1.55vw, 31px); display: block; }
.syn-logo-txt {
  font-size: clamp(15px, 1.15vw, 23px);
  font-weight: 600;
  letter-spacing: -.02em;
  color: #0d0d26;
}

.syn-nav-links { display: flex; align-items: center; gap: clamp(10px, 1.55vw, 31px); }
.syn-nav-link {
  display: inline-flex;
  align-items: center;
  gap: .28em;
  font-size: clamp(11px, .8vw, 16px);
  color: #1b1b35;
  text-decoration: none;
  white-space: nowrap;
  transition: color .15s;
}
.syn-nav-link:hover { color: #4a4fe6; }
.syn-caret { width: .78em; height: .78em; opacity: .75; }

.syn-nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: clamp(9px, 1.25vw, 25px);
}
.syn-globe { width: clamp(15px, 1.1vw, 22px); height: clamp(15px, 1.1vw, 22px); color: #1b1b35; }
.syn-divider { width: 1px; height: 1.6em; background: #e2e2ec; }

/* ── Buttons ── */
.syn-btn {
  display: inline-flex;
  align-items: center;
  gap: .55em;
  background: #4a4fe6;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
  transition: background .16s, transform .14s;
}
.syn-btn:hover { background: #3d42d8; }
.syn-btn:active { transform: translateY(1px); }
.syn-btn--sm {
  font-size: clamp(11px, .8vw, 16px);
  padding: clamp(8px, .62vw, 13px) clamp(13px, 1.05vw, 21px);
}
.syn-btn--lg {
  font-size: clamp(13px, .87vw, 18px);
  padding: clamp(13px, 1.02vw, 21px) clamp(20px, 1.75vw, 36px);
}
.syn-arrow { font-size: 1.05em; line-height: 1; }

/* ── Hero copy ── */
.syn-copy {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: clamp(22px, 3.2vh, 54px) clamp(16px, 3vw, 40px) 0;
  flex-shrink: 0;
}
/* G2 review pill above the headline */
.syn-reviews {
  display: inline-flex;
  align-items: center;
  gap: clamp(6px, .62vw, 13px);
  background: #fff;
  border: 1px solid #e8e9f5;
  border-radius: 999px;
  padding: clamp(5px, .42vw, 9px) clamp(11px, .95vw, 19px);
  margin-bottom: clamp(14px, 2.1vh, 30px);
  font-size: clamp(9px, .68vw, 14px);
  font-weight: 700;
  letter-spacing: .02em;
  text-transform: uppercase;
  color: #1b1b3d;
  box-shadow: 0 1px 2px rgba(30,40,110,.05);
}
.syn-rv-div { width: 1px; height: 1.5em; background: #e2e3f0; }
.syn-info { width: 1.25em; height: 1.25em; color: #8b8ca6; }

.syn-headline {
  margin: 0;
  font-size: clamp(30px, 4.75vw, 96px);
  font-weight: 700;
  line-height: 1.055;
  letter-spacing: -.035em;
  color: #0d0d26;
}
.syn-sub {
  margin: clamp(12px, 1.9vh, 28px) auto 0;
  font-size: clamp(12px, .96vw, 20px);
  line-height: 1.55;
  color: #3d3d5c;
}
.syn-sub br { display: none; }
@media (min-width: 900px) { .syn-sub br { display: inline; } }

.syn-copy .syn-btn--lg { margin-top: clamp(16px, 2.6vh, 38px); }

.syn-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, .9vw, 18px);
  margin-top: clamp(12px, 1.8vh, 26px);
  font-size: clamp(10px, .72vw, 15px);
  color: #4a4a63;
}
.syn-g2 {
  width: clamp(16px, 1.25vw, 25px);
  height: clamp(16px, 1.25vw, 25px);
  border-radius: 50%;
  background: #ff492c;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: .68em;
  font-weight: 700;
  flex-shrink: 0;
}
.syn-g2--lg {
  width: clamp(17px, 1.35vw, 27px);
  height: clamp(17px, 1.35vw, 27px);
  font-size: .78em;
}

/* ── Gradient card ── */
.syn-card {
  position: relative;
  z-index: 5;
  width: min(72%, 1500px);
  margin: clamp(20px, 3.4vh, 54px) auto 0;
  border-radius: clamp(14px, 1.25vw, 26px);
  /* diagonal wash: pale periwinkle top-left → saturated blue bottom-right */
  background:
    radial-gradient(88% 62% at 8% 0%, rgba(255,255,255,.75) 0%, rgba(255,255,255,0) 62%),
    linear-gradient(118deg,
      #e8ebfd 0%,
      #d7ddfb 20%,
      #bcc8f6 42%,
      #94a8f0 63%,
      #7590e9 82%,
      #6382e5 100%);
  padding: clamp(13px, 1.55vw, 32px) clamp(14px, 2.05vw, 44px) clamp(12px, 1.35vw, 28px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* slow diagonal sheen — adds life without touching the base gradient */
.syn-card::after {
  content: "";
  position: absolute;
  inset: -40%;
  background: linear-gradient(72deg,
    rgba(255,255,255,0) 38%,
    rgba(255,255,255,.16) 50%,
    rgba(255,255,255,0) 62%);
  pointer-events: none;
  animation: synSheen 9s ease-in-out 2.2s infinite;
}
@keyframes synSheen {
  0%       { transform: translateX(-38%); opacity: 0; }
  12%, 32% { opacity: 1; }
  50%, 100% { transform: translateX(38%); opacity: 0; }
}

/* tab row */
.syn-cardtop {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: clamp(12px, 1.55vw, 31px);
}
.syn-tabs {
  position: relative;
  display: flex;
  align-items: center;
  gap: clamp(2px, .2vw, 4px);
  background: rgba(255,255,255,.34);
  border: 1px solid rgba(255,255,255,.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 999px;
  padding: clamp(3px, .28vw, 6px);
  max-width: 100%;
}

/* the sliding indicator — width and x are set from JS */
.syn-pill {
  position: absolute;
  left: 0;
  top: clamp(3px, .28vw, 6px);
  bottom: clamp(3px, .28vw, 6px);
  width: 0;
  z-index: 0;
  border-radius: 999px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(30,40,110,.16);
  /* springy slide between tabs */
  transition: transform .55s cubic-bezier(.34,1.32,.5,1),
              width     .55s cubic-bezier(.34,1.32,.5,1);
}
/* how far through the current video segment we are */
.syn-pill-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: var(--p, 0%);
  background: rgba(74,79,230,.10);
}

.syn-tab {
  position: relative;
  z-index: 1;
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  border-radius: 999px;
  padding: clamp(7px, .62vw, 13px) clamp(12px, 1.5vw, 32px);
  font-size: clamp(8px, .65vw, 13px);
  font-weight: 600;
  letter-spacing: .085em;
  color: #1b1b3d;
  white-space: nowrap;
  transition: color .3s ease;
}
.syn-tab:hover { color: #4a4fe6; }
.syn-tab--on { color: #4a4fe6; }

/* mute toggle — sits at the card's right edge, on the tab row */
.syn-mute {
  position: absolute;
  right: 0;
  width: clamp(30px, 3.3vw, 66px);
  height: clamp(30px, 3.3vw, 66px);
  border-radius: 50%;
  border: 0;
  cursor: pointer;
  background: #4a4fe6;
  color: #fff;
  display: grid;
  place-items: center;
  box-shadow: 0 0 0 clamp(3px, .42vw, 8px) rgba(255,255,255,.3);
  transition: background .18s, transform .18s;
}
.syn-mute:hover { background: #3d42d8; transform: scale(1.05); }
.syn-mute svg { width: 52%; height: 52%; display: block; }

/* video window — slightly wider than the source so the card stays a
   comfortable height; cover trims a sliver top and bottom */
.syn-window {
  position: relative;
  /* taller than the 16/9 source — matches the reference proportions,
     cover trims the sides rather than the top and bottom */
  aspect-ratio: 1.65;
  border-radius: clamp(7px, .62vw, 13px);
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 6px rgba(25,40,110,.07), 0 22px 60px rgba(25,40,110,.16);
}
.syn-window video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  display: block;
}

/* footnote below the card — gives the hero a proper bottom edge */
.syn-footnote {
  position: relative;
  z-index: 5;
  text-align: center;
  margin: 0;
  padding: clamp(20px, 3.2vh, 46px) 1rem clamp(26px, 4.4vh, 62px);
  font-size: clamp(11px, .85vw, 18px);
  color: #2a2a45;
  animation: synRise .8s cubic-bezier(.22,1,.36,1) 1.35s backwards;
}

/* ═══════════════════════════════════════════
   Entrance choreography
   ═══════════════════════════════════════════ */

.syn-nav { animation: synNav .8s cubic-bezier(.22,1,.36,1) backwards; }
@keyframes synNav {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

.syn-reviews { animation: synPop .7s cubic-bezier(.34,1.5,.6,1) .06s backwards; }

/* headline unmasks upward, line by line */
.syn-hl-line {
  display: block;
  animation: synLine 1s cubic-bezier(.22,1,.36,1) backwards;
}
.syn-hl-line:nth-child(1) { animation-delay: .14s; }
.syn-hl-line:nth-child(2) { animation-delay: .26s; }
@keyframes synLine {
  from { opacity: 0; transform: translateY(.36em); clip-path: inset(0 0 100% 0); }
  to   { opacity: 1; transform: translateY(0);     clip-path: inset(0 0 -16% 0); }
}

/* accent words carry a left→right ramp from pale periwinkle into deep
   indigo — each word gets its own ramp, matching the reference where
   "platform" starts lighter than "AI Video" */
.syn-headline em {
  font-style: normal;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.syn-hl-line:nth-child(1) em {
  background-image: linear-gradient(90deg, #7d88ef 0%, #5560e9 48%, #3d49e0 100%);
}
.syn-hl-line:nth-child(2) em {
  background-image: linear-gradient(90deg, #9aa3f4 0%, #6570eb 46%, #4550e2 100%);
}

.syn-sub          { animation: synRise .85s cubic-bezier(.22,1,.36,1) .58s backwards; }
.syn-copy .syn-btn--lg { animation: synPop .7s cubic-bezier(.34,1.5,.6,1) .72s backwards; }
.syn-trust        { animation: synRise .8s cubic-bezier(.22,1,.36,1) .84s backwards; }
@keyframes synRise {
  from { opacity: 0; transform: translateY(16px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
@keyframes synPop {
  from { opacity: 0; transform: translateY(14px) scale(.92); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* card lifts in, then its contents settle on top of it */
.syn-card {
  animation: synCard 1.15s cubic-bezier(.22,1,.36,1) .92s backwards;
}
@keyframes synCard {
  from { opacity: 0; transform: translateY(64px) scale(.965); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.syn-tabs   { animation: synRise .7s cubic-bezier(.22,1,.36,1) 1.42s backwards; }
.syn-mute   { animation: synPop  .7s cubic-bezier(.34,1.5,.6,1) 1.52s backwards; }
.syn-window { animation: synRise .9s cubic-bezier(.22,1,.36,1) 1.24s backwards; }

@media (prefers-reduced-motion: reduce) {
  .syn-nav, .syn-hl-line, .syn-sub, .syn-trust, .syn-card,
  .syn-tabs, .syn-mute, .syn-window, .syn-footnote, .syn-reviews,
  .syn-copy .syn-btn--lg, .syn-card::after {
    animation: none;
    opacity: 1;
    filter: none;
    transform: none;
    clip-path: none;
  }
  .syn-pill { transition: none; }
}

/* ── Responsive ── */
@media (max-width: 1080px) {
  .syn-nav-links { display: none; }
  .syn-card { width: 92%; }
}
@media (max-width: 720px) {
  .syn-nav-right .syn-nav-link,
  .syn-globe, .syn-divider { display: none; }
  .syn-tab { letter-spacing: .04em; padding: 7px 10px; }
  .syn-trust { flex-wrap: wrap; }
}
`
