"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/* ─────────────────────────────────────────────────────────────────────────
   paper-sheets — three certificates printed on glass, one WebGL context

   Ported from ThreeUI's <ThreeDPaper /> (MIT, Meng To / Design+Code).
   https://threeui.com/source-code/3d-paper.json

   The upstream component ships as an <iframe srcDoc> wrapping a 630KB
   self-contained document with Three.js r149 inlined. That works there
   because the iframe isolates its position:fixed, window.innerWidth,
   global html/body styles and Google Fonts <link> from the host page.
   None of those survive in a registry component, so the scene is ported
   out of the iframe and re-hosted here:

     · one renderer / scene / PMREM env shared by all three sheets
     · sizing driven by the container's clientWidth, never window's
     · pointer events bound to the container, never window
     · cursor set on the container, never document.body
     · canvas-drawn type, so no webfont is fetched

   Three.js r149 → r184 breakages that land on this component's shader
   injection, all fixed below:
     · sRGBEncoding / outputEncoding removed  → colorSpace / outputColorSpace
     · #include <output_fragment> renamed     → #include <opaque_fragment>
     · geometry.normal / geometry.viewDir     → geometryNormal / geometryViewDir
   ───────────────────────────────────────────────────────────────────────── */

export type SheetContent = {
  /** small line above the award title */
  kicker: string
  date: string
  /** the award title, set large */
  title: string
  /** credited people, under the title */
  names: string[]
  /** citation paragraph in the lower half */
  body: string
  /** wordmark bottom-left */
  mark: string
  markSuffix: string
  /** certificate line above the citation */
  badge: string
  /** short label set rotated down the right edge */
  tag: string
}

/* texture resolution per sheet. the upstream single-sheet hero used
   1400x1932; three of those is ~32MB of GPU texture, which is a lot to
   ask of a card sitting in a gallery grid, so the same 0.7246 proportion
   is kept at a smaller size */
const TW = 1100
const TH = 1518

/* sheet geometry, in world units — unchanged from upstream */
const SW = 2.3
const SH = 2.72

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const rng = (s: number) => () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff
  return (s >>> 8) / 8388608
}

const FONT_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'

/* ── canvas helpers (upstream, unchanged) ───────────────────────────── */

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function wrapL(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lh: number
) {
  const words = text.split(" ")
  let line = ""
  let yy = y
  for (const w of words) {
    const t = line ? line + " " + w : w
    if (ctx.measureText(t).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = w
      yy += lh
    } else line = t
  }
  if (line) ctx.fillText(line, x, yy)
  return yy + lh
}

/** procedural signature — deterministic per seed */
function signature(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  seed: number,
  color: string
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  ctx.strokeStyle = color
  ctx.lineWidth = 2.2
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  const rnd = rng(seed * 7919 + 13)
  ctx.beginPath()
  ctx.moveTo(0, 15)
  ctx.bezierCurveTo(-3 + rnd() * 4, -7, 9, -20 - rnd() * 6, 15, -5)
  ctx.bezierCurveTo(18, 7, 7, 15, 9, 4)
  let px = 9
  let py = 4
  const n = 4 + Math.floor(rnd() * 3)
  for (let i = 0; i < n; i++) {
    const step = 9 + rnd() * 11
    const nx = px + step
    const ny = 4 - (i % 2 ? -1 : 1) * (4 + rnd() * 13)
    ctx.bezierCurveTo(
      px + step * 0.35,
      py - 9 - rnd() * 10,
      nx - step * 0.35,
      ny + 7 + rnd() * 8,
      nx,
      ny
    )
    px = nx
    py = ny
  }
  ctx.bezierCurveTo(px + 9, py - 13, px + 21, py + 11, px + 29, py - 3)
  ctx.stroke()
  ctx.beginPath()
  ctx.lineWidth = 1.4
  ctx.moveTo(-5, 19)
  ctx.quadraticCurveTo(px * 0.55, 24 + rnd() * 5, px + 25, 12 + rnd() * 4)
  ctx.stroke()
  ctx.restore()
}

/**
 * Draw a headline, stepping the size down only if it would otherwise run
 * past the sheet's inner border. Upstream hard-coded 106px/110px because it
 * shipped with one fixed string; card copy is data here, so a long kicker
 * would print straight off the edge of the paper.
 */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  weight: string,
  size: number
) {
  let s = size
  ctx.font = weight + " " + s + "px " + FONT_STACK
  while (s > 44 && ctx.measureText(text).width > maxW) {
    s -= 2
    ctx.font = weight + " " + s + "px " + FONT_STACK
  }
  ctx.fillText(text, x, y)
}

/** the certificate artwork, authored on a 1200x1656 grid then scaled up */
function drawGlass(ctx: CanvasRenderingContext2D, c: SheetContent, seed: number) {
  ctx.scale(TW / 1200, TH / 1656)

  ctx.fillStyle = "rgba(255,255,255,.030)"
  ctx.fillRect(0, 0, 1200, 1656)

  // a whisper of frost behind the headline so it holds over the type below
  const fr = ctx.createLinearGradient(0, 240, 0, 880)
  fr.addColorStop(0, "rgba(255,255,255,0)")
  fr.addColorStop(0.26, "rgba(255,255,255,.060)")
  fr.addColorStop(0.74, "rgba(255,255,255,.060)")
  fr.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = fr
  ctx.fillRect(40, 240, 1120, 640)

  ctx.strokeStyle = "rgba(255,255,255,.34)"
  ctx.lineWidth = 2
  rr(ctx, 20, 20, 1160, 1616, 14)
  ctx.stroke()
  ctx.strokeStyle = "rgba(255,255,255,.12)"
  ctx.lineWidth = 1
  rr(ctx, 36, 36, 1128, 1584, 10)
  ctx.stroke()

  const M = 74
  ctx.fillStyle = "#ffffff"
  ctx.font = "700 104px " + FONT_STACK
  ctx.fillText("z.", M, 190)

  // the inner border sits at x=36..1164, so mirror the left margin on the right
  const HEAD_W = 1200 - M * 2
  ctx.fillStyle = "rgba(255,255,255,.52)"
  fitText(ctx, c.kicker, M, 392, HEAD_W, "500", 106)
  fitText(ctx, c.date, M, 518, HEAD_W, "500", 106)
  ctx.fillStyle = "#ffffff"
  fitText(ctx, c.title, M, 664, HEAD_W, "600", 110)

  ctx.font = "600 34px " + FONT_STACK
  ctx.fillStyle = "rgba(255,255,255,.90)"
  c.names.forEach((s, i) => ctx.fillText(s, M + 4, 752 + i * 45))

  const px = 592
  const py = 1158
  ctx.font = "700 24px " + FONT_STACK
  ctx.fillStyle = "rgba(255,255,255,.92)"
  ctx.fillText(c.badge + ".", px, py)
  ctx.font = "500 22px " + FONT_STACK
  ctx.fillStyle = "rgba(255,255,255,.68)"
  const endY = wrapL(ctx, c.body, px, py + 36, 296, 28)
  ;[0, 1, 2].forEach((i) =>
    signature(ctx, px + 6 + i * 100, endY + 24, 0.86, i * 5 + 3 + seed * 11, "rgba(255,255,255,.62)")
  )

  ctx.save()
  ctx.translate(1200 - M - 24, 1236)
  ctx.rotate(Math.PI / 2)
  ctx.font = "500 23px " + FONT_STACK
  ctx.fillStyle = "rgba(255,255,255,.62)"
  ctx.fillText("—", 0, 0)
  ctx.fillText(c.tag, 48, 0)
  ctx.restore()

  ctx.font = "700 34px " + FONT_STACK
  ctx.fillStyle = "#ffffff"
  ctx.fillText(c.mark, M, 1516)
  const w = ctx.measureText(c.mark).width
  ctx.font = "500 34px " + FONT_STACK
  ctx.fillStyle = "rgba(255,255,255,.62)"
  ctx.fillText(c.markSuffix, M + w, 1516)
}

function makeCertTexture(c: SheetContent, seed: number) {
  const cv = document.createElement("canvas")
  cv.width = TW
  cv.height = TH
  const ctx = cv.getContext("2d")
  if (!ctx) return null
  ctx.clearRect(0, 0, TW, TH)
  ctx.save()
  rr(ctx, 0, 0, TW, TH, 30)
  ctx.clip()
  drawGlass(ctx, c, seed)
  ctx.restore()
  const t = new THREE.CanvasTexture(cv)
  // r152+: encoding was replaced by colorSpace
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  t.needsUpdate = true
  return t
}

/* ── the bend, verbatim from upstream ───────────────────────────────────
   paper conserves arc length, so the sheet is built by integrating the
   bend angle rather than displacing Z — that is what makes the silhouette
   genuinely pull in where the sheet turns away from the camera */
const WAVE = `
uniform float uTime, uAmp, uFlutter, uPhase, uFreq, uTwist;
uniform vec2  uSize;

float sAmp(float u, float v){ return uAmp*(0.10 + pow(u,1.35))*(0.50 + 0.64*v); }
float sAmpV(float u){        return uAmp*(0.10 + pow(u,1.35))*0.64; }

float sTheta(float u, float v){
  float a  = sAmp(u,v);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  return a*sin(ph) + uFlutter*a*0.60*sin(ph*2.35 + uTime*2.0);
}
float sThetaV(float u, float v){
  float a  = sAmp(u,v), da = sAmpV(u);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  float f  = ph*2.35 + uTime*2.0;
  return da*sin(ph) + a*cos(ph)*uTwist
       + uFlutter*0.60*(da*sin(f) + a*cos(f)*uTwist*2.35);
}
float sYoff(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.021*uSize.y*sin(2.05*u + uTime*0.47 + uPhase)
       + 0.013*uSize.y*sin(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdU(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.0431*uSize.y*cos(2.05*u + uTime*0.47 + uPhase)
       + 0.0436*uSize.y*cos(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdV(float u, float v){
  float ph = 3.35*u - 1.55*v + uTime*0.63 + uPhase;
  return 0.013*uSize.y*(-1.55*cos(ph)*(1.0-0.55*v) - 0.55*sin(ph));
}

void sheetPoint(vec2 q, out vec3 P, out vec3 NN){
  float u = q.x, v = q.y;
  float x=0.0, z=0.0, xe=0.0, ze=0.0, dxv=0.0, dzv=0.0, dxe=0.0, dze=0.0;
  const int NS = 20;
  float h = 1.0/float(NS);
  for(int i=0;i<NS;i++){
    float uu = (float(i)+0.5)*h;
    float w  = clamp((u-(uu-0.5*h))/h, 0.0, 1.0);
    float th = sTheta(uu,v);
    float dt = sThetaV(uu,v);
    float c = cos(th), sn = sin(th);
    xe += c*h;          ze += sn*h;
    dxe += -sn*dt*h;    dze +=  c*dt*h;
    x   += c*h*w;       z   += sn*h*w;
    dxv += -sn*dt*h*w;  dzv +=  c*dt*h*w;
  }
  float W = uSize.x, H = uSize.y;
  float th0 = sTheta(u,v);
  P = vec3((x - xe*0.5)*W, (v-0.5)*H + sYoff(u,v), (z - ze*0.5)*W);
  vec3 Tu = vec3(W*cos(th0), sYdU(u,v), W*sin(th0));
  vec3 Tv = vec3((dxv - dxe*0.5)*W, H + sYdV(u,v), (dzv - dze*0.5)*W);
  NN = normalize(cross(Tu, Tv));
}`

/** the studio-light environment, drawn rather than loaded */
function envTexture() {
  const w = 1024
  const h = 512
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const x = c.getContext("2d")!
  const g = x.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, "#3a3d47")
  g.addColorStop(0.46, "#171820")
  g.addColorStop(1, "#08080a")
  x.fillStyle = g
  x.fillRect(0, 0, w, h)
  const blob = (cx: number, cy: number, rx: number, ry: number, col: string, a: string) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry))
    rg.addColorStop(0, col.replace("A", a))
    rg.addColorStop(1, col.replace("A", "0"))
    x.save()
    x.translate(cx, cy)
    x.scale(1, ry / rx)
    x.translate(-cx, -cy)
    x.fillStyle = rg
    x.beginPath()
    x.arc(cx, cy, rx, 0, 7)
    x.fill()
    x.restore()
  }
  blob(w * 0.3, h * 0.24, 330, 240, "rgba(255,252,246,A)", "1")
  blob(w * 0.74, h * 0.34, 240, 200, "rgba(150,175,235,A)", ".42")
  blob(w * 0.52, h * 0.86, 420, 190, "rgba(255,170,120,A)", ".10")
  const t = new THREE.CanvasTexture(c)
  t.mapping = THREE.EquirectangularReflectionMapping
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

type Sheet = {
  group: THREE.Group
  mat: THREE.MeshPhysicalMaterial
  uni: Record<string, { value: unknown }>
  baseX: number
  dragYaw: number
  dragPitch: number
  velYaw: number
  velPitch: number
  prevYaw: number
  prevPitch: number
  release: number
  quad: [number, number][] | null
  hover: number
  hoverTarget: number
}

export function PaperSheets({ cards }: { cards: SheetContent[] }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const canvas = document.createElement("canvas")
    canvas.className = "pg-gl"
    host.appendChild(canvas)

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
    } catch {
      // no WebGL — the DOM fallback underneath stays visible
      canvas.remove()
      return
    }
    // r152+: outputEncoding was replaced by outputColorSpace
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100)
    camera.position.set(0, 0, 8.2)

    const pmrem = new THREE.PMREMGenerator(renderer)
    pmrem.compileEquirectangularShader()
    const envSrc = envTexture()
    const envRT = pmrem.fromEquirectangular(envSrc)
    scene.environment = envRT.texture
    envSrc.dispose()

    const key = new THREE.DirectionalLight(0xfff6ec, 1.42)
    key.position.set(-3.3, 2.1, 2.0)
    const fill = new THREE.DirectionalLight(0x9fb6ff, 0.13)
    fill.position.set(3.6, -1.8, 1.6)
    const rim = new THREE.DirectionalLight(0xffffff, 0.1)
    rim.position.set(1.6, 1.2, -2.6)
    scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.16))

    const touchLight = new THREE.PointLight(0xdfe8ff, 0, 7.5, 1.35)
    touchLight.position.set(0, 0, 1.7)
    scene.add(touchLight)

    /* one geometry, shared by all three sheets */
    const geo = new THREE.PlaneGeometry(SW, SH, 72, 96)

    const haloTex = (() => {
      const s = 256
      const c = document.createElement("canvas")
      c.width = c.height = s
      const x = c.getContext("2d")!
      const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
      g.addColorStop(0, "rgba(0,0,0,.55)")
      g.addColorStop(0.45, "rgba(0,0,0,.28)")
      g.addColorStop(1, "rgba(0,0,0,0)")
      x.fillStyle = g
      x.fillRect(0, 0, s, s)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      return t
    })()

    /* the rig holds the three sheets so the whole row scales as one */
    const rig = new THREE.Group()
    scene.add(rig)

    const GAP = 0.42
    const PITCH = SW + GAP
    const sheets: Sheet[] = []
    const textures: THREE.Texture[] = []
    const halos: THREE.Mesh[] = []

    cards.forEach((card, i) => {
      const tex = makeCertTexture(card, i)
      if (tex) textures.push(tex)

      const uni: Record<string, { value: unknown }> = {
        uTime: { value: 0 },
        uAmp: { value: 1.18 - i * 0.08 },
        uFreq: { value: 4.7 },
        uTwist: { value: 1.3 },
        uSize: { value: new THREE.Vector2(SW, SH) },
        uFlutter: { value: 0 },
        // each sheet reads the same field at a different point in it, so
        // the three never breathe in lockstep
        uPhase: { value: i * 2.1 },
        uRim: { value: 0.62 },
        uRimA: { value: 0.88 },
        uSpecA: { value: 0.14 },
        uRimCol: { value: new THREE.Color(0xeaf2ff) },
      }

      const mat = new THREE.MeshPhysicalMaterial({
        map: tex ?? undefined,
        color: new THREE.Color(0xc4d2e8),
        side: THREE.DoubleSide,
        metalness: 0.0,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        iridescence: 0.1,
        iridescenceIOR: 1.35,
        iridescenceThicknessRange: [120, 420],
        envMapIntensity: 1.15,
        specularIntensity: 1.0,
        ior: 1.5,
        transparent: true,
        alphaTest: 0.012,
        opacity: 1,
      })

      mat.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, uni)
        sh.vertexShader = sh.vertexShader
          .replace("#include <common>", "#include <common>\n" + WAVE)
          .replace(
            "#include <beginnormal_vertex>",
            "vec3 sheetP; vec3 objectNormal;\n" +
              "sheetPoint(uv, sheetP, objectNormal);\n" +
              "#ifdef USE_TANGENT\n  vec3 objectTangent = vec3( tangent.xyz );\n#endif"
          )
          .replace("#include <begin_vertex>", "vec3 transformed = sheetP;")

        sh.fragmentShader = sh.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nuniform float uRim, uRimA, uSpecA;\nuniform vec3 uRimCol;"
          )
          // judge the cut against the artwork's own alpha, not alpha*opacity,
          // so the intro fade does not eat the sheet
          .replace(
            "#include <alphatest_fragment>",
            "if ( diffuseColor.a / max(opacity,1e-4) < alphaTest ) discard;"
          )
          // r154 renamed output_fragment; r155 renamed the geometry struct
          // members to the flat geometryNormal / geometryViewDir locals that
          // lights_fragment_begin declares just above this chunk
          .replace(
            "#include <opaque_fragment>",
            "float fres = pow(1.0 - clamp(abs(dot(geometryNormal, geometryViewDir)),0.0,1.0), 3.2);\n" +
              "outgoingLight += fres * uRim * uRimCol;\n" +
              "float baseA = diffuseColor.a / max(opacity, 1e-4);\n" +
              "float outA  = clamp(baseA + fres*uRimA + uSpecA*dot(outgoingLight, vec3(0.3333)), 0.0, 1.0) * opacity;\n" +
              "gl_FragColor = vec4( outgoingLight, outA );"
          )
      }

      const group = new THREE.Group()
      group.add(new THREE.Mesh(geo, mat))

      // a faint dark cloud so each sheet sits clear of the wordmark behind
      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 4.1),
        new THREE.MeshBasicMaterial({
          map: haloTex,
          transparent: true,
          depthWrite: false,
          opacity: 0.3,
        })
      )
      halo.position.z = -0.62
      group.add(halo)
      halos.push(halo)

      const baseX = (i - (cards.length - 1) / 2) * PITCH
      group.position.x = baseX
      rig.add(group)

      sheets.push({
        group,
        mat,
        uni,
        baseX,
        dragYaw: 0,
        dragPitch: 0,
        velYaw: 0,
        velPitch: 0,
        prevYaw: 0,
        prevPitch: 0,
        release: 0,
        quad: null,
        hover: 0,
        hoverTarget: 0,
      })
    })

    /* ── layout: fit the whole row inside the container ──────────────── */
    let vw = 0
    let vh = 0

    function resize() {
      vw = host!.clientWidth
      vh = host!.clientHeight
      if (!vw || !vh) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(vw, vh, false)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()

      const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      const visW = visH * camera.aspect
      const rigW = cards.length * SW + (cards.length - 1) * GAP
      // the row is the constraint on wide screens, the sheet height on tall ones
      const s = Math.min((visW * 0.92) / rigW, (visH * 0.74) / SH)
      rig.scale.setScalar(s)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    /* ── pointer, bound to the container rather than the window ──────── */
    const _v = new THREE.Vector3()

    function cornerPoint(sheet: Sheet, qx: number, qy: number) {
      const t = sheet.uni.uTime.value as number
      const ph = sheet.uni.uPhase.value as number
      const A = sheet.uni.uAmp.value as number
      const F = sheet.uni.uFreq.value as number
      const TWs = sheet.uni.uTwist.value as number
      const u = qx
      const v = qy
      const theta = (uu: number) =>
        A *
        (0.1 + Math.pow(uu, 1.35)) *
        (0.5 + 0.64 * v) *
        Math.sin(F * uu + TWs * v + t * 0.4 + ph)
      let x = 0
      let z = 0
      let xe = 0
      let ze = 0
      const N = 20
      const h = 1 / N
      for (let i = 0; i < N; i++) {
        const uu = (i + 0.5) * h
        const w = clamp((u - (uu - 0.5 * h)) / h, 0, 1)
        const th = theta(uu)
        const c = Math.cos(th)
        const s = Math.sin(th)
        xe += c * h
        ze += s * h
        x += c * h * w
        z += s * h * w
      }
      const yo =
        0.021 * SH * Math.sin(2.05 * u + t * 0.47 + ph) +
        0.013 * SH * Math.sin(3.35 * u - 1.55 * v + t * 0.63 + ph) * (1 - 0.55 * v)
      return _v.set((x - xe * 0.5) * SW, (v - 0.5) * SH + yo, (z - ze * 0.5) * SW)
    }

    function buildQuad(sheet: Sheet) {
      const pts: [number, number][] = []
      for (const [u, v] of [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ]) {
        cornerPoint(sheet, u, v).applyMatrix4(sheet.group.matrixWorld).project(camera)
        pts.push([(_v.x * 0.5 + 0.5) * vw, (-_v.y * 0.5 + 0.5) * vh])
      }
      const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4
      const cy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4
      sheet.quad = pts.map(([x, y]) => [cx + (x - cx) * 1.07, cy + (y - cy) * 1.07])
    }

    function inQuad(sheet: Sheet, px: number, py: number) {
      const quad = sheet.quad
      if (!quad) return false
      let sign = 0
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = quad[i]
        const [bx, by] = quad[(i + 1) % 4]
        const c = (bx - ax) * (py - ay) - (by - ay) * (px - ax)
        if (c !== 0) {
          const s = c > 0 ? 1 : -1
          if (sign === 0) sign = s
          else if (s !== sign) return false
        }
      }
      return true
    }

    /** topmost sheet under the pointer — nearest camera wins on overlap */
    function pick(px: number, py: number): Sheet | null {
      let best: Sheet | null = null
      let bestZ = -Infinity
      for (const s of sheets) {
        if (!inQuad(s, px, py)) continue
        const z = s.group.position.z
        if (z > bestZ) {
          bestZ = z
          best = s
        }
      }
      return best
    }

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
    let dragging: Sheet | null = null
    let lastPX = 0
    let lastPY = 0
    let cursorNow = ""

    const local = (e: PointerEvent) => {
      const r = host!.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    const onMove = (e: PointerEvent) => {
      const p = local(e)
      mouse.tx = (p.x / Math.max(vw, 1) - 0.5) * 2
      mouse.ty = (p.y / Math.max(vh, 1) - 0.5) * 2
      if (dragging) {
        const dx = p.x - lastPX
        const dy = p.y - lastPY
        lastPX = p.x
        lastPY = p.y
        dragging.dragYaw += dx * 0.006
        dragging.dragPitch = clamp(dragging.dragPitch - dy * 0.0045, -0.6, 0.6)
        return
      }
      const hit = pick(p.x, p.y)
      for (const s of sheets) s.hoverTarget = s === hit ? 1 : 0
    }

    const onDown = (e: PointerEvent) => {
      const p = local(e)
      const hit = pick(p.x, p.y)
      if (!hit) return
      dragging = hit
      lastPX = p.x
      lastPY = p.y
      hit.velYaw = hit.velPitch = 0
      hit.prevYaw = hit.dragYaw
      hit.prevPitch = hit.dragPitch
      host!.setPointerCapture?.(e.pointerId)
    }

    const onUp = (e: PointerEvent) => {
      if (dragging) {
        dragging.release = 0.6
        dragging = null
      }
      host!.releasePointerCapture?.(e.pointerId)
    }

    const onLeave = () => {
      for (const s of sheets) s.hoverTarget = 0
    }

    host.addEventListener("pointermove", onMove, { passive: true })
    host.addEventListener("pointerdown", onDown)
    host.addEventListener("pointerup", onUp)
    host.addEventListener("pointercancel", onUp)
    host.addEventListener("pointerleave", onLeave)

    /* ── loop, paused when offscreen or the tab is hidden ─────────────── */
    const clock = new THREE.Clock()
    const lightPos = new THREE.Vector3()
    let intro = 0
    let raf = 0
    let running = false
    let onScreen = true
    let pageVisible = typeof document === "undefined" || !document.hidden

    function frame() {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime

      intro += (1 - intro) * Math.min(1, dt * 1.9)

      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.0)
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.0)
      const idle = REDUCED ? 0 : 1
      const rise = 1 - intro

      let anyHover = 0
      sheets.forEach((s, i) => {
        s.uni.uTime.value = REDUCED ? 2.4 : t
        s.mat.opacity = intro
        const haloMat = halos[i].material as THREE.MeshBasicMaterial
        haloMat.opacity = intro * 0.3

        if (dragging === s) {
          const k = Math.min(1, dt * 14)
          s.velYaw += ((s.dragYaw - s.prevYaw) / Math.max(dt, 1e-3) - s.velYaw) * k
          s.velPitch += ((s.dragPitch - s.prevPitch) / Math.max(dt, 1e-3) - s.velPitch) * k
          s.velYaw = clamp(s.velYaw, -7, 7)
          s.velPitch = clamp(s.velPitch, -4, 4)
        } else {
          s.dragYaw += s.velYaw * dt
          s.dragPitch = clamp(s.dragPitch + s.velPitch * dt, -0.6, 0.6)
          const decay = Math.pow(0.018, dt)
          s.velYaw *= decay
          s.velPitch *= decay
          s.release = Math.max(0, s.release - dt)
          if (s.release <= 0) {
            // settle on the nearest whole turn rather than unwinding a spin
            const home = Math.round(s.dragYaw / (Math.PI * 2)) * Math.PI * 2
            const k = Math.min(1, dt * 0.55)
            s.dragYaw += (home - s.dragYaw) * k
            s.dragPitch -= s.dragPitch * k
          }
        }
        s.prevYaw = s.dragYaw
        s.prevPitch = s.dragPitch

        s.hover += (s.hoverTarget - s.hover) * Math.min(1, dt * 4.5)
        anyHover = Math.max(anyHover, s.hover)

        const ph = i * 1.7
        s.group.rotation.y = s.dragYaw + mouse.x * 0.16 + Math.sin(t * 0.23 + ph) * 0.045 * idle
        s.group.rotation.x =
          s.dragPitch - mouse.y * 0.11 + Math.sin(t * 0.19 + ph) * 0.026 * idle + rise * 0.28
        s.group.rotation.z = Math.sin(t * 0.27 + ph) * 0.018 * idle
        s.group.position.y = Math.sin(t * 0.36 + ph) * 0.06 * idle - rise * 0.7
        s.group.position.x = s.baseX + Math.sin(t * 0.21 + ph) * 0.05 * idle
        // hovered sheet lifts toward the camera so it wins the overlap
        s.group.position.z += (s.hover * 0.36 - s.group.position.z) * Math.min(1, dt * 5)
      })

      rig.updateMatrixWorld(true)

      touchLight.intensity = anyHover * 2.6 * intro
      if (anyHover > 0.002) {
        lightPos.set(mouse.tx, -mouse.ty, 0.5).unproject(camera).sub(camera.position).normalize()
        touchLight.position
          .copy(camera.position)
          .addScaledVector(lightPos, (1.75 - camera.position.z) / lightPos.z)
      }

      for (const s of sheets) buildQuad(s)

      const wantCursor = dragging ? "grabbing" : anyHover > 0.5 ? "grab" : ""
      if (wantCursor !== cursorNow) {
        cursorNow = wantCursor
        host!.style.cursor = wantCursor
      }

      renderer.render(scene, camera)
    }

    function start() {
      if (running) return
      running = true
      clock.getDelta()
      raf = requestAnimationFrame(frame)
    }
    function stop() {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }
    const sync = () => (onScreen && pageVisible ? start() : stop())

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true
        sync()
      },
      { rootMargin: "120px" }
    )
    io.observe(host)

    const onVis = () => {
      pageVisible = !document.hidden
      sync()
    }
    document.addEventListener("visibilitychange", onVis)

    // warm the shaders before the first visible frame so the sheets do not
    // pop in half-compiled
    renderer.compile(scene, camera)
    host.dataset.ready = "true"
    sync()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerdown", onDown)
      host.removeEventListener("pointerup", onUp)
      host.removeEventListener("pointercancel", onUp)
      host.removeEventListener("pointerleave", onLeave)
      geo.dispose()
      haloTex.dispose()
      for (const t of textures) t.dispose()
      for (const s of sheets) s.mat.dispose()
      for (const h of halos) {
        h.geometry.dispose()
        ;(h.material as THREE.Material).dispose()
      }
      envRT.texture.dispose()
      pmrem.dispose()
      renderer.dispose()
      canvas.remove()
      delete host.dataset.ready
    }
  }, [cards])

  return <div ref={hostRef} className="pg-stage" aria-hidden />
}
