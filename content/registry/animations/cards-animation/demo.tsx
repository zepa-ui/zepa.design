"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import gsap from "gsap"

/* ─────────────────────────────────────────────
   cards-animation — the deal-in carousel wheel

   Eighteen cards fly in from alternating sides,
   spinning and scaling down from four times their
   size, then settle onto a giant wheel whose pivot
   sits 200vh below the stage — so only the top arc
   is ever on screen and the cards fan out like a
   hand being dealt.

   Scrolling turns the wheel. The component owns its
   own scroll container (a tall track under a sticky
   stage), so it reads its own scrollTop and never
   touches window scroll or position:fixed.

   Most cards are monochrome; a few are duotoned warm
   or cool so the wheel reads as one object with two
   accents rather than eighteen competing photos.

   Click a card and it lifts out of the wheel to the
   centre, drops every filter, and opens its detail
   panel. Escape or the backdrop sends it back.

   Deal-in choreography after a GSAP study by
   @deadrabbbbit, itself inspired by the Hyundai site.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781877270/zepalogo1_bnzxuc.png"

/** tint: which cards break the monochrome — 2 warm, 2 cool per set of nine */
type Tint = "mono" | "warm" | "cool"

type Card = {
  src: string
  title: string
  kind: string
  body: string
  tint: Tint
}

const BASE: Card[] = [
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
    title: "Selfie Hero",
    kind: "Hero section",
    body: "A hero that greets the visitor with their own reflection — camera-lit, permission-gated, and gracefully blank when the answer is no.",
    tint: "mono",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
    title: "Paper Grid",
    kind: "Grid section",
    body: "Three certificates printed on glass, bending like real paper. The curl is integrated along the sheet, so the silhouette pulls in where the page turns away.",
    tint: "warm",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/03_sceom4.png",
    title: "Zaveda Interface",
    kind: "Hero section",
    body: "A savings-app hero on soft lilac, with three phones fanned and a live earnings readout built from real digit wheels.",
    tint: "mono",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/04_dpquqc.png",
    title: "Companion Grid",
    kind: "Grid section",
    body: "A train of polaroids clears away one at a time as you scroll, revealing the line underneath. Starts on the last card and ends on the first.",
    tint: "cool",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
    title: "Scrolldown Hero",
    kind: "Hero section",
    body: "Trading cards float up on buttery easing while the background marquee drifts sideways and speeds up with your scroll velocity.",
    tint: "mono",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/06_p0lonf.png",
    title: "Wave Hero",
    kind: "Hero section",
    body: "A displacement field runs across the type so the headline reads as something seen through moving water rather than sitting on top of it.",
    tint: "warm",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/07_wzzq5u.png",
    title: "Osmos Hero",
    kind: "Hero section",
    body: "Soft bodies drift, meet and merge under a metaball threshold — no physics engine, just a distance field resolved per pixel.",
    tint: "mono",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
    title: "Drops Hero",
    kind: "Hero section",
    body: "An image trail that follows the cursor and thins out as it goes, each drop inheriting a little less of the last one's momentum.",
    tint: "cool",
  },
  {
    src: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
    title: "Bluish Hero",
    kind: "Hero section",
    body: "A cold-lit landing surface where the gradient is doing the typography's job, and the copy simply stays out of its way.",
    tint: "mono",
  },
]

/** served at the card's own aspect so the wheel is not fetching nine originals */
const fit = (u: string) =>
  u.replace("/upload/", "/upload/c_fill,w_520,h_740,g_auto/")

const CARDS: Card[] = [...BASE, ...BASE].map((c) => ({ ...c, src: fit(c.src) }))

/** how far the wheel turns across the full scroll track */
const SPIN_DEGREES = 360

export default function CardsAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  /* the panel has to stay mounted while it animates out, so closing is a
     state of its own rather than just clearing `open` */
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const CLOSE_MS = 300

  const openCard = useCallback((i: number) => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setClosing(false)
    setOpen(i)
  }, [])

  const close = useCallback(() => {
    if (closeTimer.current !== null) return // already on the way out
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      setOpen(null)
      setClosing(false)
      closeTimer.current = null
    }, CLOSE_MS)
  }, [])

  // never leave a timer running past unmount
  useEffect(
    () => () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current)
    },
    []
  )

  /* ── entrance: the deal-in ─────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current
    const itemsEl = itemsRef.current
    if (!root || !itemsEl) return

    /* context scopes every selector below to this root and gives us one
       revert() that undoes each tween and inline style on unmount */
    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray<HTMLElement>(".ca-item")
      const imageSize = images.length
      const degree = 360 / imageSize

      gsap.set(itemsEl, { transformOrigin: "center 200vh" })

      const timeline = gsap.timeline()

      images.forEach((image, index) => {
        const sign = Math.floor((index / 2) % 2) ? 1 : -1
        const value = Math.floor((index + 4) / 4) * 4
        const rotation = index > imageSize - 3 ? 0 : sign * value

        gsap.set(image, { rotation, scale: 0.5 })

        timeline.from(
          image,
          {
            /* the original threw these off the window's edges; the stage's
               own box is what a registry component may measure */
            x: () =>
              index % 2
                ? root.clientWidth + image.clientWidth * 4
                : -root.clientWidth - image.clientWidth * 4,
            y: () => root.clientHeight - image.clientHeight,
            rotation: index % 2 ? 200 : -200,
            scale: 4,
            opacity: 1,
            ease: "power4.out",
            duration: 1,
            delay: 0.15 * Math.floor(index / 2),
          },
          0
        )

        timeline.to(image, { scale: 1, duration: 0 }, 0.15 * (imageSize / 2 - 1) + 1)

        timeline.to(
          image,
          {
            transformOrigin: "center 200vh",
            rotation:
              index > imageSize / 2 ? -degree * (imageSize - index) : index * degree,
            duration: 1,
            ease: "power1.out",
          },
          0.15 * (imageSize / 2 - 1) + 1
        )
      })

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timeline.progress(1).pause()
      }
    }, root)

    return () => ctx.revert()
  }, [])

  /* ── scroll turns the wheel ────────────────────────────────────────── */
  useEffect(() => {
    const root = rootRef.current
    const itemsEl = itemsRef.current
    if (!root || !itemsEl) return

    let raf = 0
    let cur = root.scrollTop

    const tick = () => {
      raf = requestAnimationFrame(tick)

      /* the component's own scroll position, never the window's — a
         registry component can be embedded anywhere and must not
         assume it owns the page */
      const target = root.scrollTop
      cur += (target - cur) * 0.09 // lenis-style ease
      if (Math.abs(target - cur) < 0.05) cur = target

      const travel = root.scrollHeight - root.clientHeight
      const p = travel > 0 ? Math.min(1, Math.max(0, cur / travel)) : 0
      /* driven through gsap rather than the CSS rotate property, so the
         wheel shares one transform (and one transform-origin) with the
         cards instead of composing rotate and transform separately */
      gsap.set(itemsEl, { rotation: -p * SPIN_DEGREES })
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ── Escape closes the detail panel ────────────────────────────────── */
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, close])

  const active = open === null ? null : CARDS[open]

  return (
    <div
      ref={rootRef}
      className={"ca-root" + (open !== null ? " ca-root--locked" : "")}
    >
      <style>{CSS}</style>

      <div className="ca-track">
        <div className="ca-stage">
          <div className="ca-logo">
            <img src={LOGO} alt="Zepa" draggable={false} />
          </div>

          <div className="ca-container">
            <div className="ca-center">
              <div ref={itemsRef} className="ca-items">
                {CARDS.map((card, i) => (
                  <div className="ca-item" key={i}>
                    <div
                      className={"ca-card ca-card--" + card.tint}
                      role="button"
                      tabIndex={0}
                      aria-label={"Open " + card.title}
                      onClick={() => openCard(i)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          openCard(i)
                        }
                      }}
                    >
                      <img className="ca-image" src={card.src} alt="" draggable={false} />
                      <span className="ca-card-tag">{card.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="ca-hint">Scroll to turn · Click a card to open</p>

          {/* ── detail panel ── */}
          {active && (
            <div
              className={"ca-detail" + (closing ? " ca-detail--closing" : "")}
              onClick={close}
              role="presentation"
            >
              <div
                className="ca-detail-inner"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={active.title}
              >
                <div className="ca-detail-card">
                  <img src={active.src} alt="" draggable={false} />
                </div>

                <div className="ca-detail-copy">
                  <span className="ca-detail-kind">{active.kind}</span>
                  <h2>{active.title}</h2>
                  <p>{active.body}</p>
                  <button type="button" className="ca-detail-close" onClick={close}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CSS = `
.ca-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #ffffff;
  color: #000000;
  font-weight: 600;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: none;
}
.ca-root::-webkit-scrollbar { display: none; }
.ca-root--locked { overflow: hidden; }

.ca-root *,
.ca-root *::before,
.ca-root *::after { box-sizing: border-box; }

/* the scroll runway — its length sets how far one turn takes */
.ca-track { position: relative; width: 100%; height: 400vh; }

.ca-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

/* the logo reads as the section's title, so it is sized like one —
   capped in vh as well as vw so it cannot crowd the wheel, which
   starts at 28% of the stage */
.ca-logo {
  position: absolute;
  z-index: 20;
  top: clamp(20px, 4vh, 52px);
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
.ca-logo img {
  display: block;
  height: min(clamp(52px, 7.4vw, 132px), 15vh);
  width: auto;
  user-select: none;
  -webkit-user-select: none;
}

.ca-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.ca-center {
  height: 100vh;
  position: absolute;
  left: 50%;
  top: 28%;
  transform: translate(-50%);
  user-select: none;
  -webkit-user-select: none;
}

.ca-items {
  transform-origin: center 200vh;
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  will-change: transform;
}

.ca-item {
  position: absolute;
  user-select: none;
  -webkit-user-select: none;
  transform: translateX(-50%);
}

.ca-card {
  display: block;
  width: 430px;
  height: 610px;
  color: #fff;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 17px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 4px solid #000000;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.ca-card:active { transform: scale(0.97); }
.ca-card:focus-visible { outline: 3px solid #ff6a1f; outline-offset: 4px; }

.ca-image {
  height: 100%;
  width: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  transition: filter 0.4s ease;
}

/* duotone via filters, so the accent is the same regardless of the photo */
.ca-card--mono .ca-image { filter: grayscale(1) contrast(1.05); }
.ca-card--warm .ca-image {
  filter: grayscale(1) sepia(1) saturate(4.2) hue-rotate(-12deg) contrast(1.02);
}
.ca-card--cool .ca-image {
  filter: grayscale(1) sepia(1) saturate(4.6) hue-rotate(178deg) contrast(1.02);
}
.ca-card:hover .ca-image { filter: none; }

.ca-card-tag {
  position: absolute;
  left: 14px;
  bottom: 14px;
  z-index: 2;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.ca-card:hover .ca-card-tag { opacity: 1; }

.ca-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 26px;
  z-index: 20;
  margin: 0;
  text-align: center;
  pointer-events: none;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.42);
}

/* ── detail panel ── */
.ca-detail {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: caFade 0.3s ease both;
}
@keyframes caFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes caFadeOut { from { opacity: 1; } to { opacity: 0; } }

.ca-detail-inner {
  display: flex;
  align-items: center;
  gap: 44px;
  max-width: 940px;
  width: 100%;
  animation: caRise 0.46s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes caRise {
  from { opacity: 0; transform: translateY(30px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes caSink {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(18px) scale(0.96); }
}

/* the artwork leads on the way in and trails on the way out, so the panel
   reads as the card growing rather than a box appearing over it */
.ca-detail-card {
  flex: 0 0 auto;
  width: 320px;
  height: 454px;
  border-radius: 17px;
  overflow: hidden;
  border: 5px solid #000000;
  box-shadow: 0 40px 90px -30px rgba(0, 0, 0, 0.5);
  animation: caCardIn 0.52s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes caCardIn {
  from { opacity: 0; transform: scale(0.82) rotate(-4deg); }
  to   { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes caCardOut {
  from { opacity: 1; transform: scale(1) rotate(0deg); }
  to   { opacity: 0; transform: scale(0.88) rotate(3deg); }
}
.ca-detail-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* the copy comes in just behind the artwork */
.ca-detail-kind,
.ca-detail-copy h2,
.ca-detail-copy p,
.ca-detail-close {
  animation: caCopyIn 0.44s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ca-detail-kind      { animation-delay: 0.08s; }
.ca-detail-copy h2   { animation-delay: 0.13s; }
.ca-detail-copy p    { animation-delay: 0.18s; }
.ca-detail-close     { animation-delay: 0.23s; }
@keyframes caCopyIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── on the way out ── */
.ca-detail--closing { animation: caFadeOut 0.3s ease both; }
.ca-detail--closing .ca-detail-inner { animation: caSink 0.3s cubic-bezier(0.4, 0, 1, 1) both; }
.ca-detail--closing .ca-detail-card { animation: caCardOut 0.3s cubic-bezier(0.4, 0, 1, 1) both; }
.ca-detail--closing .ca-detail-kind,
.ca-detail--closing .ca-detail-copy h2,
.ca-detail--closing .ca-detail-copy p,
.ca-detail--closing .ca-detail-close {
  animation: caFadeOut 0.18s ease both;
  animation-delay: 0s;
}

.ca-detail-copy { flex: 1 1 auto; min-width: 0; }
.ca-detail-kind {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 14px;
}
.ca-detail-copy h2 {
  margin: 0 0 14px;
  font-size: clamp(30px, 3.6vw, 52px);
  line-height: 1.03;
  letter-spacing: -0.035em;
  font-weight: 700;
}
.ca-detail-copy p {
  margin: 0 0 26px;
  font-size: 16px;
  line-height: 1.6;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.66);
  max-width: 46ch;
}
.ca-detail-close {
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #000000;
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ca-detail-close:hover { opacity: 0.82; }

@media screen and (max-height: 1000px) {
  .ca-card { width: 350px; height: 497px; }
}
@media screen and (max-height: 800px) {
  .ca-card { width: 300px; height: 400px; }
}

@media (max-width: 820px) {
  .ca-detail-inner { flex-direction: column; gap: 24px; text-align: center; }
  .ca-detail-card { width: 210px; height: 298px; border-width: 4px; }
  .ca-detail-copy p { margin-inline: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .ca-detail,
  .ca-detail-inner,
  .ca-detail-card,
  .ca-detail-kind,
  .ca-detail-copy h2,
  .ca-detail-copy p,
  .ca-detail-close,
  .ca-detail--closing,
  .ca-detail--closing .ca-detail-inner,
  .ca-detail--closing .ca-detail-card { animation: none; }
  .ca-card, .ca-image, .ca-card-tag { transition: none; }
  .ca-card:active { transform: none; }
}
`
