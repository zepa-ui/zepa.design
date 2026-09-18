"use client"

import { useEffect, useRef } from "react"

/* ─────────────────────────────────────────────
   slider-animation — snapping 3D slide transition

   A vertical scroll-snap rail where each slide is a
   card standing in 2000px of perspective. As a slide
   travels through the viewport it rotates from -40°
   on both X and Y, through flat at dead centre, out
   to +40° — so it turns toward you, squares up as it
   snaps, then turns away. Scale rides 0.8 → 1 → 0.8
   underneath it, and the caption drifts vertically
   and forward in Z on its own track.

   Ported from a Webflow project. Webflow keeps its
   interactions as an IX2 data blob rather than as
   CSS, so the keyframes below were read out of the
   exported webflow.js — a single SCROLLING_IN_VIEW
   event on .section driving its children. The
   easing is not an easing at all: IX2 damps the raw
   scroll value with a per-frame lerp whose alpha is
   max(1 - smoothing/100, 0.01), and this interaction
   ships smoothing 86, hence 0.14.

   Rebuilt to be embed-safe: the component owns its
   scroll container, all sizing comes from its own
   width rather than vw, and every class is prefixed.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"

type Slide = { src: string; word: string; href: string; label: string }

/** All four are square; the card is taller than it is wide, so `cover` trims the sides. */
const PHOTOS = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518882/WhatsApp_Image_2024-12-11_at_14.19.21_mpsdlf.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/vivek_i01gjp.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781705172/samevans_hf73xr.jpg",
]

const WORDS = ["Handcraft", "Open Source", "Copy Paste", "Ship Ready"]

/**
 * Four unique slides, then the first repeated.
 *
 * The repeat is the reference's own trick: the rail does not loop, so ending on
 * a copy of the opening slide means scrolling off the bottom lands somewhere
 * that looks like the beginning.
 */
const SLIDES: Slide[] = [...Array(5)].map((_, i) => {
  const n = i % PHOTOS.length
  return {
    src: PHOTOS[n],
    word: WORDS[n],
    href: "https://zepa.design",
    label: "zepa.design ↗",
  }
})

/* ── the IX2 keyframes, read out of webflow.js ──
   Each track is [scroll keyframe 0-100, value]. Values between stops are
   linearly interpolated, which is what IX2 does for a continuous action. */

type Track = [number, number][]

/** applied to both rotateX and rotateY — the reference keys them identically */
const ROTATE: Track = [
  [0, -40],
  [50, 0],
  [100, 40],
]
const OPACITY: Track = [
  [0, 0],
  [10, 1],
  [50, 1],
  [90, 0],
  [100, 0],
]
const SCALE: Track = [
  [0, 0.8],
  [50, 1],
  [100, 0.8],
]
/** caption drift, in the reference's vw units */
const TEXT_Y: Track = [
  [0, -10],
  [50, 0],
  [100, 10],
]
/** caption depth, in px */
const TEXT_Z: Track = [
  [0, 60],
  [50, 0],
  [100, 60],
]

/** smoothing: 86 → max(1 - 0.86, 0.01) */
const ALPHA = 0.14

function sample(track: Track, progress: number) {
  const k = progress * 100
  if (k <= track[0][0]) return track[0][1]
  for (let i = 1; i < track.length; i++) {
    const [k0, v0] = track[i - 1]
    const [k1, v1] = track[i]
    if (k <= k1) return v0 + ((v1 - v0) * (k - k0)) / (k1 - k0)
  }
  return track[track.length - 1][1]
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

export default function SliderAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const sections = Array.from(
      root.querySelectorAll<HTMLElement>("[data-section]"),
    )
    if (!sections.length) return

    const items = sections.map((section) => ({
      section,
      slide: section.querySelector<HTMLElement>("[data-slide]"),
      text: section.querySelector<HTMLElement>("[data-text]"),
      /** the damped value IX2 would be holding */
      current: 0,
      primed: false,
      /** cached so the frame loop never touches layout */
      centre: 0,
      /** last values written, so identical frames cost nothing */
      wroteT: "",
      wroteO: "",
      wroteTextT: "",
    }))

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reduced = motionQuery.matches

    /* ── geometry, measured only when it can actually change ──
       offsetTop/offsetHeight force layout. Reading them inside the frame loop
       — after the previous iteration has written a transform — makes the
       browser flush layout again on every single slide, every frame. Cached
       here instead, so a frame is pure arithmetic and pure writes.

       The reference is written in vw; republishing the root's own width as a
       custom property keeps CSS and JS agreeing when the component is
       embedded in something narrower than the viewport. */
    let vh = 0
    let vw = 0
    const measure = () => {
      vh = root.clientHeight
      vw = root.clientWidth
      root.style.setProperty("--sl-vw", `${vw / 100}px`)
      for (const item of items) {
        item.centre = item.section.offsetTop + item.section.offsetHeight / 2
      }
    }
    measure()

    const round = (n: number, dp: number) => {
      const f = 10 ** dp
      return Math.round(n * f) / f
    }

    const apply = (item: (typeof items)[number]) => {
      const p = item.current
      const { slide, text } = item

      if (slide) {
        const r = round(sample(ROTATE, p), 2)
        const s = round(sample(SCALE, p), 4)
        const t = `rotateX(${r}deg) rotateY(${r}deg) scale(${s})`
        if (t !== item.wroteT) {
          slide.style.transform = t
          item.wroteT = t
        }
        const o = String(round(sample(OPACITY, p), 3))
        if (o !== item.wroteO) {
          slide.style.opacity = o
          item.wroteO = o
        }
      }

      if (text) {
        // vw resolved against the component, not the window
        const y = round((sample(TEXT_Y, p) / 100) * vw, 2)
        const z = round(sample(TEXT_Z, p), 2)
        const t = `translate3d(0px, ${y}px, ${z}px)`
        if (t !== item.wroteTextT) {
          text.style.transform = t
          item.wroteTextT = t
        }
      }
    }

    /**
     * Progress for one section, 0..1.
     *
     * 0.5 is dead centre. 0 is a full viewport below centre and 1 a full
     * viewport above, which — because the sections are exactly one viewport
     * tall and snap centred — puts each neighbour at an endpoint while the
     * current slide sits flat.
     */
    const targetOf = (centreOffset: number, scrollCentre: number) =>
      clamp01(0.5 - (centreOffset - scrollCentre) / (2 * vh))

    /* ── the frame loop ──
       IX2 damps by a fixed fraction *per frame*, which silently ties the feel
       to the refresh rate: the same gesture settles twice as fast on a 120Hz
       screen and stutters whenever a frame is dropped. Converting that fixed
       fraction into a per-millisecond rate reproduces the reference exactly at
       60Hz and holds it everywhere else. */
    const PER_FRAME_60 = 16.666666
    let frame = 0
    let running = false
    let lastTime = 0

    const tick = (now: number) => {
      const dt = lastTime ? Math.min(now - lastTime, 100) : PER_FRAME_60
      lastTime = now
      const alpha = reduced ? 1 : 1 - (1 - ALPHA) ** (dt / PER_FRAME_60)

      const scrollCentre = root.scrollTop + vh / 2
      let moving = false

      for (const item of items) {
        const target = targetOf(item.centre, scrollCentre)
        if (!item.primed) {
          // settle instantly on the first frame, so the opening slide is not
          // animated in from wherever zero happens to be
          item.current = target
          item.primed = true
        } else if (Math.abs(target - item.current) < 0.0004) {
          item.current = target
        } else {
          item.current += (target - item.current) * alpha
          moving = true
        }
        apply(item)
      }

      // Nothing left to interpolate — stop burning frames until something
      // actually happens. A scroll or a resize wakes it again.
      if (moving) {
        frame = requestAnimationFrame(tick)
      } else {
        running = false
        lastTime = 0
      }
    }

    const wake = () => {
      if (running) return
      running = true
      lastTime = 0
      frame = requestAnimationFrame(tick)
    }
    wake()

    const onScroll = () => wake()
    root.addEventListener("scroll", onScroll, { passive: true })

    const ro = new ResizeObserver(() => {
      measure()
      // geometry moved, so the cached px values are stale
      for (const item of items) {
        item.wroteT = ""
        item.wroteO = ""
        item.wroteTextT = ""
      }
      wake()
    })
    ro.observe(root)

    const onMotionChange = (e: MediaQueryListEvent) => {
      reduced = e.matches
      wake()
    }
    motionQuery.addEventListener("change", onMotionChange)

    return () => {
      cancelAnimationFrame(frame)
      running = false
      root.removeEventListener("scroll", onScroll)
      motionQuery.removeEventListener("change", onMotionChange)
      ro.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} className="sl-root">
      <style>{CSS}</style>

      <header className="sl-head">
        <img className="sl-logo" src={LOGO} alt="Zepa" draggable={false} />
      </header>

      {SLIDES.map((slide, i) => (
        <div key={i} data-section="" className="sl-section">
          <div data-slide="" className="sl-slide">
            <img
              className="sl-img"
              src={slide.src}
              alt=""
              loading="eager"
              draggable={false}
            />
            <div data-text="" className="sl-text">
              <div className="sl-heading">{slide.word}</div>
              <a
                className="sl-link"
                href={slide.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                {slide.label}
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const CSS = `
.sl-root {
  --sl-vw: 1vw;
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: y mandatory;
  perspective: 2000px;
  background-color: #131313;
  color: #ffffff;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;
}
.sl-root::-webkit-scrollbar { display: none; }
.sl-root *, .sl-root *::before, .sl-root *::after { box-sizing: border-box; }

.sl-head {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  padding: calc(var(--sl-vw) * 2) calc(var(--sl-vw) * 2.5);
  pointer-events: none;
  z-index: 10;
}
.sl-logo {
  width: min(calc(var(--sl-vw) * 12), 150px);
  max-height: 7vh;
  height: auto;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}

.sl-section {
  scroll-snap-align: center;
  perspective: 2000px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  height: 100svh;
}

.sl-slide {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 98%;
  /* the caption's translateZ only reads as depth if the card keeps its
     children in 3D — IX2 sets this itself, the exported CSS does not */
  transform-style: preserve-3d;
  will-change: transform, opacity;
  /* the card turns to ±40°, so its reverse face would otherwise flash at the
     steepest part of the turn */
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.sl-img {
  object-fit: cover;
  border-radius: calc(var(--sl-vw) * 2);
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
}

.sl-text {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 10%;
  left: -10%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  pointer-events: none;
  will-change: transform;
}

.sl-heading {
  margin-bottom: calc(var(--sl-vw) * 0.5);
  margin-left: calc(var(--sl-vw) * -3);
  font-size: calc(var(--sl-vw) * 8);
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.sl-link {
  color: rgba(255, 255, 255, 0.5);
  font-size: calc(var(--sl-vw) * 3);
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
  transition: color 0.2s;
  pointer-events: auto;
}
.sl-link:hover { color: #ffffff; }

@media (max-width: 848px) {
  .sl-slide { width: 82%; height: 62%; }
  .sl-heading { font-size: calc(var(--sl-vw) * 13); margin-left: calc(var(--sl-vw) * -2); }
  .sl-link { font-size: calc(var(--sl-vw) * 5); }
  .sl-text { left: -4%; bottom: -12%; }
  .sl-logo { width: min(calc(var(--sl-vw) * 30), 130px); }
}
`
