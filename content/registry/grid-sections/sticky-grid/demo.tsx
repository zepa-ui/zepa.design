"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   sticky-grid — sticky media beside scrolling steps

   Two columns. The right one is a stack of tall
   blocks you scroll through; the left one is a
   single sticky frame that swaps its clip to match
   whichever block you are level with.

   An IntersectionObserver watching the right column
   decides which step is active. The incoming clip
   does not simply fade — it resolves, running a
   short blur-and-contrast pass from 14px down to
   zero while it scales back from 1.08, so the swap
   reads as the image sharpening into place.

   The component owns its scroll container, so the
   observer is rooted to it rather than the window
   and the sticky column sticks inside it. That is
   what lets it sit in a preview frame without
   hijacking the page.

   Adapted from a section built for cohortdata.com,
   rewritten for the registry: no react-router, no
   Tailwind, no dependencies.
   ───────────────────────────────────────────── */

type Step = {
  number: string
  title: string
  description: string
  href: string
  media: string
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Browse the registry",
    description:
      "Heroes, grids, animations and illustrations, each one a working demo you can scrub through before you commit. No screenshots standing in for behaviour.",
    href: "https://zepa.design/components",
    media:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1781974779/samples/sea-turtle.mp4",
  },
  {
    number: "02",
    title: "Copy the source",
    description:
      "One command writes the component straight into your repo. What lands is plain React and plain CSS — no wrapper, no build step of ours, nothing to learn before you can read it.",
    href: "https://zepa.design/docs",
    media:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/110_bnaecb.mp4",
  },
  {
    number: "03",
    title: "Make it yours",
    description:
      "Every value is a named constant and every class is prefixed, so you can retune the motion, swap the palette, or gut half of it without fighting a library that assumed otherwise.",
    href: "https://zepa.design/components",
    media:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/111_ltcvxx.mp4",
  },
  {
    number: "04",
    title: "Ship it",
    description:
      "The code is yours outright. No version to bump, no breaking change arriving on someone else's schedule, no package release standing between you and a fix.",
    href: "https://zepa.design",
    media:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/109_jc84sb.mp4",
  },
]

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8H13M13 8L9 4M13 8L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StickyGrid() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLLIElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    /* Rooted to the component, not the window — the steps scroll inside
       .sg-root, so a viewport-rooted observer would never fire correctly in a
       preview frame.

       The source rebuilds this observer on every index change, because its
       effect lists activeIndex as a dependency. Nothing here reads that value
       during setup, so it is built once and left alone. */
    /* Same window as the reference — rootMargin -20%/-20% leaves the middle
       60% of the container — but the step is chosen by which one covers that
       window most, rather than by a single 0.7 threshold.

       The reference's fixed 0.7 threshold is knife-edge: at its own 85vh step
       against a 60vh window the deepest coverage possible is 60/85 = 0.706,
       so a step registers within about 4.5px of scroll on a 900px viewport —
       less than one wheel tick, which is how steps get skipped. Taking the
       largest of several reported ratios keeps the same behaviour, survives
       fast scrolling, and does not break when the step height changes. */
    const ratios = new Array(stepRefs.current.length).fill(0)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-index"))
          if (Number.isNaN(index)) continue
          ratios[index] = entry.isIntersecting ? entry.intersectionRatio : 0
        }
        let best = -1
        let bestRatio = 0
        for (let i = 0; i < ratios.length; i++) {
          if (ratios[i] > bestRatio) {
            bestRatio = ratios[i]
            best = i
          }
        }
        // nothing in the window mid-gap: hold the last one rather than reset
        if (best >= 0) setActive(best)
      },
      {
        root,
        threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
        rootMargin: "-20% 0px -20% 0px",
      },
    )

    for (const el of stepRefs.current) if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* Only the clip on screen decodes; the rest stay mounted and paused so a
     swap never reloads a src. */
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === active) {
        const p = v.play()
        if (p && typeof p.catch === "function") p.catch(() => {})
      } else {
        v.pause()
      }
    })
  }, [active])

  return (
    <div ref={rootRef} className="sg-root">
      <style>{CSS}</style>

      <div className="sg-inner">

        <div className="sg-cols">
          {/* sticky media, desktop only */}
          <div className="sg-media">
            <div className="sg-sticky">
              <div className="sg-frame">
                {STEPS.map((step, i) => (
                  <video
                    key={step.media}
                    ref={(el) => {
                      videoRefs.current[i] = el
                    }}
                    className={`sg-shot${i === active ? " is-active" : ""}`}
                    src={step.media}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-hidden={i !== active}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* the scrolling steps */}
          <ol className="sg-steps">
            {STEPS.map((step, i) => (
              <li
                key={step.number}
                data-index={i}
                ref={(el) => {
                  stepRefs.current[i] = el
                }}
                className={`sg-step${i === active ? " is-active" : ""}`}
              >
                <div className="sg-step-body">
                  <div className="sg-num">{step.number}</div>
                  <h3 className="sg-title">{step.title}</h3>
                  <p className="sg-desc">{step.description}</p>
                  <a
                    className="sg-link"
                    href={step.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Learn more <Arrow />
                  </a>
                </div>

                {/* the same clip, inline, for narrow screens where there is no
                    room for a sticky column */}
                <div className="sg-inline-shot">
                  <video
                    src={step.media}
                    muted
                    loop
                    playsInline
                    preload="none"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.sg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  background-color: #f3f3f3;
  color: #131313;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;
}
.sg-root::-webkit-scrollbar { display: none; }
.sg-root *, .sg-root *::before, .sg-root *::after { box-sizing: border-box; }

/* max-w-[1600px] mx-auto px-5 md:px-8, section py-16 md:py-24 */
.sg-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 48px 20px 0;
}

/* grid grid-cols-1 lg:grid-cols-2 gap-20 */
.sg-cols { display: grid; grid-template-columns: 1fr; gap: 32px; }

/* the media column is hidden until there are two columns to hold it */
.sg-media { display: none; position: relative; }

/* sticky top-24 h-[500px] xl:h-[700px] flex items-center justify-center */
.sg-sticky {
  position: sticky;
  top: 96px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sg-frame { position: relative; width: 100%; height: 100%; }

/* absolute inset-0 w-full h-full object-contain, transition-all duration-700 */
.sg-shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.95);
  filter: blur(24px);
  transition: opacity 0.7s ease-out, transform 0.7s ease-out, filter 0.7s ease-out;
  pointer-events: none;
}
.sg-shot.is-active {
  opacity: 1;
  transform: scale(1);
  filter: blur(0px);
  animation: sg-resolve 700ms ease-out;
}
/* the reference's pixelateReveal, unchanged */
@keyframes sg-resolve {
  0%   { filter: blur(14px) contrast(1.15) saturate(1.2); transform: scale(1.08); }
  50%  { filter: blur(6px) contrast(1.1); }
  100% { filter: blur(0px) contrast(1); transform: scale(1); }
}

.sg-steps { list-style: none; margin: 0; padding: 0; }

/* min-h-[70vh] lg:min-h-[85vh] flex items-center pl-6 border-l-4 */
/* Base is the reference's stacked mobile card: clip on top (column-reverse
   puts the last child first), then the copy. The step layout below arrives
   with the second column at lg. */
.sg-step {
  display: flex;
  flex-direction: column-reverse;
  margin-bottom: 32px;
  border-left: 0;
  transition: border-color 0.5s ease-out;
}
/* The active step's vertical rule. Uncomment both this and the border-left
   in the lg block below to bring it back. */
/* .sg-step.is-active { border-left-color: #266347; } */

/* ── the copy rises as its step becomes active ──
   Keyed off .is-active, so it replays every time the class lands on a step —
   no timers, no extra state. Each child is offset a little behind the last so
   the block assembles rather than arriving all at once. */
@keyframes sg-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sg-step.is-active .sg-num   { animation: sg-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.sg-step.is-active .sg-title { animation: sg-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) 70ms both; }
.sg-step.is-active .sg-desc  { animation: sg-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) 140ms both; }
.sg-step.is-active .sg-link  { animation: sg-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) 210ms both; }

/* text-[60px] font-semibold mb-6, text-black/10 -> #266347 when active */
.sg-num {
  font-size: 60px;
  line-height: 1;
  font-weight: 600;
  margin-bottom: 16px;
  font-variant-numeric: tabular-nums;
  color: rgba(0, 0, 0, 0.1);
  transition: color 0.5s ease-out;
}
.sg-step.is-active .sg-num { color: #266347; }

/* text-3xl md:text-6xl tracking-tight mb-8 */
.sg-title {
  margin: 0 0 22px;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.025em;
  font-weight: 600;
  color: #131313;
  transition: color 0.5s ease-out;
}
.sg-step.is-active .sg-title { color: #266347; }

/* text-xl leading-relaxed max-w-2xl */
.sg-desc {
  margin: 0;
  font-size: 20px;
  line-height: 1.625;
  color: #404040;
  max-width: 42rem;
}

/* mt-8 gap-2 text-[15px] font-semibold */
.sg-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  color: #266347;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
}
.sg-link:hover { text-decoration: underline; }
.sg-link:focus-visible { outline: 2px solid #266347; outline-offset: 3px; border-radius: 3px; }

/* the stacked mobile card: rounded-lg h-[250px], object-contain */
.sg-inline-shot {
  height: 250px;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}
.sg-inline-shot video { width: 100%; height: 100%; object-fit: contain; display: block; }

@media (min-width: 640px) {
  .sg-inline-shot { height: 300px; }
  .sg-num { font-size: 60px; }
  .sg-title { font-size: 36px; }
  .sg-desc { font-size: 18px; }
}

@media (min-width: 768px) {
  .sg-inner { padding: 68px 32px 0; }
}

/* lg: the two-column sticky layout switches on */
@media (min-width: 1024px) {
  .sg-cols { grid-template-columns: 1fr 1fr; gap: 80px; }
  .sg-media { display: block; }
  .sg-step {
    min-height: 72vh;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0;
    /* padding-left stays so the copy keeps its indent with the rule gone */
    padding-left: 24px;
    /* border-left: 4px solid transparent; */
  }
  .sg-inline-shot { display: none; }
  .sg-title { font-size: 60px; }
  .sg-desc { font-size: 20px; }
  /* Tail. The reference has a whole page below this section to scroll into;
     a self-contained component does not, so without it the last step can
     never travel far enough to satisfy threshold 0.7. */
  .sg-steps { padding-bottom: 34vh; }
}

@media (min-width: 1280px) {
  .sg-sticky { height: 700px; }
}

@media (prefers-reduced-motion: reduce) {
  .sg-shot { transition: none; filter: none; transform: none; }
  .sg-shot.is-active { animation: none; }
  .sg-step.is-active .sg-num,
  .sg-step.is-active .sg-title,
  .sg-step.is-active .sg-desc,
  .sg-step.is-active .sg-link { animation: none; }
  .sg-step, .sg-num, .sg-title { transition: none; }
}
`
