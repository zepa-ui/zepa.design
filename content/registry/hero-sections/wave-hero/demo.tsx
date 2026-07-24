/**
 * Component originally created by @franky-adl
 * Original repository: https://github.com/franky-adl/fluid-cursor-demo
 * Copyright (c) 2026 franky-adl
 * Licensed under the MIT License.
 * Modified for Zepa UI.
 */

"use client";

/* ─────────────────────────────────────────────
   wave-hero — single-file React port of the
   "3d-wave-grid" vanilla Three.js project.

   An instanced 40×40 grid of tall cubes ripples
   with expanding Gaussian wavefronts that follow
   the cursor (and drift on their own when idle).
   ───────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import gsap from "gsap";

/* ── Vignette + RGB-shift post FX shader ─────────────────────── */
const VignetteRGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    shiftAmount: { value: 0.005 },
    vignetteRadius: { value: 0.3 },
    vignetteSoftness: { value: 0.3 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float shiftAmount;
    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    varying vec2 vUv;

    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      float horzQuadrant = sign(vUv.x - center.x);
      float vertQuadrant = sign(vUv.y - center.y);

      float vignetteFactor = smoothstep(vignetteRadius, vignetteRadius + vignetteSoftness, dist);
      float currentShift = shiftAmount * vignetteFactor;

      float r = texture2D(tDiffuse, vUv + vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(currentShift * horzQuadrant, currentShift * vertQuadrant)).b;

      float darken = 1.0 - vignetteFactor * 0.5;
      gl_FragColor = vec4(vec3(r, g, b) * darken, 1.0);
    }
  `,
};

/* ── MouseTrail: records cursor path in world space and uploads
      it as a 128×1 RGBA-float texture the vertex shader reads. ── */
const MAX_TRAIL = 128;

interface TrailPoint {
  x: number;
  z: number;
  age: number;
  distDelta: number;
}

interface TrailUniforms {
  uTrailTexture: { value: THREE.DataTexture };
  uTrailCount: { value: number };
  uFadeTime: { value: number };
}

class MouseTrail {
  bounds: number;
  camera: THREE.Camera;
  canvas: HTMLCanvasElement;
  params = { fadeTime: 2.0, trailSpacing: 0.1 };
  trail: TrailPoint[] = [];
  lastPoint: { x: number; z: number } | null = null;
  timeSinceLastMove = 0;
  randomPointTimer = 0;
  isPlacingRandomPoints = true;
  randomPointStrength = 0.8;
  mouseCoords = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  rayPlane: THREE.Mesh;
  trailData: Float32Array;
  trailTexture: THREE.DataTexture;
  _uniforms: TrailUniforms;
  rect: DOMRect;
  onPointerMove: (e: PointerEvent) => void;

  constructor(bounds: number, camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.bounds = bounds;
    this.camera = camera;
    this.canvas = canvas;

    this.rayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }),
    );
    this.rayPlane.rotation.x = -Math.PI / 2;
    this.rayPlane.updateMatrixWorld(true);

    this.trailData = new Float32Array(MAX_TRAIL * 4);
    this.trailTexture = new THREE.DataTexture(
      this.trailData,
      MAX_TRAIL,
      1,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    this.trailTexture.needsUpdate = true;

    this._uniforms = {
      uTrailTexture: { value: this.trailTexture },
      uTrailCount: { value: 0 },
      uFadeTime: { value: this.params.fadeTime },
    };

    this.rect = this.canvas.getBoundingClientRect();

    this.onPointerMove = (e: PointerEvent) => {
      this.mouseCoords.set(
        ((e.clientX - this.rect.left) / this.rect.width) * 2 - 1,
        -((e.clientY - this.rect.top) / this.rect.height) * 2 + 1,
      );
      this.raycaster.setFromCamera(this.mouseCoords, this.camera);
      const hits = this.raycaster.intersectObject(this.rayPlane);
      if (hits.length === 0) return;

      const { x, z } = hits[0].point;
      let distDelta = 0;
      if (this.lastPoint) {
        const dx = x - this.lastPoint.x;
        const dz = z - this.lastPoint.z;
        distDelta = Math.sqrt(dx * dx + dz * dz);
        if (distDelta < this.params.trailSpacing) return;
      }
      if (this.trail.length >= MAX_TRAIL) this.trail.shift();
      this.trail.push({ x, z, age: 0, distDelta });
      this.lastPoint = { x, z };
      this.timeSinceLastMove = 0;
      this.isPlacingRandomPoints = false;
      this.randomPointTimer = 0;
    };
    this.canvas.addEventListener("pointermove", this.onPointerMove);
  }

  get uniforms() {
    return this._uniforms;
  }

  refreshRect() {
    this.rect = this.canvas.getBoundingClientRect();
  }

  addRandomPoint() {
    const x = (Math.random() * 0.5 - 0.25) * this.bounds;
    const z = (Math.random() * 0.5 - 0.25) * this.bounds;
    const distDelta = this.randomPointStrength + Math.random() * 0.2;
    if (this.trail.length >= MAX_TRAIL) this.trail.shift();
    this.trail.push({ x, z, age: 0, distDelta });
  }

  update(delta: number) {
    const expiry = this.params.fadeTime * 4;
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].age += delta;
      if (this.trail[i].age > expiry) this.trail.splice(i, 1);
    }

    this.timeSinceLastMove += delta;
    if (this.timeSinceLastMove >= 3.0 && !this.isPlacingRandomPoints) {
      this.isPlacingRandomPoints = true;
      this.randomPointTimer = 0;
    }
    if (this.isPlacingRandomPoints) {
      this.randomPointTimer += delta;
      if (this.randomPointTimer >= 1.5) {
        this.addRandomPoint();
        this.randomPointTimer = 0;
      }
    }

    const count = Math.min(this.trail.length, MAX_TRAIL);
    if (count > 0 || this._uniforms.uTrailCount.value > 0) {
      for (let i = 0; i < count; i++) {
        const ti = i * 4;
        this.trailData[ti] = this.trail[i].x;
        this.trailData[ti + 1] = this.trail[i].z;
        this.trailData[ti + 2] = this.trail[i].age;
        this.trailData[ti + 3] = this.trail[i].distDelta;
      }
      this.trailTexture.needsUpdate = true;
      this._uniforms.uTrailCount.value = count;
    }
  }

  dispose() {
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.trailTexture.dispose();
    (this.rayPlane.geometry as THREE.BufferGeometry).dispose();
    (this.rayPlane.material as THREE.Material).dispose();
  }
}

/* ── Shared wave deformation injected into both the lit material
      and the depth material so shadows match the displacement. ── */
function overrideVertexShader(vertexShader: string) {
  return vertexShader
    .replace(
      "#include <common>",
      `#include <common>
      varying float vHeight;
      attribute vec2 aOffset;
      uniform sampler2D uTrailTexture;
      uniform int       uTrailCount;
      uniform float     uWaveSpeed;
      uniform float     uWaveFreq;
      uniform float     uWaveWidth;
      uniform float     uFadeTime;
      uniform float     uAmplitude;
      uniform float     uJitter;
      uniform float     uMaxHeight;

      vec2 hash2( vec2 p ) {
        p = vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) );
        return fract( sin( p ) * 43758.5453123 ) - 0.5;
      }`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vHeight = 0.0;
      if ( position.y > 0.0 ) {
        vec2 jitter  = hash2( aOffset ) * uJitter;
        vec2 worldXZ = aOffset + jitter;
        float waveHeight  = 0.0;
        float totalWeight = 0.0;
        for ( int i = 0; i < uTrailCount; i++ ) {
          vec4 td = texture2D( uTrailTexture, vec2( ( float(i) + 0.5 ) / 128.0, 0.5 ) );
          float dist      = length( worldXZ - td.rg );
          float wavefront = uWaveSpeed * td.b;
          float relDist   = dist - wavefront;
          float window = exp( -( relDist * relDist ) / ( uWaveWidth * uWaveWidth ) );
          float fade   = exp( -td.b / uFadeTime );
          float atten  = 1.0 / ( 1.0 + dist * 0.1 );
          float weight = fade * window * atten * td.a;
          waveHeight  += weight * cos( uWaveFreq * relDist );
          totalWeight += weight;
        }
        waveHeight /= max( totalWeight, 1.0 );
        float displacement = clamp( waveHeight * uAmplitude, -uMaxHeight, uMaxHeight );
        transformed.y += displacement;
        vHeight = displacement;
      }`,
    );
}

const ArrowIcon = () => (
  <svg
    className="wh-arrow"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function WaveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const container = rootRef.current!;

    /* ── Sizes (container-based for embed safety) ── */
    const sizes = {
      width: container.clientWidth,
      height: container.clientHeight,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };

    /* ── Params ──────────────────────────────── */
    const gridSize = 40;
    const cubeWidth = 0.8;
    const cubeHeight = 3;
    const params = {
      gap: 0.01,
      waveAmplitude: 0.4,
      waveSpeed: 6.0,
      waveFrequency: 1.2,
      waveWidth: 3.0,
      waveJitter: 0.2,
      waveMaxHeight: 0.4,
      colorBase: "#ffffff",
      colorHigh: "#0055ff",
    };
    const bounds = gridSize * (cubeWidth + params.gap);

    /* ── Scene ───────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(params.colorBase).multiplyScalar(0.5);

    /* ── Camera ──────────────────────────────── */
    const camera = new THREE.PerspectiveCamera(
      40,
      sizes.width / sizes.height,
      0.1,
      200,
    );
    const camRadius = 12;
    const alphaRange = Math.PI * 0.03;
    const betaRange = Math.PI * 0.05;
    const mouse = new THREE.Vector2(0, 0);
    const lerpedMouse = new THREE.Vector2(0, 0);

    const updateCamPosition = (mx: number, my: number) => {
      const alpha = my * alphaRange;
      const beta = mx * betaRange;
      camera.position.set(
        -camRadius * Math.cos(alpha) * Math.sin(beta),
        camRadius * Math.cos(alpha) * Math.cos(beta),
        camRadius * Math.sin(alpha),
      );
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
    };
    updateCamPosition(0, 0);
    scene.add(camera);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / sizes.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / sizes.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Lighting ────────────────────────────── */
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 4.0);
    directionalLight.position.set(-20, 10, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.radius = 6;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 60;
    directionalLight.shadow.camera.left = -22;
    directionalLight.shadow.camera.right = 22;
    directionalLight.shadow.camera.top = 22;
    directionalLight.shadow.camera.bottom = -22;
    directionalLight.shadow.bias = 0.0001;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight("#ffffff", 1.0);
    directionalLight2.position.set(10, 5, -3);
    scene.add(directionalLight2);

    /* ── MouseTrail ──────────────────────────── */
    const mouseTrail = new MouseTrail(bounds, camera, canvas);
    const mu = mouseTrail.uniforms;

    /* ── Instanced grid ──────────────────────── */
    const count = gridSize * gridSize;
    const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth);
    const offsetAttribute = new THREE.InstancedBufferAttribute(
      new Float32Array(count * 2),
      2,
    );
    geometry.setAttribute("aOffset", offsetAttribute);

    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTrailTexture = mu.uTrailTexture;
      shader.uniforms.uTrailCount = mu.uTrailCount;
      shader.uniforms.uFadeTime = mu.uFadeTime;
      shader.uniforms.uWaveSpeed = { value: params.waveSpeed };
      shader.uniforms.uWaveFreq = { value: params.waveFrequency };
      shader.uniforms.uWaveWidth = { value: params.waveWidth };
      shader.uniforms.uAmplitude = { value: params.waveAmplitude };
      shader.uniforms.uJitter = { value: params.waveJitter };
      shader.uniforms.uMaxHeight = { value: params.waveMaxHeight };
      shader.uniforms.uColorBase = { value: new THREE.Color(params.colorBase) };
      shader.uniforms.uColorHigh = { value: new THREE.Color(params.colorHigh) };
      shader.vertexShader = overrideVertexShader(shader.vertexShader);
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          varying float vHeight;
          uniform vec3  uColorBase;
          uniform vec3  uColorHigh;
          uniform float uMaxHeight;`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float t = clamp( vHeight / uMaxHeight, 0.0, 1.0 );
          diffuseColor.rgb = mix( uColorBase, uColorHigh, t );`,
        );
    };

    const depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTrailTexture = mu.uTrailTexture;
      shader.uniforms.uTrailCount = mu.uTrailCount;
      shader.uniforms.uFadeTime = mu.uFadeTime;
      shader.uniforms.uWaveSpeed = { value: params.waveSpeed };
      shader.uniforms.uWaveFreq = { value: params.waveFrequency };
      shader.uniforms.uWaveWidth = { value: params.waveWidth };
      shader.uniforms.uAmplitude = { value: params.waveAmplitude };
      shader.uniforms.uJitter = { value: params.waveJitter };
      shader.uniforms.uMaxHeight = { value: params.waveMaxHeight };
      shader.vertexShader = overrideVertexShader(shader.vertexShader);
    };

    const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
    instancedMesh.customDepthMaterial = depthMaterial;
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const spacing = cubeWidth + params.gap;
    const offset = ((gridSize - 1) * spacing) / 2;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        const x = i * spacing - offset;
        const z = j * spacing - offset;
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(index, dummy.matrix);
        offsetAttribute.setXY(index, x, z);
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    offsetAttribute.needsUpdate = true;

    /* ── Renderer + post-processing ──────────── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor("#808080");
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const vignettePass = new ShaderPass(VignetteRGBShiftShader);
    vignettePass.uniforms.shiftAmount.value = 0.005;
    vignettePass.uniforms.vignetteRadius.value = 0.3;
    vignettePass.uniforms.vignetteSoftness.value = 0.3;
    composer.addPass(vignettePass);
    composer.addPass(new OutputPass());
    composer.setSize(sizes.width, sizes.height);
    composer.setPixelRatio(sizes.pixelRatio);

    /* ── Resize (ResizeObserver on container) ── */
    const resizeObserver = new ResizeObserver(() => {
      sizes.width = container.clientWidth;
      sizes.height = container.clientHeight;
      sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(sizes.pixelRatio);
      composer.setSize(sizes.width, sizes.height);
      composer.setPixelRatio(sizes.pixelRatio);
      mouseTrail.refreshRect();
    });
    resizeObserver.observe(container);

    /* ── Animation loop ──────────────────────── */
    const timer = new THREE.Timer();
    timer.connect(document);

    renderer.setAnimationLoop(() => {
      timer.update();
      const delta = timer.getDelta();

      lerpedMouse.x += (mouse.x - lerpedMouse.x) * 0.04;
      lerpedMouse.y += (mouse.y - lerpedMouse.y) * 0.04;
      updateCamPosition(lerpedMouse.x, lerpedMouse.y);

      mouseTrail.update(delta);
      composer.render();
    });

    /* ── UTC clock ───────────────────────────── */
    const updateTime = () => {
      if (!timeRef.current) return;
      const now = new Date();
      timeRef.current.textContent =
        now.toLocaleTimeString("en-US", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }) + " UTC";
    };
    updateTime();
    const timeInterval = window.setInterval(updateTime, 60000);

    /* ── Staggered intro ─────────────────────── */
    const scope = rootRef.current!;
    const targets = scope.querySelectorAll<HTMLElement>(
      ".nav-logo a, .nav-links a, .nav-socials a, .nav-time p, .hero-section h1, .bar-location p, .bar-projects a, .bar-availability a",
    );
    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: 20 },
      {
        duration: 1,
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      },
    );

    /* ── Cleanup ─────────────────────────────── */
    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.clearInterval(timeInterval);
      tween.kill();
      timer.disconnect();
      timer.dispose();
      resizeObserver.disconnect();
      mouseTrail.dispose();
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          m.geometry?.dispose();
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((x) => x?.dispose());
          else mat?.dispose();
        }
      });
      geometry.dispose();
      material.dispose();
      depthMaterial.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="wave-hero-page" ref={rootRef}>
      <style>{css}</style>

      <div className="overlay">
        <div className="top-nav">
          <div className="nav-logo">
            <a href="#">
              <img
                src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
                alt="Zepa"
                className="wh-logo-img"
              />
            </a>
          </div>
          <div className="nav-content">
            <div className="nav-links">
              <a href="#" className="animated-link">
                <span className="link-content">
                  <span className="link-text">Components</span>
                  <span className="link-text">Components</span>
                </span>
              </a>
              <a href="#" className="animated-link">
                <span className="link-content">
                  <span className="link-text">Templates</span>
                  <span className="link-text">Templates</span>
                </span>
              </a>
              <a href="#" className="animated-link">
                <span className="link-content">
                  <span className="link-text">Docs</span>
                  <span className="link-text">Docs</span>
                </span>
              </a>
            </div>
            <div className="nav-socials">
              <a href="#" className="animated-link">
                <span className="link-content">
                  <span className="link-text">GitHub</span>
                  <span className="link-text">GitHub</span>
                </span>
              </a>
              <a href="#" className="animated-link">
                <span className="link-content">
                  <span className="link-text">Twitter</span>
                  <span className="link-text">Twitter</span>
                </span>
              </a>
            </div>
            <div className="nav-time">
              <p ref={timeRef} />
            </div>
          </div>
        </div>

        <div className="hero-section">
          <div className="spacer" />
          <h1>
            Zepa is an open-source component library built for modern React
            applications.
            <span className="secondary">
              {" "}
              Every component is handcrafted, fully accessible, and ready to
              drop into your project — no configuration required.
            </span>
          </h1>
          <div className="spacer-back" />
        </div>

        <div className="bottom-bar">
          <div className="bar-projects">
            <Link href="/" className="animated-link">
              <span className="link-content">
                <span className="link-text">
                  Browse components
                  <ArrowIcon />
                </span>
                <span className="link-text">
                  Browse components
                  <ArrowIcon />
                </span>
              </span>
            </Link>
          </div>
          <div className="bar-availability">
            <Link href="/" className="animated-link">
              <span className="link-content">
                <span className="link-text">
                  Get Started
                  <ArrowIcon />
                </span>
                <span className="link-text">
                  Get Started
                  <ArrowIcon />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <canvas className="webgl" ref={canvasRef} />
    </div>
  );
}

/* ── styles (scoped under .wave-hero-page) ─────────────────── */
const css = `
.wave-hero-page {
  --text-color: #000000;
  --secondary-text-color: #616161;
  position: relative; width: 100%; height: 100vh; overflow: hidden;
  font-family: var(--font-manrope), -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-color);
  -webkit-font-smoothing: antialiased;
}
.wave-hero-page * { margin: 0; padding: 0; box-sizing: border-box; }

.wave-hero-page .webgl { position: absolute; top: 0; left: 0; outline: none; }

.wave-hero-page .overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 2rem; pointer-events: none; z-index: 1;
}
.wave-hero-page .overlay a {
  color: var(--text-color); text-decoration: none; pointer-events: all;
}

.wave-hero-page .top-nav {
  position: absolute; top: 0; left: 0; width: 100%;
  display: flex; padding: 1rem; gap: 1rem;
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
}
.wave-hero-page .top-nav a { color: var(--secondary-text-color); font-size: 18px; font-weight: 400; }
.wave-hero-page .top-nav .nav-logo { width: 36%; display: flex; align-items: center; }
.wave-hero-page .top-nav .nav-logo a { display: flex; align-items: center; }
.wave-hero-page .wh-logo-img { height: clamp(2.2rem, 3.5vw, 3.5rem); width: auto; object-fit: contain; }
.wave-hero-page .top-nav .nav-content { display: flex; flex: 1; gap: 0.5rem; }
.wave-hero-page .top-nav .nav-content .nav-links,
.wave-hero-page .top-nav .nav-content .nav-socials {
  display: flex; gap: 0.5rem; flex-direction: column; flex: 1;
}
.wave-hero-page .top-nav .nav-content .nav-time { color: var(--secondary-text-color); flex: 1; }

.wave-hero-page .hero-section {
  margin-top: 40vh; height: 60vh; display: flex; justify-content: flex-start;
}
.wave-hero-page .hero-section .spacer { width: 36%; }
.wave-hero-page .hero-section .spacer-back { width: 10%; }
.wave-hero-page .hero-section h1 {
  font-size: clamp(1.5rem, 2.5vw, 2rem); flex: 1; font-weight: 400;
}
.wave-hero-page .hero-section h1 .secondary { color: var(--secondary-text-color); }

.wave-hero-page .bottom-bar { display: flex; justify-content: space-between; width: 100%; }
.wave-hero-page .bottom-bar .bar-projects,
.wave-hero-page .bottom-bar .bar-availability { flex: 1; }

.wave-hero-page .animated-link {
  display: inline-block; overflow: hidden; line-height: 1.2; height: 1.2em;
}
.wave-hero-page .link-content {
  display: flex; flex-direction: column; transform: translateY(-50%);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.wave-hero-page .link-text {
  display: flex; align-items: center; white-space: nowrap; height: 1.2em;
}
.wave-hero-page .wh-arrow { margin-left: 0.5rem; width: 20px; height: 20px; }
.wave-hero-page .animated-link:hover .link-content {
  transform: translateY(0%); color: var(--text-color);
}

@media (max-width: 768px) {
  .wave-hero-page .overlay { padding: 1rem; }
  .wave-hero-page .top-nav { flex-direction: column; align-items: center; gap: 1rem; }
  .wave-hero-page .top-nav .nav-logo { order: -1; width: 100%; text-align: center; justify-content: center; }
  .wave-hero-page .wh-logo-img { height: 2.5rem; }
  .wave-hero-page .top-nav .nav-content { width: 100%; gap: 0.5rem; }
  .wave-hero-page .hero-section h1 { font-size: 1rem; align-items: center; text-align: center; }
  .wave-hero-page .hero-section .spacer,
  .wave-hero-page .hero-section .spacer-back { display: none; }
  .wave-hero-page .bottom-bar { gap: 0.5rem; align-items: flex-end; font-size: 12px; }
}
`;
