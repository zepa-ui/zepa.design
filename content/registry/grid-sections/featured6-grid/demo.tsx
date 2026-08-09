"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   featured6-grid — showcase rail
   ─ oversized two-tone headline
   ─ three black video cards on a centred rail
     that bleeds off both edges of the viewport
   ─ meta pill row underneath
   ───────────────────────────────────────────── */

const CARDS = [
  { src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/111_ltcvxx.mp4" },
  { src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/110_bnaecb.mp4" },
  { src: "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/109_jc84sb.mp4" },
]

const NAV = ["PRICING", "FAQ", "SHOWCASE"]

type Item = { label: string; href: string; note?: string; external?: boolean }

const JOIN_ITEMS: Item[] = [
  { label: "Browse components", href: "/components", note: "111" },
  { label: "Read the docs", href: "/docs" },
  { label: "Hero playground", href: "/playground/hero" },
  { label: "Star on GitHub", href: "https://github.com/zepa-ui/zepa.design", external: true },
]

const EFFECT_ITEMS: Item[] = [
  { label: "Hero sections", href: "/components", note: "32" },
  { label: "Grid sections", href: "/components", note: "6" },
  { label: "Navbar sections", href: "/components", note: "6" },
  { label: "Unicorn section", href: "/components", note: "15" },
  { label: "View every effect", href: "/components" },
]

/* one dropdown used by both buttons; `drop` flips it upward for the
   meta row, which sits at the bottom of a section with overflow:hidden */
function Dropdown({
  label,
  items,
  variant,
  drop = "down",
}: {
  label: string
  items: Item[]
  variant: "join" | "see"
  drop?: "down" | "up"
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="f6g-dd" ref={ref}>
      <button
        type="button"
        className={variant === "join" ? "f6g-join" : "f6g-see"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <svg
          viewBox="0 0 12 12"
          className={`f6g-caret${variant === "see" ? " f6g-caret--lime" : ""}${open ? " f6g-caret--open" : ""}`}
          aria-hidden
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className={`f6g-menu f6g-menu--${drop}`} role="menu">
          {items.map((it) =>
            it.external ? (
              <a
                key={it.label}
                href={it.href}
                target="_blank"
                rel="noopener noreferrer"
                className="f6g-menu-item"
                role="menuitem"
              >
                {it.label}
                <span className="f6g-menu-arrow">↗</span>
              </a>
            ) : (
              <Link key={it.label} href={it.href} className="f6g-menu-item" role="menuitem">
                {it.label}
                {it.note && <span className="f6g-menu-note">{it.note}</span>}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  )
}

/* how far the button drifts toward the pointer, and the ceiling on that
   drift so it always stays anchored near the middle of the card */
const PULL = 0.34
const MAX_RATIO = 0.2

function ShowcaseCard({ src, index }: { src: string; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  /* written straight to the DOM — running this through state would
     re-render the section on every pointer move */
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    const btn = btnRef.current
    if (!card || !btn) return

    const r = card.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const max = Math.min(r.width, r.height) * MAX_RATIO
    const clamp = (v: number) => Math.max(-max, Math.min(max, v))

    btn.style.transform =
      `translate(${clamp(dx * PULL).toFixed(1)}px, ${clamp(dy * PULL).toFixed(1)}px)`
  }

  /* springs back to dead centre */
  const handleLeave = () => {
    if (btnRef.current) btnRef.current.style.transform = ""
  }

  return (
    <div
      className="f6g-card"
      ref={cardRef}
      style={{ "--i": index } as React.CSSProperties}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <video src={src} autoPlay muted loop playsInline preload="auto" />

      <div className="f6g-overlay" aria-hidden />

      <button className="f6g-view" ref={btnRef} type="button">
        <span className="f6g-view-inner">
          VIEW
          <br />
          MORE
        </span>
      </button>
    </div>
  )
}

export default function Featured6Grid() {
  return (
    <section className="f6g-root">
      <style>{CSS}</style>

      {/* ── nav ── */}
      <header className="f6g-nav">
        <Link href="/" className="f6g-brand">Made With Zepa</Link>

        <div className="f6g-nav-right">
          <nav className="f6g-pillnav">
            <Link href="/components" className="f6g-navlink">
              COLLECTION <span className="f6g-count">111</span>
            </Link>
            {NAV.map((n) => (
              <Link key={n} href="/components" className="f6g-navlink">{n}</Link>
            ))}
          </nav>

          <button className="f6g-circle" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="10" r="3" />
              <path d="M5.8 19a6.6 6.6 0 0112.4 0" />
            </svg>
          </button>

          <Dropdown label="JOIN" items={JOIN_ITEMS} variant="join" />
        </div>
      </header>

      {/* ── headline ── */}
      <h2 className="f6g-headline">
        <span className="f6g-line">Latest effects,</span>
        <span className="f6g-line f6g-line--muted">freshly added</span>
      </h2>

      {/* ── rail — wider than the viewport, so the outer cards clip ── */}
      <div className="f6g-rail">
        {CARDS.map((c, i) => (
          <ShowcaseCard key={c.src} src={c.src} index={i} />
        ))}
      </div>

      {/* ── meta row ── */}
      <div className="f6g-meta">
        <span className="f6g-pill">#110</span>
        <span className="f6g-pill">2 WEEKS AGO</span>
        <Dropdown label="SEE EFFECT" items={EFFECT_ITEMS} variant="see" drop="up" />
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.f6g-root {
  --f6g-ink: rgb(10, 10, 11);
  --f6g-lime: #cbf364;

  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #f0f0f0;
  color: var(--f6g-ink);
  /* LayGrotesk first — self-host it and it takes over automatically */
  font-family: LayGrotesk, "Helvetica Neue", Helvetica, Inter,
               var(--font-manrope, ui-sans-serif), Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  padding: clamp(18px, 2vw, 34px) 0 clamp(24px, 3vh, 48px);
  box-sizing: border-box;
}

/* ── Nav ── */
.f6g-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 clamp(14px, 1.6vw, 30px);
  flex-shrink: 0;
}
.f6g-brand {
  font-size: clamp(14px, 1.12vw, 22px);
  font-weight: 500;
  letter-spacing: -.02em;
  color: var(--f6g-ink);
  text-decoration: none;
  white-space: nowrap;
}
.f6g-nav-right { display: flex; align-items: center; gap: clamp(6px, .6vw, 12px); }

.f6g-pillnav {
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.5vw, 28px);
  background: #fff;
  border-radius: 999px;
  padding: clamp(9px, .9vw, 17px) clamp(14px, 1.4vw, 27px);
}
.f6g-navlink {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: clamp(9px, .66vw, 13px);
  font-weight: 500;
  letter-spacing: .04em;
  color: var(--f6g-ink);
  text-decoration: none;
  white-space: nowrap;
  transition: opacity .15s;
}
.f6g-navlink:hover { opacity: .55; }
.f6g-count {
  background: #ededed;
  border-radius: 999px;
  padding: 2px 7px;
  font-size: .92em;
  color: #6b6b6f;
}

.f6g-circle,
.f6g-join {
  border: 0;
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.f6g-circle {
  width: clamp(34px, 2.5vw, 48px);
  height: clamp(34px, 2.5vw, 48px);
  border-radius: 50%;
  background: #fff;
  color: var(--f6g-ink);
}
.f6g-circle svg { width: 48%; height: 48%; }
.f6g-join {
  gap: 8px;
  background: var(--f6g-lime);
  color: var(--f6g-ink);
  border-radius: 999px;
  padding: clamp(10px, .95vw, 18px) clamp(16px, 1.5vw, 30px);
  font-size: clamp(9px, .66vw, 13px);
  font-weight: 500;
  letter-spacing: .05em;
  transition: filter .15s;
}
.f6g-join:hover { filter: brightness(.95); }
.f6g-caret {
  width: 1em;
  height: 1em;
  transition: transform .25s cubic-bezier(.22,1,.36,1);
}
.f6g-caret--open { transform: rotate(180deg); }

/* ── Dropdowns ── */
.f6g-dd { position: relative; }
.f6g-menu {
  position: absolute;
  right: 0;
  z-index: 40;
  min-width: 232px;
  padding: 7px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 18px 44px -14px rgba(10,10,11,.30), 0 0 0 1px rgba(10,10,11,.06);
  animation: f6gMenu .26s cubic-bezier(.22,1,.36,1);
  transform-origin: top right;
}
.f6g-menu--down { top: calc(100% + 9px); }
/* the meta row sits at the bottom of an overflow:hidden section, so this
   one has to open upward or it would be clipped away */
.f6g-menu--up {
  bottom: calc(100% + 9px);
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  transform-origin: bottom center;
}
@keyframes f6gMenu {
  from { opacity: 0; transform: translateY(-6px) scale(.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
.f6g-menu--up { animation-name: f6gMenuUp; }
@keyframes f6gMenuUp {
  from { opacity: 0; transform: translateX(-50%) translateY(6px) scale(.97); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0)   scale(1); }
}

.f6g-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 13px;
  border-radius: 12px;
  font-size: clamp(11px, .74vw, 14px);
  font-weight: 500;
  letter-spacing: -.01em;
  color: var(--f6g-ink);
  text-decoration: none;
  white-space: nowrap;
  transition: background .14s ease;
}
.f6g-menu-item:hover { background: #f2f2f2; }
.f6g-menu-note {
  background: #ededed;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: .86em;
  color: #6b6b6f;
}
.f6g-menu-arrow { color: #9a9a9f; font-size: .95em; }

/* ── Headline — LayGrotesk 500 / 120px / 114px ── */
.f6g-headline {
  margin: clamp(28px, 5vh, 88px) 0 clamp(24px, 4vh, 62px);
  text-align: center;
  font-size: clamp(38px, 6.4vw, 126px);
  font-weight: 500;
  line-height: .95;
  letter-spacing: -.035em;
  color: var(--f6g-ink);
  flex-shrink: 0;
}
.f6g-line { display: block; }
.f6g-line--muted { color: #8e8e93; }

/* ── Rail ──
   three cards at 40vw each plus gaps run past 100vw, so the outer
   two clip against the section's overflow while the middle sits centred */
.f6g-rail {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: clamp(8px, 1.1vw, 21px);
  flex-shrink: 0;
}
.f6g-card {
  position: relative;
  flex: 0 0 auto;
  width: clamp(260px, 40vw, 780px);
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}
.f6g-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Hover: frosted sheet over the footage ── */
.f6g-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  background: rgba(10,10,11,.34);
  backdrop-filter: blur(11px) saturate(1.1);
  -webkit-backdrop-filter: blur(11px) saturate(1.1);
  transition: opacity .38s ease;
}
.f6g-card:hover .f6g-overlay { opacity: 1; }

/* ── Magnetic "view more" ──
   inset:0 + margin:auto centres it with fixed dimensions, which leaves
   the transform property entirely free for the pointer offset JS writes.
   Centring via translate(-50%,-50%) would be clobbered on first move. */
.f6g-view {
  position: absolute;
  inset: 0;
  margin: auto;
  width: clamp(78px, 7vw, 132px);
  height: clamp(78px, 7vw, 132px);
  border: 0;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  /* the lag is the effect — it trails the cursor instead of tracking it */
  transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .3s ease;
}
.f6g-card:hover .f6g-view { opacity: 1; pointer-events: auto; }

/* scale lives on the inner element so it never fights the JS transform */
.f6g-view-inner {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #fff;
  color: var(--f6g-ink);
  font-family: inherit;
  font-size: clamp(8px, .6vw, 12px);
  font-weight: 500;
  letter-spacing: .09em;
  line-height: 1.35;
  text-align: center;
  transform: scale(.72);
  transition: transform .45s cubic-bezier(.34,1.4,.64,1), background .2s ease;
}
.f6g-card:hover .f6g-view-inner { transform: scale(1); }
.f6g-view:hover .f6g-view-inner { background: var(--f6g-lime); }

/* ── Meta row ── */
.f6g-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(6px, .55vw, 11px);
  margin-top: clamp(20px, 3vh, 52px);
  flex-shrink: 0;
}
.f6g-pill,
.f6g-see {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  padding: clamp(9px, .78vw, 15px) clamp(14px, 1.25vw, 24px);
  font-family: inherit;
  font-size: clamp(9px, .66vw, 13px);
  font-weight: 500;
  letter-spacing: .05em;
  white-space: nowrap;
}
.f6g-pill { background: #fff; color: var(--f6g-ink); }
.f6g-see {
  background: var(--f6g-ink);
  color: #fff;
  cursor: pointer;
  transition: opacity .15s;
}
.f6g-see:hover { opacity: .85; }
.f6g-caret--lime { color: var(--f6g-lime); }

/* ══════════════════════════════════════════
   Entrance — ~2000ms end to end
   nav → headline focuses → rail closes in from
   both edges → meta row
   ══════════════════════════════════════════ */

.f6g-nav { animation: f6gDrop .85s cubic-bezier(.22,1,.36,1) .05s backwards; }
@keyframes f6gDrop {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* each line clears its own blur, so the two-tone reads in sequence */
.f6g-line { animation: f6gFocus 1.05s cubic-bezier(.22,1,.36,1) backwards; }
.f6g-line:nth-child(1) { animation-delay: .18s; }
.f6g-line:nth-child(2) { animation-delay: .34s; }
@keyframes f6gFocus {
  from { opacity: 0; transform: translateY(30px); filter: blur(12px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* the rail assembles: the two clipped cards slide in from the edges they
   are cut off by, the centre one rises — so the composition converges */
.f6g-card {
  animation-duration: 1s;
  animation-timing-function: cubic-bezier(.22,1,.36,1);
  animation-fill-mode: backwards;
  animation-delay: calc(.60s + var(--i) * .13s);
}
.f6g-rail > .f6g-card:nth-child(1) { animation-name: f6gFromLeft; }
.f6g-rail > .f6g-card:nth-child(2) { animation-name: f6gFromBelow; }
.f6g-rail > .f6g-card:nth-child(3) { animation-name: f6gFromRight; }
@keyframes f6gFromLeft {
  from { opacity: 0; transform: translateX(-70px) scale(.96); }
  to   { opacity: 1; transform: translateX(0)     scale(1); }
}
@keyframes f6gFromBelow {
  from { opacity: 0; transform: translateY(42px) scale(.96); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes f6gFromRight {
  from { opacity: 0; transform: translateX(70px) scale(.96); }
  to   { opacity: 1; transform: translateX(0)    scale(1); }
}

.f6g-meta { animation: f6gDrop .85s cubic-bezier(.22,1,.36,1) 1.15s backwards; }

@media (prefers-reduced-motion: reduce) {
  .f6g-nav, .f6g-line, .f6g-card, .f6g-meta {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
  .f6g-view, .f6g-view-inner, .f6g-overlay { transition: none; }
  .f6g-card:hover .f6g-view-inner { transform: scale(1); }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .f6g-pillnav { display: none; }
  .f6g-card { width: 78vw; }
}
`
