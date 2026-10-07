"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   gemini-ai — assistant home screen + chat

   A light, airy assistant workspace:

   · Rail — hamburger expands it into a sidebar with
     "New chat" and recent chats; help, activity and
     settings sit at the bottom.
   · Top bar — model switcher dropdown, an apps
     launcher popover and a ring-bordered avatar.
   · Greeting — "Hello, Sam" in a gradient that
     sweeps in, then the grey question rises below.
   · Four suggestion cards with live mini
     illustrations (code that types, a PDF that
     lifts, a fading plan, bars that grow). Click
     one to send it.
   · Prompt pill — upload chip, a mic that "listens"
     and transcribes, and a send button that appears
     when you type.
   · Chat — streamed replies with a spinning sparkle
     while thinking, rich blocks (code, outline,
     chart) and like / dislike / regenerate / copy.

   Front-end only — replies are scripted. No deps.
   ───────────────────────────────────────────── */

type Block =
  | { kind: "code"; lines: string[] }
  | { kind: "chart"; values: number[]; labels: string[] }
  | { kind: "outline"; items: string[] }

type Msg = { id: number; role: "user" | "bot"; text: string; full: string; block?: Block; done: boolean; vote?: "up" | "down" }

const MODELS = [
  { id: "adv", name: "Advanced", note: "Our most capable model" },
  { id: "pro", name: "Pro", note: "Balanced for everyday tasks" },
  { id: "flash", name: "Flash", note: "Fastest responses" },
]

const RECENTS = ["Landing page copy ideas", "Explain React server components", "Q3 launch checklist", "Trip plan for Lisbon"]

const APPS = [
  { n: "Search", c: "#4285f4" },
  { n: "Mail", c: "#ea4335" },
  { n: "Drive", c: "#fbbc04" },
  { n: "Docs", c: "#4285f4" },
  { n: "Sheets", c: "#34a853" },
  { n: "Slides", c: "#fbbc04" },
  { n: "Meet", c: "#00897b" },
  { n: "Calendar", c: "#4285f4" },
  { n: "Photos", c: "#ea4335" },
]

const CHART = [62, 48, 100, 86, 70, 30, 54, 70, 50]

const CARDS = [
  { id: "py", title: "Explain Python concepts", prompt: "Explain Python dictionary comprehensions" },
  { id: "pdf", title: "Create an outline from my content", prompt: "Create an outline from my content" },
  { id: "plan", title: "Develop a board game shop business plan", prompt: "Develop a board game shop business plan" },
  { id: "chart", title: "Make a chart and share insights", prompt: "Make a chart of monthly sales and share insights" },
] as const

function reply(q: string): { text: string; block?: Block } {
  const s = q.toLowerCase()
  if (s.includes("python") || s.includes("dictionar")) {
    return {
      text: "A **dictionary comprehension** builds a dict in a single expression — the same idea as a list comprehension, but producing key–value pairs.\n\n### Why use it\n- Shorter and more readable than a loop\n- Can filter with an `if` clause\n- Usually a little faster",
      block: { kind: "code", lines: ["squares = {x: x**2 for x in range(1, 6)}", "print(squares)", "# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}", "", "evens = {k: v for k, v in squares.items() if v % 2 == 0}", "# {2: 4, 4: 16}"] },
    }
  }
  if (s.includes("outline") || s.includes("pdf") || s.includes("attached")) {
    return {
      text: "Here's a clean outline of your content. I grouped related points and put the strongest idea first.",
      block: { kind: "outline", items: ["Introduction — the problem and who it affects", "Key findings — three supporting data points", "Proposed approach — phased rollout", "Risks and mitigations", "Next steps and owners"] },
    }
  }
  if (s.includes("business plan") || s.includes("board game")) {
    return {
      text: "### Business Plan: The Meeple House — Atlanta's Premier Board Game Destination\n1. **Executive summary** — a café-style shop with 600+ games to play, plus retail and weekly events\n2. **Market** — 1.2M nearby adults, a growing tabletop scene, few dedicated venues\n3. **Revenue** — table fees, food and drink, game sales, memberships\n4. **Marketing** — league nights, local creators, school partnerships\n5. **Financials** — break-even in month 14 at 55% weekend occupancy",
    }
  }
  if (s.includes("chart") || s.includes("sales") || s.includes("insight")) {
    return {
      text: "Here's monthly sales for the last nine months.\n\n### Insights\n- **March** was the peak, driven by the spring launch\n- A dip in **June** lines up with the pricing change\n- Sales recovered **+80%** from June to August",
      block: { kind: "chart", values: CHART, labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] },
    }
  }
  return {
    text: "Happy to help! Could you tell me a bit more about **what you're working on** and **what a great result looks like**? I can explain concepts, draft plans, outline documents or turn numbers into charts.",
  }
}

const CSS = `
.gm-root {
  --gm-bg: #ffffff;
  --gm-soft: #f0f4f9;
  --gm-soft-2: #e3e9f1;
  --gm-ink: #1f1f1f;
  --gm-mute: #444746;
  --gm-faint: #c4c7c5;
  --gm-blue: #4b6bdc;
  box-sizing: border-box; position: relative; width: 100%;
  height: 100vh; height: 100dvh; min-height: 640px;
  display: flex; overflow: hidden; background: var(--gm-bg); color: var(--gm-ink);
  font-family: "Google Sans", "Product Sans", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased; container-type: inline-size;
}
.gm-root *, .gm-root *::before, .gm-root *::after { box-sizing: border-box; }
.gm-root button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; }
.gm-ib { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; color: var(--gm-mute); transition: background .2s, transform .2s; position: relative; }
.gm-ib:hover { background: rgba(68,71,70,.08); }
.gm-ib:active { transform: scale(.92); }

/* rail */
.gm-rail { flex: none; width: 92px; background: var(--gm-soft); display: flex; flex-direction: column; padding: 18px 26px 18px 26px; transition: width .35s cubic-bezier(.2,.8,.2,1); overflow: hidden; }
.gm-rail[data-open="true"] { width: 280px; }
.gm-new { margin-top: 70px; height: 44px; min-width: 40px; border-radius: 22px; background: var(--gm-soft-2) !important; color: var(--gm-mute); display: flex; align-items: center; gap: 12px; padding: 0 10px; white-space: nowrap; transition: background .2s, width .35s; width: 40px; }
.gm-rail[data-open="true"] .gm-new { width: 128px; padding: 0 16px 0 10px; }
.gm-new:hover { background: #d8dfe9 !important; }
.gm-new span { opacity: 0; transition: opacity .2s; font-size: 14px; font-weight: 500; }
.gm-rail[data-open="true"] .gm-new span { opacity: 1; transition-delay: .12s; }
.gm-recent { margin-top: 28px; flex: 1; overflow: hidden; opacity: 0; transform: translateX(-8px); transition: opacity .25s, transform .25s; pointer-events: none; }
.gm-rail[data-open="true"] .gm-recent { opacity: 1; transform: none; transition-delay: .15s; pointer-events: auto; }
.gm-recent p { margin: 0 0 8px 10px; font-size: 14px; font-weight: 500; }
.gm-recent button { display: flex; align-items: center; gap: 12px; width: 228px; padding: 9px 12px; border-radius: 20px; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; color: var(--gm-mute); transition: background .15s; }
.gm-recent button:hover, .gm-recent button[data-on="true"] { background: #d3e3fd; color: #041e49; }
.gm-rail-b { display: flex; flex-direction: column; gap: 6px; margin-left: -8px; }
.gm-dot { position: absolute; top: 6px; right: 7px; width: 8px; height: 8px; border-radius: 50%; background: #1a73e8; box-shadow: 0 0 0 2px var(--gm-soft); }
.gm-spacer { flex: 1; }

/* main */
.gm-main { flex: 1; min-width: 0; display: flex; flex-direction: column; position: relative; }
.gm-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px 0 30px; height: 64px; }
.gm-model { position: relative; }
.gm-model > button { display: flex; align-items: center; gap: 6px; font-size: 22px; padding: 8px 12px; border-radius: 8px; transition: background .2s; }
.gm-model > button:hover { background: var(--gm-soft); }
.gm-model > button em { font-style: normal; background: linear-gradient(90deg,#4b90ff,#a46ad1 55%,#d96570); -webkit-background-clip: text; background-clip: text; color: transparent; }
.gm-model > button svg { transition: transform .25s; }
.gm-model[data-open="true"] > button svg { transform: rotate(180deg); }
.gm-pop { position: absolute; z-index: 10; top: calc(100% + 6px); background: #fff; border-radius: 14px; box-shadow: 0 4px 8px 3px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.12); padding: 8px; animation: gm-pop .2s cubic-bezier(.2,.8,.2,1) both; transform-origin: top left; }
@keyframes gm-pop { from { opacity: 0; transform: scale(.95) translateY(-4px) } to { opacity: 1; transform: none } }
.gm-pop.gm-models { left: 0; width: 280px; }
.gm-pop.gm-models button { width: 100%; text-align: left; padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; justify-content: space-between; transition: background .15s; }
.gm-pop.gm-models button:hover { background: var(--gm-soft); }
.gm-pop.gm-models b { display: block; font-weight: 500; font-size: 15px; }
.gm-pop.gm-models small { color: var(--gm-mute); font-size: 12px; }
.gm-check { color: #1a73e8; }
.gm-top-r { display: flex; align-items: center; gap: 8px; position: relative; }
.gm-pop.gm-apps { right: 48px; width: 300px; display: grid; grid-template-columns: repeat(3,1fr); gap: 4px; padding: 14px; transform-origin: top right; }
.gm-pop.gm-apps button { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 4px; border-radius: 12px; font-size: 13px; transition: background .15s; }
.gm-pop.gm-apps button:hover { background: var(--gm-soft); }
.gm-pop.gm-apps i { width: 34px; height: 34px; border-radius: 10px; display: block; transition: transform .25s cubic-bezier(.3,1.5,.5,1); }
.gm-pop.gm-apps button:hover i { transform: scale(1.12) rotate(-6deg); }
.gm-av { width: 46px; height: 46px; border-radius: 50%; padding: 3px; background: conic-gradient(#ea4335 0 25%, #fbbc04 0 50%, #34a853 0 75%, #4285f4 0); display: grid; place-items: center; transition: transform .3s; }
.gm-av:hover { transform: rotate(20deg); }
.gm-av span { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #fff; background: #e8710a; color: #fff; display: grid; place-items: center; font-size: 18px; font-weight: 500; transition: transform .3s; }
.gm-av:hover span { transform: rotate(-20deg); }

.gm-scroll { flex: 1; overflow-y: auto; }
.gm-col { max-width: 1070px; margin: 0 auto; padding: 0 24px; }

/* greeting */
.gm-hello { padding-top: 52px; font-size: clamp(40px, 5.4vw, 66px); line-height: 1.24; letter-spacing: -.02em; font-weight: 500; }
.gm-hello h1 { margin: 0; font: inherit; }
.gm-name { display: inline-block; background: linear-gradient(74deg,#4285f4 0,#9b72cb 9%,#d96570 20%,#d96570 24%,#9b72cb 35%,#4285f4 44%,#9b72cb 50%,#d96570 56%,#fff 75%,#fff 100%); background-size: 400% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: gm-sweep 1.6s cubic-bezier(.3,.6,.3,1) both; }
@keyframes gm-sweep { from { background-position: 100% 0 } to { background-position: 0 0 } }
.gm-q { margin: 0; color: var(--gm-faint); }
.gm-q span { display: inline-block; opacity: 0; transform: translateY(14px); animation: gm-word .6s cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes gm-word { to { opacity: 1; transform: none } }

/* cards */
.gm-cards { margin: 96px 0 40px; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; }
.gm-card { position: relative; height: 258px; border-radius: 14px; background: var(--gm-soft); padding: 20px; text-align: left; display: flex; flex-direction: column; overflow: hidden; opacity: 0; transform: translateY(18px); animation: gm-word .6s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: var(--gm-d); transition: background .25s, box-shadow .25s; }
.gm-card:hover { background: #dde3ea; }
.gm-card:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }
.gm-card h3 { margin: 0; font-size: 20px; font-weight: 400; line-height: 1.4; }
.gm-ill { flex: 1; margin-top: 16px; position: relative; font-size: 12px; line-height: 23px; color: var(--gm-ink); }
.gm-code ol { margin: 0; padding-left: 18px; }
.gm-code li::marker { color: var(--gm-ink); }
.gm-code .gm-k { color: #8430ce; } .gm-code .gm-n { color: #b55908; } .gm-code .gm-f { color: #1967d2; }
.gm-fade { -webkit-mask-image: linear-gradient(#000 40%, transparent 98%); mask-image: linear-gradient(#000 40%, transparent 98%); }
.gm-code .gm-type { display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: bottom; max-width: 0; transition: max-width .9s steps(24); }
.gm-card:hover .gm-code .gm-type { max-width: 200px; }
.gm-card:hover .gm-code .gm-placeholder { display: none; }
.gm-pdf { position: absolute; left: 50%; top: 10px; width: 118px; height: 118px; margin-left: -59px; background: #fff; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,.12); padding: 14px; transition: transform .4s cubic-bezier(.3,1.4,.5,1), box-shadow .3s; }
.gm-card:hover .gm-pdf { transform: translateY(-6px) rotate(-3deg); box-shadow: 0 12px 20px -8px rgba(0,0,0,.25); }
.gm-pdf b { display: flex; align-items: center; gap: 6px; font-weight: 400; color: #5f6368; font-size: 12px; }
.gm-pdf b i { font-style: normal; background: #ea4335; color: #fff; font-size: 6px; font-weight: 700; padding: 3px 2px; border-radius: 2px; }
.gm-pdf s { display: block; height: 3px; border-radius: 2px; background: #dadce0; margin-top: 7px; text-decoration: none; }
.gm-pdf s:first-of-type { margin-top: 16px; }
.gm-plus { position: absolute; left: 50%; top: -4px; margin-left: 42px; width: 30px; height: 30px; border-radius: 50%; background: #7d8fb5; color: #fff; display: grid; place-items: center; box-shadow: 0 0 0 2px var(--gm-soft); transition: transform .35s cubic-bezier(.3,1.5,.5,1), background .2s; z-index: 1; }
.gm-card:hover .gm-plus { transform: rotate(90deg) scale(1.1); background: #4b6bdc; box-shadow: 0 0 0 2px #dde3ea; }
.gm-plan { color: #3c4043; }
.gm-plan p { margin: 0; }
.gm-plan .gm-dim { color: var(--gm-faint); }
.gm-card:hover .gm-plan { animation: gm-scroll 3s ease-in-out forwards; }
@keyframes gm-scroll { to { transform: translateY(-46px) } }
.gm-chart { position: absolute; inset: 10px 4px 0; display: flex; align-items: flex-end; gap: 7px; border-bottom: 1px solid #dadce0; padding: 0 6px; }
.gm-chart i { flex: 1; background: #4169e1; border-radius: 2px 2px 0 0; height: calc(var(--h) * 1%); transform-origin: bottom; transform: scaleY(0); animation: gm-grow .7s cubic-bezier(.3,1.3,.5,1) forwards; animation-delay: calc(var(--gm-d) + var(--i) * 45ms + 300ms); transition: filter .2s; }
@keyframes gm-grow { to { transform: scaleY(1) } }
.gm-card:hover .gm-chart i { animation: gm-wave .8s ease-in-out; animation-delay: calc(var(--i) * 40ms); transform: scaleY(1); }
@keyframes gm-wave { 50% { transform: scaleY(.6) } }
.gm-chart i:hover { filter: brightness(1.25); }

/* chat */
.gm-chat { max-width: 760px; margin: 0 auto; padding: 24px 24px 40px; display: flex; flex-direction: column; gap: 32px; }
.gm-u { display: flex; gap: 18px; align-items: flex-start; animation: gm-word .4s ease forwards; opacity: 0; transform: translateY(8px); }
.gm-u .gm-uav { flex: none; width: 32px; height: 32px; border-radius: 50%; background: #e8710a; color: #fff; display: grid; place-items: center; font-size: 14px; }
.gm-u p { margin: 5px 0 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap; }
.gm-b { display: flex; gap: 18px; align-items: flex-start; }
.gm-spark { flex: none; width: 32px; height: 32px; display: grid; place-items: center; }
.gm-spark svg { transition: transform .4s; }
.gm-spark[data-busy="true"] svg { animation: gm-spin 1.4s linear infinite; }
@keyframes gm-spin { to { transform: rotate(360deg) } }
.gm-body { flex: 1; min-width: 0; font-size: 16px; line-height: 1.7; }
.gm-md p { margin: 0 0 8px; }
.gm-md .gm-h { font-weight: 500; margin-top: 12px; font-size: 17px; }
.gm-md .gm-li { padding-left: 22px; text-indent: -14px; margin: 0 0 4px; }
.gm-md code { font-family: ui-monospace, Menlo, monospace; font-size: 14px; background: var(--gm-soft); padding: 1px 5px; border-radius: 4px; }
.gm-caret { display: inline-block; width: 8px; height: 8px; margin-left: 4px; border-radius: 50%; background: linear-gradient(135deg,#4b90ff,#d96570); animation: gm-blink .7s ease-in-out infinite alternate; }
@keyframes gm-blink { to { opacity: .2 } }
.gm-shimmer { display: flex; flex-direction: column; gap: 10px; padding-top: 6px; }
.gm-shimmer i { height: 14px; border-radius: 4px; background: linear-gradient(90deg,#e3e9f1 0%,#c7d6fb 30%,#e3e9f1 60%); background-size: 200% 100%; animation: gm-shim 1.2s linear infinite; }
.gm-shimmer i:nth-child(2) { width: 85% } .gm-shimmer i:nth-child(3) { width: 60% }
@keyframes gm-shim { from { background-position: 100% 0 } to { background-position: -100% 0 } }
.gm-block { margin-top: 12px; animation: gm-word .5s ease forwards; opacity: 0; transform: translateY(8px); }
.gm-codeblk { background: var(--gm-soft); border-radius: 12px; overflow: hidden; }
.gm-codeblk header { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; font-size: 13px; color: var(--gm-mute); background: var(--gm-soft-2); }
.gm-codeblk pre { margin: 0; padding: 16px; font-family: ui-monospace, Menlo, monospace; font-size: 13.5px; line-height: 1.7; overflow-x: auto; }
.gm-codeblk .gm-cm { color: #5f6368; }
.gm-outline { margin: 0; padding: 0; list-style: none; counter-reset: o; display: flex; flex-direction: column; gap: 8px; }
.gm-outline li { counter-increment: o; display: flex; gap: 12px; align-items: center; background: var(--gm-soft); border-radius: 12px; padding: 10px 14px; transition: transform .2s, background .2s; }
.gm-outline li:hover { transform: translateX(4px); background: #dde3ea; }
.gm-outline li::before { content: counter(o); width: 24px; height: 24px; flex: none; border-radius: 50%; background: #d3e3fd; color: #041e49; display: grid; place-items: center; font-size: 12px; font-weight: 600; }
.gm-bigchart { background: var(--gm-soft); border-radius: 12px; padding: 18px 18px 10px; }
.gm-bars { height: 180px; display: flex; align-items: flex-end; gap: 10px; border-bottom: 1px solid #c4c7c5; position: relative; }
.gm-bars button { flex: 1; height: calc(var(--h) * 1%); background: #4169e1; border-radius: 4px 4px 0 0; transform-origin: bottom; transform: scaleY(0); animation: gm-grow .7s cubic-bezier(.3,1.3,.5,1) forwards; animation-delay: calc(var(--i) * 60ms); position: relative; transition: background .2s; }
.gm-bars button:hover, .gm-bars button[data-on="true"] { background: #1a3fa8; }
.gm-tip { position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); background: #1f1f1f; color: #fff; font-size: 12px; padding: 3px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none; }
.gm-labels { display: flex; gap: 10px; padding-top: 6px; }
.gm-labels span { flex: 1; text-align: center; font-size: 12px; color: var(--gm-mute); }
.gm-acts { display: flex; gap: 2px; margin: 8px 0 0 -10px; opacity: 0; animation: gm-word .4s ease .1s forwards; }
.gm-acts .gm-ib[data-on="true"] { color: #1a73e8; background: #d3e3fd; }
.gm-toast { position: absolute; left: 50%; bottom: 120px; transform: translateX(-50%); background: #1f1f1f; color: #fff; font-size: 14px; padding: 10px 18px; border-radius: 8px; animation: gm-pop .2s ease both; z-index: 20; }

/* prompt */
.gm-foot { padding: 0 24px 10px; }
.gm-prompt { max-width: 1070px; margin: 0 auto; background: var(--gm-soft); border-radius: 32px; min-height: 64px; display: flex; align-items: center; gap: 4px; padding: 6px 12px 6px 22px; transition: background .25s, box-shadow .25s; opacity: 0; animation: gm-word .6s cubic-bezier(.2,.8,.2,1) .7s forwards; transform: translateY(14px); }
.gm-prompt:focus-within { background: var(--gm-soft-2); }
.gm-prompt[data-listen="true"] { box-shadow: 0 0 0 2px #4b90ff, 0 0 30px -6px rgba(75,144,255,.6); }
.gm-prompt input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 17px; color: var(--gm-ink); padding: 10px 0; }
.gm-prompt input::placeholder { color: var(--gm-mute); }
.gm-chip { display: flex; align-items: center; gap: 6px; background: #fff; border-radius: 10px; padding: 5px 6px 5px 10px; font-size: 13px; max-width: 200px; animation: gm-pop .2s ease both; }
.gm-chip span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gm-chip button { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; color: var(--gm-mute); }
.gm-chip button:hover { background: var(--gm-soft); }
.gm-mic[data-on="true"] { color: #fff; background: #d93025; }
.gm-mic[data-on="true"]::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #d93025; animation: gm-ping 1.1s ease-out infinite; }
@keyframes gm-ping { from { transform: scale(.9); opacity: .8 } to { transform: scale(1.35); opacity: 0 } }
.gm-send { animation: gm-pop .2s ease both; color: #1a73e8 !important; }
.gm-disc { margin: 10px 0 0; text-align: center; font-size: 12px; color: var(--gm-mute); }
.gm-disc a { color: inherit; }

@container (max-width: 1000px) {
  .gm-cards { grid-template-columns: repeat(2, minmax(0,1fr)); margin-top: 48px; }
  .gm-card { height: 220px; }
}
@container (max-width: 640px) {
  .gm-rail { position: absolute; z-index: 15; height: 100%; width: 0; padding: 18px 0; }
  .gm-rail[data-open="true"] { width: 260px; padding: 18px 16px; box-shadow: 0 0 40px rgba(0,0,0,.2); }
  .gm-burger-m { display: grid !important; }
  .gm-top { padding-left: 8px; }
  .gm-model > button { font-size: 18px; }
  .gm-cards { grid-template-columns: 1fr 1fr; gap: 10px; }
  .gm-card { height: 190px; padding: 14px; }
  .gm-card h3 { font-size: 16px; }
  .gm-hello { padding-top: 24px; }
  .gm-col, .gm-foot { padding-left: 14px; padding-right: 14px; }
  .gm-pop.gm-apps { right: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .gm-root *, .gm-root *::before, .gm-root *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition: none !important; }
}
`

/* ── icons ── */

const Ic = {
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  help: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01" /></svg>,
  history: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" /></svg>,
  gear: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  caret: <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor"><path d="M1 3h8L5 7.5z" /></svg>,
  apps: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">{[4, 12, 20].flatMap((y) => [4, 12, 20].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" />))}</svg>,
  addImg: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>,
  mic: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1a7 7 0 0 0 6-6.9h-2z" /></svg>,
  send: <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17L22 12 3 20.5zM5 17.4 16.8 12 5 6.6v4.1l6 1.3-6 1.3v4.1z" /></svg>,
  up: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 10v11H3V10h4zm0 0 4-8a3 3 0 0 1 3 3v4h5.5a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.1 21H7" /></svg>,
  redo: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.6M20 3v5.6h-5.6" /></svg>,
  copy: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>,
  x: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>,
}

function Sparkle({ busy }: { busy: boolean }) {
  return (
    <span className="gm-spark" data-busy={busy}>
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <defs>
          <linearGradient id="gm-sp" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4b90ff" />
            <stop offset="1" stopColor="#d96570" />
          </linearGradient>
        </defs>
        <path d="M14 1c.9 6.6 5.4 11.1 13 13-7.6 1.9-12.1 6.4-13 13-.9-6.6-5.4-11.1-13-13 7.6-1.9 12.1-6.4 13-13z" fill="url(#gm-sp)" />
      </svg>
    </span>
  )
}

function inline(t: string, k: string) {
  return t.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") ? <strong key={`${k}${i}`} style={{ fontWeight: 500 }}>{p.slice(2, -2)}</strong> : p.startsWith("`") ? <code key={`${k}${i}`}>{p.slice(1, -1)}</code> : <span key={`${k}${i}`}>{p}</span>
  )
}

function Markdown({ text, caret }: { text: string; caret: boolean }) {
  const lines = text.split("\n")
  return (
    <div className="gm-md">
      {lines.map((raw, i) => {
        const t = raw.trim()
        const end = caret && i === lines.length - 1 ? <span className="gm-caret" /> : null
        if (!t) return end ? <p key={i}>{end}</p> : null
        if (t.startsWith("###")) return <p key={i} className="gm-h">{inline(t.replace(/^#+\s*/, ""), `h${i}`)}{end}</p>
        const b = t.match(/^[-*]\s+(.*)/)
        if (b) return <p key={i} className="gm-li">•&nbsp;&nbsp;{inline(b[1], `b${i}`)}{end}</p>
        const n = t.match(/^(\d+)\.\s+(.*)/)
        if (n) return <p key={i} className="gm-li">{n[1]}.&nbsp;&nbsp;{inline(n[2], `n${i}`)}{end}</p>
        return <p key={i}>{inline(t, `p${i}`)}{end}</p>
      })}
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  const [bar, setBar] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  if (block.kind === "code") {
    return (
      <div className="gm-block gm-codeblk">
        <header>
          <span>Python</span>
          <button type="button" onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400) }}>{copied ? "Copied" : "Copy code"}</button>
        </header>
        <pre>
          {block.lines.map((l, i) => (
            <div key={i} className={l.startsWith("#") ? "gm-cm" : undefined}>{l || " "}</div>
          ))}
        </pre>
      </div>
    )
  }
  if (block.kind === "outline") {
    return (
      <ol className="gm-block gm-outline">
        {block.items.map((it) => <li key={it}>{it}</li>)}
      </ol>
    )
  }
  const max = Math.max(...block.values)
  return (
    <div className="gm-block gm-bigchart">
      <div className="gm-bars" onMouseLeave={() => setBar(null)}>
        {block.values.map((v, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${block.labels[i]}: $${v}k`}
            data-on={bar === i}
            style={{ ["--h" as string]: (v / max) * 100, ["--i" as string]: i }}
            onMouseEnter={() => setBar(i)}
            onFocus={() => setBar(i)}
          >
            {bar === i && <span className="gm-tip">{block.labels[i]} · ${v}k</span>}
          </button>
        ))}
      </div>
      <div className="gm-labels">{block.labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  )
}

function CardArt({ id, delay }: { id: string; delay: number }) {
  if (id === "py") {
    return (
      <div className="gm-ill gm-code gm-fade">
        <ol>
          <li>
            Creating a dictionary of squares:
            <br />
            squares = {"{"}x: x**<span className="gm-n">2</span> <span className="gm-k">for</span> x <span className="gm-k">in</span> <span className="gm-f">range</span>(<span className="gm-n">1</span>, <span className="gm-n">6</span>){"}"}
            <br />
            print (squares) <span className="gm-placeholder"># Output: {"{"}1: 1, 2: 4, 3: 9, 4: 16, 5: 25{"}"}</span>
            <span className="gm-type"># Output: {"{"}1: 1, 2: 4 …{"}"}</span>
          </li>
          <li>Filtering a dictionary</li>
        </ol>
      </div>
    )
  }
  if (id === "pdf") {
    return (
      <div className="gm-ill">
        <span className="gm-plus">{Ic.plus}</span>
        <div className="gm-pdf">
          <b><i>PDF</i>PDF</b>
          <s /><s /><s style={{ width: "60%" }} />
        </div>
      </div>
    )
  }
  if (id === "plan") {
    return (
      <div className="gm-ill gm-fade" style={{ overflow: "hidden" }}>
        <div className="gm-plan">
          <p>Business Plan: [Your Shop Name] – Atlanta&apos;s Premier Board Game Destination</p>
          <p>1. Executive Summary</p>
          <p className="gm-dim">[Your Shop Name] will be a unique retail establishment dedicated to tabletop games, events and community nights.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="gm-ill">
      <div className="gm-chart">
        {CHART.map((h, i) => (
          <i key={i} style={{ ["--h" as string]: h, ["--i" as string]: i, ["--gm-d" as string]: `${delay}ms` }} />
        ))}
      </div>
    </div>
  )
}

const TRANSCRIPT = "Help me plan a product launch for next month"

export default function GeminiAI() {
  const [railOpen, setRailOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [appsOpen, setAppsOpen] = useState(false)
  const [model, setModel] = useState("adv")
  const [input, setInput] = useState("")
  const [file, setFile] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [activeRecent, setActiveRecent] = useState<string | null>(null)

  const timers = useRef<number[]>([])
  const idRef = useRef(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => clearTimeout(t))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el && msgs.length) el.scrollTop = el.scrollHeight
  }, [msgs])

  const flash = (t: string) => {
    setToast(t)
    later(() => setToast(null), 1600)
  }

  const stream = useCallback((q: string) => {
    const r = reply(q)
    const id = ++idRef.current
    setMsgs((m) => [...m, { id, role: "bot", text: "", full: r.text, block: r.block, done: false }])
    let i = 0
    const step = () => {
      i = Math.min(r.text.length, i + 4 + Math.floor(Math.random() * 5))
      const done = i >= r.text.length
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: r.text.slice(0, i), done } : x)))
      if (done) setBusy(false)
      else timers.current.push(window.setTimeout(step, 16))
    }
    timers.current.push(window.setTimeout(step, 900))
  }, [])

  const send = useCallback(
    (override?: string) => {
      const text = (override ?? input).trim()
      if (!text || busy) return
      const full = file ? `${text}\n📎 ${file}` : text
      setMsgs((m) => [...m, { id: ++idRef.current, role: "user", text: full, full, done: true }])
      setInput("")
      setFile(null)
      setListening(false)
      setBusy(true)
      stream(file ? `${text} attached` : text)
    },
    [input, busy, file, stream]
  )

  const newChat = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
    setMsgs([])
    setBusy(false)
    setInput("")
    setFile(null)
    setActiveRecent(null)
  }

  const toggleMic = () => {
    if (listening) {
      setListening(false)
      return
    }
    setListening(true)
    setInput("")
    TRANSCRIPT.split(" ").forEach((_, i, arr) => {
      later(() => setInput(arr.slice(0, i + 1).join(" ")), 350 + i * 180)
    })
    later(() => setListening(false), 350 + TRANSCRIPT.split(" ").length * 180 + 200)
  }

  const regenerate = (id: number) => {
    if (busy) return
    const idx = msgs.findIndex((m) => m.id === id)
    const q = msgs[idx - 1]?.text ?? ""
    setMsgs((m) => m.filter((x) => x.id !== id))
    setBusy(true)
    stream(q)
  }

  const chatting = msgs.length > 0
  const modelName = MODELS.find((m) => m.id === model)?.name ?? "Advanced"
  const q = "How can I help you today?".split(" ")

  return (
    <div className="gm-root" onClick={() => { setModelOpen(false); setAppsOpen(false) }}>
      <style>{CSS}</style>

      {/* rail */}
      <aside className="gm-rail" data-open={railOpen}>
        <button type="button" className="gm-ib" aria-label="Main menu" aria-expanded={railOpen} onClick={() => setRailOpen((o) => !o)} style={{ marginLeft: -8 }}>
          {Ic.menu}
        </button>
        <button type="button" className="gm-new" aria-label="New chat" onClick={newChat}>
          {Ic.plus}
          <span>New chat</span>
        </button>
        <div className="gm-recent">
          <p>Recent</p>
          {RECENTS.map((r) => (
            <button key={r} type="button" data-on={activeRecent === r} onClick={() => { setActiveRecent(r); newChat(); setActiveRecent(r) }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
              {r}
            </button>
          ))}
        </div>
        {!railOpen && <div className="gm-spacer" />}
        <div className="gm-rail-b">
          <button type="button" className="gm-ib" aria-label="Help" onClick={() => flash("Help center opened")}>{Ic.help}</button>
          <button type="button" className="gm-ib" aria-label="Activity" onClick={() => setRailOpen(true)}>{Ic.history}</button>
          <button type="button" className="gm-ib" aria-label="Settings" onClick={() => flash("Settings opened")}>{Ic.gear}<span className="gm-dot" /></button>
        </div>
      </aside>

      {/* main */}
      <div className="gm-main">
        <header className="gm-top">
          <div style={{ display: "flex", alignItems: "center" }}>
            <button type="button" className="gm-ib gm-burger-m" style={{ display: "none" }} aria-label="Main menu" onClick={() => setRailOpen((o) => !o)}>{Ic.menu}</button>
            <div className="gm-model" data-open={modelOpen} onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-haspopup="menu" aria-expanded={modelOpen} onClick={() => { setModelOpen((o) => !o); setAppsOpen(false) }}>
                Zepa <em>{modelName}</em> {Ic.caret}
              </button>
              {modelOpen && (
                <div className="gm-pop gm-models" role="menu">
                  {MODELS.map((m) => (
                    <button key={m.id} type="button" role="menuitemradio" aria-checked={model === m.id} onClick={() => { setModel(m.id); setModelOpen(false); flash(`Switched to ${m.name}`) }}>
                      <span><b>{m.name}</b><small>{m.note}</small></span>
                      {model === m.id && <span className="gm-check">{Ic.check}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="gm-top-r" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="gm-ib" aria-label="Apps" aria-expanded={appsOpen} onClick={() => { setAppsOpen((o) => !o); setModelOpen(false) }}>{Ic.apps}</button>
            {appsOpen && (
              <div className="gm-pop gm-apps">
                {APPS.map((a) => (
                  <button key={a.n} type="button" onClick={() => { setAppsOpen(false); flash(`Opening ${a.n}`) }}>
                    <i style={{ background: a.c }} />
                    {a.n}
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="gm-av" aria-label="Account"><span>S</span></button>
          </div>
        </header>

        <div className="gm-scroll" ref={scrollRef}>
          {!chatting ? (
            <div className="gm-col">
              <div className="gm-hello">
                <h1><span className="gm-name">Hello, Sam</span></h1>
                <p className="gm-q">
                  {q.map((w, i) => (
                    <span key={i} style={{ animationDelay: `${450 + i * 70}ms` }}>{w}&nbsp;</span>
                  ))}
                </p>
              </div>
              <div className="gm-cards">
                {CARDS.map((c, i) => {
                  const d = 650 + i * 90
                  return (
                    <button key={c.id} type="button" className="gm-card" style={{ ["--gm-d" as string]: `${d}ms` }} onClick={() => send(c.prompt)}>
                      <h3>{c.title}</h3>
                      <CardArt id={c.id} delay={d} />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="gm-chat">
              {msgs.map((m, i) =>
                m.role === "user" ? (
                  <div key={m.id} className="gm-u">
                    <span className="gm-uav">S</span>
                    <p>{m.text}</p>
                  </div>
                ) : (
                  <div key={m.id} className="gm-b">
                    <Sparkle busy={!m.done} />
                    <div className="gm-body">
                      {m.text ? (
                        <Markdown text={m.text} caret={!m.done} />
                      ) : (
                        <div className="gm-shimmer" aria-label="Thinking"><i /><i /><i /></div>
                      )}
                      {m.done && m.block && <BlockView block={m.block} />}
                      {m.done && (
                        <div className="gm-acts">
                          <button type="button" className="gm-ib" aria-label="Good response" data-on={m.vote === "up"} onClick={() => setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, vote: x.vote === "up" ? undefined : "up" } : x)))}>{Ic.up}</button>
                          <button type="button" className="gm-ib" aria-label="Bad response" data-on={m.vote === "down"} style={{ transform: "scaleY(-1)" }} onClick={() => setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, vote: x.vote === "down" ? undefined : "down" } : x)))}>{Ic.up}</button>
                          {i === msgs.length - 1 && <button type="button" className="gm-ib" aria-label="Regenerate" disabled={busy} onClick={() => regenerate(m.id)}>{Ic.redo}</button>}
                          <button type="button" className="gm-ib" aria-label="Copy" onClick={() => flash("Copied to clipboard")}>{Ic.copy}</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="gm-foot">
          <form
            className="gm-prompt"
            data-listen={listening}
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
          >
            {file && (
              <span className="gm-chip">
                <span>📎 {file}</span>
                <button type="button" aria-label="Remove file" onClick={() => setFile(null)}>{Ic.x}</button>
              </span>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Enter a prompt here"}
              aria-label="Prompt"
            />
            <button type="button" className="gm-ib" aria-label="Upload file" onClick={() => fileRef.current?.click()}>{Ic.addImg}</button>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setFile(f.name)
                e.target.value = ""
                inputRef.current?.focus()
              }}
            />
            <button type="button" className="gm-ib gm-mic" data-on={listening} aria-label={listening ? "Stop listening" : "Use microphone"} onClick={toggleMic}>{Ic.mic}</button>
            {input.trim() && !busy && (
              <button type="submit" className="gm-ib gm-send" aria-label="Send">{Ic.send}</button>
            )}
          </form>
          <p className="gm-disc">
            Zepa may display inaccurate info, including about people, so double-check its responses. <a href="#privacy" onClick={(e) => e.preventDefault()}>Your privacy &amp; Zepa Apps</a>
          </p>
        </div>
        {toast && <div className="gm-toast" role="status">{toast}</div>}
      </div>
    </div>
  )
}
