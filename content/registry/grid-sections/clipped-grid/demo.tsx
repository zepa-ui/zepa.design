"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   clipped-grid — notched video stage with tabbed
   content

   One big video frame cut by a seven-point polygon:
   a chamfer off the top-right corner and a step
   bitten out of the bottom-left. The bite is not
   decoration — the floating tab rail sits in it, so
   the controls read as part of the frame rather than
   as something dropped on top of it.

   Switching a tab crossfades the video underneath
   and replays the glass card in the centre. All four
   videos stay mounted and only the active one is
   played, which avoids the reload flash you get from
   swapping a single element's src.

   Adapted from a section built for cohortdata.com.
   Rewritten for the registry: the original leaned on
   framer-motion and lucide-react, and every component
   in this category ships with no dependencies, so the
   crossfades are CSS and the icons are inline.
   ───────────────────────────────────────────── */

type Task = {
  title: string
  meta: string
  status: "completed" | "progress" | "pending"
}

type Item = {
  label: string
  icon: "layers" | "grid" | "spark" | "pen"
  video: string
  card: {
    heading: string
    badge: string
    goal: string
    tasks: Task[]
    footLeft: string
    footRight: string
  }
}

const ITEMS: Item[] = [
  {
    label: "Hero Sections",
    icon: "layers",
    video:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1781974779/samples/sea-turtle.mp4",
    card: {
      heading: "Hero Sections",
      badge: "Source",
      goal: "Drop a full-bleed hero into a fresh Next.js app and make it yours.",
      tasks: [
        { title: "Resolve registry entry", meta: "Completed in 0.3s", status: "completed" },
        { title: "Fetch component source", meta: "Completed in 1.1s", status: "completed" },
        { title: "Write files into your repo", meta: "In progress… 2s", status: "progress" },
        { title: "Install peer dependencies", meta: "Pending", status: "pending" },
      ],
      footLeft: "2/4 steps complete",
      footRight: "No package to update",
    },
  },
  {
    label: "Grid Sections",
    icon: "grid",
    video:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/110_bnaecb.mp4",
    card: {
      heading: "Grid Sections",
      badge: "Bento",
      goal: "Assemble a feature grid where every tile does something on hover.",
      tasks: [
        { title: "Pick a bento layout", meta: "Completed in 0.6s", status: "completed" },
        { title: "Wire tile interactions", meta: "Completed in 3.4s", status: "completed" },
        { title: "Swap in your own copy", meta: "In progress… 9s", status: "progress" },
        { title: "Tune the breakpoints", meta: "Pending", status: "pending" },
      ],
      footLeft: "2/4 steps complete",
      footRight: "Yours to edit",
    },
  },
  {
    label: "Animations",
    icon: "spark",
    video:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/111_ltcvxx.mp4",
    card: {
      heading: "Animations",
      badge: "Scroll",
      goal: "Add a scroll-driven reveal that owns its own container, not the page.",
      tasks: [
        { title: "Mount the scroll container", meta: "Completed in 0.4s", status: "completed" },
        { title: "Bind the timeline", meta: "Completed in 2.2s", status: "completed" },
        { title: "Tune the runway", meta: "In progress… 14s", status: "progress" },
        { title: "Check reduced motion", meta: "Pending", status: "pending" },
      ],
      footLeft: "2/4 steps complete",
      footRight: "No layout shift",
    },
  },
  {
    label: "Illustrations",
    icon: "pen",
    video:
      "https://res.cloudinary.com/dzvffb6vv/video/upload/v1786286194/109_jc84sb.mp4",
    card: {
      heading: "Illustrations",
      badge: "Zero deps",
      goal: "Place an interactive illustration that ships without a single package.",
      tasks: [
        { title: "Copy the single file", meta: "Completed in 0.2s", status: "completed" },
        { title: "Inline the SVG defs", meta: "Completed in 0.9s", status: "completed" },
        { title: "Match your palette", meta: "In progress… 6s", status: "progress" },
        { title: "Ship it", meta: "Pending", status: "pending" },
      ],
      footLeft: "2/4 steps complete",
      footRight: "0 dependencies",
    },
  },
]

/* ── inline icons, so the component needs no icon package ── */

function Icon({ name }: { name: Item["icon"] }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  if (name === "layers")
    return (
      <svg {...common}>
        <path d="M12 3 3 8l9 5 9-5-9-5Z" />
        <path d="m3 14 9 5 9-5" />
      </svg>
    )
  if (name === "grid")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  if (name === "spark")
    return (
      <svg {...common}>
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="M12 19l7-7 3 3-7 7-3-3Z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  )
}

function StatusMark({ status }: { status: Task["status"] }) {
  if (status === "completed")
    return (
      <svg className="cg-mark cg-mark--done" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8 12.5 2.6 2.6L16 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  if (status === "progress")
    return (
      <svg className="cg-mark cg-mark--busy" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeDasharray="44" strokeDashoffset="14" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg className="cg-mark cg-mark--idle" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export default function ClippedGrid() {
  const [active, setActive] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  /* Every clip stays mounted so switching never reloads a src, but only the
     visible one is decoding. */
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

  const item = ITEMS[active]

  return (
    <div className="cg-root">
      <style>{CSS}</style>

      <div className="cg-inner">
        <header className="cg-top">
          <h2 className="cg-title">Every section, ready to paste</h2>
          <p className="cg-lede">
            Zepa ships heroes, grids, animations and illustrations as source you
            own outright. Copy a component in, change whatever you like, and
            never wait on a package release again.
          </p>
        </header>

        <div className="cg-stage">
          <div className="cg-tabs" role="tablist" aria-label="Registry sections">
            {ITEMS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`cg-tab${i === active ? " is-active" : ""}`}
                onClick={() => setActive(i)}
              >
                <Icon name={t.icon} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* the notch in the bottom-left is where the tab rail sits */}
          <div className="cg-frame">
            {ITEMS.map((t, i) => (
              <video
                key={t.video}
                ref={(el) => {
                  videoRefs.current[i] = el
                }}
                className={`cg-video${i === active ? " is-active" : ""}`}
                src={t.video}
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden={i !== active}
              />
            ))}

            <div className="cg-scrim" />

            <div className="cg-cardwrap">
              {/* keyed so the entry animation replays on every tab change */}
              <div key={active} className="cg-card">
                <div className="cg-card-head">
                  <h3 className="cg-card-title">{item.card.heading}</h3>
                  <span className="cg-badge">{item.card.badge}</span>
                </div>

                <div className="cg-goal">
                  <p className="cg-goal-label">Goal</p>
                  <p className="cg-goal-text">{item.card.goal}</p>
                </div>

                <ul className="cg-tasks">
                  {item.card.tasks.map((task) => (
                    <li key={task.title} className="cg-task">
                      <StatusMark status={task.status} />
                      <div>
                        <p className={`cg-task-title cg-task-title--${task.status}`}>
                          {task.title}
                        </p>
                        <p className="cg-task-meta">{task.meta}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="cg-card-foot">
                  <span>{item.card.footLeft}</span>
                  <span>{item.card.footRight}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CSS = `
.cg-root {
  position: relative;
  width: 100%;
  background-color: #f3f3f3;
  color: #131313;
  /* asymmetric on purpose — the heading needs air above it, the frame does
     not need the same below */
  padding: clamp(64px, 7vw, 120px) 0 clamp(28px, 3.2vw, 56px);
  overflow: hidden;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.cg-root *, .cg-root *::before, .cg-root *::after { box-sizing: border-box; }

.cg-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 clamp(16px, 3vw, 24px);
}

.cg-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(20px, 3.2vw, 44px);
  align-items: start;
  margin-bottom: clamp(18px, 2.2vw, 30px);
}
.cg-title {
  margin: 0;
  font-size: clamp(24px, 2.9vw, 38px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
  max-width: 16ch;
}
.cg-lede {
  margin: 0;
  font-size: clamp(14px, 1.05vw, 16px);
  line-height: 1.7;
  color: #666666;
  max-width: 52ch;
}

.cg-stage { position: relative; }

/* ── the tab rail, parked in the notch ── */
.cg-tabs {
  position: absolute;
  left: 8px;
  bottom: 44px;
  z-index: 3;
  width: 206px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 22px;
  box-shadow: 0 14px 32px rgba(19, 19, 19, 0.12);
}
.cg-tab {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  color: #131313;
  font: inherit;
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;
}
.cg-tab:hover { border-color: #266347; background: #f8fffb; color: #266347; }
.cg-tab.is-active { border-color: #266347; background: #f4fbf7; color: #266347; }
.cg-tab:focus-visible { outline: 2px solid #266347; outline-offset: 2px; }

/* ── the clipped frame ──
   Seven points: square top-left, a chamfer off the top-right, then a step
   bitten out of the bottom-left for the tab rail to sit in. */
.cg-frame {
  position: relative;
  height: clamp(340px, 43vw, 545px);
  overflow: hidden;
  border-radius: 28px;
  background: #131313;
  clip-path: polygon(0 0, 92% 0, 100% 12%, 100% 100%, 30% 100%, 22% 88%, 0 88%);
}

.cg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.45s ease;
  pointer-events: none;
}
.cg-video.is-active { opacity: 1; }

.cg-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.cg-cardwrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  pointer-events: none;
}

.cg-card {
  width: 274px;
  max-width: 100%;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.8);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(19, 19, 19, 0.28);
  animation: cg-card-in 0.35s ease both;
}
@keyframes cg-card-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cg-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.cg-card-title { margin: 0; font-size: 16px; font-weight: 600; }
.cg-badge {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;
  background: #eef8f2;
  color: #266347;
  white-space: nowrap;
}

.cg-goal { margin-top: 13px; padding: 10px; border: 1px solid #e7e7e7; border-radius: 12px; background: rgba(255,255,255,0.5); }
.cg-goal-label { margin: 0; font-size: 11px; color: #777777; }
.cg-goal-text { margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; }

.cg-tasks { list-style: none; margin: 13px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.cg-task { display: flex; align-items: flex-start; gap: 8px; }
.cg-mark { width: 15px; height: 15px; flex: none; margin-top: 2px; }
.cg-mark--done { color: #266347; }
.cg-mark--busy { color: #266347; animation: cg-spin 1.1s linear infinite; }
.cg-mark--idle { color: #bdbdbd; }
@keyframes cg-spin { to { transform: rotate(360deg); } }

.cg-task-title { margin: 0; font-size: 12.5px; }
.cg-task-title--completed { text-decoration: line-through; color: #666666; }
.cg-task-title--progress { color: #266347; font-weight: 500; }
.cg-task-title--pending { color: #999999; }
.cg-task-meta { margin: 0; font-size: 11px; color: #999999; }

.cg-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  font-size: 10.5px;
  color: #888888;
}

/* ── tablet ── */
@media (max-width: 1100px) {
  .cg-tabs { width: 186px; bottom: 34px; }
  .cg-tab { padding: 8px 10px; font-size: 13px; }
}

/* ── phone ──
   The rail stops floating: at this width it would cover most of the frame, so
   it becomes a scrolling row beneath it and the notch goes back to being a
   purely graphic cut. */
@media (max-width: 848px) {
  .cg-top { grid-template-columns: 1fr; }
  .cg-frame { height: clamp(290px, 74vw, 400px); border-radius: 20px; }
  .cg-tabs {
    position: static;
    width: 100%;
    flex-direction: row;
    gap: 8px;
    margin-top: 16px;
    padding: 8px;
    border-radius: 18px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .cg-tabs::-webkit-scrollbar { display: none; }
  .cg-tab { flex: 0 0 auto; padding: 10px 14px; font-size: 13px; }
  .cg-card { width: 100%; max-width: 274px; padding: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .cg-video { transition: none; }
  .cg-card { animation: none; }
  .cg-mark--busy { animation: none; }
}
`
