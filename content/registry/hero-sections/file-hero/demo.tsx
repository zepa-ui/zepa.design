"use client"

import { useEffect, useRef, useState } from "react"

/* ─────────────────────────────────────────────
   file-hero — a design-components hero with a
   fan of live UI cards spilling out of a glass
   folder

   · A dashed blueprint grid frames the page; six
     side specimens (search, graph, calendar,
     transactions, bar chart, flight) all work.
   · Nav pill glides between tabs; headline, copy
     and CTAs rise in on a stagger.
   · The cards fly out of the folder on load and
     fan into place, drift with the cursor at
     different depths, and on hover straighten,
     lift and come to the front. Each card has its
     own interaction: play the video, flip the
     currency, count the calories, reorder the
     grid, toggle stabilization, switch daily /
     weekly, play the track, start the sprint.
   · The frosted folder stays in front and the
     cards peek out behind it.

   No dependencies — CSS + a little state.
   ───────────────────────────────────────────── */

const IMG_VIDEO = "https://res.cloudinary.com/dzvffb6vv/image/upload/c_fill,w_520,h_340,g_auto/samples/two-ladies.jpg"
const IMG_MUSIC = "https://res.cloudinary.com/dakrfj1oh/image/upload/c_fill,w_200,h_200,g_auto/v1781518635/samples/people/jazz.jpg"
const IMG_RUN = "https://res.cloudinary.com/dzvffb6vv/image/upload/c_fill,w_320,h_320,g_auto/samples/woman-on-a-football-field.jpg"

const CSS = `
.fh-root { container-type: inline-size;
  --fh-blue: #2f80ed;
  --fh-ink: #0b0b0f;
  --fh-mute: #6b7280;
  --fh-line: #c9d3e3;
  box-sizing: border-box; position: relative; width: 100%; overflow: hidden;
  background: #f3f6fa; color: var(--fh-ink);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
.fh-root *, .fh-root *::before, .fh-root *::after { box-sizing: border-box; }
.fh-root button { font: inherit; color: inherit; cursor: pointer; border: 0; background: none; }
.fh-mono { font-family: ui-monospace, "SF Mono", Menlo, monospace; }

/* blueprint grid */
.fh-grid { position: absolute; inset: 0; pointer-events: none; }
.fh-v, .fh-h { position: absolute; border-color: #d4dceb; border-style: dashed; opacity: 0; animation: fh-fade .9s ease forwards; }
.fh-v { top: 0; bottom: 0; border-width: 0 0 0 1px; }
.fh-h { left: 0; right: 0; border-width: 1px 0 0 0; }
@keyframes fh-fade { to { opacity: 1 } }

.fh-inner { position: relative; max-width: 1440px; margin: 0 auto; display: grid; grid-template-columns: 300px 1fr 300px; gap: 0 32px; padding: 0 32px; }

/* side specimens */
.fh-side { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; padding-bottom: 60px; }
.fh-spec { position: relative; border: 1px solid #c3d0e6; background: rgba(255,255,255,.35); padding: 14px 14px; opacity: 0; transform: translateY(14px); animation: fh-rise .8s cubic-bezier(.2,.8,.2,1) forwards; animation-delay: var(--d); transition: background .25s, border-color .25s; }
.fh-spec:hover { background: rgba(255,255,255,.7); border-color: #9fb4d9; }
.fh-spec::before, .fh-spec::after, .fh-spec > .fh-c1, .fh-spec > .fh-c2 { content: ""; position: absolute; width: 6px; height: 6px; background: #8aa6d6; }
.fh-spec::before { left: -3px; top: -3px } .fh-spec::after { right: -3px; top: -3px }
.fh-spec > .fh-c1 { left: -3px; bottom: -3px } .fh-spec > .fh-c2 { right: -3px; bottom: -3px }
.fh-tag { font-size: 11px; color: #6b7a90; letter-spacing: .02em; margin: 0 0 12px; }
.fh-search { display: flex; align-items: center; justify-content: space-between; height: 41px; border-radius: 999px; padding: 0 5px 0 18px; margin-top: 10px; font-size: 13px; color: #4b5563; transition: box-shadow .25s; }
.fh-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; color: var(--fh-ink); }
.fh-search input::placeholder { color: #6b7280; }
.fh-s1 { background: #fff; box-shadow: 0 6px 18px -10px rgba(30,60,120,.35); }
.fh-s1 span { width: 30px; height: 30px; border-radius: 50%; background: #e5ebf5; display: grid; place-items: center; color: #7c8aa3; }
.fh-s2 { border: 1px solid #c7d2e4; }
.fh-s2 span { padding-right: 10px; color: #7c8aa3; }
.fh-search:focus-within { box-shadow: 0 0 0 3px rgba(47,128,237,.2); }
.fh-gr { width: 100%; height: 130px; display: block; }
.fh-gr path { fill: none; stroke-width: 1.6; stroke-linejoin: round; stroke-dasharray: 400; stroke-dashoffset: 400; animation: fh-draw 1.6s ease forwards .8s; }
@keyframes fh-draw { to { stroke-dashoffset: 0 } }
.fh-cal p { margin: 0 0 8px; text-align: center; font-size: 13px; color: #374151; }
.fh-cal-g { display: grid; grid-template-columns: repeat(7, 1fr); border-top: 1px solid #dfe5ef; border-left: 1px solid #dfe5ef; margin-bottom: 12px; }
.fh-cal-g button, .fh-cal-g span { height: 29px; font-size: 12px; color: #4b5563; border-right: 1px solid #dfe5ef; border-bottom: 1px solid #dfe5ef; display: grid; place-items: center; }
.fh-cal-g button { transition: background .15s, color .15s; }
.fh-cal-g button:hover { background: #eaf2ff; }
.fh-cal-g button[data-on="true"] { background: #dbeafe; color: var(--fh-blue); font-weight: 600; }
.fh-tx { display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-bottom: 1px solid #e3e9f2; border-radius: 8px; width: 100%; text-align: left; transition: background .2s, transform .2s; }
.fh-tx:last-child { border-bottom: 0; }
.fh-tx:hover { background: rgba(255,255,255,.8); transform: translateX(3px); }
.fh-tx i { width: 35px; height: 35px; border-radius: 50%; background: #e8edf5; display: grid; place-items: center; font-style: normal; font-size: 16px; filter: grayscale(1); opacity: .7; transition: filter .2s, opacity .2s; }
.fh-tx:hover i { filter: none; opacity: 1; }
.fh-tx b { display: block; font-weight: 400; font-size: 14px; color: #374151; }
.fh-tx small { font-size: 12px; color: #9ca3af; }
.fh-bars { display: flex; align-items: flex-end; gap: 14px; height: 160px; border-bottom: 1px solid #dfe5ef; padding: 0 6px; }
.fh-bars button { flex: 1; background: #dfe6f1; height: calc(var(--h) * 1%); transform-origin: bottom; transform: scaleY(0); animation: fh-grow .8s cubic-bezier(.3,1.3,.5,1) forwards; animation-delay: calc(1s + var(--i) * 80ms); transition: background .2s; }
.fh-bars button:hover, .fh-bars button[data-on="true"] { background: #a9cdf5; }
@keyframes fh-grow { to { transform: scaleY(1) } }
.fh-bl { display: flex; gap: 14px; padding: 8px 6px 0; }
.fh-bl span { flex: 1; text-align: center; font-size: 12px; color: #6b7280; }
.fh-bl span[data-on="true"] { color: var(--fh-blue); }
.fh-fl small { display: block; font-size: 11px; color: #6b7280; margin: 6px 0 6px; }
.fh-fl strong { display: block; font-weight: 400; font-size: 22px; color: #374151; transition: opacity .25s, transform .25s; }
.fh-fl-row { position: relative; border-bottom: 1px solid #c7d2e4; padding-bottom: 18px; margin-bottom: 14px; }
.fh-swap { position: absolute; right: 4px; bottom: -22px; width: 44px; height: 44px; border-radius: 50%; background: #6aa8e0 !important; color: #fff !important; display: grid; place-items: center; transition: transform .4s cubic-bezier(.3,1.4,.5,1); z-index: 1; }
.fh-swap:hover { transform: rotate(180deg); }

/* center */
.fh-center { display: flex; flex-direction: column; align-items: center; min-width: 0; }
.fh-nav { display: grid; grid-template-columns: 300px 1fr 300px; gap: 0 32px; align-items: center; height: 84px; grid-column: 1 / -1; }
.fh-brand { font-size: 26px; font-weight: 700; letter-spacing: -.02em; padding-left: 50px; opacity: 0; animation: fh-rise .7s ease forwards; }
.fh-tabs { position: relative; justify-self: center; display: flex; }
.fh-tabs button { position: relative; z-index: 1; padding: 0 18px; height: 72px; font-size: 16px; color: #9aa3b2; transition: color .25s; }
.fh-tabs button:hover { color: #4b5563; }
.fh-tabs button[data-on="true"] { color: var(--fh-blue); }
.fh-tab-ind { position: absolute; top: 0; height: 72px; border: 1px solid #c3d0e6; background: rgba(255,255,255,.35); transition: left .45s cubic-bezier(.3,1.2,.5,1), width .45s cubic-bezier(.3,1.2,.5,1); }
.fh-tab-ind::before, .fh-tab-ind::after { content: ""; position: absolute; width: 6px; height: 6px; background: #8aa6d6; bottom: -3px; }
.fh-tab-ind::before { left: -3px } .fh-tab-ind::after { right: -3px }
.fh-sign { justify-self: end; border: 1.5px solid var(--fh-ink) !important; border-radius: 999px; height: 48px; width: 240px; font-size: 16px; font-weight: 500; transition: background .25s, color .25s !important; }
.fh-sign:hover { background: var(--fh-ink) !important; color: #fff !important; }

.fh-h1 { margin: 10px -70px 0; text-align: center; font-size: clamp(30px, 3.4vw, 52px); line-height: 1.08; letter-spacing: -.035em; font-weight: 700; }
.fh-h1 span { display: inline-block; opacity: 0; transform: translateY(24px); animation: fh-rise .8s cubic-bezier(.2,.8,.2,1) forwards; }
.fh-p { margin: 16px auto 0; max-width: 520px; text-align: center; font-size: 17px; line-height: 1.6; color: #4b5563; opacity: 0; animation: fh-rise .8s ease .5s forwards; transform: translateY(14px); }
@keyframes fh-rise { to { opacity: 1; transform: none } }
.fh-ctas { display: flex; gap: 16px; margin-top: 24px; opacity: 0; animation: fh-rise .8s ease .62s forwards; transform: translateY(14px); }
.fh-try { white-space: nowrap; display: flex; align-items: center; gap: 28px; height: 54px; padding: 0 5px 0 64px; border-radius: 999px; background: var(--fh-blue) !important; color: #fff !important; font-size: 18px; font-weight: 500; box-shadow: 0 14px 30px -14px rgba(47,128,237,.8); transition: transform .25s, box-shadow .25s !important; }
.fh-try:hover { transform: translateY(-2px); box-shadow: 0 20px 36px -14px rgba(47,128,237,.9); }
.fh-try i { width: 44px; height: 44px; border-radius: 50%; background: #fff; color: var(--fh-blue); display: grid; place-items: center; font-style: normal; transition: transform .3s cubic-bezier(.3,1.5,.5,1); }
.fh-try:hover i { transform: translateX(4px) rotate(-12deg); }
.fh-sales { white-space: nowrap; height: 54px; padding: 0 56px; border-radius: 999px; background: #fff !important; font-size: 18px; font-weight: 600; transition: transform .25s, box-shadow .25s !important; }
.fh-sales:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -18px rgba(0,0,0,.4); }

/* stage */
.fh-stage { position: relative; width: 504px; height: 504px; margin-top: 4px; flex: none; }
.fh-scale { position: absolute; left: 50%; top: 0; width: 900px; height: 900px; margin-left: -450px; transform-origin: top center; transform: scale(.56); }
.fh-par { position: absolute; transition: transform .5s cubic-bezier(.2,.8,.2,1); }
.fh-card { position: absolute; left: 0; top: 0; border-radius: 18px; overflow: hidden; text-align: left; transform: translate(var(--fx), var(--fy)) rotate(0deg) scale(.3); opacity: 0; transition: transform .55s cubic-bezier(.3,1.25,.5,1), box-shadow .3s, filter .3s; box-shadow: 0 18px 40px -22px rgba(15,30,60,.45); }
.fh-out .fh-card { transform: translate(0,0) rotate(var(--r)) scale(1); opacity: 1; transition: transform 1s cubic-bezier(.25,1.2,.4,1), opacity .4s ease, box-shadow .3s; transition-delay: var(--d), var(--d), 0s; }
.fh-out .fh-par:hover { z-index: 40 !important; }
.fh-out .fh-par:hover .fh-card { transform: translate(0,-26px) rotate(0deg) scale(1.05); transition-delay: 0s; box-shadow: 0 34px 60px -24px rgba(15,30,60,.55); }

/* individual cards */
.fh-photo { width: 300px; height: 196px; background: linear-gradient(135deg,#d9cbb8,#a88f73) center/cover; border: 7px solid #fff; border-radius: 16px; }
.fh-photo img, .fh-cover img, .fh-run img { width: 100%; height: 100%; object-fit: cover; display: block; }
.fh-play { position: absolute; left: 50%; top: 50%; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; background: rgba(255,255,255,.4); backdrop-filter: blur(6px); display: grid; place-items: center; color: #fff; transition: transform .25s, background .25s; }
.fh-play:hover { transform: scale(1.12); background: rgba(255,255,255,.6); }
.fh-prog { position: absolute; left: 10px; right: 10px; bottom: 10px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.4); overflow: hidden; }
.fh-prog i { display: block; height: 100%; width: var(--p); background: #fff; transition: width .25s linear; }
.fh-ex { width: 310px; height: 300px; background: #eaff4f; padding: 22px 24px; }
.fh-ex header { display: flex; justify-content: space-between; font-size: 15px; font-weight: 500; border-bottom: 1px solid rgba(0,0,0,.12); padding-bottom: 16px; }
.fh-ex header button { display: flex; gap: 8px; align-items: center; font-weight: 600; font-size: 14px; padding: 2px 6px; border-radius: 6px; transition: background .2s; }
.fh-ex header button:hover { background: rgba(0,0,0,.08); }
.fh-ex strong { display: block; margin-top: 20px; font-size: 64px; font-weight: 500; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.fh-ex small { font-size: 14px; color: #3f3f1a; }
.fh-cal2 { width: 300px; height: 200px; background: linear-gradient(135deg,#ff8a3d,#f26a1b); color: #fff; padding: 22px; }
.fh-cal2 header { display: flex; gap: 12px; align-items: center; }
.fh-cal2 header i { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,.25); display: grid; place-items: center; font-style: normal; }
.fh-cal2 b { font-weight: 600; font-size: 17px; display: block; }
.fh-cal2 small { font-size: 12px; opacity: .8; }
.fh-cal2 strong { display: block; margin-top: 16px; font-size: 62px; font-weight: 600; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.fh-cal2::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.2) 1px, transparent 1.2px); background-size: 6px 6px; -webkit-mask-image: linear-gradient(120deg, transparent 50%, #000); mask-image: linear-gradient(120deg, transparent 50%, #000); pointer-events: none; }
.fh-gp { width: 350px; height: 330px; background: #1f1f23; color: #fff; padding: 22px 22px; }
.fh-gp header { display: flex; gap: 12px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.1); }
.fh-gp header i { width: 42px; height: 42px; border-radius: 50%; background: #e10600; display: grid; place-items: center; font-style: normal; font-size: 18px; }
.fh-gp header b { display: block; font-weight: 600; }
.fh-gp header small { color: #9b9ba3; font-size: 13px; }
.fh-gp > p { margin: 16px 0 8px; font-weight: 600; font-size: 15px; display: flex; gap: 10px; align-items: center; }
.fh-gp li { list-style: none; display: flex; align-items: center; gap: 12px; padding: 8px 6px; border-radius: 10px; font-size: 14px; color: #e4e4e7; transition: background .2s, transform .35s cubic-bezier(.3,1.3,.5,1); cursor: pointer; }
.fh-gp li:hover { background: rgba(255,255,255,.08); }
.fh-gp ol { margin: 0; padding: 0; }
.fh-gp li span:first-child { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: #111; }
.fh-gp li em { font-style: normal; color: #9b9ba3; width: 16px; }
.fh-stab { width: 290px; height: 300px; background: linear-gradient(160deg,#e6e8ec,#cfd3da); padding: 26px 24px; }
.fh-stab h4 { margin: 0; font-size: 34px; line-height: 1.1; letter-spacing: -.02em; font-weight: 600; }
.fh-stab p { margin: 14px 0 0; font-size: 13px; color: #374151; }
.fh-tog { margin-top: 22px; width: 54px; height: 30px; border-radius: 999px; background: #9ca3af !important; position: relative; transition: background .25s; }
.fh-tog::after { content: ""; position: absolute; left: 3px; top: 3px; width: 24px; height: 24px; border-radius: 50%; background: #fff; transition: transform .3s cubic-bezier(.3,1.4,.5,1); box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.fh-tog[data-on="true"] { background: #22c55e !important; }
.fh-tog[data-on="true"]::after { transform: translateX(24px); }
.fh-wob { animation: fh-wob .25s linear infinite; }
@keyframes fh-wob { 25% { transform: translate(1px,-1px) } 75% { transform: translate(-1px,1px) } }
.fh-st { width: 320px; height: 520px; background: #fff; border-radius: 28px; padding: 24px 22px; border: 1px solid #e5e7eb; }
.fh-st header { display: flex; gap: 14px; align-items: center; font-size: 22px; font-weight: 600; }
.fh-seg { position: relative; display: flex; margin-top: 20px; background: #f1f3f6; border-radius: 999px; padding: 4px; }
.fh-seg button { flex: 1; height: 32px; font-size: 13px; position: relative; z-index: 1; color: #6b7280; transition: color .25s; }
.fh-seg button[data-on="true"] { color: var(--fh-ink); }
.fh-seg i { position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); background: #fff; border-radius: 999px; box-shadow: 0 1px 3px rgba(0,0,0,.12); transition: left .35s cubic-bezier(.3,1.3,.5,1); }
.fh-st small { display: block; margin-top: 22px; color: #6b7280; font-size: 13px; }
.fh-st strong { display: flex; align-items: center; gap: 12px; font-size: 44px; font-weight: 600; letter-spacing: -.02em; }
.fh-st strong em { font-style: normal; font-size: 12px; font-weight: 600; color: #16a34a; background: #dcfce7; border-radius: 999px; padding: 3px 8px; }
.fh-stb { display: flex; align-items: flex-end; gap: 12px; height: 160px; margin-top: 18px; border-bottom: 1px solid #eef0f3; }
.fh-stb div { flex: 1; display: flex; flex-direction: column-reverse; border-radius: 4px 4px 0 0; overflow: hidden; height: calc(var(--h) * 1%); transition: height .5s cubic-bezier(.3,1.3,.5,1); }
.fh-stb div i { display: block; }
.fh-music { width: 300px; height: 140px; background: linear-gradient(120deg,#3a2c2c,#6b3f35 60%,#2b2424); color: #fff; padding: 18px; display: flex; gap: 14px; }
.fh-cover { width: 64px; height: 64px; flex: none; border-radius: 10px; overflow: hidden; background: #8a5a4a; }
.fh-music b { display: block; font-size: 26px; font-weight: 500; letter-spacing: -.02em; }
.fh-music small { font-size: 12px; opacity: .7; }
.fh-mbar { position: absolute; left: 18px; right: 18px; bottom: 16px; display: flex; align-items: center; gap: 10px; font-size: 11px; opacity: .8; }
.fh-mbar span { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.25); overflow: hidden; }
.fh-mbar span i { display: block; height: 100%; background: #fff; width: var(--p); transition: width .25s linear; }
.fh-mplay { width: 30px; height: 30px; border-radius: 50%; background: #fff !important; color: #3a2c2c !important; display: grid; place-items: center; flex: none; transition: transform .2s; }
.fh-mplay:hover { transform: scale(1.1); }
.fh-eq { display: inline-flex; gap: 2px; align-items: flex-end; height: 12px; margin-left: 6px; }
.fh-eq i { width: 3px; background: #fff; border-radius: 1px; animation: fh-eq .6s ease-in-out infinite alternate; }
.fh-eq i:nth-child(2) { animation-delay: .15s } .fh-eq i:nth-child(3) { animation-delay: .3s }
@keyframes fh-eq { from { height: 3px } to { height: 12px } }
.fh-sprint { width: 270px; height: 360px; background: linear-gradient(160deg,#e9edf3,#cfd8e3); padding: 22px; }
.fh-sprint b { font-size: 30px; font-weight: 600; letter-spacing: -.02em; display: block; }
.fh-sprint small { color: #6b7280; font-size: 13px; }
.fh-run { width: 190px; height: 190px; border-radius: 50%; overflow: hidden; margin: 20px auto 0; background: linear-gradient(135deg,#9db6d2,#56718f); box-shadow: 0 0 0 0 rgba(47,128,237,.4); transition: box-shadow .3s; }
.fh-sprint[data-on="true"] .fh-run { animation: fh-pulse 1.2s ease-out infinite; }
@keyframes fh-pulse { 0% { box-shadow: 0 0 0 0 rgba(47,128,237,.5) } 100% { box-shadow: 0 0 0 22px rgba(47,128,237,0) } }
.fh-timer { margin-top: 12px; text-align: center; font-size: 13px; color: #374151; font-variant-numeric: tabular-nums; }
.fh-rev { width: 280px; height: 420px; background: #a28cf5; color: #1d1442; padding: 22px; }
.fh-rev b { font-weight: 600; font-size: 17px; }
.fh-rev strong { display: block; margin-top: 10px; font-size: 44px; font-weight: 600; letter-spacing: -.03em; }
.fh-rev small { font-size: 12px; opacity: .8; }
.fh-rev svg { margin-top: 30px; width: 100%; height: 150px; }
.fh-rev svg path { stroke-dasharray: 500; stroke-dashoffset: 500; transition: stroke-dashoffset 1.2s ease; }
.fh-out .fh-rev svg path { stroke-dashoffset: 0; transition-delay: 1.4s; }
.fh-par:hover .fh-rev svg path { animation: fh-redraw 1.2s ease; }
@keyframes fh-redraw { from { stroke-dashoffset: 500 } to { stroke-dashoffset: 0 } }
.fh-file { width: 240px; height: 84px; background: #fff; padding: 16px; display: flex; gap: 14px; align-items: center; border-radius: 14px; }
.fh-file i { width: 40px; height: 48px; border-radius: 4px 12px 4px 4px; display: grid; place-items: end center; padding-bottom: 6px; font-style: normal; font-size: 8px; font-weight: 800; color: #fff; }
.fh-file b { display: block; font-weight: 500; font-size: 15px; }
.fh-file small { color: #6b7280; font-size: 13px; }
.fh-kwh { width: 170px; height: 170px; border-radius: 50% !important; background: #f7cb45; display: grid; place-content: center; text-align: center; }
.fh-kwh strong { font-size: 44px; font-weight: 500; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.fh-kwh small { font-size: 13px; font-weight: 500; }
.fh-chip { width: 88px; height: 88px; border-radius: 50% !important; display: grid; place-items: center; }

/* folder */
.fh-folder { position: absolute; left: 130px; top: 500px; width: 640px; height: 400px; z-index: 200; pointer-events: none; opacity: 0; transform: translateY(40px); animation: fh-rise 1s cubic-bezier(.2,.8,.2,1) .3s forwards; }
.fh-glass { position: absolute; inset: 0; border-radius: 34px; background: linear-gradient(170deg, rgba(150,182,222,.93) 0%, rgba(98,138,200,.95) 55%, rgba(70,108,178,.97) 100%); backdrop-filter: blur(30px) saturate(150%); -webkit-backdrop-filter: blur(30px) saturate(150%); clip-path: path("M0 34 Q0 0 34 0 L300 0 Q322 0 334 18 L366 72 Q378 92 400 92 L606 92 Q640 92 640 126 L640 366 Q640 400 606 400 L34 400 Q0 400 0 366 Z"); box-shadow: inset 0 1px 0 rgba(255,255,255,.6); }
.fh-glass::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,.35), transparent 30%); }
.fh-fshadow { position: absolute; left: 40px; right: 40px; bottom: -30px; height: 60px; background: rgba(60,100,170,.35); filter: blur(30px); border-radius: 50%; }
.fh-folder h3 { position: absolute; left: 60px; bottom: 50px; margin: 0; color: #fff; font-size: 56px; line-height: 1.05; font-weight: 700; letter-spacing: -.02em; text-shadow: 0 2px 20px rgba(30,60,120,.3); }

@container (max-width: 1360px) {
  .fh-inner { grid-template-columns: 240px 1fr 240px; }
  .fh-nav { grid-template-columns: 240px 1fr 240px; }
  .fh-sign { width: 200px; }
  .fh-brand { padding-left: 20px; }
  .fh-tabs button { padding: 0 14px; font-size: 16px; }
}
@container (max-width: 1160px) {
  .fh-inner { grid-template-columns: 1fr; padding: 0 20px; }
  .fh-nav { grid-template-columns: auto 1fr auto; }
  .fh-side { display: none; }
  .fh-tabs { display: none; }
  .fh-sign { width: auto; padding: 0 28px; height: 48px; font-size: 16px; }
  .fh-brand { padding-left: 0; font-size: 24px; }
}
@container (max-width: 960px) {
  .fh-ctas { gap: 10px; }
  .fh-try { padding-left: 36px; }
  .fh-sales { padding: 0 32px; }
  .fh-stage { width: 500px; height: 500px; }
  .fh-scale { transform: scale(.555); }
  .fh-h1 { margin: 10px 0 0; }
}
@container (max-width: 700px) {
  .fh-center { overflow: hidden; }
  .fh-h1 { font-size: 30px; }
  .fh-stage { width: 360px; height: 370px; }
  .fh-scale { transform: scale(.4); }
  .fh-p { font-size: 17px; }
  .fh-ctas { flex-direction: column; width: 100%; align-items: stretch; gap: 12px; }
  .fh-try { justify-content: space-between; padding-left: 28px; height: 58px; font-size: 19px; }
  .fh-try i { width: 46px; height: 46px; }
  .fh-sales { padding: 0; height: 58px; font-size: 19px; }
  .fh-nav { height: 84px; }
}
@media (prefers-reduced-motion: reduce) {
  .fh-root *, .fh-root *::before, .fh-root *::after { animation-duration: .01ms !important; animation-delay: 0ms !important; transition-duration: .01ms !important; transition-delay: 0ms !important; }
}
`

/* ── data ── */

const TABS = ["Home", "Features", "Case Study", "Testimonials", "How it works"]
const TX = [
  { n: "Movie Tickets", i: "🎟️" },
  { n: "Coffee", i: "☕" },
  { n: "Pets Food", i: "🐶" },
  { n: "Grocery Store", i: "🛒" },
  { n: "Pets Food", i: "🐱" },
]
const BARS = [100, 64, 22, 80, 22, 56]
const DRIVERS = [
  { n: "Max", c: "#3b82f6" },
  { n: "Oscar", c: "#f97316" },
  { n: "George", c: "#14b8a6" },
  { n: "Lando", c: "#eab308" },
]
const ST_DAILY = [62, 48, 54, 58, 22, 50, 40]
const ST_WEEKLY = [80, 70, 44, 66, 60, 86, 52]

/* card layout: position, rotation, parallax depth, entrance delay, z */
type Spot = { x: number; y: number; r: number; depth: number; d: number; z: number }
const S: Record<string, Spot> = {
  photo: { x: 60, y: 80, r: -11, depth: 0.5, d: 0, z: 4 },
  ex: { x: 380, y: 10, r: 4, depth: 0.35, d: 80, z: 3 },
  cal: { x: 640, y: 110, r: 24, depth: 0.6, d: 160, z: 3 },
  gp: { x: 220, y: 200, r: -7, depth: 0.7, d: 240, z: 6 },
  stab: { x: 360, y: 330, r: 4, depth: 0.85, d: 320, z: 8 },
  st: { x: 540, y: 250, r: 9, depth: 1, d: 400, z: 12 },
  music: { x: -150, y: 300, r: -16, depth: 0.55, d: 460, z: 5 },
  sprint: { x: -110, y: 520, r: -14, depth: 0.7, d: 520, z: 9 },
  rev: { x: 120, y: 470, r: -4, depth: 0.8, d: 580, z: 10 },
  xls: { x: -20, y: 200, r: -6, depth: 0.45, d: 640, z: 7 },
  pdf: { x: -40, y: 760, r: -6, depth: 0.5, d: 700, z: 11 },
  kwh: { x: 800, y: 330, r: 0, depth: 0.65, d: 760, z: 6 },
  calchip: { x: 790, y: 540, r: 0, depth: 1.1, d: 820, z: 13 },
  plane: { x: 820, y: 720, r: 0, depth: 1.2, d: 880, z: 14 },
}

function useTick(on: boolean, ms: number, cb: () => void) {
  const ref = useRef(cb)
  useEffect(() => {
    ref.current = cb
  })
  useEffect(() => {
    if (!on) return
    const t = window.setInterval(() => ref.current(), ms)
    return () => window.clearInterval(t)
  }, [on, ms])
}

function Img({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true)
  return ok ? <img src={src} alt={alt} loading="lazy" draggable={false} onError={() => setOk(false)} /> : null
}

export default function FileHero() {
  const [out, setOut] = useState(false)
  const [tab, setTab] = useState(0)
  const [ind, setInd] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const stageRef = useRef<HTMLDivElement | null>(null)

  // side specimens
  const [day, setDay] = useState(16)
  const [bar, setBar] = useState(3)
  const [route, setRoute] = useState(["New York", "Abu Dhabi"])

  // cards
  const [playing, setPlaying] = useState(false)
  const [vp, setVp] = useState(18)
  const [eur, setEur] = useState(false)
  const [kcal, setKcal] = useState(11840)
  const [grid, setGrid] = useState(DRIVERS)
  const [stab, setStab] = useState(true)
  const [weekly, setWeekly] = useState(false)
  const [music, setMusic] = useState(false)
  const [mp, setMp] = useState(32)
  const [sprint, setSprint] = useState(false)
  const [secs, setSecs] = useState(0)
  const [kwh, setKwh] = useState(45)

  useEffect(() => {
    const t = window.setTimeout(() => setOut(true), 450)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const b = tabRefs.current[tab]
    if (b) setInd({ left: b.offsetLeft, width: b.offsetWidth })
  }, [tab])

  useTick(playing, 120, () => setVp((p) => (p >= 100 ? 0 : p + 1)))
  useTick(music, 250, () => setMp((p) => (p >= 100 ? 0 : p + 0.6)))
  useTick(sprint, 1000, () => setSecs((s) => s + 1))

  const onMove = (e: React.MouseEvent) => {
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setMouse({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
  }

  const place = (k: string) => {
    const s = S[k]
    const fx = 450 - s.x - 100
    const fy = 640 - s.y
    return {
      wrap: {
        left: s.x,
        top: s.y,
        zIndex: s.z,
        transform: `translate(${mouse.x * -40 * s.depth}px, ${mouse.y * -30 * s.depth}px)`,
      } as React.CSSProperties,
      card: { ["--r" as string]: `${s.r}deg`, ["--d" as string]: `${s.d}ms`, ["--fx" as string]: `${fx}px`, ["--fy" as string]: `${fy}px` } as React.CSSProperties,
    }
  }

  const rate = eur ? 263.18 : 285.72
  const words = "Organize design components and make them ready for next project".split(" ")
  const stVals = weekly ? ST_WEEKLY : ST_DAILY

  return (
    <section className="fh-root">
      <style>{CSS}</style>

      <div className="fh-grid" aria-hidden>
        {["24px", "56px", "352px", "386px", "calc(100% - 386px)", "calc(100% - 352px)", "calc(100% - 56px)", "calc(100% - 24px)"].map((l, i) => (
          <span key={l} className="fh-v" style={{ left: l, animationDelay: `${i * 60}ms` }} />
        ))}
        {[20, 92].map((t, i) => (
          <span key={t} className="fh-h" style={{ top: t, animationDelay: `${i * 60}ms` }} />
        ))}
      </div>

      <div className="fh-inner">
        <nav className="fh-nav">
          <div className="fh-brand">Components</div>
          <div className="fh-tabs">
            <span className="fh-tab-ind" style={{ left: ind.left, width: ind.width }} />
            {TABS.map((t, i) => (
              <button key={t} type="button" ref={(el) => { tabRefs.current[i] = el }} data-on={tab === i} onClick={() => setTab(i)}>
                {t}
              </button>
            ))}
          </div>
          <button type="button" className="fh-sign">Sign In</button>
        </nav>

        {/* left specimens */}
        <aside className="fh-side">
          <div className="fh-spec" style={{ ["--d" as string]: "300ms", minHeight: 210 }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">01_SEARCH</p>
            <label className="fh-search fh-s1" style={{ marginTop: 24 }}>
              <input placeholder="Search here" aria-label="Search" />
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              </span>
            </label>
            <label className="fh-search fh-s2">
              <input placeholder="Search here" aria-label="Search" />
              <span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              </span>
            </label>
          </div>
          <div className="fh-spec fh-cal" style={{ ["--d" as string]: "420ms", marginTop: 18 }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">03_CALENDAR</p>
            {["January 2025", "February 2025"].map((m, mi) => (
              <div key={m}>
                <p>{m}</p>
                <div className="fh-cal-g">
                  <span /><span />
                  {Array.from({ length: mi ? 26 : 31 }, (_, i) => i + 1).map((d) => {
                    const key = mi * 100 + d
                    return (
                      <button key={d} type="button" data-on={day === key} onClick={() => setDay(key)} aria-label={`${m.split(" ")[0]} ${d}`}>
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="fh-spec" style={{ ["--d" as string]: "540ms" }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">05_BAR_CHART</p>
            <div className="fh-bars">
              {BARS.map((h, i) => (
                <button key={i} type="button" aria-label={`Bar 0${i + 1}`} data-on={bar === i} style={{ ["--h" as string]: h, ["--i" as string]: i }} onMouseEnter={() => setBar(i)} onClick={() => setBar(i)} />
              ))}
            </div>
            <div className="fh-bl fh-mono">
              {BARS.map((_, i) => <span key={i} data-on={bar === i}>0{i + 1}</span>)}
            </div>
          </div>
        </aside>

        {/* center */}
        <div className="fh-center">
          <h1 className="fh-h1">
            {words.map((w, i) => (
              <span key={i} style={{ animationDelay: `${120 + i * 45}ms` }}>{w}&nbsp;</span>
            ))}
          </h1>
          <p className="fh-p">No more headaches when you’re looking for design components from your past explorations.</p>
          <div className="fh-ctas">
            <button type="button" className="fh-try">
              Try for free
              <i>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </i>
            </button>
            <button type="button" className="fh-sales">Contact Sales</button>
          </div>

          <div className="fh-stage" ref={stageRef} onMouseMove={onMove} onMouseLeave={() => setMouse({ x: 0, y: 0 })}>
            <div className={`fh-scale${out ? " fh-out" : ""}`}>
              {/* video photo */}
              <div className="fh-par" style={place("photo").wrap}>
                <div className="fh-card fh-photo" style={place("photo").card}>
                  <Img src={IMG_VIDEO} alt="Video thumbnail" />
                  <button type="button" className="fh-play" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
                    {playing ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
                    )}
                  </button>
                  <div className="fh-prog"><i style={{ ["--p" as string]: `${vp}%` }} /></div>
                </div>
              </div>

              {/* exchange */}
              <div className="fh-par" style={place("ex").wrap}>
                <div className="fh-card fh-ex" style={place("ex").card}>
                  <header>
                    <span>Exchange</span>
                    <button type="button" onClick={() => setEur((v) => !v)} aria-label="Swap currencies">
                      {eur ? "EUR" : "USD"} → {eur ? "USD" : "EUR"}
                    </button>
                  </header>
                  <strong>{eur ? "€" : "$"}{rate.toFixed(2)}</strong>
                  <small>Available balance</small>
                </div>
              </div>

              {/* calories */}
              <div className="fh-par" style={place("cal").wrap}>
                <button type="button" className="fh-card fh-cal2" style={place("cal").card} onClick={() => setKcal((k) => k + 120)}>
                  <header>
                    <i>🔥</i>
                    <div>
                      <b>Calories Burned</b>
                      <small>Your Age 37 · tap to add</small>
                    </div>
                  </header>
                  <strong>{kcal.toLocaleString("en-US")}</strong>
                </button>
              </div>

              {/* grand prix */}
              <div className="fh-par" style={place("gp").wrap}>
                <div className="fh-card fh-gp" style={place("gp").card}>
                  <header>
                    <i>🏁</i>
                    <div>
                      <b>Saudi Arabian GP</b>
                      <small>Tomorrow, 00:00</small>
                    </div>
                  </header>
                  <p>⚑ Starting Grid</p>
                  <ol>
                    {grid.map((d, i) => (
                      <li key={d.n} title="Click to move up" onClick={() => i > 0 && setGrid((g) => { const n = [...g]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n })}>
                        <span style={{ background: d.c }}>{d.n[0]}</span>
                        <em>{i + 1}.</em>
                        {d.n}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* stabilization */}
              <div className="fh-par" style={place("stab").wrap}>
                <div className="fh-card fh-stab" style={place("stab").card}>
                  <h4 className={stab ? undefined : "fh-wob"}>Video Stabilization</h4>
                  <p>Smooth out shaky footage for a professional look.</p>
                  <button type="button" className="fh-tog" data-on={stab} aria-pressed={stab} aria-label="Toggle stabilization" onClick={() => setStab((v) => !v)} />
                </div>
              </div>

              {/* screen time */}
              <div className="fh-par" style={place("st").wrap}>
                <div className="fh-card fh-st" style={place("st").card}>
                  <header>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                    Screen Time
                  </header>
                  <div className="fh-seg">
                    <i style={{ left: weekly ? "50%" : 4 }} />
                    <button type="button" data-on={!weekly} onClick={() => setWeekly(false)}>Daily</button>
                    <button type="button" data-on={weekly} onClick={() => setWeekly(true)}>Weekly</button>
                  </div>
                  <small>{weekly ? "Weekly Average" : "Daily Average"}</small>
                  <strong>
                    {weekly ? "6h 02m" : "8h 28m"} <em>{weekly ? "+4,10%" : "-12,56%"}</em>
                  </strong>
                  <div className="fh-stb">
                    {stVals.map((h, i) => (
                      <div key={i} style={{ ["--h" as string]: h }}>
                        <i style={{ flex: 5, background: "#3b5bfd" }} />
                        <i style={{ flex: 2, background: "#a855f7" }} />
                        <i style={{ flex: 1.4, background: "#2dd4bf" }} />
                        <i style={{ flex: 1, background: "#f97316" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* music */}
              <div className="fh-par" style={place("music").wrap}>
                <div className="fh-card fh-music" style={place("music").card}>
                  <div className="fh-cover"><Img src={IMG_MUSIC} alt="Album cover" /></div>
                  <div>
                    <b>Green Light{music && <span className="fh-eq"><i /><i /><i /></span>}</b>
                    <small>Lorde</small>
                  </div>
                  <div className="fh-mbar">
                    <button type="button" className="fh-mplay" aria-label={music ? "Pause" : "Play"} onClick={() => setMusic((m) => !m)}>
                      {music ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8z" /></svg>
                      )}
                    </button>
                    <span><i style={{ ["--p" as string]: `${mp}%` }} /></span>
                    03:55
                  </div>
                </div>
              </div>

              {/* sprint */}
              <div className="fh-par" style={place("sprint").wrap}>
                <button type="button" className="fh-card fh-sprint" data-on={sprint} style={place("sprint").card} onClick={() => setSprint((s) => !s)}>
                  <b>Sprint Mode</b>
                  <small>{sprint ? "Running · tap to stop" : "Tap to start · 4 songs"}</small>
                  <div className="fh-run"><Img src={IMG_RUN} alt="Runner" /></div>
                  <div className="fh-timer">{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</div>
                </button>
              </div>

              {/* revenue */}
              <div className="fh-par" style={place("rev").wrap}>
                <div className="fh-card fh-rev" style={place("rev").card}>
                  <b>Monthly Revenue</b>
                  <strong>$12,480</strong>
                  <small>14 Jan – 13 Feb</small>
                  <svg viewBox="0 0 240 150" fill="none" aria-hidden>
                    <path d="M0 140 L40 120 L80 70 L120 90 L160 40 L200 55 L240 10" stroke="#1d1442" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <small>This month</small>
                </div>
              </div>

              {/* files */}
              <div className="fh-par" style={place("xls").wrap}>
                <div className="fh-card fh-file" style={place("xls").card}>
                  <i style={{ background: "#21a366" }}>XLS</i>
                  <div><b>List of Elements</b><small>12.4 MB</small></div>
                </div>
              </div>
              <div className="fh-par" style={place("pdf").wrap}>
                <div className="fh-card fh-file" style={place("pdf").card}>
                  <i style={{ background: "#e5484d" }}>PDF</i>
                  <div><b>Vintage Brief</b><small>3.5 MB</small></div>
                </div>
              </div>

              {/* kwh */}
              <div className="fh-par" style={place("kwh").wrap}>
                <button type="button" className="fh-card fh-kwh" style={place("kwh").card} onClick={() => setKwh((k) => (k >= 60 ? 30 : k + 5))} aria-label="Cycle energy">
                  <strong>±{kwh}</strong>
                  <small>kWh per day</small>
                </button>
              </div>

              {/* chips */}
              <div className="fh-par" style={place("calchip").wrap}>
                <div className="fh-card fh-chip" style={{ ...place("calchip").card, background: "#7cb6f0" }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0b2a55" strokeWidth="2" strokeLinecap="round"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h2M14 14h2M8 17h2" /></svg>
                </div>
              </div>
              <div className="fh-par" style={place("plane").wrap}>
                <div className="fh-card fh-chip" style={{ ...place("plane").card, background: "#d5e3e1" }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0b0b0f" strokeWidth="2" strokeLinejoin="round"><path d="M22 3 2 10l8 3 3 8z" /><path d="m10 13 5-5" /></svg>
                </div>
              </div>

              {/* folder (static) */}
              <div className="fh-folder" aria-hidden>
                <div className="fh-fshadow" />
                <div className="fh-glass" />
                <h3>Design<br />Components</h3>
              </div>
            </div>
          </div>
        </div>

        {/* right specimens */}
        <aside className="fh-side">
          <div className="fh-spec" style={{ ["--d" as string]: "360ms", minHeight: 210 }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">02_GRAPHS</p>
            <svg className="fh-gr" viewBox="0 0 260 160" aria-hidden>
              {[0, 1, 2, 3].map((i) => <line key={i} x1={i * 65 + 32} x2={i * 65 + 32} y1="10" y2="130" stroke="#e1e7f0" />)}
              <rect x="1" y="10" width="258" height="120" fill="none" stroke="#e1e7f0" />
              <path d="M2 50 L40 50 L70 15 L100 15 L130 90 L160 50 L200 50 L258 50" stroke="#5aa1e3" />
              <path d="M2 100 L40 75 L70 75 L100 30 L130 30 L160 70 L200 70 L225 95 L258 50" stroke="#2b2b33" style={{ animationDelay: "1.1s" }} />
              {["W1", "W2", "W3", "W4"].map((w, i) => <text key={w} x={i * 65 + 32} y="150" textAnchor="middle" fontSize="10" fill="#374151">{w}</text>)}
            </svg>
          </div>
          <div className="fh-spec" style={{ ["--d" as string]: "480ms", marginTop: 18 }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">04_TRANSACTIONS</p>
            {TX.map((t, i) => (
              <button key={i} type="button" className="fh-tx">
                <i>{t.i}</i>
                <span><b>{t.n}</b><small>$12.5</small></span>
              </button>
            ))}
          </div>
          <div className="fh-spec fh-fl" style={{ ["--d" as string]: "600ms", marginTop: 12 }}>
            <i className="fh-c1" /><i className="fh-c2" />
            <p className="fh-tag fh-mono">06_FLIGHT</p>
            <div className="fh-fl-row">
              <small className="fh-mono">From</small>
              <strong className="fh-mono">{route[0]}</strong>
              <button type="button" className="fh-swap" aria-label="Swap cities" onClick={() => setRoute((r) => [r[1], r[0]])}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4" /></svg>
              </button>
            </div>
            <small className="fh-mono">To</small>
            <strong className="fh-mono">{route[1]}</strong>
          </div>
        </aside>
      </div>
    </section>
  )
}
