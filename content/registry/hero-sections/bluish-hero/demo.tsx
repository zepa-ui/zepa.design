"use client"

import React, { useState } from "react"
import Link from "next/link"

/* ─────────────────────────────────────────────
   bluish-hero — soft blue SaaS landing hero
   ─ floating white nav pill
   ─ concentric arc rings in the background
   ─ badge → headline → sub-copy → dual CTA
   ─ dashboard mockup with tilted label chips
   ───────────────────────────────────────────── */

const NAV = ["Features", "About Us", "FAQ", "Contact", "Pricing", "Blog"]

/* ── tab icons for the dashboard strip ── */
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" strokeLinejoin="round" />
  </svg>
)
const IconDecor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M12 12c-3-4-8-3-8 1s5 5 8 1zM12 12c3-4 8-3 8 1s-5 5-8 1z" strokeLinejoin="round" />
    <path d="M12 4v16" strokeLinecap="round" />
  </svg>
)
const IconFood = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 14h16a8 8 0 0 0-16 0z" strokeLinejoin="round" />
    <path d="M3 17.5h18M7 10c0-2 1.5-2.5 1.5-4" strokeLinecap="round" />
  </svg>
)
const IconEnt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <circle cx="8" cy="17" r="3" />
    <path d="M11 17V5l8-2v11" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="14" r="2.6" />
  </svg>
)
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M4 5h16v11H9l-5 4z" strokeLinejoin="round" />
  </svg>
)
const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" strokeLinejoin="round" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17.5" cy="18" r="1.8" />
  </svg>
)
const IconWand = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
    <path d="m5 19 10-10M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM18.5 11l.7 1.4 1.4.7-1.4.7-.7 1.4-.7-1.4-1.4-.7 1.4-.7z" strokeLinejoin="round" />
  </svg>
)
const IconQuote = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 7H5a2 2 0 0 0-2 2v3h4v5H3v-2h2v-1H3V9a4 4 0 0 1 4-4h2zM19 7h-4a2 2 0 0 0-2 2v3h4v5h-4v-2h2v-1h-2V9a4 4 0 0 1 4-4h2z" />
  </svg>
)

/* ── dashboard card blocks ──
   Every tab is described with the same handful of primitives so the
   panel keeps one visual language no matter which tab is selected. */
type Block =
  | { t: "stats"; title: string; rows: [string, string][] }
  | { t: "lines"; title: string; lines: string[]; pills?: string[]; pen?: boolean }
  | { t: "kv";    title: string; pairs: [string, string][] }
  | { t: "count"; title: string; num: string; faces?: boolean }
  | { t: "chat";  title: string; line: string; pill: string; pen?: boolean }
  | { t: "poll";  title: string; q: string; note: string; answer: string; pct: number }

type Tab = {
  label: string
  Icon: () => React.JSX.Element
  cols: [Block[], Block[], Block[]]
}

const TABS: Tab[] = [
  {
    label: "Venue",
    Icon: IconHome,
    cols: [
      [
        { t: "stats", title: "Venue Search", rows: [["Sites visited:", "6"], ["Quotes in:", "4"], ["Holds placed:", "2"], ["Contracts:", "1"]] },
        { t: "lines", title: "Backup Sites", lines: ["Cedar Hall — on hold", "Riverside Barn"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Final walkthrough– 12 Jun 2024", "Deposit due– 30 Jun 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Venue Contact", line: "Message the events manager", pill: "$Springfield Hall", pen: true },
        { t: "poll",  title: "Polling", q: "Indoor hall or the garden marquee?", note: "◷ 3 weeks left", answer: "Garden marquee", pct: 58 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Capacity:", "120 seated"], ["Rooms:", "3"], ["Parking:", "60 spaces"], ["Setup:", "6 hours"]] },
        { t: "count", title: "Walkthroughs", num: "3", faces: true },
        { t: "count", title: "Site Photos", num: "48" },
      ],
    ],
  },
  {
    label: "Décor",
    Icon: IconDecor,
    cols: [
      [
        { t: "stats", title: "Design Progress", rows: [["Mockups:", "12"], ["Approved:", "7"], ["Samples:", "9"], ["Revisions:", "3"]] },
        { t: "lines", title: "Moodboards", lines: ["Warm Neutrals v3", "Garden Party"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Sample delivery– 04 Jul 2024", "Install begins– 17 Aug 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Studio Thread", line: "Share the palette with the florist", pill: "$Décor Group Chat", pen: true },
        { t: "poll",  title: "Polling", q: "Should centrepieces be tall or low?", note: "◷ 5 weeks left", answer: "Low and lush", pct: 71 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Theme:", "Garden"], ["Palette:", "Sage / Cream"], ["Linens:", "Ivory"], ["Lighting:", "Warm string"]] },
        { t: "count", title: "Designers", num: "2", faces: true },
        { t: "count", title: "Rental Items", num: "64" },
      ],
    ],
  },
  {
    label: "Food & Beverage",
    Icon: IconFood,
    cols: [
      [
        { t: "stats", title: "Updates", rows: [["Uploads:", "74"], ["Feedback:", "41"], ["Polling results:", "12"], ["Guests replies:", "0"]] },
        { t: "lines", title: "Related Events", lines: ["Welcome Brunch", "Cousins' Olympics"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Mail save the date cards– 15 Jan 2024", "Mail invitations– 27 May 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Communication", line: "Join the WhatsApp channel", pill: "$Miller Group Chat", pen: true },
        { t: "poll",  title: "Polling", q: "Should dinner be sit-down, buffet, or something else?", note: "◷ 2 months left", answer: "Something else", pct: 33 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Date:", "18 Aug 2024"], ["Location:", "Springfield"], ["Time:", "10:00AM–11:00PM"], ["Event Type:", "Reunion"]] },
        { t: "count", title: "Stakeholders", num: "3", faces: true },
        { t: "count", title: "Events Guests", num: "96" },
      ],
    ],
  },
  {
    label: "Entertainment",
    Icon: IconEnt,
    cols: [
      [
        { t: "stats", title: "Bookings", rows: [["Acts shortlisted:", "8"], ["Auditions:", "4"], ["Confirmed:", "2"], ["Riders signed:", "2"]] },
        { t: "lines", title: "Setlists", lines: ["Dinner — acoustic", "After hours — DJ"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Sound check– 18 Aug 2024", "Final setlist due– 02 Aug 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Band Thread", line: "Confirm the stage plot", pill: "$Live Acts Chat", pen: true },
        { t: "poll",  title: "Polling", q: "Live band or DJ for the late set?", note: "◷ 6 weeks left", answer: "Live band", pct: 64 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Slot:", "8–11:00PM"], ["Genre:", "Soul / Funk"], ["Stage:", "North lawn"], ["Curfew:", "11:30PM"]] },
        { t: "count", title: "Performers", num: "5", faces: true },
        { t: "count", title: "Playlist", num: "42" },
      ],
    ],
  },
  {
    label: "Guest Communications",
    Icon: IconChat,
    cols: [
      [
        { t: "stats", title: "Outreach", rows: [["Save-the-dates:", "96"], ["Invites sent:", "96"], ["RSVPs in:", "61"], ["Reminders:", "2"]] },
        { t: "lines", title: "Message Drafts", lines: ["Travel & parking note", "Dress code reminder"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["RSVP deadline– 20 Jul 2024", "Final details mail– 10 Aug 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Communication", line: "Join the WhatsApp channel", pill: "$Miller Group Chat", pen: true },
        { t: "poll",  title: "Polling", q: "How would you prefer event updates?", note: "◷ 2 weeks left", answer: "WhatsApp", pct: 82 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Channel:", "WhatsApp"], ["Language:", "English"], ["Reminder:", "Weekly"], ["Deadline:", "20 Jul 2024"]] },
        { t: "count", title: "Coordinators", num: "3", faces: true },
        { t: "count", title: "Recipients", num: "96" },
      ],
    ],
  },
  {
    label: "Logistics",
    Icon: IconTruck,
    cols: [
      [
        { t: "stats", title: "Operations", rows: [["Vendors:", "9"], ["Deliveries:", "6"], ["Permits:", "3"], ["Insurance:", "1"]] },
        { t: "lines", title: "Run Sheet", lines: ["06:00 — Load-in", "23:30 — Load-out"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Permit filing– 01 Jul 2024", "Vendor briefing– 14 Aug 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Transport", line: "Confirm the shuttle schedule", pill: "$Ops Group Chat", pen: true },
        { t: "poll",  title: "Polling", q: "What time should shuttles start running?", note: "◷ 4 weeks left", answer: "From 9:00AM", pct: 47 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Load-in:", "06:00AM"], ["Load-out:", "11:30PM"], ["Parking:", "60 spaces"], ["Storage:", "On site"]] },
        { t: "count", title: "Crew", num: "7", faces: true },
        { t: "count", title: "Shuttles", num: "4" },
      ],
    ],
  },
  {
    label: "Final Go Live",
    Icon: IconWand,
    cols: [
      [
        { t: "stats", title: "Readiness", rows: [["Tasks done:", "118"], ["Open items:", "6"], ["Approvals:", "9"], ["Blockers:", "1"]] },
        { t: "lines", title: "Final Checks", lines: ["Vendor confirmations", "Day-of contact sheet"], pen: true },
      ],
      [
        { t: "lines", title: "Upcoming activity", lines: ["Rehearsal– 17 Aug 2024", "Go live– 18 Aug 2024"], pills: ["View all", "The Big List", "The Big Timeline"] },
        { t: "chat",  title: "Day-of Comms", line: "Open the live coordination channel", pill: "$Go Live Chat", pen: true },
        { t: "poll",  title: "Readiness", q: "Are we clear to go live on 18 Aug?", note: "◷ 3 days left", answer: "Go", pct: 94 },
      ],
      [
        { t: "kv",    title: "Details", pairs: [["Date:", "18 Aug 2024"], ["Doors:", "10:00AM"], ["Rehearsal:", "17 Aug"], ["Contact:", "Ella M."]] },
        { t: "count", title: "Leads", num: "3", faces: true },
        { t: "count", title: "Events Guests", num: "96" },
      ],
    ],
  },
]

/* floating chips — left and right of the dashboard.
   `d` = entrance delay, `f` = idle-float period (staggered so they
   never bob in unison), `fx` = distance the chip flies in from. */
const CHIPS_L = [
  { label: "Venue",           Icon: IconHome,  top: "3%",  left: "-16%", rot: -9,  d: 1.02, f: 6.4, fx: -120 },
  { label: "Food & Beverage", Icon: IconFood,  top: "13%", left: "-19%", rot: -14, d: 1.14, f: 7.1, fx: -150 },
  { label: "Logistics",       Icon: IconTruck, top: "24%", left: "-15%", rot: -3,  d: 1.26, f: 5.8, fx: -130 },
]
const CHIPS_R = [
  { label: "Décor",                Icon: IconDecor, top: "16%", right: "-15%", rot: -8,  d: 1.08, f: 6.8, fx: 130 },
  { label: "Entertainment",        Icon: IconEnt,   top: "29%", right: "-19%", rot: -11, d: 1.20, f: 6.1, fx: 155 },
  { label: "Guest Communications", Icon: IconQuote, top: "37%", right: "-24%", rot: -2,  d: 1.32, f: 7.4, fx: 175 },
  { label: "Final Go Live",        Icon: IconWand,  top: "45%", right: "-16%", rot: -10, d: 1.44, f: 6.6, fx: 140 },
]

/* renders one dashboard card from a Block description */
function Card({ b }: { b: Block }) {
  if (b.t === "stats")
    return (
      <div className="blu-card">
        <div className="blu-card-h"><i className="blu-tick" />{b.title}</div>
        {b.rows.map(([k, v]) => (
          <div key={k} className="blu-stat">
            <i className="blu-stat-ico" />
            <span>{k}<b>{v}</b></span>
          </div>
        ))}
      </div>
    )

  if (b.t === "lines")
    return (
      <div className="blu-card">
        <div className="blu-card-h">
          <i className="blu-tick" />{b.title}
          {b.pen && <span className="blu-pen">✎</span>}
        </div>
        {b.lines.map((l) => <p key={l} className="blu-line">{l}</p>)}
        {b.pills && (
          <div className="blu-chiprow">
            {b.pills.map((p, i) => (
              <span key={p} className={`blu-mini${i ? " blu-mini--out" : ""}`}>{p}</span>
            ))}
          </div>
        )}
      </div>
    )

  if (b.t === "kv")
    return (
      <div className="blu-card">
        <div className="blu-card-h"><i className="blu-tick" />{b.title}</div>
        <div className="blu-kv">
          {b.pairs.map(([k, v]) => (
            <div key={k}><span>{k}</span><p>{v}</p></div>
          ))}
        </div>
      </div>
    )

  if (b.t === "count")
    return (
      <div className="blu-card blu-card--row">
        <span className="blu-card-h blu-card-h--flat"><i className="blu-tick" />{b.title}</span>
        <span className="blu-num">{b.num}</span>
        {b.faces && <div className="blu-faces"><i /><i /><i /></div>}
        <span className="blu-pen blu-pen--br">✎</span>
      </div>
    )

  if (b.t === "chat")
    return (
      <div className="blu-card">
        <div className="blu-card-h">
          <i className="blu-tick" />{b.title}
          {b.pen && <span className="blu-pen">✎</span>}
        </div>
        <p className="blu-line blu-line--ico"><i className="blu-wa" />{b.line}</p>
        <span className="blu-mini blu-mini--out">{b.pill}</span>
      </div>
    )

  /* poll */
  return (
    <div className="blu-card">
      <div className="blu-card-h"><i className="blu-tick" />{b.title}</div>
      <p className="blu-line">{b.q}</p>
      <span className="blu-mini blu-mini--soft blu-mini--r">{b.note}</span>
      <p className="blu-line">{b.answer}</p>
      <div className="blu-bar"><i style={{ width: `${b.pct}%` }} /></div>
      <div className="blu-barmeta">
        <span>{b.pct}%</span>
        <span className="blu-mini blu-mini--soft">◉ 0/3</span>
        <span className="blu-mini blu-mini--soft">⛁ ⛁</span>
      </div>
    </div>
  )
}

export default function BluishHero() {
  const [active, setActive] = useState(2) // Food & Beverage, as in the reference
  const tab = TABS[active]

  return (
    <div className="blu-root">
      <style>{CSS}</style>

      <div className="blu-panel">
        {/* ── background rings ── */}
        <div className="blu-rings" aria-hidden>
          <span /><span /><span /><span /><span />
        </div>
        <div className="blu-glow" aria-hidden />

        {/* ── floating nav ── */}
        <nav className="blu-nav">
          <Link href="/" className="blu-brand">
            <svg viewBox="0 0 48 48" className="blu-mark" aria-hidden>
              <defs>
                <linearGradient id="bluMark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"  stopColor="#a02a8f" />
                  <stop offset="55%" stopColor="#6d3fa0" />
                  <stop offset="100%" stopColor="#2c2f7a" />
                </linearGradient>
              </defs>
              <path
                d="M33 13c-3-3.4-8-4.2-12-2.2-4.4 2.2-5.6 7.6-2 10.6 3 2.5 8 2 11.4 4.6 3.6 2.8 2.6 8.4-1.6 10.6-4 2.1-9.2 1.2-12.2-2.2"
                fill="none" stroke="url(#bluMark)" strokeWidth="4.6" strokeLinecap="round"
              />
            </svg>
            <span className="blu-brand-name">SWANKEY</span>
          </Link>

          <div className="blu-nav-links">
            {NAV.map((n, i) => (
              <Link
                key={n}
                href="/components"
                className={`blu-nav-link${i === 0 ? " blu-nav-link--active" : ""}`}
              >
                {n}
              </Link>
            ))}
          </div>

          <div className="blu-nav-actions">
            <Link href="/components" className="blu-btn blu-btn--ghost">Get Started</Link>
            <Link href="/login"      className="blu-btn blu-btn--solid">Login</Link>
          </div>
        </nav>

        {/* ── hero copy ── */}
        <div className="blu-copy">
          <div className="blu-badge">Get things done — without sacrificing your sanity.</div>

          <h1 className="blu-headline">
            <span className="blu-hl-line">Plan the event of your dreams</span>
            <span className="blu-hl-line">Without sacrificing your sanity</span>
          </h1>

          <p className="blu-sub">
            Swankey&apos;s event planning tools help you organize, plan, and host your event.
            Swankey users know our platform minimizes stress, workload, and expenses, while
            helping meet their guests&apos; every need.
          </p>

          <div className="blu-cta">
            <Link href="/docs"       className="blu-btn blu-btn--ghost blu-btn--lg blu-pop blu-pop-1">Why Swankey</Link>
            <Link href="/components" className="blu-btn blu-btn--solid blu-btn--lg blu-pop blu-pop-2">Get Started</Link>
          </div>
        </div>

        {/* ── dashboard mockup ── */}
        <div className="blu-stage">
          {[...CHIPS_L, ...CHIPS_R].map((c) => {
            const idx = TABS.findIndex((t) => t.label === c.label)
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => idx > -1 && setActive(idx)}
                className={`blu-chip${idx === active ? " blu-chip--on" : ""}`}
                style={{
                  top: c.top,
                  left:  "left"  in c ? c.left  : undefined,
                  right: "right" in c ? c.right : undefined,
                  "--rot": `${c.rot}deg`,
                  "--fx":  `${c.fx}px`,
                  "--d":   `${c.d}s`,
                  "--f":   `${c.f}s`,
                } as React.CSSProperties}
              >
                <span className="blu-chip-ico"><c.Icon /></span>
                {c.label}
              </button>
            )
          })}

          <div className="blu-window">
            {/* title bar */}
            <div className="blu-win-bar">
              <i className="blu-dot" style={{ background: "#8b3fa8" }} />
              <i className="blu-dot" style={{ background: "#1b3a6b" }} />
              <i className="blu-dot" style={{ background: "#ea6a52" }} />
            </div>

            {/* app header */}
            <div className="blu-app-head">
              <span className="blu-back">‹</span>
              <span className="blu-event">MILLER FAMILY REUNION</span>
              <span className="blu-hq">Event HQ</span>
              <span className="blu-head-right">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1b3a6b" strokeWidth="1.6" className="blu-bell">
                  <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" strokeLinejoin="round" />
                  <path d="M10 19a2 2 0 0 0 4 0" strokeLinecap="round" />
                </svg>
                <i className="blu-avatar" />
              </span>
            </div>

            {/* tab strip */}
            <div className="blu-tabs">
              {TABS.map(({ label, Icon }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={`blu-tab${i === active ? " blu-tab--on" : ""}`}
                >
                  <span className="blu-tab-ico"><Icon /></span>
                  <span className="blu-tab-lbl">{label}</span>
                </button>
              ))}
            </div>

            {/* card grid — keyed on the active tab so it re-animates */}
            <div className="blu-grid" key={active}>
              {tab.cols.map((col, ci) => (
                <div className="blu-col" key={ci} style={{ "--ci": ci } as React.CSSProperties}>
                  {col.map((b, bi) => <Card key={bi} b={b} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CSS = `
/* ── Root / panel ── */
.blu-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fdfdfd;
  padding: clamp(8px, 1.1vw, 18px);
  box-sizing: border-box;
  font-family: var(--font-manrope, ui-sans-serif, system-ui, -apple-system, sans-serif);
  -webkit-font-smoothing: antialiased;
}
.blu-panel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: clamp(16px, 1.6vw, 26px);
  background:
    radial-gradient(120% 80% at 50% 34%, #eaf2fb 0%, #d3e2f4 42%, #b9d0ec 74%, #adc7e8 100%);
  box-sizing: border-box;
}

/* concentric rings, centred left-of-middle like the reference */
.blu-rings {
  position: absolute;
  left: 34%; top: 52%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.blu-rings span {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.5);
}
.blu-rings span:nth-child(1) { width:  46vw; height:  46vw; }
.blu-rings span:nth-child(2) { width:  66vw; height:  66vw; }
.blu-rings span:nth-child(3) { width:  86vw; height:  86vw; }
.blu-rings span:nth-child(4) { width: 108vw; height: 108vw; }
.blu-rings span:nth-child(5) { width: 130vw; height: 130vw; }

/* soft white bloom behind the copy */
.blu-glow {
  position: absolute;
  left: 50%; top: 30%;
  transform: translate(-50%, -50%);
  width: 74%; height: 62%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,.72), rgba(255,255,255,0) 68%);
  pointer-events: none;
}

/* ── Nav ── */
.blu-nav {
  position: relative;
  z-index: 10;
  margin: clamp(8px, 1vw, 14px) auto 0;
  width: min(93%, 1560px);
  height: clamp(56px, 5.4vw, 74px);
  background: #fff;
  border-radius: clamp(12px, 1.2vw, 18px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 clamp(12px, 1.4vw, 22px);
  box-sizing: border-box;
  box-shadow: 0 1px 2px rgba(21,49,88,.04);
}
.blu-brand {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  text-decoration: none;
  width: fit-content;
}
.blu-mark { width: clamp(28px, 2.6vw, 38px); height: clamp(28px, 2.6vw, 38px); display: block; }
.blu-brand-name {
  font-size: clamp(9px, .82vw, 12px);
  letter-spacing: .18em;
  font-weight: 600;
  color: #33334a;
}

.blu-nav-links {
  display: flex;
  align-items: center;
  gap: clamp(4px, .5vw, 8px);
  justify-self: center;
}
.blu-nav-link {
  font-size: clamp(11px, 1.02vw, 15px);
  color: #2f3d4f;
  text-decoration: none;
  padding: clamp(6px, .62vw, 10px) clamp(8px, .9vw, 15px);
  border-radius: 9px;
  white-space: nowrap;
  transition: background .15s, color .15s;
}
.blu-nav-link:hover { background: #f1f5fa; }
.blu-nav-link--active {
  background: #f0f4f9;
  color: #16202e;
  font-weight: 600;
}

.blu-nav-actions {
  display: flex;
  align-items: center;
  gap: clamp(6px, .7vw, 12px);
  justify-self: end;
}

/* ── Buttons ── */
.blu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  font-size: clamp(11px, 1.02vw, 15px);
  font-weight: 500;
  text-decoration: none;
  padding: clamp(8px, .78vw, 13px) clamp(14px, 1.5vw, 26px);
  white-space: nowrap;
  transition: background .16s, color .16s, transform .12s;
}
.blu-btn--ghost {
  border: 1px solid #2c6a5c;
  color: #235b4f;
  background: transparent;
}
.blu-btn--ghost:hover { background: rgba(44,106,92,.07); }
.blu-btn--solid {
  background: #2c6a5c;
  color: #fff;
  border: 1px solid #2c6a5c;
}
.blu-btn--solid:hover { background: #235b4f; }
.blu-btn--lg {
  padding: clamp(11px, 1.05vw, 17px) clamp(20px, 2.1vw, 36px);
  font-size: clamp(12px, 1.12vw, 17px);
  border-radius: 10px;
}

/* ── Hero copy ── */
.blu-copy {
  position: relative;
  z-index: 6;
  text-align: center;
  padding: clamp(20px, 3.6vh, 52px) clamp(16px, 4vw, 40px) 0;
}
.blu-badge {
  display: inline-block;
  background: rgba(255,255,255,.7);
  border: 1px solid rgba(255,255,255,.9);
  color: #2c6a5c;
  font-size: clamp(11px, 1.04vw, 16px);
  font-weight: 500;
  padding: clamp(7px, .72vw, 12px) clamp(14px, 1.5vw, 25px);
  border-radius: 999px;
}
.blu-headline {
  margin: clamp(12px, 1.9vh, 26px) 0 0;
  /* rounded geometric face, falls back to the app font */
  font-family: ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN",
               var(--font-manrope, system-ui), sans-serif;
  font-size: clamp(28px, 4.15vw, 62px);
  font-weight: 500;
  line-height: 1.16;
  letter-spacing: -.005em;
  color: #16202e;
}
.blu-hl-line { display: block; }
.blu-sub {
  margin: clamp(12px, 1.9vh, 26px) auto 0;
  max-width: 68ch;
  font-size: clamp(12px, 1.16vw, 18px);
  line-height: 1.62;
  color: #3c4a5c;
}
.blu-cta {
  display: flex;
  justify-content: center;
  gap: clamp(8px, 1vw, 16px);
  margin-top: clamp(16px, 2.6vh, 34px);
}

/* ── Dashboard stage ── */
.blu-stage {
  position: relative;
  z-index: 5;
  width: min(56%, 1080px);
  margin: clamp(18px, 3vh, 46px) auto 0;
}
.blu-window {
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: clamp(8px, .8vw, 13px) clamp(8px, .8vw, 13px) 0 0;
  overflow: hidden;
  box-shadow: 0 -1px 3px rgba(20,50,90,.06), 0 24px 60px rgba(20,50,90,.14);
  font-size: clamp(5px, .58vw, 9px);
}
.blu-win-bar {
  display: flex;
  align-items: center;
  gap: .8em;
  padding: 1.35em 1.6em;
  background: #fafbfc;
}
.blu-dot { width: 1.35em; height: 1.35em; border-radius: 50%; display: block; }

/* app header */
.blu-app-head {
  display: flex;
  align-items: center;
  gap: 1em;
  padding: .2em 1.8em 1.2em;
}
.blu-back  { color: #7b8794; font-size: 1.9em; line-height: 1; }
.blu-event {
  font-size: 1.95em;
  font-weight: 500;
  color: #1b3a6b;
  letter-spacing: .01em;
  white-space: nowrap;
}
.blu-hq {
  background: #1b3a6b;
  color: #fff;
  font-size: 1.15em;
  padding: .6em 1.2em;
  border-radius: .55em;
  white-space: nowrap;
}
.blu-head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1.2em;
}
.blu-bell { width: 2em; height: 2em; }
.blu-avatar {
  width: 2.9em; height: 2.9em;
  border-radius: 50%;
  display: block;
  background: linear-gradient(145deg, #d9a58c, #b5766a 55%, #7d4a52);
}

/* tab strip */
.blu-tabs {
  display: flex;
  justify-content: space-between;
  gap: .6em;
  padding: 0 2.4em 1.3em;
  border-bottom: 1px solid #eef1f4;
  margin: 0 1.4em;
}
.blu-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .55em;
  flex: 1;
  min-width: 0;
  /* reset button chrome */
  background: none;
  border: 0;
  font: inherit;
  cursor: pointer;
  padding: .85em .4em .95em;
  border-radius: .7em;
  transition: background .2s ease;
}
.blu-tab:hover { background: #f4f7fb; }

/* the icon puck echoes the floating chips: navy circle, white glyph */
.blu-tab-ico {
  width: 2.3em; height: 2.3em;
  color: #1b3a6b;
  display: grid;
  place-items: center;
  border-radius: 50%;
  transition: background .25s ease, color .25s ease, transform .25s cubic-bezier(.34,1.56,.64,1);
}
.blu-tab-ico svg { width: 100%; height: 100%; display: block; }
.blu-tab-lbl {
  font-size: 1.05em;
  color: #45566b;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  transition: color .2s ease, font-weight .2s ease;
}

/* selected */
.blu-tab--on { background: #eef3fa; }
.blu-tab--on .blu-tab-ico {
  background: #1b3a6b;
  color: #fff;
  transform: scale(1.12);
  padding: .42em;
  box-shadow: 0 4px 10px rgba(27,58,107,.28);
}
.blu-tab--on .blu-tab-lbl { color: #1b3a6b; font-weight: 600; }
/* indicator sits on the strip's bottom rule */
.blu-tab--on::after {
  content: "";
  position: absolute;
  left: 50%; bottom: -1.35em;
  transform: translateX(-50%);
  width: 62%; height: .3em;
  border-radius: 999px;
  background: #1b3a6b;
  animation: bluTabBar .35s cubic-bezier(.22,1,.36,1);
}
@keyframes bluTabBar {
  from { width: 0; opacity: 0; }
  to   { width: 62%; opacity: 1; }
}

/* card grid */
.blu-grid {
  display: grid;
  grid-template-columns: 1fr 1.32fr 1fr;
  gap: 1.1em;
  padding: 1.5em;
}
/* columns cascade in when the tab changes (the grid is keyed on the
   active index, so React remounts it and the animation replays) */
.blu-col {
  display: flex;
  flex-direction: column;
  gap: 1.1em;
  animation: bluSwap .5s cubic-bezier(.22,1,.36,1) backwards;
  animation-delay: calc(var(--ci) * .07s);
}
@keyframes bluSwap {
  from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}
.blu-card {
  position: relative;
  border: 1px solid #eceff3;
  border-radius: .7em;
  padding: 1.15em 1.2em;
  background: #fff;
}
.blu-card--row { display: flex; align-items: center; gap: .8em; }
.blu-card-h {
  display: flex;
  align-items: center;
  gap: .7em;
  font-size: 1.22em;
  font-weight: 600;
  color: #1f2a37;
  margin-bottom: .95em;
}
.blu-card-h--flat { margin-bottom: 0; }
.blu-tick {
  width: .5em; height: 1.5em;
  border-radius: 1px;
  background: #e0574a;
  flex-shrink: 0;
}
.blu-pen {
  margin-left: auto;
  color: #98a4b3;
  border: 1px solid #e6eaef;
  border-radius: 50%;
  width: 1.9em; height: 1.9em;
  display: grid;
  place-items: center;
  font-size: .92em;
}
.blu-pen--br { position: absolute; right: .9em; bottom: .9em; }

/* stat rows */
.blu-stat {
  display: flex;
  align-items: center;
  gap: .7em;
  margin-bottom: .75em;
  font-size: 1.05em;
  color: #55637a;
}
.blu-stat-ico {
  width: 1.5em; height: 1.5em;
  border-radius: 50%;
  border: 1.4px solid #b9c6d6;
  flex-shrink: 0;
}
.blu-stat b { display: block; font-weight: 500; color: #22303f; }

.blu-line {
  margin: 0 0 .55em;
  font-size: 1.05em;
  line-height: 1.5;
  color: #55637a;
}
.blu-line--ico { display: flex; align-items: center; gap: .6em; }
.blu-wa {
  width: 1.6em; height: 1.6em;
  border-radius: 50%;
  background: #25d366;
  flex-shrink: 0;
}
.blu-num { font-size: 1.45em; font-weight: 600; color: #1f2a37; margin-left: auto; }

/* mini pills */
.blu-chiprow { display: flex; gap: .55em; flex-wrap: wrap; margin-top: .55em; }
.blu-mini {
  display: inline-flex;
  align-items: center;
  gap: .35em;
  font-size: .98em;
  padding: .5em .9em;
  border-radius: .45em;
  border: 1px solid #2c6a5c;
  color: #2c6a5c;
  white-space: nowrap;
}
.blu-mini--out { border-color: #cfd8e3; color: #55637a; }
.blu-mini--soft { border-color: #eceff3; background: #f6f8fa; color: #6b788a; }
.blu-mini--r { position: absolute; right: 1.1em; top: 2.9em; }

/* poll bar */
.blu-bar {
  height: .55em;
  border-radius: 999px;
  background: #eef1f5;
  overflow: hidden;
  margin: .5em 0 .55em;
}
.blu-bar i { display: block; height: 100%; background: #2c6a5c; border-radius: 999px; }
.blu-barmeta {
  display: flex;
  align-items: center;
  gap: .55em;
  font-size: .98em;
  color: #55637a;
}

/* details key/value */
.blu-kv { display: grid; grid-template-columns: 1fr 1fr; gap: .85em .6em; }
.blu-kv span { font-size: 1em; color: #8a97a8; }
.blu-kv p { margin: .18em 0 0; font-size: 1.02em; color: #22303f; }

.blu-faces { display: flex; }
.blu-faces i {
  width: 1.9em; height: 1.9em;
  border-radius: 50%;
  border: 1.5px solid #fff;
  margin-left: -.5em;
  background: linear-gradient(145deg, #cf9a86, #8d5f63);
}
.blu-faces i:first-child { margin-left: 0; background: linear-gradient(145deg,#9fb3d1,#4d6488); }
.blu-faces i:nth-child(2) { background: linear-gradient(145deg,#e0a98f,#a06a5c); }

/* ── Floating chips ── */
.blu-chip {
  position: absolute;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: clamp(6px, .62vw, 11px);
  background: #fff;
  border-radius: clamp(6px, .6vw, 10px);
  padding: clamp(5px, .5vw, 9px) clamp(11px, 1.15vw, 20px) clamp(5px, .5vw, 9px) clamp(5px, .5vw, 9px);
  font-size: clamp(9px, .95vw, 15px);
  font-weight: 500;
  color: #1b3a6b;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(20,50,90,.12);
  /* reset button chrome — chips select their matching tab */
  border: 0;
  font-family: inherit;
  cursor: pointer;
  transition: box-shadow .25s ease, background .25s ease;
}
.blu-chip:hover { box-shadow: 0 10px 26px rgba(20,50,90,.2); }
/* selected chip keeps its angle and float — only the ring changes,
   so nothing fights the transform the deal/drift animations own */
.blu-chip--on {
  background: #1b3a6b;
  color: #fff;
  box-shadow: 0 8px 24px rgba(27,58,107,.38);
}
.blu-chip--on .blu-chip-ico { background: #fff; color: #1b3a6b; }
.blu-chip-ico {
  width: clamp(20px, 2.1vw, 34px);
  height: clamp(20px, 2.1vw, 34px);
  border-radius: 50%;
  background: #1b3a6b;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.blu-chip-ico svg { width: 58%; height: 58%; display: block; }

/* ═══════════════════════════════════════════
   Entrance choreography
   Runs top-down: nav → badge → headline lines →
   sub → CTAs → dashboard → chips deal in last.
   ═══════════════════════════════════════════ */

/* rings ripple outward from the centre */
.blu-rings span {
  opacity: 0;
  animation: bluRipple 1.6s cubic-bezier(.22,1,.36,1) forwards;
}
.blu-rings span:nth-child(1) { animation-delay: .10s; }
.blu-rings span:nth-child(2) { animation-delay: .18s; }
.blu-rings span:nth-child(3) { animation-delay: .26s; }
.blu-rings span:nth-child(4) { animation-delay: .34s; }
.blu-rings span:nth-child(5) { animation-delay: .42s; }
@keyframes bluRipple {
  from { opacity: 0; transform: translate(-50%,-50%) scale(.82); }
  to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
}

/* nav drops in from above the frame */
.blu-nav {
  animation: bluNavDrop .95s cubic-bezier(.22,1,.36,1) .05s backwards;
}
@keyframes bluNavDrop {
  from { opacity: 0; transform: translateY(-140%); }
  to   { opacity: 1; transform: translateY(0); }
}

/* badge expands with a slight overshoot */
.blu-badge {
  animation: bluBadgeIn .8s cubic-bezier(.34,1.56,.64,1) .3s backwards;
}
@keyframes bluBadgeIn {
  from { opacity: 0; transform: scale(.8) translateY(12px); filter: blur(6px); }
  to   { opacity: 1; transform: scale(1)  translateY(0);    filter: blur(0); }
}

/* headline: de-blurs while its tracking settles tight —
   reads as the type "focusing" rather than sliding */
.blu-hl-line {
  animation: bluFocus 1.15s cubic-bezier(.22,1,.36,1) backwards;
}
.blu-hl-line:nth-child(1) { animation-delay: .42s; }
.blu-hl-line:nth-child(2) { animation-delay: .56s; }
@keyframes bluFocus {
  from {
    opacity: 0;
    transform: translateY(26px) scale(.985);
    letter-spacing: .055em;
    filter: blur(11px);
  }
  60% { opacity: 1; }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    letter-spacing: -.005em;
    filter: blur(0);
  }
}

.blu-sub {
  animation: bluRise .9s cubic-bezier(.22,1,.36,1) .74s backwards;
}
@keyframes bluRise {
  from { opacity: 0; transform: translateY(18px); filter: blur(5px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

/* CTAs pop with a back-out overshoot */
.blu-pop { animation: bluPop .7s cubic-bezier(.34,1.56,.64,1) backwards; }
.blu-pop-1 { animation-delay: .88s; }
.blu-pop-2 { animation-delay: .96s; }
@keyframes bluPop {
  from { opacity: 0; transform: translateY(16px) scale(.9); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

/* dashboard lays down onto the surface in 3D */
.blu-stage { perspective: 1600px; }
.blu-window {
  transform-origin: 50% 0%;
  animation: bluLayDown 1.35s cubic-bezier(.22,1,.36,1) .92s backwards;
}
@keyframes bluLayDown {
  from {
    opacity: 0;
    transform: translateY(70px) rotateX(26deg) scale(.94);
    box-shadow: 0 0 0 rgba(20,50,90,0);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
  }
}

/* chips are dealt in from off-canvas — they fly past their
   resting angle, then settle and drift on a slow idle float.
   --rot/--fx/--d/--f are set per chip inline. */
.blu-chip {
  transform: rotate(var(--rot));
  animation:
    bluDeal .95s cubic-bezier(.22,1,.36,1) var(--d) backwards,
    bluDrift var(--f) ease-in-out calc(var(--d) + .95s) infinite;
}
@keyframes bluDeal {
  from {
    opacity: 0;
    transform: translate(var(--fx), 34px) rotate(calc(var(--rot) - 22deg)) scale(.66);
    filter: blur(7px);
  }
  55%  { opacity: 1; filter: blur(0); }
  to {
    opacity: 1;
    transform: translate(0, 0) rotate(var(--rot)) scale(1);
    filter: blur(0);
  }
}
/* every keyframe re-states the resting angle so the float
   never fights the transform the deal animation left behind */
@keyframes bluDrift {
  0%, 100% { transform: translateY(0)     rotate(var(--rot)); }
  50%      { transform: translateY(-7px)  rotate(calc(var(--rot) + 1.2deg)); }
}

@media (prefers-reduced-motion: reduce) {
  .blu-rings span, .blu-nav, .blu-badge, .blu-hl-line,
  .blu-sub, .blu-pop, .blu-window, .blu-chip {
    animation: none;
    opacity: 1;
    filter: none;
  }
  .blu-chip { transform: rotate(var(--rot)); }
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .blu-nav-links { display: none; }
  .blu-stage { width: min(80%, 900px); }
  .blu-chip  { display: none; }
}
@media (max-width: 720px) {
  .blu-nav-actions .blu-btn--ghost { display: none; }
  .blu-headline { font-size: clamp(24px, 6.6vw, 38px); }
  .blu-stage { width: 92%; }
}
`
