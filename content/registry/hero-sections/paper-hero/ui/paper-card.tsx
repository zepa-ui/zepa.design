"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A near-paper-thin 3D video card that chases the cursor. No bending —
 * the card is a rigid, slightly-thicker-than-paper sheet that tilts
 * (rotates) toward the direction of movement, like a card carried
 * through air. Idle, it sways gently.
 */

interface PaperCardProps {
  videoSrc: string;
}

export function PaperCard({ videoSrc }: PaperCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Desktop + motion-safe only (mirrors the reference site, which hides
    // the card below 991px). Static pages get no canvas at all.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop || reducedMotion) return;

    let disposed = false;

    // ── Video element (texture source) ──
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});

    // ── Three basics ──
    // Orthographic camera: zero perspective distortion, so the card keeps
    // its exact width/height anywhere on screen — tilting reads as a clean
    // lean, never a stretched/elastic trapezoid.
    const scene = new THREE.Scene();
    const FRUSTUM_H = 2;
    let aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.OrthographicCamera(
      (-FRUSTUM_H * aspect) / 2,
      (FRUSTUM_H * aspect) / 2,
      FRUSTUM_H / 2,
      -FRUSTUM_H / 2,
      0.1,
      10
    );
    camera.position.z = 2.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    // Square card with a whisper of thickness — a rigid sheet, not a slab.
    const CARD_WIDTH = 0.5;
    const CARD_HEIGHT = 0.8;
    const CARD_THICKNESS = 0.008;
    const geometry = new THREE.BoxGeometry(
      CARD_WIDTH,
      CARD_HEIGHT,
      CARD_THICKNESS
    );

    const videoMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xd8d8d8 });
    // Box face order: +x, -x, +y, -y, +z (front), -z (back)
    const card = new THREE.Mesh(geometry, [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      videoMaterial,
      videoMaterial,
    ]);
    scene.add(card);

    // ── Cursor chase state ──
    const target = new THREE.Vector2(0, 0);
    const mouse = new THREE.Vector2(0, 0);
    // Smoothed velocity — holds the tilt while moving instead of
    // collapsing the instant the cursor pauses between frames.
    const vel = new THREE.Vector2(0, 0);
    let hasMoved = false;

    function visibleSize() {
      return { w: FRUSTUM_H * aspect, h: FRUSTUM_H };
    }

    function onMouseMove(event: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      const { w, h } = visibleSize();
      target.set((ndcX * w) / 2, (ndcY * h) / 2);
      hasMoved = true;
    }
    window.addEventListener("mousemove", onMouseMove);

    function onResize() {
      if (!container) return;
      aspect = container.clientWidth / container.clientHeight;
      camera.left = (-FRUSTUM_H * aspect) / 2;
      camera.right = (FRUSTUM_H * aspect) / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener("resize", onResize);

    // ── Frame loop ──
    const clock = new THREE.Clock();
    let raf = 0;

    function tick() {
      if (disposed) return;
      raf = requestAnimationFrame(tick);

      const t = clock.getElapsedTime();

      if (hasMoved) {
        // Lag behind the cursor…
        mouse.lerp(target, 0.075);
        card.position.x = mouse.x;
        card.position.y = mouse.y;

        // Smooth the lag into a velocity signal that persists while
        // the cursor is in motion.
        vel.x = THREE.MathUtils.lerp(vel.x, target.x - mouse.x, 0.2);
        vel.y = THREE.MathUtils.lerp(vel.y, target.y - mouse.y, 0.2);

        // 3D flip toward the direction of travel…
        card.rotation.y = THREE.MathUtils.lerp(
          card.rotation.y,
          THREE.MathUtils.clamp(vel.x * 2.2, -1.0, 1.0),
          0.14
        );
        card.rotation.x = THREE.MathUtils.lerp(
          card.rotation.x,
          THREE.MathUtils.clamp(-vel.y * 2.2, -1.0, 1.0),
          0.14
        );
        // …plus in-plane ROLL — the trailing-edge swing that makes it
        // read as dragged paper (move left → card leans left).
        card.rotation.z = THREE.MathUtils.lerp(
          card.rotation.z,
          THREE.MathUtils.clamp(vel.x * 1.1, -0.5, 0.5),
          0.12
        );
      } else {
        // Idle sway before the first mouse move — enough to read as 3D.
        card.rotation.y = Math.sin(t * 0.8) * 0.18;
        card.rotation.x = Math.cos(t * 0.6) * 0.1;
      }

      renderer.render(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      video.pause();
      video.src = "";
      texture.dispose();
      geometry.dispose();
      videoMaterial.dispose();
      edgeMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [videoSrc]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-20 hidden md:block"
      aria-hidden="true"
    />
  );
}
