"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import * as THREE from "three"

/* ─────────────────────────────────────────────
   draggable-animation — the WebGL drag slider

   Every slide is a DOM box with `display: none` on
   its <img>. The box exists only to be measured;
   what you actually see is a Three.js plane parked
   at the box's coordinates, sampling that image as
   a texture.

   Drag and the whole rail moves with eased inertia.
   Slides wrap infinitely — each plane has its own
   min/max pair, and gsap.utils.wrap teleports it to
   the far end the moment it leaves the frame, so six
   planes cover an endless rail.

   Drag velocity feeds one uniform, uVelo, which does
   three things at once: bows the plane along a sine
   in the vertex shader, and slides the green and blue
   channels apart by 0.15 and 0.10 in the fragment
   shader — a chromatic smear that only exists while
   you are moving.

   Each slide also scales its texture from 0.65 to 1
   as it crosses the viewport, so the image is always
   pushing outward from its own centre.

   The titles roll on the same progress value as the
   two progress lines at the bottom, so the word in
   the middle is never out of sync with the rail.

   Ported from a CodePen by Jesper Landberg (@ReGGae).
   Rewritten to be embed-safe: no position:fixed, no
   window.innerWidth, no document.body — the canvas
   mounts inside the component and every measurement
   is taken relative to its own root.
   ───────────────────────────────────────────── */

const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"

/**
 * Six slides cycling three photos.
 *
 * The count is not arbitrary. The titles alternate between two words, and the
 * roll only wraps seamlessly when the last title repeats the first — which
 * needs an odd title count, so an even slide count. Six is the smallest even
 * number that is also a multiple of three, so the photos repeat cleanly too.
 */
const IMAGES = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518635/samples/landscapes/architecture-signs.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518635/samples/people/jazz.jpg",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518634/samples/animals/reindeer.jpg",
]

const SLIDES = Array.from({ length: 6 }, (_, i) => IMAGES[i % IMAGES.length])

/** Seven titles for six slides — the seventh repeats the first to close the loop. */
const TITLES = Array.from({ length: 7 }, (_, i) =>
  i % 2 === 0 ? "Handcraft" : "Ship It",
)

/**
 * The hidden proxy is what holds the title window open, so it has to be the
 * widest word — anything longer would be clipped, and anything shorter would
 * stop the narrower titles centring inside the list.
 */
const WIDEST_TITLE = TITLES.reduce((a, b) => (b.length > a.length ? b : a))

/* ── shaders ────────────────────────────────── */

/** Cover-fit the texture inside the mesh regardless of either aspect ratio. */
const backgroundCoverUv = `
vec2 backgroundCoverUv(vec2 screenSize, vec2 imageSize, vec2 uv) {
  float screenRatio = screenSize.x / screenSize.y;
  float imageRatio = imageSize.x / imageSize.y;
  vec2 newSize = screenRatio < imageRatio
      ? vec2(imageSize.x * screenSize.y / imageSize.y, screenSize.y)
      : vec2(screenSize.x, imageSize.y * screenSize.x / imageSize.x);
  vec2 newOffset = (screenRatio < imageRatio
      ? vec2((newSize.x - screenSize.x) / 2.0, 0.0)
      : vec2(0.0, (newSize.y - screenSize.y) / 2.0)) / newSize;
  return uv * screenSize / newSize + newOffset;
}
`

/** Bows the plane along a half-sine, so the middle lags the edges while dragging. */
const vertexShader = `
precision mediump float;

uniform float uVelo;

varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

void main(){
  vec3 pos = position;
  pos.x = pos.x + ((sin(uv.y * M_PI) * uVelo) * 0.125);

  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

/**
 * Cover-fit, scale from the centre, then walk G and B off R for the smear.
 *
 * The reference names its accumulator `vec4 texture`. That compiled in 2020 and
 * does not now: three targets GLSL ES 3.00 and injects `#define texture2D
 * texture` into the fragment prefix, so every `texture2D(...)` here expands to
 * `texture(...)` — which the local variable shadows. The compiler then reports
 * "'texture' : function name expected". Renamed to `color`; nothing else about
 * the maths changes.
 */
const fragmentShader = `
precision mediump float;

${backgroundCoverUv}

uniform sampler2D uTexture;
uniform vec2 uMeshSize;
uniform vec2 uImageSize;
uniform float uVelo;
uniform float uScale;
uniform float uNoir;
uniform float uLift;
uniform float uSat;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 texCenter = vec2(0.5);
  vec2 texUv = backgroundCoverUv(uMeshSize, uImageSize, uv);
  vec2 texScale = (texUv - texCenter) * uScale + texCenter;
  vec4 color = texture2D(uTexture, texScale);

  texScale.x += 0.15 * uVelo;
  if (uv.x < 1.) color.g = texture2D(uTexture, texScale).g;

  texScale.x += 0.10 * uVelo;
  if (uv.x < 1.) color.b = texture2D(uTexture, texScale).b;

  // ── noir ──
  // Runs after the channel offsets, so the drag smear survives the grade.
  // Luminance first, then a trace of the original colour mixed back, then the
  // shadow lift, and only then the flat multiply. Order matters: lifting after
  // the multiply would just brighten everything uniformly again.
  float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 graded = mix(vec3(luma), color.rgb, uSat);
  graded = pow(max(graded, 0.0), vec3(uLift));
  color.rgb = graded * uNoir;

  gl_FragColor = color;
}
`

/* ── tuning, all from the reference ─────────── */

const SPEED = 2
const THRESHOLD = 50
const EASE = 0.075
/** uScale runs 0.65 → 1 across a slide's pass through the frame. */
const SCALE_FROM = 0.65
/**
 * The noir grade, in three parts.
 *
 * NOIR is a flat multiply — how much light survives overall. On its own it is a
 * blunt instrument: being linear, it drags shadows and highlights down by the
 * same factor, so dark areas crush into the background before the picture as a
 * whole looks dark enough.
 *
 * NOIR_LIFT is a gamma applied before that multiply. Below 1 it raises the dark
 * end much further than the light end, which is what actually recovers detail
 * in coats, hair and shadow.
 *
 * NOIR_SAT is how much original colour is mixed back over the luminance. 0 is
 * pure black and white; a little keeps it reading as a graded photograph rather
 * than a flat greyscale plate.
 */
const NOIR = 0.8
const NOIR_LIFT = 0.8
const NOIR_SAT = 0.3

type Item = {
  el: HTMLElement
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  /** DOM offset from the plane's own centre, in root-relative pixels. */
  pos: { x: number; y: number }
  left: number
  right: number
  width: number
  min: number
  max: number
  tl: gsap.core.Timeline
  out: boolean
}

export default function DraggableAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const titlesRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<HTMLDivElement>(null)
  const line2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const slider = sliderRef.current
    const inner = innerRef.current
    const titles = titlesRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    if (!root || !stage || !slider || !inner || !titles || !line1 || !line2)
      return

    const slideEls = Array.from(
      inner.querySelectorAll<HTMLElement>("[data-slide]"),
    )
    if (!slideEls.length) return

    /* ── sizing ──
       The reference reads window.innerWidth/innerHeight. Everything here is
       measured off the root instead, and --dg-vw is republished as a pixel
       value so the CSS (which is written in vw-like multiples) and the JS
       bounds agree by construction even if the component is embedded in
       something narrower than the viewport. */
    let ww = root.clientWidth
    let wh = root.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      ww / -2,
      ww / 2,
      wh / 2,
      wh / -2,
      1,
      10,
    )
    camera.lookAt(scene.position)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    // the reference pins 1.5; cap there but never upscale past the real ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setSize(ww, wh)
    renderer.setClearColor(0x000000, 0)
    // r152+ colour management. sRGB in, sRGB out is a round trip, so this
    // matches the reference's uncorrected passthrough.
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const canvas = renderer.domElement
    canvas.className = "dg-gl"
    stage.appendChild(canvas)

    /* Geometry and material are built per mount, not shared at module scope.
       Strict Mode runs this effect twice; module-level objects disposed by the
       first cleanup would be dead by the time the second mount used them. */
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"

    const state = {
      target: 0,
      current: 0,
      currentRounded: 0,
      on: { x: 0, y: 0 },
      off: 0,
      progress: 0,
      diff: 0,
      max: 0,
      dragging: false,
    }

    const items: Item[] = []
    const textures: THREE.Texture[] = []
    /** Texture loads are async and can land after unmount. */
    let disposed = false

    /** Root-relative box for an element — the viewport plays no part. */
    const rectIn = (el: Element) => {
      const r = el.getBoundingClientRect()
      const o = root.getBoundingClientRect()
      return {
        left: r.left - o.left,
        right: r.right - o.left,
        top: r.top - o.top,
        width: r.width,
        height: r.height,
      }
    }

    /** Bounds, per-item wrap points and plane placement. Re-run on resize. */
    const measure = () => {
      const { width: wrapWidth, left: wrapDiff } = rectIn(inner)
      const last = rectIn(slideEls[slideEls.length - 1])

      state.max = -(last.right - wrapWidth - wrapDiff)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const { left, right, width, top, height } = rectIn(item.el)

        item.left = left
        item.right = right
        item.width = width
        item.min = left < ww ? ww * 0.775 : -(ww * 0.225 - wrapWidth * 0.2)
        item.max =
          left > ww
            ? state.max - ww * 0.775
            : state.max + (ww * 0.225 - wrapWidth * 0.2)

        item.pos = {
          x: left + width / 2 - ww / 2,
          y: top + height / 2 - wh / 2,
        }
        // DOM y grows downward, Three's grows up. The reference omits this
        // negation and gets away with it because the rail is centred, so the
        // term is zero — it is still wrong, and free to fix.
        item.mesh.position.y = -item.pos.y
        item.mesh.scale.set(width, height, 1)
        item.material.uniforms.uMeshSize.value.set(width, height)
      }
    }

    /* ── build ── */
    for (const el of slideEls) {
      const material = new THREE.ShaderMaterial({
        transparent: true,
        fragmentShader,
        vertexShader,
        uniforms: {
          uTexture: { value: null },
          uMeshSize: { value: new THREE.Vector2(0, 0) },
          uImageSize: { value: new THREE.Vector2(0, 0) },
          uScale: { value: 0.75 },
          uVelo: { value: 0 },
          uNoir: { value: NOIR },
          uLift: { value: NOIR_LIFT },
          uSat: { value: NOIR_SAT },
        },
      })

      const img = el.querySelector("img")
      if (img) {
        loader.load(
          img.src,
          (texture) => {
            if (disposed) {
              texture.dispose()
              return
            }
            texture.minFilter = THREE.LinearFilter
            texture.generateMipmaps = false
            texture.colorSpace = THREE.SRGBColorSpace
            textures.push(texture)
            material.uniforms.uTexture.value = texture
            material.uniforms.uImageSize.value.set(
              img.naturalWidth,
              img.naturalHeight,
            )
          },
          undefined,
          // A plane with no texture renders as nothing, which looks identical
          // to a layout bug. Say which URL failed instead.
          () => {
            console.error(
              `[draggable-animation] texture failed to load: ${img.src}`,
            )
          },
        )
      }

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      items.push({
        el,
        mesh,
        material,
        pos: { x: 0, y: 0 },
        left: 0,
        right: 0,
        width: 0,
        min: 0,
        max: 0,
        tl: gsap
          .timeline({ paused: true })
          .fromTo(
            material.uniforms.uScale,
            { value: SCALE_FROM },
            { value: 1, duration: 1, ease: "none" },
          ),
        out: false,
      })
    }

    /* Titles and progress lines share one timeline scrubbed by rail progress.
       Elements, not selector strings — a selector would reach outside the
       component and grab a second instance's nodes. */
    const tl = gsap
      .timeline({ paused: true, defaults: { duration: 1, ease: "none" } })
      .fromTo(
        line2,
        { scaleX: 1 },
        { scaleX: 0, duration: 0.5, ease: "power3" },
        0,
      )
      .fromTo(
        titles,
        { yPercent: 0 },
        { yPercent: -(100 - 100 / TITLES.length) },
        0,
      )
      .fromTo(line1, { scaleX: 0 }, { scaleX: 1 }, 0)

    measure()

    /* ── frame ── */
    const isVisible = ({ left, right, width, min, max }: Item) => {
      const translate = gsap.utils.wrap(min, max, state.currentRounded)
      const start = left + translate
      const end = right + translate
      return {
        translate,
        visible: start < THRESHOLD + ww && end > -THRESHOLD,
        progress: gsap.utils.clamp(
          0,
          1,
          1 - (translate + left + width) / (ww + width),
        ),
      }
    }

    const tick = () => {
      state.current += (state.target - state.current) * EASE
      state.currentRounded = Math.round(state.current * 100) / 100
      state.diff = (state.target - state.current) * 0.0005
      // state.max is 0 until the rail has been laid out. Dividing by it would
      // feed NaN into tl.progress() and wedge the titles and both lines.
      if (state.max !== 0) {
        state.progress = gsap.utils.wrap(0, 1, state.currentRounded / state.max)
        tl.progress(state.progress)
      }

      for (const item of items) {
        const { translate, visible, progress } = isVisible(item)
        item.mesh.position.x = translate + item.pos.x
        item.material.uniforms.uVelo.value = state.diff
        if (!item.out) item.tl.progress(progress)
        item.out = !visible
      }

      renderer.render(scene, camera)
    }

    gsap.ticker.add(tick)

    /* ── drag ──
       Pointer events cover mouse and touch in one path, which retires the
       reference's userAgent sniff. `touch-action: pan-y` on the rail hands
       vertical scrolling back to the page while we keep the horizontal axis. */
    const onDown = (e: PointerEvent) => {
      state.dragging = true
      state.on.x = e.clientX
      state.on.y = e.clientY
      slider.setPointerCapture(e.pointerId)
    }

    const onMove = (e: PointerEvent) => {
      if (!state.dragging) return
      const moveX = e.clientX - state.on.x
      const moveY = e.clientY - state.on.y
      if (Math.abs(moveX) > Math.abs(moveY) && e.cancelable) e.preventDefault()
      state.target = state.off + moveX * SPEED
    }

    const onUp = (e: PointerEvent) => {
      if (!state.dragging) return
      state.dragging = false
      state.off = state.target
      if (slider.hasPointerCapture(e.pointerId))
        slider.releasePointerCapture(e.pointerId)
    }

    /** Capture can be revoked by the browser mid-drag; never strand dragging=true. */
    const onLostCapture = () => {
      if (!state.dragging) return
      state.dragging = false
      state.off = state.target
    }

    slider.addEventListener("pointerdown", onDown)
    slider.addEventListener("pointermove", onMove)
    slider.addEventListener("pointerup", onUp)
    slider.addEventListener("pointercancel", onUp)
    slider.addEventListener("lostpointercapture", onLostCapture)

    /* ── resize ──
       The reference has none and simply breaks. Republish --dg-vw, resize the
       renderer and frustum, then re-measure every plane. */
    const ro = new ResizeObserver(() => {
      const w = root.clientWidth
      const h = root.clientHeight
      if (!w || !h) return

      ww = w
      wh = h
      root.style.setProperty("--dg-vw", `${w / 100}px`)

      renderer.setSize(ww, wh)
      camera.left = ww / -2
      camera.right = ww / 2
      camera.top = wh / 2
      camera.bottom = wh / -2
      camera.updateProjectionMatrix()

      // No clamping here. The rail wraps infinitely by design — the reference
      // defines clampTarget() and never calls it — so pinning target into
      // [max, 0] would teleport the user on any resize.
      measure()
    })
    ro.observe(root)

    return () => {
      disposed = true
      gsap.ticker.remove(tick)
      ro.disconnect()
      slider.removeEventListener("pointerdown", onDown)
      slider.removeEventListener("pointermove", onMove)
      slider.removeEventListener("pointerup", onUp)
      slider.removeEventListener("pointercancel", onUp)
      slider.removeEventListener("lostpointercapture", onLostCapture)

      tl.kill()
      for (const item of items) {
        item.tl.kill()
        scene.remove(item.mesh)
        item.material.dispose()
      }
      for (const texture of textures) texture.dispose()
      geometry.dispose()
      renderer.dispose()
      if (canvas.parentElement === stage) stage.removeChild(canvas)
    }
  }, [])

  return (
    <div ref={rootRef} className="dg-root">
      <style>{CSS}</style>

      <div ref={stageRef} className="dg-stage" />

      <header className="dg-head">
        <img className="dg-logo" src={LOGO} alt="Zepa" draggable={false} />
      </header>

      <div ref={sliderRef} className="dg-slider">
        <div ref={innerRef} className="dg-slider-inner">
          {SLIDES.map((src, i) => (
            <div
              key={i}
              data-slide=""
              className="dg-slide"
              style={i === 0 ? undefined : { left: `${i * 120}%` }}
            >
              <div className="dg-slide-inner">
                {/* measured, never painted — the plane is what you see */}
                <img
                  className="dg-slide-img"
                  src={src}
                  alt=""
                  crossOrigin="anonymous"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dg-titles">
        <div className="dg-title dg-title--proxy">{WIDEST_TITLE}</div>
        <div ref={titlesRef} className="dg-titles-list">
          {TITLES.map((t, i) => (
            <div key={i} className="dg-title">
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="dg-progress">
        <div ref={line1Ref} className="dg-progress-line" />
        <div ref={line2Ref} className="dg-progress-line dg-progress-line--2" />
      </div>
    </div>
  )
}

const CSS = `
.dg-root {
  --dg-vw: 1vw;
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background-color: #111111;
  color: #ffffff;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.dg-root *, .dg-root *::before, .dg-root *::after { box-sizing: border-box; }

.dg-stage {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
.dg-gl { display: block; width: 100%; height: 100%; }

.dg-head {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: calc(var(--dg-vw) * 2) calc(var(--dg-vw) * 2.5);
  pointer-events: none;
  z-index: 1000;
}
.dg-logo {
  width: min(calc(var(--dg-vw) * 12), 150px);
  max-height: 7vh;
  height: auto;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}

.dg-slider {
  position: relative;
  padding: 0 calc(var(--dg-vw) * 22.5);
  display: flex;
  align-items: center;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
  touch-action: pan-y;
  z-index: 2;
}
.dg-slider:active { cursor: grabbing; }
.dg-slider-inner { display: flex; position: relative; }

.dg-slide { overflow: hidden; }
.dg-slide:first-child { position: relative; }
.dg-slide:not(:first-child) { position: absolute; top: 0; height: 100%; }
.dg-slide-inner {
  position: relative;
  overflow: hidden;
  width: calc(var(--dg-vw) * 55);
  padding-top: 56.5%;
}
/* the <img> is a texture source and a measuring stick, never a painted pixel */
.dg-slide-img { display: none; }

.dg-titles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  overflow: hidden;
  pointer-events: none;
  z-index: 3;
}
.dg-titles-list { position: absolute; top: 0; left: 0; }
.dg-title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: calc(var(--dg-vw) * 6);
  font-weight: 700;
  letter-spacing: calc(var(--dg-vw) * -0.1);
  line-height: 1.1;
  white-space: nowrap;
  color: #ffffff;
}
/* holds the window open at exactly one title tall */
.dg-title--proxy { visibility: hidden; }

.dg-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.25rem;
  overflow: hidden;
  pointer-events: none;
  z-index: 4;
}
.dg-progress-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(0);
  transform-origin: left;
  background-color: #ffffff;
}
.dg-progress-line--2 { transform-origin: right; }

@media (max-width: 848px) {
  .dg-slider { padding: 0 calc(var(--dg-vw) * 12); }
  .dg-slide-inner { width: calc(var(--dg-vw) * 76); }
  .dg-title { font-size: calc(var(--dg-vw) * 9); }
  .dg-logo { width: min(calc(var(--dg-vw) * 30), 130px); }
}
`
