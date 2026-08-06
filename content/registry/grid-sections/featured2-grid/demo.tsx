"use client"

import React from "react"

/* ─────────────────────────────────────────────
   featured2-grid — glass bento over a sky video
   ─ 12-col bento: 7/5, then 5/7, then 3-up
   ─ frosted cards let the moving sky read
     straight through them
   ─ artwork bleeds to the card's bottom edge
   ───────────────────────────────────────────── */

const SKY =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1785156022/sky_yxiqww.mp4"

type Card = {
  title: string
  body: string
  img?: string
  span: "wide" | "narrow" | "third"
}

const CARDS: Card[] = [
  {
    title: "Canvas",
    body: "Make it once. Run it everywhere. Take any approved asset and multiply it. Resize, reformat, adapt for any channel, directly in Air.",
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1786038355/a1_ikho5s.webp",
    span: "wide",
  },
  {
    title: "Conversational Search",
    body: "Find anything. Even if you don't know what it's called. Search by color, object, face, or however you remember it.",
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1786038355/a2_tjlgap.webp",
    span: "narrow",
  },
  {
    title: "Reviews & Approvals",
    body: "Feedback that sticks. Pin comments directly to images or video timelines, track status in a Kanban board, and always know what's approved.",
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1786038355/a2_tjlgap.webp",
    span: "narrow",
  },
  {
    title: "Creative Intelligence",
    body: "Every asset becomes searchable the moment it lands in your library. Air auto-generates tags, summaries, and chapters without manual tagging.",
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1786038354/a3_pgpdfv.webp",
    span: "wide",
  },
  {
    title: "Libraries",
    body: "Organize your creative into flexible, access-controlled spaces by brand, campaign, or whatever works best for your team.",
    span: "third",
  },
  {
    title: "Desktop Sync",
    body: "Sync Air to your computer for instant access to assets. Open files in your creative tools, save changes, and everything is up to date automatically.",
    span: "third",
  },
  {
    title: "Content Collection",
    body: "Collect photos, videos, and files from photographers, partners, or clients with a simple upload form. No Air account needed.",
    span: "third",
  },
]

export default function Featured2Grid() {
  return (
    <section className="fg2-root">
      <style>{CSS}</style>

      {/* ── sky background ── */}
      <video className="fg2-sky" src={SKY} autoPlay muted loop playsInline preload="auto" />
      <div className="fg2-veil" aria-hidden />

      {/* ── heading ── */}
      <header className="fg2-head">
        <h2 className="fg2-title">
          Air unblocks creativity <em>at scale</em>.
        </h2>
        <p className="fg2-sub">
          Organize your work, approve what matters, and multiply it
          <br />
          across every channel. All in one place.
        </p>
      </header>

      {/* ── bento ── */}
      <div className="fg2-bento">
        {CARDS.map((c, i) => (
          <article
            key={c.title}
            className={`fg2-card fg2-card--${c.span}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <h3 className="fg2-card-title">{c.title}</h3>
            <p className="fg2-card-body">{c.body}</p>

            {c.img && (
              <div className="fg2-media">
                <img src={c.img} alt="" loading="lazy" />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

const CSS = `
/* ── Root ── */
.fg2-root {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #3a8ef6;
  color: #fff;
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
  padding: clamp(38px, 5vh, 84px) 0 clamp(48px, 7vh, 110px);
}

/* ── Sky ── */
.fg2-sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
/* keeps the headline legible wherever the clouds happen to be, and
   pushes the whole sky a touch bluer */
.fg2-veil {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg,
    rgba(14,80,190,.40) 0%,
    rgba(22,98,205,.31) 26%,
    rgba(26,105,212,.27) 100%);
  pointer-events: none;
}

/* ── Heading ── */
.fg2-head {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 1.5rem;
}
.fg2-title {
  margin: 0;
  font-size: clamp(24px, 1.9vw, 40px);
  font-weight: 600;
  letter-spacing: -.02em;
  line-height: 1.2;
  color: #fff;
  text-shadow: 0 1px 20px rgba(0,50,120,.18);
}
.fg2-title em {
  font-family: Georgia, "Times New Roman", serif;
  font-style: italic;
  font-weight: 400;
}
.fg2-sub {
  margin: clamp(10px, 1.5vh, 22px) auto 0;
  font-size: clamp(13px, .95vw, 20px);
  line-height: 1.55;
  color: rgba(255,255,255,.92);
  text-shadow: 0 1px 14px rgba(0,50,120,.16);
}
.fg2-sub br { display: none; }
@media (min-width: 800px) { .fg2-sub br { display: inline; } }

/* ── Bento ── */
.fg2-bento {
  position: relative;
  z-index: 2;
  width: min(72.5%, 1480px);
  margin: clamp(30px, 5vh, 76px) auto 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(14px, 1.85vw, 37px);
}
.fg2-card--wide   { grid-column: span 7; }
.fg2-card--narrow { grid-column: span 5; }
.fg2-card--third  { grid-column: span 4; }

/* ── Glass card ── */
.fg2-card {
  --pad: clamp(18px, 1.9vw, 38px);

  position: relative;
  display: flex;
  flex-direction: column;
  /* no bottom padding — artwork runs to the card's edge */
  padding: var(--pad) var(--pad) 0;
  border-radius: clamp(12px, .9vw, 19px);
  overflow: hidden;
  /* the deeper blue behind means the glass needs a little more milk
     and a brighter rim to stay legible */
  background: rgba(255,255,255,.155);
  border: 1px solid rgba(255,255,255,.34);
  backdrop-filter: blur(16px) saturate(1.25);
  -webkit-backdrop-filter: blur(16px) saturate(1.25);
  box-shadow: 0 18px 50px -28px rgba(0,40,110,.42);
}
/* light catching the top edge, the way frosted glass does */
.fg2-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg,
    rgba(255,255,255,.16) 0%,
    rgba(255,255,255,.04) 22%,
    rgba(255,255,255,0) 55%);
}
.fg2-card--wide,
.fg2-card--narrow { min-height: clamp(320px, 27.5vw, 560px); }
.fg2-card--third  {
  min-height: clamp(150px, 12.5vw, 255px);
  padding-bottom: var(--pad);
}

.fg2-card-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(17px, 1.3vw, 27px);
  font-weight: 500;
  letter-spacing: -.01em;
  color: #fff;
}
.fg2-card-body {
  position: relative;
  z-index: 1;
  margin: clamp(7px, .75vw, 15px) 0 0;
  font-size: clamp(12px, .85vw, 18px);
  line-height: 1.56;
  color: rgba(255,255,255,.88);
}

/* artwork — pushed to the bottom, bleeding past the side padding */
.fg2-media {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
  margin: clamp(16px, 1.9vw, 38px) calc(var(--pad) * -1) 0;
  overflow: hidden;
}
.fg2-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

/* ══════════════════════════════════════════════
   Entrance — "the glass condenses out of the sky"
   ~2000ms end to end. Cards begin as plain sky
   (no blur, no fill, no rim) and the frost forms
   in place; their contents rise a beat later.
   ══════════════════════════════════════════════ */

/* the sky eases out of a slow push-in */
.fg2-sky {
  animation: fg2Sky 2.2s cubic-bezier(.16,1,.3,1) backwards;
}
@keyframes fg2Sky {
  from { opacity: 0; transform: scale(1.09); }
  40%  { opacity: 1; }
  to   { opacity: 1; transform: scale(1); }
}
.fg2-veil { animation: fg2Fade 1.1s ease-out backwards; }
@keyframes fg2Fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* headline lifts through a blur, tracking settling as it sharpens */
.fg2-title {
  animation: fg2Focus .9s cubic-bezier(.22,1,.36,1) .05s backwards;
}
@keyframes fg2Focus {
  from {
    opacity: 0;
    transform: translateY(24px);
    letter-spacing: .05em;
    filter: blur(9px);
  }
  60% { opacity: 1; }
  to {
    opacity: 1;
    transform: translateY(0);
    letter-spacing: -.02em;
    filter: blur(0);
  }
}
/* the italic phrase arrives just behind the rest of the line */
.fg2-title em {
  display: inline-block;
  animation: fg2Em .8s cubic-bezier(.34,1.4,.64,1) .38s backwards;
}
@keyframes fg2Em {
  from { opacity: 0; transform: translateY(.22em) rotate(-2.5deg); }
  to   { opacity: 1; transform: translateY(0)     rotate(0deg); }
}

.fg2-sub {
  animation: fg2Rise .85s cubic-bezier(.22,1,.36,1) .2s backwards;
}
@keyframes fg2Rise {
  from { opacity: 0; transform: translateY(18px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* ── the frost forming — the signature move ──
   every property that makes the card look like glass starts at
   nothing, so at 0% you are looking straight at the sky */
.fg2-card {
  animation: fg2Frost 1s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.4s + var(--i) * .095s);
}
@keyframes fg2Frost {
  0% {
    opacity: 0;
    transform: translateY(44px) scale(.955);
    background-color: rgba(255,255,255,0);
    border-color: rgba(255,255,255,0);
    -webkit-backdrop-filter: blur(0px) saturate(1);
            backdrop-filter: blur(0px) saturate(1);
    box-shadow: 0 0 0 rgba(0,40,110,0);
  }
  45% { opacity: 1; }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    background-color: rgba(255,255,255,.155);
    border-color: rgba(255,255,255,.34);
    -webkit-backdrop-filter: blur(16px) saturate(1.25);
            backdrop-filter: blur(16px) saturate(1.25);
    box-shadow: 0 18px 50px -28px rgba(0,40,110,.42);
  }
}

/* contents settle onto the glass once it exists */
.fg2-card-title {
  animation: fg2In .65s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.58s + var(--i) * .095s);
}
.fg2-card-body {
  animation: fg2In .65s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.63s + var(--i) * .095s);
}
@keyframes fg2In {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* artwork rises into the frame, unmasking from the bottom */
.fg2-media {
  animation: fg2Reveal .78s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(.68s + var(--i) * .095s);
}
@keyframes fg2Reveal {
  from { opacity: 0; transform: translateY(26px); clip-path: inset(100% 0 0 0); }
  to   { opacity: 1; transform: translateY(0);    clip-path: inset(0 0 0 0); }
}

@media (prefers-reduced-motion: reduce) {
  .fg2-sky, .fg2-veil, .fg2-title, .fg2-title em, .fg2-sub,
  .fg2-card, .fg2-card-title, .fg2-card-body, .fg2-media {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: none;
    letter-spacing: normal;
  }
  .fg2-title { letter-spacing: -.02em; }
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .fg2-bento { width: min(92%, 900px); }
  .fg2-card--wide, .fg2-card--narrow { grid-column: span 12; }
  .fg2-card--third { grid-column: span 12; }
  .fg2-card--wide, .fg2-card--narrow { min-height: clamp(300px, 58vw, 460px); }
}
`
