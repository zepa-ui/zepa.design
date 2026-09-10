"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

/* ─────────────────────────────────────────────
   jiggle-animation — click to ripple between photos

   One subdivided plane, two textures, one click.

   The vertex shader measures each vertex's distance
   from the click point and rides a cosine outward
   from it, pulling every vertex toward or away from
   that point — the whole sheet wobbles like water
   struck once. A second timeline runs a hard vertical
   wipe across the same beat, so the next photo is
   revealed by the same gesture that shakes the old
   one.

   The ripple is two curves at different speeds: the
   power envelope ramps up over 0.5s and decays over
   1s, and that whole envelope is itself scrubbed by
   an ease over 1.5s. The wipe runs 1.15s on an expo
   ease alongside it, finishing first, so the shake
   outlives the change.

   Ported from a CodePen that leaned on twgl. twgl is
   not a dependency here — the four matrix helpers and
   the subdivided plane it supplied are ~80 lines, and
   a registry component should not make you install a
   library to see one effect. The context is WebGL1 on
   purpose, so the reference's attribute/varying/
   texture2D shaders compile untouched.
   ───────────────────────────────────────────── */

/** The dark mark — the light one this component started with disappears on white. */
const LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"

const IMAGES = [
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1789059986/pexels-jean-luc-benazet-753072919-19025346_s6uesf.jpg",
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1789059984/nothing_uiozzh.avif",
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1789059984/work_vvvatz.avif",
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1789059984/photo-1544764200-d834fd210a23_pwbvkj.avif",
]

/* ── shaders, verbatim from the reference ───── */

const vert = `
  precision mediump float;
  attribute vec3 position;
  attribute vec2 texcoord;
  uniform mat4 uMatrix;
  uniform mat4 uTmatrix;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uOffset;
  uniform float uPower;
  varying vec2 vTexcoord;
  void main() {
    vec3 pos = position.xzy;
    float dist = distance(uOffset, vec2(pos.x, pos.y));
    float rippleEffect = cos(15.0 * (dist - (uTime / 60.0)));
    float distortionEffect = rippleEffect * uPower;
    pos.x += (distortionEffect / 30.0 * (uOffset.x - pos.x));
    pos.y += distortionEffect / 30.0 * (uOffset.y - pos.y);
    gl_Position = uMatrix * vec4(pos, 1.0);
    vTexcoord = (uTmatrix * vec4(texcoord - vec2(.5), 0, 1)).xy + vec2(.5);
  }
`

const frag = `
  precision mediump float;
  uniform sampler2D uTexOne;
  uniform sampler2D uTexTwo;
  uniform float uProgress;
  varying vec2 vTexcoord;
  void main() {
    vec2 uv = vTexcoord;

    vec4 color = vec4(1.0);
    vec4 texOne = texture2D(uTexOne, uv);
    vec4 texTwo = texture2D(uTexTwo, uv);
    float effect = step(uv.x, uProgress);
    color = mix(texOne, texTwo, effect);
    gl_FragColor = color;
  }
`

/* ── the bits of twgl.m4 this needed ──────────
   Column-major, and each one matches twgl's own
   implementation term for term. The ripple's screen
   position depends entirely on these, so they are
   transcribed rather than reinvented. */

const identity = () =>
  new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

function ortho(
  left: number,
  right: number,
  bottom: number,
  top: number,
  near: number,
  far: number,
  dst: Float32Array,
) {
  dst[0] = 2 / (right - left)
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = 0
  dst[5] = 2 / (top - bottom)
  dst[6] = 0
  dst[7] = 0
  dst[8] = 0
  dst[9] = 0
  dst[10] = 2 / (near - far)
  dst[11] = 0
  dst[12] = (right + left) / (left - right)
  dst[13] = (top + bottom) / (bottom - top)
  dst[14] = (far + near) / (near - far)
  dst[15] = 1
  return dst
}

/** dst = m · T(v) */
function translate(m: Float32Array, v: number[], dst: Float32Array) {
  const [v0, v1, v2] = v
  if (m !== dst) for (let i = 0; i < 12; i++) dst[i] = m[i]
  dst[12] = m[0] * v0 + m[4] * v1 + m[8] * v2 + m[12]
  dst[13] = m[1] * v0 + m[5] * v1 + m[9] * v2 + m[13]
  dst[14] = m[2] * v0 + m[6] * v1 + m[10] * v2 + m[14]
  dst[15] = m[3] * v0 + m[7] * v1 + m[11] * v2 + m[15]
  return dst
}

/** dst = m · S(v) */
function scale(m: Float32Array, v: number[], dst: Float32Array) {
  const [v0, v1, v2] = v
  for (let i = 0; i < 4; i++) {
    dst[i] = v0 * m[i]
    dst[4 + i] = v1 * m[4 + i]
    dst[8 + i] = v2 * m[8 + i]
  }
  if (m !== dst) for (let i = 12; i < 16; i++) dst[i] = m[i]
  return dst
}

/**
 * twgl.primitives.createPlaneBufferInfo(gl, 1, 1, 30, 30).
 *
 * The plane lies in XZ with y = 0, which is why the vertex shader opens with
 * `position.xzy` — that swizzle is what stands it up into XY.
 */
function createPlane(width: number, depth: number, sw: number, sd: number) {
  const positions: number[] = []
  const texcoords: number[] = []
  const indices: number[] = []

  for (let z = 0; z <= sd; z++) {
    for (let x = 0; x <= sw; x++) {
      const u = x / sw
      const v = z / sd
      positions.push(width * u - width * 0.5, 0, depth * v - depth * 0.5)
      texcoords.push(u, v)
    }
  }

  const across = sw + 1
  for (let z = 0; z < sd; z++) {
    for (let x = 0; x < sw; x++) {
      // triangle 1: top-left, bottom-left, top-right
      indices.push(
        (z + 0) * across + x,
        (z + 1) * across + x,
        (z + 0) * across + x + 1,
      )
      // triangle 2: bottom-left, bottom-right, top-right — the last index must
      // be x + 1. Dropping the + 1 mirrors this triangle back over the first,
      // leaving half of every quad unpainted: the whole plane renders as a
      // sawtooth of holes.
      indices.push(
        (z + 1) * across + x,
        (z + 1) * across + x + 1,
        (z + 0) * across + x + 1,
      )
    }
  }

  return {
    position: new Float32Array(positions),
    texcoord: new Float32Array(texcoords),
    indices: new Uint16Array(indices),
    count: indices.length,
  }
}

type TexInfo = { texture: WebGLTexture; width: number; height: number }

export default function JiggleAnimation() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })
    if (!gl) {
      console.error("[jiggle-animation] WebGL is unavailable")
      return
    }

    /* ── program ── */
    if (gl.isContextLost()) {
      console.error(
        "[jiggle-animation] the WebGL context is lost; nothing can be compiled against it",
      )
      return
    }

    const compile = (type: number, src: string) => {
      const which = type === gl.VERTEX_SHADER ? "vertex" : "fragment"
      const sh = gl.createShader(type)
      if (!sh) throw new Error(`could not create the ${which} shader`)
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh)
        gl.deleteShader(sh)
        // An empty log with a failed compile almost always means the context
        // died rather than the GLSL being wrong — say so instead of implying a
        // syntax error that isn't there.
        throw new Error(
          log?.trim()
            ? `${which} shader: ${log.trim()}`
            : `${which} shader failed to compile and the driver gave no reason` +
              (gl.isContextLost() ? " — the context is lost" : ""),
        )
      }
      return sh
    }

    let program: WebGLProgram | null = null
    let vs: WebGLShader | null = null
    let fs: WebGLShader | null = null
    try {
      vs = compile(gl.VERTEX_SHADER, vert)
      fs = compile(gl.FRAGMENT_SHADER, frag)
      program = gl.createProgram()
      if (!program) throw new Error("could not create program")
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) ?? "program failed to link")
      }
    } catch (err) {
      console.error("[jiggle-animation]", err)
      return
    }

    const aPosition = gl.getAttribLocation(program, "position")
    const aTexcoord = gl.getAttribLocation(program, "texcoord")
    // uRes is declared in the reference's vertex shader and never read, so the
    // compiler strips it and this comes back null. Every setter guards for it.
    const u = {
      uMatrix: gl.getUniformLocation(program, "uMatrix"),
      uTmatrix: gl.getUniformLocation(program, "uTmatrix"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uRes: gl.getUniformLocation(program, "uRes"),
      uOffset: gl.getUniformLocation(program, "uOffset"),
      uPower: gl.getUniformLocation(program, "uPower"),
      uTexOne: gl.getUniformLocation(program, "uTexOne"),
      uTexTwo: gl.getUniformLocation(program, "uTexTwo"),
      uProgress: gl.getUniformLocation(program, "uProgress"),
    }

    /* ── geometry ── */
    const plane = createPlane(1, 1, 30, 30)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, plane.position, gl.STATIC_DRAW)
    const texcoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, plane.texcoord, gl.STATIC_DRAW)
    const indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, plane.indices, gl.STATIC_DRAW)

    /* ── textures ── */
    let disposed = false
    const textures: TexInfo[] = []
    const pending: {
      image: HTMLImageElement
      onLoad: () => void
      onError: () => void
    }[] = []

    for (const src of IMAGES) {
      const texture = gl.createTexture()
      if (!texture) continue
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // one black pixel so the first frames have something legal to sample
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        1,
        1,
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0]),
      )
      // the photos are non-power-of-two, so clamped edges and a non-mipmap
      // filter are mandatory, not stylistic
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

      // width/height start at 1/1, never undefined — the reference typos this
      // as `heigth`, so its first frames divide by undefined and the cover-fit
      // scale is NaN until the first image lands
      const info: TexInfo = { texture, width: 1, height: 1 }
      textures.push(info)

      const image = document.createElement("img")
      const onLoad = () => {
        if (disposed) return
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
        info.width = image.naturalWidth
        info.height = image.naturalHeight
      }
      // Guarded: a load aborted by unmount is not a broken URL, and reporting
      // it as one sends you hunting for a CORS problem that does not exist.
      const onError = () => {
        if (disposed) return
        console.error(`[jiggle-animation] image failed to load: ${src}`)
      }
      image.addEventListener("load", onLoad)
      image.addEventListener("error", onError)
      pending.push({ image, onLoad, onError })
      // required: a texture sampled by WebGL must not taint the canvas
      image.crossOrigin = ""
      image.src = src
    }

    if (textures.length < 2) return

    const values = {
      total: textures.length - 1,
      power: 0,
      progress: 0,
      time: 0,
      offset: [0, 0] as [number, number],
      current: 0,
      next: 1,
    }
    let isAnimating = false

    /* ── frame ── */
    const resize = () => {
      // the reference sizes the buffer in CSS pixels, which is soft on a retina
      // display; the click offset is normalised off the element rect instead of
      // the buffer, so raising this cannot desync the ripple's position
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    const matrix = identity()
    const tMatrix = identity()

    const render = () => {
      resize()
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      identityInto(matrix)
      identityInto(tMatrix)

      // The reference cover-fits every slide to textures[0]'s aspect. These
      // photos are not all the same shape, so it follows the slide on screen.
      const tex = textures[values.current]
      const texAspect = tex.width / tex.height
      const imgAspect = canvas.width / canvas.height
      let scaleY = 1
      let scaleX = 1
      if (imgAspect < texAspect) {
        scaleY = 1
        scaleX = imgAspect / texAspect
      } else if (imgAspect > texAspect) {
        scaleY = texAspect / imgAspect
        scaleX = 1
      }
      // The reference initialises both to 0 and has no else branch, so when the
      // aspects match exactly the texcoords collapse to a single texel and the
      // whole plane renders as one flat colour. Three of these photos are
      // exactly 3:2, so that is reachable — defaulting to 1 is the no-crop case
      // the missing branch wanted.

      scale(tMatrix, [scaleX, scaleY, 1], tMatrix)
      values.time++

      ortho(0, canvas.width, canvas.height, 0, -1, 1, matrix)
      translate(matrix, [canvas.width / 2, canvas.height / 2, 1], matrix)
      scale(matrix, [canvas.width / 1.5, canvas.height / 1.5, 1], matrix)

      gl.useProgram(program)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
      gl.enableVertexAttribArray(aTexcoord)
      gl.vertexAttribPointer(aTexcoord, 2, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

      if (u.uMatrix) gl.uniformMatrix4fv(u.uMatrix, false, matrix)
      if (u.uTmatrix) gl.uniformMatrix4fv(u.uTmatrix, false, tMatrix)
      if (u.uTime) gl.uniform1f(u.uTime, values.time)
      if (u.uPower) gl.uniform1f(u.uPower, values.power)
      if (u.uProgress) gl.uniform1f(u.uProgress, values.progress)
      if (u.uRes) gl.uniform2f(u.uRes, canvas.width, canvas.height)
      if (u.uOffset) gl.uniform2f(u.uOffset, values.offset[0], values.offset[1])

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[values.current].texture)
      if (u.uTexOne) gl.uniform1i(u.uTexOne, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, textures[values.next].texture)
      if (u.uTexTwo) gl.uniform1i(u.uTexTwo, 1)

      gl.drawElements(gl.TRIANGLES, plane.count, gl.UNSIGNED_SHORT, 0)
    }

    gsap.ticker.add(render)

    /* ── interaction ── */
    const changeSlide = () => {
      values.current = values.next
      values.next = values.next === values.total ? 0 : values.next + 1
    }

    const timelines: gsap.core.Timeline[] = []

    const onClick = (e: PointerEvent) => {
      if (isAnimating) return
      isAnimating = true

      // normalised off the element's own rect, so it stays correct at any
      // device pixel ratio and inside any container
      const rect = canvas.getBoundingClientRect()
      values.offset = [
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        ((e.clientY - rect.top) / rect.height) * 2 - 1,
      ]

      // GSAP 2's TimelineMax/TimelineLite and Linear/Power2/Expo, in GSAP 3 form
      const sub = gsap
        .timeline({ paused: true })
        .to(values, { duration: 0.5, power: 1, ease: "none" }, 0)
        .to(values, { duration: 1, power: 0, ease: "none" })

      const master = gsap.timeline({
        onComplete: () => {
          isAnimating = false
          values.progress = 0
          changeSlide()
        },
      })

      master
        .to(sub, { duration: 1.5, progress: 1, ease: "power2.inOut" })
        .to(values, { duration: 1.15, progress: 1, ease: "expo.inOut" }, 0)

      timelines.push(sub, master)
    }

    canvas.addEventListener("pointerdown", onClick)

    return () => {
      disposed = true
      gsap.ticker.remove(render)
      canvas.removeEventListener("pointerdown", onClick)
      for (const tl of timelines) tl.kill()
      // Detach rather than `img.src = ""`. Blanking src aborts an in-flight
      // load and fires `error`, so under Strict Mode every image reported
      // itself broken on the throwaway first mount.
      for (const p of pending) {
        p.image.removeEventListener("load", p.onLoad)
        p.image.removeEventListener("error", p.onError)
      }
      for (const info of textures) gl.deleteTexture(info.texture)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(texcoordBuffer)
      gl.deleteBuffer(indexBuffer)
      if (vs) gl.deleteShader(vs)
      if (fs) gl.deleteShader(fs)
      gl.deleteProgram(program)
      // Deliberately NOT calling WEBGL_lose_context.loseContext(). Strict Mode
      // reuses the same <canvas>, and getContext() hands back the same context
      // object — once lost, it stays lost, so the remount's shaders fail to
      // compile with a null info log. Deleting the resources above is enough;
      // the context goes when the canvas is removed from the document.
    }
  }, [])

  return (
    <div ref={rootRef} className="jg-root">
      <style>{CSS}</style>

      <canvas ref={canvasRef} className="jg-canvas" />

      <header className="jg-head">
        <img className="jg-logo" src={LOGO} alt="Zepa" draggable={false} />
      </header>

      <div className="jg-hint">Click anywhere</div>
    </div>
  )
}

/** Reset in place — the render loop reuses two matrices rather than allocating. */
function identityInto(m: Float32Array) {
  m[0] = 1
  m[1] = 0
  m[2] = 0
  m[3] = 0
  m[4] = 0
  m[5] = 1
  m[6] = 0
  m[7] = 0
  m[8] = 0
  m[9] = 0
  m[10] = 1
  m[11] = 0
  m[12] = 0
  m[13] = 0
  m[14] = 0
  m[15] = 1
  return m
}

const CSS = `
.jg-root {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background-color: #ffffff;
  color: #111111;
  cursor: pointer;
  font-family: var(--font-manrope), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.jg-root *, .jg-root *::before, .jg-root *::after { box-sizing: border-box; }

.jg-canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  z-index: 1;
  touch-action: manipulation;
}

.jg-head {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2vw 2.5vw;
  pointer-events: none;
  z-index: 2;
}
.jg-logo {
  width: min(12vw, 150px);
  max-height: 7vh;
  height: auto;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-select: none;
}

.jg-hint {
  position: absolute;
  left: 50%;
  bottom: 4vh;
  transform: translateX(-50%);
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
  z-index: 2;
}

@media (max-width: 848px) {
  .jg-logo { width: min(30vw, 130px); }
  .jg-hint { font-size: 0.68rem; bottom: 3vh; }
}
`
