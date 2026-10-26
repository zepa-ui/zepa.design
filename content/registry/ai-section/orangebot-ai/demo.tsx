"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   orangebot-ai — Zepa AI website-builder chat

   A full chat workspace: sidebar with the Zepa
   logo, new chat, projects (created as you chat,
   deletable) and a profile row; a header; an empty
   state with the animated orange bot and three
   starter cards; and a glowing composer with
   Attach, Deep Think and Send.

   There is no backend. Replies come from a small
   scripted engine and stream in character by
   character: markdown, template cards, section
   cards, plan cards and a design-call card, with a
   contained booking modal. Attach reads only the
   file name.

   The bot avatar rotates through five GIFs. Every
   avatar runs on one shared clock but starts at a
   different GIF (its slot), so neighbouring avatars
   never show the same one at the same time.
   ───────────────────────────────────────────── */

/* ── bot gifs ── */

const GIF = "https://res.cloudinary.com/dakrfj1oh/image/upload/v1791379399"
const BOT_GIFS = [
  `${GIF}/c1_fuwy2v.gif`,
  `${GIF}/c2_m5kxp1.gif`,
  `${GIF}/c3_jyvein.gif`,
  `${GIF}/c4_frvexi.gif`,
  `${GIF}/c5_nagmjs.gif`,
]
const GIF_EVERY_MS = 3500
const LOGO = "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"

/* ── types ── */

type Template = { id: string; name: string; kind: string; tint: string; sections: number; points: string[] }
type Section = { id: string; name: string; category: string; tint: string; icon: string; note: string }
type Plan = { id: string; name: string; price: number; badge?: string; features: string[] }

type Card =
  | { kind: "templates"; items: Template[] }
  | { kind: "sections"; items: Section[] }
  | { kind: "plans"; items: Plan[] }
  | { kind: "consultation"; reason: string }

type Msg = { id: number; role: "user" | "bot"; text: string; card?: Card; done?: boolean; slot: number }
type Project = { id: number; title: string }

/* ── sample data ── */

const TEMPLATES: Template[] = [
  { id: "saas", name: "SaaS Launch", kind: "Landing page", tint: "linear-gradient(135deg,#1e3a8a,#3b82f6)", sections: 7, points: ["Hero with product shot", "Feature bento grid", "Pricing + FAQ"] },
  { id: "folio", name: "Studio Portfolio", kind: "Portfolio", tint: "linear-gradient(135deg,#f08a24,#f43f5e)", sections: 5, points: ["Scroll-reveal case studies", "Clipped image grid", "Contact CTA"] },
  { id: "agency", name: "Agency Pro", kind: "Multi-page site", tint: "linear-gradient(135deg,#0f766e,#22c55e)", sections: 9, points: ["Animated navbar", "Services + team", "Testimonials wall"] },
]

const SECTIONS: Section[] = [
  { id: "globe", name: "Globe Hero", category: "Hero section", tint: "linear-gradient(135deg,#0048b0,#5ea0ff)", icon: "🌐", note: "Interactive 3D globe with a rotating headline" },
  { id: "tuple", name: "Tuple Grid", category: "Grid section", tint: "linear-gradient(135deg,#16a34a,#86efac)", icon: "▦", note: "Feature bento with live video tiles" },
  { id: "curved", name: "Curved Navbar", category: "Navbar", tint: "linear-gradient(135deg,#6d5dfc,#c8c4e8)", icon: "☰", note: "Glassy pill nav with a sliding active state" },
]

const PLANS: Plan[] = [
  { id: "free", name: "Starter", price: 0, features: ["zepa.site subdomain", "Unlimited sections", "Community support"] },
  { id: "pro", name: "Pro", price: 19, badge: "Popular", features: ["Custom domain + SSL", "Remove Zepa badge", "Analytics and forms"] },
]

const STARTERS = [
  { t: "Start a landing page", s: "Describe your product and get a first draft.", p: "Build me a landing page for my SaaS product" },
  { t: "Browse sections", s: "Heroes, grids, navbars and more.", p: "Show me sections I can add" },
  { t: "Free design call", s: "Talk to a Zepa designer at no cost.", consult: true },
] as const

const CHIPS = [
  { icon: "✨", label: "Generate a hero", p: "Show me sections I can add" },
  { icon: "💳", label: "Compare plans", p: "Compare plans for publishing" },
  { icon: "🎨", label: "Design review", consult: true },
  { icon: "🌍", label: "Custom domain", p: "How do I connect a custom domain?" },
] as const

/* ── scripted reply engine ── */

function reply(q: string, deep: boolean): { text: string; card?: Card } {
  const s = q.toLowerCase()
  const pre = deep ? "I took a closer look at layout, performance and conversion patterns.\n\n" : ""
  if (s.startsWith("use the")) {
    const name = q.replace(/use the\s*/i, "").replace(/\s*template$/i, "").trim()
    return {
      text: `${pre}Nice pick — **${name}** is a great starting point.\n\n### What I set up\n1. Page structure with responsive breakpoints\n2. Your brand colors and typography\n3. Placeholder copy you can edit inline\n\nWant to swap in some sections? Say **show sections**.`,
      card: { kind: "consultation", reason: `Polish your ${name} site` },
    }
  }
  if (s.startsWith("add the")) {
    return { text: `${pre}Added ✅ Your page is ready to publish — pick a plan to go live:`, card: { kind: "plans", items: PLANS } }
  }
  if (s.startsWith("publish on")) {
    return {
      text: `${pre}🚀 Your site is live!\n\n### Project summary\n- **Template:** SaaS Launch\n- **Sections:** 8, all responsive\n- **Hosting:** global edge, SSL included\n\nBook a quick launch review and a Zepa designer will suggest final tweaks.`,
      card: { kind: "consultation", reason: "Launch review" },
    }
  }
  if (s.includes("section") || s.includes("hero") || s.includes("component")) {
    return { text: `${pre}Here are popular sections from the Zepa library — each one drops straight into your page:`, card: { kind: "sections", items: SECTIONS } }
  }
  if (s.includes("plan") || s.includes("price") || s.includes("publish")) {
    return { text: `${pre}Publishing is one click. Here's how the plans compare:`, card: { kind: "plans", items: PLANS } }
  }
  if (s.includes("domain")) {
    return {
      text: `${pre}### Connect a custom domain\n- Open **Settings → Domains** and enter your domain\n- Add the two DNS records Zepa shows you\n- SSL is issued automatically, usually within minutes\n\nCustom domains are included on the **Pro** plan.`,
    }
  }
  if (s.includes("brand") || s.includes("screenshot") || s.includes("attach")) {
    return { text: `${pre}Tap **Attach** and add a brand guide or a screenshot. I'll pull out your colors, fonts and tone and apply them to every section.` }
  }
  if (s.includes("landing") || s.includes("website") || s.includes("site") || s.includes("build") || s.includes("portfolio")) {
    return {
      text: `${pre}Let's build it. Pick a template to start from — every one is made of **production-ready Zepa sections**:\n\n- Fully responsive and accessible\n- Animations included, no extra libraries`,
      card: { kind: "templates", items: TEMPLATES },
    }
  }
  return {
    text: `${pre}Hey, I'm **Zepa** 👋 I build websites from production-ready sections. Tell me **what you're making** — a landing page, a portfolio or a SaaS site — and **who it's for**, and I'll put together a first version in seconds.`,
  }
}

/* ── styles ── */

const CSS = `
.ob-root {
  --ob-blue: #2563eb;
  --ob-blue-d: #1d4ed8;
  --ob-orange: #f08a24;
  --ob-ink: #18181b;
  --ob-mute: #71717a;
  --ob-faint: #a1a1aa;
  --ob-line: #e4e4e7;
  box-sizing: border-box; position: relative; width: 100%; height: 100vh; height: 100dvh; min-height: 620px;
  display: flex; overflow: hidden; background: #f6f7f9; color: var(--ob-ink);
  font-family: Geist, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 14px; -webkit-font-smoothing: antialiased; container-type: inline-size;
}
.ob-root *, .ob-root *::before, .ob-root *::after { box-sizing: border-box; }
.ob-root button { font: inherit; cursor: pointer; }
.ob-root button:disabled { cursor: not-allowed; }

/* sidebar */
.ob-side { width: 264px; flex: none; display: flex; flex-direction: column; background: #fff; border-right: 1px solid var(--ob-line); animation: ob-slide .5s cubic-bezier(.2,.8,.2,1) both; }
@keyframes ob-slide { from { opacity: 0; transform: translateX(-14px) } to { opacity: 1; transform: none } }
.ob-logo { padding: 16px 20px; display: flex; align-items: center; }
.ob-logo img { height: 30px; width: auto; display: block; }
.ob-new { margin: 0 12px; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; border: 0; border-radius: 12px; background: #020617; color: #fff; font-weight: 500; transition: background .2s, transform .2s; }
.ob-new:hover { background: var(--ob-blue); }
.ob-new:active { transform: scale(.98); }
.ob-nav { display: flex; flex-direction: column; gap: 2px; padding: 16px 12px 0; }
.ob-nav button { text-align: left; border: 0; background: none; padding: 8px 12px; border-radius: 8px; font-weight: 600; color: #27272a; transition: background .15s; }
.ob-nav button:hover { background: #f4f4f5; }
.ob-jh { padding: 20px 20px 8px; font-size: 11px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--ob-mute); }
.ob-jl { flex: 1; overflow-y: auto; padding: 0 12px; display: flex; flex-direction: column; gap: 2px; }
.ob-empty-j { padding: 6px 8px; font-size: 12px; color: var(--ob-faint); }
.ob-j { position: relative; display: flex; align-items: center; animation: ob-pop .35s ease both; }
.ob-j button.ob-jt { flex: 1; min-width: 0; text-align: left; border: 0; background: none; padding: 8px 36px 8px 8px; border-radius: 8px; font-weight: 500; color: #3f3f46; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background .15s; }
.ob-j button.ob-jt:hover, .ob-j[data-on="true"] button.ob-jt { background: #f4f4f5; color: var(--ob-ink); }
.ob-jdel { position: absolute; right: 4px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: #f43f5e; color: #fff; display: grid; place-items: center; opacity: 0; transform: scale(.7); transition: opacity .15s, transform .15s; }
.ob-j:hover .ob-jdel { opacity: 1; transform: none; }
.ob-me { border-top: 1px solid var(--ob-line); padding: 12px; display: flex; align-items: center; gap: 12px; }
.ob-av { width: 40px; height: 40px; flex: none; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 600; background: linear-gradient(135deg,#3b82f6,#4f46e5); box-shadow: 0 0 0 2px #fff; }
.ob-me-t { min-width: 0; flex: 1; }
.ob-me-t p { margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ob-me-t p:first-child { font-weight: 700; }
.ob-me-t p:last-child { font-size: 12px; color: var(--ob-faint); }
.ob-icon-btn { border: 0; background: none; padding: 6px; border-radius: 8px; color: var(--ob-faint); display: grid; place-items: center; transition: background .15s, color .15s; }
.ob-icon-btn:hover { background: #fff1f2; color: #f43f5e; }

/* main */
.ob-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.ob-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 20px; background: #fff; border-bottom: 1px solid var(--ob-line); }
.ob-head-l { display: flex; align-items: center; gap: 8px; min-width: 0; }
.ob-chip { padding: 6px 12px; border-radius: 8px; background: #f4f4f5; font-weight: 600; color: #27272a; white-space: nowrap; }
.ob-sub { font-size: 12px; color: var(--ob-faint); white-space: nowrap; }
.ob-mini-new { display: none; width: 32px; height: 32px; border: 0; border-radius: 8px; background: #020617; color: #fff; place-items: center; }
.ob-head-r { display: flex; gap: 8px; }
.ob-pill { border: 1px solid var(--ob-line); background: #fff; color: #52525b; border-radius: 999px; padding: 6px 16px; font-weight: 500; white-space: nowrap; transition: border-color .2s, color .2s; }
.ob-pill:hover { border-color: #93c5fd; color: var(--ob-blue); }
.ob-pill.ob-green:hover { border-color: #6ee7b7; color: #059669; }

.ob-scroll { flex: 1; overflow-y: auto; padding: 24px 16px; scroll-behavior: smooth; }
.ob-col { max-width: 672px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }

/* empty state */
.ob-hero { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 40px 0; text-align: center; }
.ob-hero > * { animation: ob-rise .6s cubic-bezier(.2,.8,.2,1) both; }
.ob-hero > *:nth-child(2) { animation-delay: .08s } .ob-hero > *:nth-child(3) { animation-delay: .16s }
@keyframes ob-rise { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
.ob-hero h2 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -.02em; }
.ob-hero p { margin: 6px auto 0; max-width: 430px; color: var(--ob-mute); line-height: 1.5; }
.ob-starters { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ob-starter { text-align: left; background: #fff; border: 1px solid var(--ob-line); border-radius: 16px; padding: 16px; transition: border-color .2s, box-shadow .2s, transform .2s; }
.ob-starter:hover { border-color: #93c5fd; box-shadow: 0 8px 24px -14px rgba(37,99,235,.5); transform: translateY(-2px); }
.ob-starter b { display: block; font-weight: 600; }
.ob-starter span { display: block; margin-top: 4px; font-size: 12px; color: var(--ob-mute); line-height: 1.45; }

/* bot avatar (rotating gifs) */
.ob-bot { position: relative; flex: none; display: block; border-radius: 50%; }
.ob-bot img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transition: opacity .45s ease; }
.ob-bot[data-s="thinking"] { animation: ob-breathe 1s ease-in-out infinite alternate; }
.ob-bot[data-s="typing"] { animation: ob-bob .42s ease-in-out infinite alternate; }
@keyframes ob-breathe { from { transform: scale(1) } to { transform: scale(1.07) } }
@keyframes ob-bob { from { transform: translateY(0) } to { transform: translateY(-3px) } }
.ob-hero-bot { transition: transform .3s cubic-bezier(.3,1.4,.5,1); }
.ob-hero-bot:hover { transform: scale(1.08) rotate(-4deg); }

/* messages */
.ob-row { display: flex; gap: 10px; animation: ob-rise .35s cubic-bezier(.2,.8,.2,1) both; }
.ob-row.ob-u { justify-content: flex-end; align-items: flex-end; }
.ob-bubble-u { max-width: 75%; white-space: pre-wrap; background: var(--ob-blue); color: #fff; padding: 10px 16px; border-radius: 16px 16px 6px 16px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,.06); }
.ob-uav { width: 32px; height: 32px; font-size: 11px; box-shadow: none; }
.ob-stack { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
.ob-bubble { align-self: flex-start; max-width: 85%; background: #fff; border: 1px solid #dbeafe; border-radius: 6px 16px 16px 16px; padding: 10px 16px; line-height: 1.55; color: #27272a; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.ob-md { display: flex; flex-direction: column; gap: 4px; }
.ob-md p { margin: 0; }
.ob-md .ob-h { font-weight: 600; margin-top: 4px; }
.ob-md .ob-li { padding-left: 16px; }
.ob-md .ob-li span { margin-right: 8px; }
.ob-md .ob-gap { height: 6px; }
.ob-caret { display: inline-block; width: 7px; height: 15px; margin-left: 2px; vertical-align: -2px; background: var(--ob-blue); border-radius: 1px; animation: ob-caret .8s steps(1) infinite; }
@keyframes ob-caret { 50% { opacity: 0 } }
.ob-dots { display: inline-flex; gap: 4px; color: #60a5fa; font-size: 20px; line-height: 10px; }
.ob-dots i { font-style: normal; animation: ob-dot 1s ease-in-out infinite; }
.ob-dots i:nth-child(2) { animation-delay: .15s } .ob-dots i:nth-child(3) { animation-delay: .3s }
@keyframes ob-dot { 0%, 60%, 100% { transform: translateY(0) } 30% { transform: translateY(-5px) } }
.ob-note { margin: 0; padding-left: 4px; font-size: 12px; color: var(--ob-faint); animation: ob-pulse 1.4s ease-in-out infinite; }
@keyframes ob-pulse { 50% { opacity: .45 } }

/* cards */
.ob-cards { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; }
.ob-card { display: flex; flex-direction: column; overflow: hidden; background: #fff; border: 1px solid #dbeafe; border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04); animation: ob-rise .45s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--ob-d, 0ms); transition: transform .25s, box-shadow .25s; }
.ob-card:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -18px rgba(37,99,235,.55); }
.ob-card-img { height: 120px; overflow: hidden; background: #e4e4e7; }
.ob-card-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
.ob-card:hover .ob-card-img img { transform: scale(1.06); }
.ob-card-b { flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 14px; }
.ob-card-b h4 { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.25; }
.ob-card-b small { font-size: 12px; color: var(--ob-mute); }
.ob-card-b ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #52525b; }
.ob-card-b li::before { content: "✓"; color: #3b82f6; margin-right: 6px; }
.ob-cost { margin: auto 0 0; padding-top: 6px; font-weight: 600; }
.ob-save { margin: 0; font-size: 12px; font-weight: 500; color: #16a34a; }
.ob-sel { margin-top: 6px; width: 100%; border: 0; border-radius: 8px; padding: 8px; background: var(--ob-blue); color: #fff; font-weight: 500; transition: background .2s; }
.ob-sel:hover { background: var(--ob-blue-d); }
.ob-sel:disabled { opacity: .4; }
.ob-hotel-img { height: 104px; display: grid; place-items: center; font-size: 28px; }

.ob-tickets { display: flex; flex-direction: column; gap: 12px; max-width: 448px; }
.ob-ticket { background: #fff; border: 1px solid #dbeafe; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,.04); animation: ob-rise .45s cubic-bezier(.2,.8,.2,1) both; animation-delay: var(--ob-d, 0ms); transition: transform .25s, box-shadow .25s; }
.ob-ticket:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -18px rgba(37,99,235,.55); }
.ob-t-top { display: flex; justify-content: space-between; padding: 16px 20px 0; }
.ob-t-top b { font-weight: 600; }
.ob-t-top span { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #3b82f6; font-weight: 500; }
.ob-leg { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; }
.ob-leg + .ob-leg { border-top: 1px solid #eff6ff; }
.ob-code { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
.ob-leg small { font-size: 12px; color: var(--ob-mute); }
.ob-path { flex: 1; padding: 0 16px; display: flex; flex-direction: column; align-items: center; }
.ob-path-l { width: 100%; display: flex; align-items: center; }
.ob-path-l i { width: 6px; height: 6px; border-radius: 50%; background: #93c5fd; flex: none; }
.ob-path-l em { flex: 1; border-top: 1px dashed #93c5fd; }
.ob-plane { width: 32px; height: 32px; margin: 0 4px; border-radius: 50%; background: #eff6ff; color: var(--ob-blue); display: grid; place-items: center; font-style: normal; transition: transform .5s cubic-bezier(.3,1.3,.5,1); }
.ob-ticket:hover .ob-plane { transform: translateX(10px) rotate(-8deg); }
.ob-path small { margin-top: 4px; font-size: 11px; color: var(--ob-faint); }
.ob-perf { position: relative; border-top: 1px dashed #bfdbfe; }
.ob-perf::before, .ob-perf::after { content: ""; position: absolute; top: -10px; width: 20px; height: 20px; border-radius: 50%; background: #f6f7f9; border: 1px solid #dbeafe; }
.ob-perf::before { left: -10px } .ob-perf::after { right: -10px }
.ob-t-foot { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; }
.ob-t-foot small { color: var(--ob-mute); }
.ob-t-foot div { display: flex; align-items: center; gap: 12px; }
.ob-t-foot b { font-size: 20px; }
.ob-sel.ob-round { width: auto; margin: 0; border-radius: 999px; padding: 6px 20px; }

.ob-consult { align-self: flex-start; max-width: 85%; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 16px; padding: 12px 16px; animation: ob-rise .45s cubic-bezier(.2,.8,.2,1) both; }
.ob-consult b { display: block; color: #064e3b; font-weight: 600; }
.ob-consult p { margin: 2px 0 0; font-size: 12px; color: #047857; }
.ob-consult button { margin-top: 12px; border: 0; border-radius: 999px; background: #059669; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: 500; transition: background .2s, transform .2s; }
.ob-consult button:hover { background: #047857; transform: translateX(2px); }

/* template thumbs */
.ob-thumb { height: 120px; padding: 12px; display: flex; flex-direction: column; gap: 6px; overflow: hidden; }
.ob-thumb i { display: block; border-radius: 4px; background: rgba(255,255,255,.7); transition: transform .5s ease; }
.ob-card:hover .ob-thumb i { transform: translateY(-2px); }
.ob-thumb .ob-tn { height: 6px; width: 100%; background: rgba(255,255,255,.45); }
.ob-thumb .ob-th { height: 12px; width: 70%; margin-top: 8px; }
.ob-thumb .ob-ts { height: 6px; width: 50%; }
.ob-thumb .ob-tg { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-top: auto; }
.ob-thumb .ob-tg i { height: 30px; background: rgba(255,255,255,.35); }
.ob-tag { align-self: flex-start; font-size: 11px; font-weight: 500; color: #1d4ed8; background: #eff6ff; border-radius: 999px; padding: 2px 8px; }

/* plans */
.ob-plan-feats { margin: 0; padding: 4px 20px 14px; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #52525b; }
.ob-plan-feats li::before { content: "✓"; color: #3b82f6; margin-right: 8px; }
.ob-badge { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #fff; background: var(--ob-blue); border-radius: 999px; padding: 2px 8px; }

/* composer */
.ob-foot { padding: 8px 16px 20px; }
.ob-foot-in { max-width: 768px; margin: 0 auto; }
.ob-chips { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 12px; scrollbar-width: none; }
.ob-chips button { flex: none; display: flex; align-items: center; gap: 6px; white-space: nowrap; border: 1px solid #dbeafe; background: #fff; border-radius: 999px; padding: 7px 16px; font-weight: 500; color: #3f3f46; box-shadow: 0 1px 2px rgba(0,0,0,.04); transition: border-color .2s, box-shadow .2s, transform .2s; animation: ob-rise .4s ease both; }
.ob-chips button:hover { border-color: #93c5fd; transform: translateY(-1px); box-shadow: 0 6px 14px -8px rgba(37,99,235,.5); }
.ob-chips button:disabled { opacity: .4; }
.ob-docnote { margin: 0 0 8px 8px; font-size: 12px; color: var(--ob-blue); animation: ob-rise .3s ease both; }
.ob-glow { border-radius: 16px; padding: 1.5px; background: linear-gradient(90deg, rgba(96,165,250,.35), rgba(129,140,248,.35), rgba(56,189,248,.35)); box-shadow: 0 0 30px -8px rgba(59,130,246,.4); transition: background .3s, box-shadow .3s; }
.ob-glow:focus-within { background: linear-gradient(90deg, rgba(59,130,246,.7), rgba(99,102,241,.7), rgba(14,165,233,.7)); box-shadow: 0 0 42px -8px rgba(59,130,246,.55); }
.ob-box { background: #fff; border-radius: 14.5px; padding: 8px 16px 12px; }
.ob-box textarea { display: block; width: 100%; max-height: 160px; resize: none; border: 0; outline: 0; background: transparent; padding: 8px 0; font: inherit; color: var(--ob-ink); line-height: 1.5; }
.ob-box textarea::placeholder { color: var(--ob-faint); }
.ob-tools { display: flex; align-items: center; justify-content: space-between; padding-top: 4px; }
.ob-tools > div { display: flex; gap: 8px; }
.ob-tool { display: flex; align-items: center; gap: 6px; border: 1px solid var(--ob-line); background: #fff; color: #3f3f46; border-radius: 999px; padding: 6px 16px; font-weight: 500; transition: border-color .2s, background .2s, color .2s; }
.ob-tool svg { color: var(--ob-faint); transition: color .2s, transform .3s; }
.ob-tool:hover { border-color: #d4d4d8; }
.ob-tool:hover svg { transform: rotate(-12deg); }
.ob-tool[data-on="true"] { border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; }
.ob-tool[data-on="true"] svg { color: #3b82f6; animation: ob-spark 1.6s ease-in-out infinite; }
@keyframes ob-spark { 50% { transform: scale(1.2) rotate(15deg) } }
.ob-send { display: flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; background: var(--ob-blue); color: #fff; padding: 6px 20px; font-weight: 500; transition: background .2s, opacity .2s, transform .2s; }
.ob-send:hover:not(:disabled) { background: var(--ob-blue-d); transform: translateX(2px); }
.ob-send:disabled { opacity: .4; }

/* modal (contained) */
.ob-modal { position: absolute; inset: 0; z-index: 20; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.45); animation: ob-fade .2s ease both; }
@keyframes ob-fade { from { opacity: 0 } to { opacity: 1 } }
.ob-sheet { width: 100%; max-width: 460px; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 60px -20px rgba(0,0,0,.4); animation: ob-up .3s cubic-bezier(.2,.9,.3,1.2) both; }
@keyframes ob-up { from { opacity: 0; transform: translateY(16px) scale(.97) } to { opacity: 1; transform: none } }
.ob-sheet-h { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #f4f4f5; }
.ob-sheet-h b { font-weight: 600; }
.ob-x { border: 0; background: none; border-radius: 999px; padding: 4px 12px; color: var(--ob-mute); transition: background .15s; }
.ob-x:hover { background: #f4f4f5; }
.ob-sheet-b { padding: 20px; }
.ob-sheet-b > p { margin: 0 0 12px; font-size: 13px; color: var(--ob-mute); }
.ob-days { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
.ob-days button, .ob-slots button { border: 1px solid var(--ob-line); background: #fff; border-radius: 12px; padding: 8px 4px; transition: border-color .15s, background .15s, color .15s; }
.ob-days button span { display: block; font-size: 11px; color: var(--ob-faint); }
.ob-days button b { font-size: 16px; }
.ob-days button[data-on="true"], .ob-slots button[data-on="true"] { border-color: #10b981; background: #ecfdf5; color: #047857; }
.ob-days button:hover, .ob-slots button:hover { border-color: #6ee7b7; }
.ob-slots { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ob-book { margin-top: 18px; width: 100%; border: 0; border-radius: 12px; padding: 11px; background: #059669; color: #fff; font-weight: 600; transition: background .2s, opacity .2s; }
.ob-book:hover:not(:disabled) { background: #047857; }
.ob-book:disabled { opacity: .4; }

@container (max-width: 920px) {
  .ob-side { display: none; }
  .ob-mini-new { display: grid; }
}
@container (max-width: 640px) {
  .ob-starters, .ob-cards { grid-template-columns: 1fr; }
  .ob-sub, .ob-pill.ob-green { display: none; }
  .ob-head { padding: 10px 14px; }
  .ob-hero { padding: 16px 0; }
  .ob-bubble-u, .ob-bubble, .ob-consult { max-width: 92%; }
  .ob-tool { padding: 6px 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .ob-root *, .ob-root *::before, .ob-root *::after { animation: none !important; transition: none !important; }
}
`

/* ── shared gif clock ── */

function useGifClock() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    BOT_GIFS.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
    const id = window.setInterval(() => setTick((t) => t + 1), GIF_EVERY_MS)
    return () => window.clearInterval(id)
  }, [])
  return tick
}

type BotState = "idle" | "thinking" | "typing"

function Bot({ tick, slot, state = "idle", size = 40, className = "" }: { tick: number; slot: number; state?: BotState; size?: number; className?: string }) {
  const src = BOT_GIFS[(tick + slot) % BOT_GIFS.length]
  return (
    <span className={`ob-bot ${className}`} data-s={state} style={{ width: size, height: size }}>
      <img key={src} src={src} alt="Zepa AI" draggable={false} />
    </span>
  )
}

function inline(text: string, k: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={`${k}-${i}`}>{p.slice(2, -2)}</strong> : <span key={`${k}-${i}`}>{p}</span>
  )
}

function Markdown({ text, caret }: { text: string; caret?: boolean }) {
  const lines = text.split("\n")
  return (
    <div className="ob-md">
      {lines.map((raw, i) => {
        const t = raw.trim()
        const end = caret && i === lines.length - 1 ? <span className="ob-caret" /> : null
        if (!t) return <div key={i} className="ob-gap">{end}</div>
        if (t.startsWith("###")) return <p key={i} className="ob-h">{inline(t.replace(/^#+\s*/, ""), `h${i}`)}{end}</p>
        const b = t.match(/^[*-]\s+(.*)/)
        if (b) return <p key={i} className="ob-li"><span>•</span>{inline(b[1], `b${i}`)}{end}</p>
        const n = t.match(/^(\d+)\.\s+(.*)/)
        if (n) return <p key={i} className="ob-li"><span>{n[1]}.</span>{inline(n[2], `n${i}`)}{end}</p>
        return <p key={i}>{inline(t, `p${i}`)}{end}</p>
      })}
    </div>
  )
}

function CardView({ card, busy, send, consult }: { card: Card; busy: boolean; send: (t: string) => void; consult: (r: string) => void }) {
  if (card.kind === "templates") {
    return (
      <div className="ob-cards">
        {card.items.map((t, i) => (
          <div key={t.id} className="ob-card" style={{ ["--ob-d" as string]: `${i * 90}ms` }}>
            <div className="ob-thumb" style={{ background: t.tint }} aria-hidden>
              <i className="ob-tn" />
              <i className="ob-th" />
              <i className="ob-ts" />
              <span className="ob-tg"><i /><i /><i /></span>
            </div>
            <div className="ob-card-b">
              <div>
                <h4>{t.name}</h4>
                <small>{t.kind} · {t.sections} sections</small>
              </div>
              <ul>{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <button type="button" className="ob-sel" style={{ marginTop: "auto" }} disabled={busy} onClick={() => send(`Use the ${t.name} template`)}>
                Use template
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (card.kind === "sections") {
    return (
      <div className="ob-cards">
        {card.items.map((c, i) => (
          <div key={c.id} className="ob-card" style={{ ["--ob-d" as string]: `${i * 90}ms` }}>
            <div className="ob-hotel-img" style={{ background: c.tint, color: "#fff" }}>{c.icon}</div>
            <div className="ob-card-b">
              <span className="ob-tag">{c.category}</span>
              <h4>{c.name}</h4>
              <small>{c.note}</small>
              <button type="button" className="ob-sel" style={{ marginTop: "auto" }} disabled={busy} onClick={() => send(`Add the ${c.name} to my page`)}>
                Add section
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (card.kind === "plans") {
    return (
      <div className="ob-tickets">
        {card.items.map((p, i) => (
          <div key={p.id} className="ob-ticket" style={{ ["--ob-d" as string]: `${i * 110}ms` }}>
            <div className="ob-t-top">
              <b>{p.name}</b>
              {p.badge ? <span className="ob-badge">{p.badge}</span> : <span>Forever free</span>}
            </div>
            <ul className="ob-plan-feats" style={{ paddingTop: 12 }}>
              {p.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div className="ob-perf" />
            <div className="ob-t-foot">
              <small>{p.price ? "per month" : "no card needed"}</small>
              <div>
                <b>${p.price}</b>
                <button type="button" className="ob-sel ob-round" disabled={busy} onClick={() => send(`Publish on the ${p.name} plan`)}>
                  Publish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="ob-consult">
      <b>🎨 Free design call available</b>
      <p>{card.reason} — a Zepa designer reviews your site at no cost. Pick a time that suits you.</p>
      <button type="button" onClick={() => consult(card.reason)}>Book free design call →</button>
    </div>
  )
}

const DAYS = [
  { d: "Mon", n: 13 },
  { d: "Tue", n: 14 },
  { d: "Wed", n: 15 },
  { d: "Thu", n: 16 },
  { d: "Fri", n: 17 },
]
const SLOTS = ["09:30", "11:00", "13:30", "15:00", "16:30", "18:00"]

function ConsultModal({ onClose, onBook }: { onClose: () => void; onBook: (label: string) => void }) {
  const [day, setDay] = useState<number | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  return (
    <div className="ob-modal" onClick={onClose}>
      <div className="ob-sheet" role="dialog" aria-modal="true" aria-label="Book your free design call" onClick={(e) => e.stopPropagation()}>
        <div className="ob-sheet-h">
          <b>Book your free design call</b>
          <button type="button" className="ob-x" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="ob-sheet-b">
          <p>30 minutes with a Zepa designer · Video call</p>
          <div className="ob-days">
            {DAYS.map((d, i) => (
              <button key={d.n} type="button" data-on={day === i} onClick={() => setDay(i)}>
                <span>{d.d}</span>
                <b>{d.n}</b>
              </button>
            ))}
          </div>
          <div className="ob-slots">
            {SLOTS.map((s) => (
              <button key={s} type="button" data-on={slot === s} disabled={day === null} onClick={() => setSlot(s)}>
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="ob-book"
            disabled={day === null || !slot}
            onClick={() => day !== null && slot && onBook(`${DAYS[day].d}, Oct ${DAYS[day].n} at ${slot}`)}
          >
            Confirm booking
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── main ── */

const USER = { name: "Alex Morgan", email: "alex.morgan@example.com" }

export default function OrangebotAI() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [deep, setDeep] = useState(false)
  const [docNote, setDocNote] = useState<string | null>(null)
  const [modal, setModal] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [active, setActive] = useState<number | null>(null)
  const tick = useGifClock()

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const timers = useRef<number[]>([])
  const idRef = useRef(0)
  const slotRef = useRef(0)

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => clearTimeout(t))
  }, [])

  // keep the newest message in view without scrolling the page
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const autosize = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const streamBot = useCallback((full: string, card?: Card, thinkMs = 700) => {
    const id = ++idRef.current
    // each bot message gets the next gif slot, so neighbours never match
    const slot = ++slotRef.current
    setMessages((m) => [...m, { id, role: "bot", text: "", card, slot }])
    let i = 0
    const tick = () => {
      i = Math.min(full.length, i + 3 + Math.floor(Math.random() * 4))
      const done = i >= full.length
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, text: full.slice(0, i), done } : x)))
      if (done) timers.current.push(window.setTimeout(() => setBusy(false), card ? 450 : 0))
      else timers.current.push(window.setTimeout(tick, 18))
    }
    timers.current.push(window.setTimeout(tick, thinkMs))
  }, [])

  const send = useCallback(
    (override?: string) => {
      const text = (override ?? input).trim()
      if (!text || busy) return
      if (active === null) {
        const pid = Date.now()
        const title = text.length > 34 ? `${text.slice(0, 34)}…` : text
        setProjects((p) => [{ id: pid, title }, ...p])
        setActive(pid)
      }
      setMessages((m) => [...m, { id: ++idRef.current, role: "user", text, done: true, slot: 0 }])
      setInput("")
      setBusy(true)
      window.setTimeout(autosize, 0)
      const r = reply(text, deep)
      streamBot(r.text, r.card, deep ? 1700 : 700)
    },
    [input, busy, active, deep, streamBot]
  )

  const newChat = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
    setMessages([])
    setBusy(false)
    setActive(null)
    setDocNote(null)
    setInput("")
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setDocNote(`📎 “${f.name}” attached.`)
    setBusy(true)
    streamBot(
      `📎 Got it — I've read **${f.name}**.\n\n### Brand I picked up\n- **Colors:** deep blue with a warm orange accent\n- **Type:** clean geometric sans, tight headings\n\nI'll apply these to every section. Want to pick a template next?`,
      undefined,
      900
    )
    e.target.value = ""
    timers.current.push(window.setTimeout(() => setDocNote(null), 4000))
  }

  const book = (label: string) => {
    setModal(null)
    setBusy(true)
    streamBot(`✅ Your free design call is booked for **${label}**. You'll get the invite by email.`, undefined, 300)
  }

  const started = messages.some((m) => m.role === "user")
  const last = messages[messages.length - 1]

  return (
    <div className="ob-root">
      <style>{CSS}</style>

      {/* sidebar */}
      <aside className="ob-side">
        <div className="ob-logo">
          <img src={LOGO} alt="Zepa" />
        </div>
        <button type="button" className="ob-new" onClick={newChat}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New chat
        </button>
        <nav className="ob-nav">
          <button type="button">My sites</button>
          <button type="button" onClick={() => setModal("Free design call")}>Book design call</button>
        </nav>
        <p className="ob-jh">Your projects</p>
        <div className="ob-jl">
          {projects.length === 0 ? (
            <p className="ob-empty-j">No projects yet</p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="ob-j" data-on={active === p.id}>
                <button type="button" className="ob-jt" title={p.title}>{p.title}</button>
                <button
                  type="button"
                  className="ob-jdel"
                  aria-label="Delete chat"
                  onClick={() => {
                    setProjects((list) => list.filter((x) => x.id !== p.id))
                    if (active === p.id) newChat()
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="ob-me">
          <span className="ob-av">{USER.name[0]}</span>
          <div className="ob-me-t">
            <p>{USER.name}</p>
            <p>{USER.email}</p>
          </div>
          <button type="button" className="ob-icon-btn" aria-label="Log out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17l5-5-5-5M20 12H9M12 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></svg>
          </button>
        </div>
      </aside>

      {/* main */}
      <div className="ob-main">
        <header className="ob-head">
          <div className="ob-head-l">
            <button type="button" className="ob-mini-new" aria-label="New chat" onClick={newChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <span className="ob-chip">Zepa AI</span>
            <span className="ob-sub">AI website builder</span>
          </div>
          <div className="ob-head-r">
            <button type="button" className="ob-pill ob-green" onClick={() => setModal("Free design call")}>Book design call</button>
            <button type="button" className="ob-pill">My sites</button>
          </div>
        </header>

        <div className="ob-scroll" ref={scrollRef}>
          <div className="ob-col">
            {!started ? (
              <div className="ob-hero">
                <Bot tick={tick} slot={0} size={84} className="ob-hero-bot" />
                <div>
                  <h2>Let’s build your website</h2>
                  <p>Describe your idea and I’ll assemble it from production-ready Zepa sections, style it to your brand, and publish it live.</p>
                </div>
                <div className="ob-starters">
                  {STARTERS.map((c) => (
                    <button
                      key={c.t}
                      type="button"
                      className="ob-starter"
                      onClick={() => ("consult" in c ? setModal("Free design call") : send(c.p))}
                    >
                      <b>{c.t}</b>
                      <span>{c.s}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                if (m.role === "user") {
                  return (
                    <div key={m.id} className="ob-row ob-u">
                      <div className="ob-bubble-u">{m.text}</div>
                      <span className="ob-av ob-uav">{USER.name[0]}</span>
                    </div>
                  )
                }
                const state: BotState = m === last && busy ? (m.text ? "typing" : "thinking") : "idle"
                const streaming = !m.done
                return (
                  <div key={m.id} className="ob-row">
                    <Bot tick={tick} slot={m.slot} size={40} state={state} />
                    <div className="ob-stack">
                      <div className="ob-bubble">
                        {m.text ? (
                          <Markdown text={m.text} caret={streaming} />
                        ) : (
                          <span className="ob-dots" aria-label="Thinking"><i>·</i><i>·</i><i>·</i></span>
                        )}
                      </div>
                      {m.card && streaming && m.text && <p className="ob-note">Preparing your options…</p>}
                      {m.card && m.done && <CardView card={m.card} busy={busy} send={send} consult={(r) => setModal(r)} />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="ob-foot">
          <div className="ob-foot-in">
            {started && (
              <div className="ob-chips">
                {CHIPS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    disabled={busy}
                    onClick={() => ("consult" in c ? setModal("Design review") : send(c.p))}
                  >
                    <span style={{ fontSize: 12 }}>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {docNote && <p className="ob-docnote">{docNote}</p>}
            <div className="ob-glow">
              <div className="ob-box">
                <textarea
                  ref={taRef}
                  rows={1}
                  value={input}
                  placeholder="Describe the website you want to build…"
                  aria-label="Message"
                  onChange={(e) => {
                    setInput(e.target.value)
                    autosize()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <div className="ob-tools">
                  <div>
                    <button type="button" className="ob-tool" disabled={busy} onClick={() => fileRef.current?.click()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 11.1 12.3 20a5.5 5.5 0 0 1-7.8-7.8l9.2-9.1a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.1a1.8 1.8 0 0 1-2.6-2.6l8.5-8.4" /></svg>
                      Attach
                    </button>
                    <input ref={fileRef} type="file" hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.fig" onChange={onFile} />
                    <button type="button" className="ob-tool" data-on={deep} aria-pressed={deep} onClick={() => setDeep((v) => !v)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4zM18 15l.9 2.1 2.1.9-2.1.9L18 21l-.9-2.1-2.1-.9 2.1-.9z" /></svg>
                      Deep Think
                    </button>
                  </div>
                  <button type="button" className="ob-send" disabled={busy || !input.trim()} onClick={() => send()}>
                    ➤ Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && <ConsultModal onClose={() => setModal(null)} onBook={book} />}
    </div>
  )
}
