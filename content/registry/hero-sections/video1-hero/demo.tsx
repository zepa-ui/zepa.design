/**
 * Component originally based on /video — animusstudios.com style hero.
 * Modified for Zepa UI.
 */
"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"

const VIDEO_SRC =
  "https://res.cloudinary.com/dakrfj1oh/video/upload/v1781518638/samples/sea-turtle.mp4"

/* subtle contour-wave background as an inline SVG tile */
const WAVES = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='260' height='400' viewBox='0 0 260 400'>
  <g fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'>
    <path d='M20 -20 C 60 80, -10 180, 30 400'/>
    <path d='M80 -20 C 120 90, 50 190, 90 400'/>
    <path d='M140 -20 C 180 80, 110 200, 150 400'/>
    <path d='M200 -20 C 240 90, 170 190, 210 400'/>
    <path d='M260 -20 C 300 80, 230 200, 270 400'/>
  </g>
</svg>`)

export default function Video1Hero() {
  return (
    <div className="vd-root">
      <style>{css}</style>

      {/* logo */}
      <Link href="/" className="vd-logo">
        <Image
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          width={100}
          height={32}
          style={{ height: 40, width: "auto", objectFit: "contain" }}
          priority
        />
      </Link>

      {/* header right */}
      <div className="vd-hdr">
        <Link href="/components" className="vd-touch">Browse Components</Link>
        <button className="vd-menu" aria-label="Menu">
          <i className="vdc tl" /><i className="vdc tr" /><i className="vdc bl" /><i className="vdc br" />
          <span /><span />
        </button>
      </div>

      {/* hero words */}
      <h1 className="vd-find">Build</h1>
      <h1 className="vd-your">Y<em>our</em></h1>
      <h1 className="vd-fasc">V<em>i</em>sion</h1>

      {/* center video */}
      <div className="vd-video">
        <video src={VIDEO_SRC} autoPlay muted loop playsInline />
      </div>

      {/* left icons */}
      <div className="vd-left">✳<br />✢<br />❋</div>

      {/* vertical side text */}
      <div className="vd-side">
        <div className="vd-lines">||||||||</div>
        <div className="vd-stext">Built&nbsp;for&nbsp;Builders</div>
      </div>

      {/* tagline */}
      <p className="vd-tag">From concept to component, beautifully crafted.</p>
    </div>
  )
}

const css = `
.vd-root {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #232322;
  color: #fff;
  font-family: var(--font-manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  -webkit-font-smoothing: antialiased;
  user-select: none;
  background-image: url("data:image/svg+xml,${WAVES}");
  background-size: 260px 400px;
}

/* ── logo ── */
.vd-logo {
  position: absolute; top: 26px; left: 38px; z-index: 40; display: block;
}

/* ── header right ── */
.vd-hdr {
  position: absolute; top: 30px; right: 34px; z-index: 40;
  display: flex; align-items: center; gap: 30px;
}
.vd-touch {
  background: none; border: 1px solid rgba(255,255,255,.5);
  border-radius: 4px; color: #fff; font-size: 14.5px;
  padding: 15px 26px; cursor: pointer; text-decoration: none;
  display: inline-block; transition: background 0.2s;
}
.vd-touch:hover { background: rgba(255,255,255,.08); }

/* hamburger */
.vd-menu {
  position: relative; width: 58px; height: 58px;
  background: none; border: none; cursor: pointer;
}
.vd-menu span {
  display: block; width: 26px; height: 1.8px;
  background: #fff; margin: 4px auto;
}
.vd-menu .vdc { position: absolute; width: 10px; height: 10px; }
.vd-menu .vdc.tl { left:0; top:0; border-left:1.5px solid #fff; border-top:1.5px solid #fff; }
.vd-menu .vdc.tr { right:0; top:0; border-right:1.5px solid #fff; border-top:1.5px solid #fff; }
.vd-menu .vdc.bl { left:0; bottom:0; border-left:1.5px solid #fff; border-bottom:1.5px solid #fff; }
.vd-menu .vdc.br { right:0; bottom:0; border-right:1.5px solid #fff; border-bottom:1.5px solid #fff; }

/* ── hero words ── */
.vd-root h1 { margin:0; font-weight:200; line-height:.9; letter-spacing:.01em; }
.vd-root h1 em { font-family: Georgia, 'Times New Roman', serif; font-style:italic; font-weight:400; }

.vd-find {
  position:absolute; left:8vw; top:14vh; z-index:1;
  font-size: clamp(90px, 15vw, 300px);
  animation: vdUp 1s cubic-bezier(.2,.8,.2,1) .1s backwards;
}
.vd-your {
  position:absolute; right:6vw; top:40vh; z-index:3;
  font-size: clamp(80px, 12.5vw, 250px);
  animation: vdUp 1s cubic-bezier(.2,.8,.2,1) .35s backwards;
}
.vd-fasc {
  position:absolute; left:22vw; bottom:12vh; z-index:3;
  font-size: clamp(80px, 11.5vw, 230px); white-space:nowrap;
  animation: vdUp 1s cubic-bezier(.2,.8,.2,1) .55s backwards;
}
@keyframes vdUp { from { opacity:0; transform:translateY(60px); } }

/* ── video panel ── */
.vd-video {
  position:absolute; left:50%; top:47%;
  transform:translate(-52%,-50%); z-index:2;
  width:min(52vw, 1020px); aspect-ratio:16/9;
  border-radius:1rem; overflow:hidden; background:#000;
  animation: vdIn 1.2s cubic-bezier(.785,.135,.15,.86) .3s backwards;
}
.vd-video video {
  width:100%; height:100%; object-fit:cover; display:block;
  filter:saturate(1.15) brightness(1.08) contrast(.96);
}
@keyframes vdIn { from { opacity:0; transform:translate(-52%,-50%) scale(.85); } }

/* ── left icons ── */
.vd-left {
  position:absolute; left:3.2rem; top:44vh; z-index:5;
  font-size:11px; line-height:1.7; color:rgba(255,255,255,.55); text-align:center;
}

/* ── vertical side text ── */
.vd-side {
  position:absolute; top:0; right:4rem; height:100%;
  writing-mode:vertical-lr; transform:scale(-1,-1);
  display:flex; flex-direction:row-reverse; justify-content:center;
  font-size:1rem; font-weight:400; text-transform:uppercase; z-index:5;
}
.vd-stext { letter-spacing:.55em; color:rgba(255,255,255,.85); font-size:11.5px; }
.vd-lines {
  margin-top:34vh; letter-spacing:.2em; font-size:10px;
  color:rgba(255,255,255,.5); margin-left:6px;
}

/* ── tagline ── */
.vd-tag {
  position:absolute; left:50%; bottom:3.6vh; transform:translateX(-50%);
  margin:0; z-index:5; font-size:clamp(15px, 1.5vw, 26px); font-weight:300;
  color:#f2f0ec; white-space:nowrap;
  animation: vdUp 1s cubic-bezier(.2,.8,.2,1) .8s backwards;
}

@media (max-width: 860px) {
  .vd-find { left:6vw; top:12vh; }
  .vd-fasc { left:4vw; white-space:normal; }
  .vd-video { width:86vw; }
  .vd-side, .vd-left { display:none; }
  .vd-tag { white-space:normal; text-align:center; width:88vw; }
}
`
