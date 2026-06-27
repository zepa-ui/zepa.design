"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import "./ui/styles.css";

// CDN base for the remaining illustration assets (folders, lights, icons, etc.)
const A = "https://qclay.design/lovable/sixsense";

// Pixel grid tile sprites (hosted on Cloudinary)
const tileEmpty = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431540/tile-empty_lmsda0.svg";
const tile1 = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431539/tile-1_eg20da.svg";
const tile2 = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431540/tile-2_ppdpra.svg";
const tile3 = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431540/tile-3_nxtgtd.svg";
const tile4 = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431540/tile-4_auzfdy.svg";
const tile5 = "https://res.cloudinary.com/dcsgson45/image/upload/v1781431540/tile-5_fbyhcq.svg";

/* ---------- Pixel Grid ---------- */
const COLS = 12;
const ROWS = 16;
const TILE = 32;
const GAP = 1;
const BASE_FILL = 0.35;
const HOVER_FILL_RATIO = 0.7;

const TILE_SPRITES = [tileEmpty, tile1, tile2, tile3, tile4, tile5];

const spriteCache: Record<string, Promise<HTMLImageElement>> = {};
function loadSprite(src: string) {
  if (!spriteCache[src]) {
    spriteCache[src] = new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  return spriteCache[src];
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function PixelGrid({ side }: { side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = COLS * TILE + (COLS - 1) * GAP;
    const h = ROWS * TILE + (ROWS - 1) * GAP;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // sprite tile index per cell (0 = empty, 1..5 = filled variants)
    const total = COLS * ROWS;
    const tileIndex = new Int8Array(total);
    const baseOn = new Uint8Array(total); // base filled cells
    const hoverOn = new Uint8Array(total);
    const isOn = new Uint8Array(total);

    for (let i = 0; i < total; i++) tileIndex[i] = 1 + Math.floor(Math.random() * 5);

    // pick base cells
    const indices = Array.from({ length: total }, (_, i) => i);
    shuffle(indices);
    const baseCount = Math.floor(total * BASE_FILL);
    for (let i = 0; i < baseCount; i++) baseOn[indices[i]] = 1;

    const revealOrder = shuffle(indices.filter((i) => baseOn[i]));
    let revealCursor = 0;

    let sprites: (HTMLImageElement | null)[] = [];
    let mounted = true;

    Promise.all(TILE_SPRITES.map((s) => loadSprite(s)))
      .then((loaded) => {
        if (!mounted) return;
        sprites = loaded;
        paintAll();
        if (reduced) {
          for (let i = 0; i < total; i++) isOn[i] = baseOn[i];
          paintAll();
        } else {
          runReveal();
          runFlicker();
        }
      })
      .catch(() => {});

    function cellRect(i: number) {
      const c = i % COLS;
      const r = Math.floor(i / COLS);
      return { x: c * (TILE + GAP), y: r * (TILE + GAP) };
    }
    function paintCell(i: number) {
      if (!sprites.length) return;
      const { x, y } = cellRect(i);
      const img = isOn[i] ? sprites[tileIndex[i]] : sprites[0];
      if (img) {
        ctx.clearRect(x, y, TILE, TILE);
        ctx.drawImage(img, x, y, TILE, TILE);
      }
    }
    function paintAll() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < total; i++) paintCell(i);
    }

    let revealRaf = 0;
    function runReveal() {
      const perTick = Math.ceil(total / 18);
      function step() {
        for (let k = 0; k < perTick && revealCursor < revealOrder.length; k++, revealCursor++) {
          const i = revealOrder[revealCursor];
          isOn[i] = 1;
          paintCell(i);
        }
        if (revealCursor < revealOrder.length) revealRaf = requestAnimationFrame(step);
      }
      revealRaf = requestAnimationFrame(step);
    }

    let flickerTimer: ReturnType<typeof setTimeout> | null = null;
    function runFlicker() {
      const tick = () => {
        for (let k = 0; k < 3; k++) {
          const i = Math.floor(Math.random() * total);
          if (hoverOn[i]) continue;
          isOn[i] = Math.random() < BASE_FILL ? 1 : 0;
          paintCell(i);
        }
        flickerTimer = setTimeout(tick, 120 + Math.random() * 180);
      };
      flickerTimer = setTimeout(tick, 200);
    }

    let hoverFlickerTimer: ReturnType<typeof setTimeout> | null = null;
    function runHoverFlicker() {
      const tick = () => {
        const list: number[] = [];
        for (let i = 0; i < total; i++) if (hoverOn[i]) list.push(i);
        const n = Math.floor(list.length * 0.18);
        for (let k = 0; k < n; k++) {
          const i = list[Math.floor(Math.random() * list.length)];
          isOn[i] = Math.random() < HOVER_FILL_RATIO ? 1 : 0;
          paintCell(i);
        }
        hoverFlickerTimer = setTimeout(tick, 70 + Math.random() * 90);
      };
      hoverFlickerTimer = setTimeout(tick, 100);
    }

    let pointerRaf = 0;
    let pendingPt: { x: number; y: number } | null = null;
    function reconcile(px: number, py: number) {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const lx = px - rect.left;
      const ly = py - rect.top;
      const cellW = TILE + GAP;
      const cx = lx / cellW;
      const cy = ly / cellW;
      const t = performance.now();
      const newHover = new Uint8Array(total);
      const baseR = 4;
      // Determine envelope bounds
      const RMAX_CAP = 8;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const dx = c - cx;
          const dy = r - cy;
          const dist = Math.hypot(dx, dy);
          if (dist > RMAX_CAP) continue;
          const angle = Math.atan2(dy, dx);
          const noise = (Math.sin(c * 12.9898 + r * 78.233 + t * 0.002) + 1) * 0.5;
          let rMax =
            baseR *
            (Math.sin(angle * 3 + t * 0.0011) * 0.55 +
              Math.sin(angle * 5 - t * 0.0017 + 1.3) * 0.3 +
              Math.sin(angle * 2 + t * 0.0007 + 2.1) * 0.2);
          rMax = baseR + rMax;
          rMax *= 0.95 + noise * 0.3;
          const i = r * COLS + c;
          if (dist <= rMax - 0.5) {
            newHover[i] = 1;
          } else if (dist <= rMax + 0.4) {
            if (noise > 0.45) newHover[i] = 1;
          }
        }
      }
      // Reconcile
      for (let i = 0; i < total; i++) {
        const was = hoverOn[i];
        const now = newHover[i];
        if (was !== now) {
          hoverOn[i] = now;
          if (now) {
            isOn[i] = Math.random() < HOVER_FILL_RATIO ? 1 : 0;
          } else {
            isOn[i] = baseOn[i];
          }
          paintCell(i);
        }
      }
    }
    function onMove(e: PointerEvent) {
      pendingPt = { x: e.clientX, y: e.clientY };
      if (!pointerRaf) {
        pointerRaf = requestAnimationFrame(() => {
          pointerRaf = 0;
          if (pendingPt) reconcile(pendingPt.x, pendingPt.y);
        });
      }
    }
    if (!reduced) window.addEventListener("pointermove", onMove);
    if (!reduced) runHoverFlicker();

    return () => {
      mounted = false;
      window.removeEventListener("pointermove", onMove);
      if (flickerTimer) clearTimeout(flickerTimer);
      if (hoverFlickerTimer) clearTimeout(hoverFlickerTimer);
      if (revealRaf) cancelAnimationFrame(revealRaf);
      if (pointerRaf) cancelAnimationFrame(pointerRaf);
    };
  }, []);

  const mask =
    side === "left"
      ? "radial-gradient(ellipse 80% 80% at 30% 50%, black 0%, transparent 75%)"
      : "radial-gradient(ellipse 80% 80% at 70% 50%, black 0%, transparent 75%)";

  const style: CSSProperties = {
    position: "absolute",
    [side]: 0,
    top: "50%",
    transform: "translateY(-40%)",
    zIndex: 0,
    pointerEvents: "none",
    WebkitMaskImage: mask,
    maskImage: mask,
  };

  return (
    <div ref={wrapRef} style={style}>
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ---------- Typewriter ---------- */
const PHRASES = [
  "Create a finance dashboard design",
  "Branding with M letter",
  "Liquid glass effect",
  "Loader animation",
  "SaaS landing page",
];
function useTypewriter() {
  const [text, setText] = useState("");
  useEffect(() => {
    let phraseIdx = 0;
    let i = 0;
    let mode: "type" | "pause" | "delete" = "type";
    let timer: ReturnType<typeof setTimeout>;
    function step() {
      const phrase = PHRASES[phraseIdx];
      if (mode === "type") {
        i++;
        setText(phrase.slice(0, i));
        if (i >= phrase.length) {
          mode = "pause";
          timer = setTimeout(step, 1400);
          return;
        }
        timer = setTimeout(step, 22 + Math.random() * 25);
      } else if (mode === "pause") {
        mode = "delete";
        timer = setTimeout(step, 14);
      } else {
        i--;
        setText(phrase.slice(0, i));
        if (i <= 0) {
          phraseIdx = (phraseIdx + 1) % PHRASES.length;
          mode = "type";
        }
        timer = setTimeout(step, 14);
      }
    }
    timer = setTimeout(step, 600);
    return () => clearTimeout(timer);
  }, []);
  return text;
}

/* ---------- Send Button ---------- */
function SendButton() {
  const [hovered, setHovered] = useState(false);
  const [arrowToggle, setArrowToggle] = useState(0);
  const ringRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const speedRef = useRef(0); // deg/ms
  const lastTRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    function loop(t: number) {
      const dt = Math.min(64, t - lastTRef.current);
      lastTRef.current = t;
      const targetSpeed = hovered ? 360 / 1500 : 0;
      const tau = hovered ? 250 : 700;
      const k = 1 - Math.exp(-dt / tau);
      speedRef.current += (targetSpeed - speedRef.current) * k;
      angleRef.current = (angleRef.current + speedRef.current * dt) % 360;
      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      if (Math.abs(speedRef.current) > 0.0005 || hovered) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = 0;
      }
    }
    if (!rafRef.current) {
      lastTRef.current = performance.now();
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [hovered]);

  return (
    <motion.div
      onHoverStart={() => {
        setHovered(true);
        setArrowToggle((v) => v + 1);
      }}
      onHoverEnd={() => setHovered(false)}
      animate={{ scale: hovered ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: 44,
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        transform: "translateY(10%)",
      }}
    >
      {/* halo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 15,
          background: "rgba(151,195,255,0.15)",
          zIndex: 1,
        }}
      />
      {/* inner 36 square */}
      <div
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "linear-gradient(180deg, #70A8F2 0%, #3D82DE 100%)",
          padding: 8,
          overflow: "hidden",
          zIndex: 2,
          boxShadow:
            "inset 0 1px 18px 2px rgba(173,208,255,0.20), inset 0 1px 4px 2px rgba(222,236,255,0.80), 0 42px 107px 0 rgba(61,130,222,0.34), 0 10px 10px 0 rgba(61,130,222,0.20), 0 3.714px 4.846px 0 rgba(61,130,222,0.15)",
        }}
      >
        {/* spinning ring */}
        <div style={{ position: "absolute", inset: -1, borderRadius: 13, pointerEvents: "none" }}>
          <div
            ref={ringRef}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 13,
              padding: 1,
              background:
                "conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, #FFFFFF 60deg, #9EC7FF 120deg, rgba(255,255,255,0) 200deg, rgba(255,255,255,0) 360deg)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              maskComposite: "exclude",
            }}
          />
        </div>
        {/* static border fallback */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            border: "1px solid #9EC7FF",
            zIndex: 4,
            pointerEvents: "none",
          }}
        />
        {/* dots overlay */}
        <img
          src={`${A}/dots.svg`}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
        {/* hover shine */}
        <AnimatePresence>
          {arrowToggle > 0 && (
            <motion.div
              key={`blink-${arrowToggle}`}
              initial={{ x: "-120%" }}
              animate={{ x: "120%" }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                mixBlendMode: "screen",
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
              }}
            />
          )}
        </AnimatePresence>
        {/* arrow swap */}
        <div style={{ position: "relative", width: 16, height: 16, overflow: "hidden", zIndex: 5 }}>
          <motion.img
            key={`out-${arrowToggle}`}
            src={`${A}/arrow-up.svg`}
            alt=""
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
            style={{ position: "absolute", inset: 0, width: 16, height: 16 }}
          />
          <motion.img
            key={`in-${arrowToggle}`}
            src={`${A}/arrow-up.svg`}
            alt=""
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
            style={{ position: "absolute", inset: 0, width: 16, height: 16 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Floating Cards ---------- */
type CardDef = {
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  rot: number;
  start: { x: number; y: number };
};
const CARDS: CardDef[] = [
  { src: `${A}/image-1.png`, w: 88.55, h: 68.46, x: -82, y: 123, rot: -16, start: { x: -5, y: 7 } },
  { src: `${A}/image-2.png`, w: 105, h: 87, x: 68, y: 124, rot: 24, start: { x: 35, y: 33 } },
  { src: `${A}/image-3.png`, w: 105, h: 96, x: -4, y: 148, rot: -4, start: { x: -4, y: 27 } },
];
const FOLDER_CENTER = 113.67 / 2;

function FloatingCards() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const idleAnims = [
    { y: [0, -6, 0, 4, 0], rotOffsets: [0, -2, 0, 2, 0], dur: 6 },
    { y: [0, 5, 0, -5, 0], rotOffsets: [0, 2, 0, -2, 0], dur: 7 },
    { y: [0, -4, 0, 6, 0], rotOffsets: [0, -1.5, 0, 1.5, 0], dur: 8 },
  ];

  return (
    <>
      {CARDS.map((c, i) => {
        const isHovered = hoveredIdx === i;
        const anyHovered = hoveredIdx !== null;
        const finalLeft = FOLDER_CENTER + c.x;
        const startLeft = FOLDER_CENTER + c.start.x;
        const idle = idleAnims[i];

        return (
          <motion.img
            key={i}
            src={c.src}
            alt=""
            initial={{
              opacity: 0,
              width: 20,
              height: 20,
              left: startLeft,
              bottom: c.start.y,
              rotate: 0,
            }}
            animate={
              anyHovered
                ? {
                    opacity: 1,
                    width: c.w,
                    height: c.h,
                    left: finalLeft,
                    bottom: c.y,
                    y: 0,
                    rotate: c.rot,
                    scale: isHovered ? 1.08 : 1,
                  }
                : {
                    opacity: 1,
                    width: c.w,
                    height: c.h,
                    left: finalLeft,
                    bottom: c.y,
                    y: idle.y,
                    rotate: idle.rotOffsets.map((o) => c.rot + o),
                    scale: 1,
                  }
            }
            transition={
              anyHovered
                ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
                : {
                    opacity: { duration: 1.4, delay: 0.6 + i * 0.25, ease: [0.16, 1, 0.3, 1] },
                    width: { duration: 1.4, delay: 0.6 + i * 0.25, ease: [0.16, 1, 0.3, 1] },
                    height: { duration: 1.4, delay: 0.6 + i * 0.25, ease: [0.16, 1, 0.3, 1] },
                    left: { duration: 1.4, delay: 0.6 + i * 0.25, ease: [0.16, 1, 0.3, 1] },
                    bottom: { duration: 1.4, delay: 0.6 + i * 0.25, ease: [0.16, 1, 0.3, 1] },
                    y: { duration: idle.dur, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: idle.dur, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                  }
            }
            onHoverStart={() => setHoveredIdx(i)}
            onHoverEnd={() => setHoveredIdx(null)}
            style={{
              position: "absolute",
              transformOrigin: "50% 100%",
              borderRadius: 10,
              boxShadow: "0 16px 40px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.10)",
              objectFit: "cover",
              cursor: "pointer",
              zIndex: isHovered ? 20 : 11 + i,
              translateX: "-50%",
            }}
          />
        );
      })}
    </>
  );
}

/* ---------- Folder Stack ---------- */
type StackItem = {
  src: string;
  bottom: number;
  left: number;
  width: number;
  height: number;
  centered?: boolean;
  enter: { opacity?: number[]; y?: number[]; duration: number; delay: number; ease: number[] | string };
  z: number;
};
const STACK: StackItem[] = [
  { src: `${A}/blue-light-2.svg`, bottom: 50, left: 54.6, width: 104, height: 170, centered: true, enter: { duration: 0.8, delay: 1.0, ease: "easeOut" }, z: 1 },
  { src: `${A}/blue-light.svg`, bottom: 28, left: 54.6, width: 104, height: 170, centered: true, enter: { duration: 0.8, delay: 1.0, ease: "easeOut" }, z: 2 },
  { src: `${A}/light-1.svg`, bottom: 35, left: 57.2, width: 180.5, height: 124.5, centered: true, enter: { duration: 1.0, delay: 1.0, ease: "easeOut" }, z: 3 },
  { src: `${A}/folder-3.svg`, bottom: 60, left: 23.4, width: 69.71, height: 45, enter: { y: [30, 0], duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }, z: 4 },
  { src: `${A}/small-light-2.svg`, bottom: 55, left: 67.6, width: 39, height: 17, centered: true, enter: { duration: 0.6, delay: 1.4, ease: "easeOut" }, z: 5 },
  { src: `${A}/small-light.svg`, bottom: 50, left: 44.2, width: 39, height: 25, centered: true, enter: { duration: 0.6, delay: 1.4, ease: "easeOut" }, z: 6 },
  { src: `${A}/folder-2.svg`, bottom: 45, left: 18.98, width: 79, height: 51, enter: { y: [30, 0], duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }, z: 7 },
  { src: `${A}/light-2.svg`, bottom: 20, left: 57.2, width: 109, height: 162.5, centered: true, enter: { duration: 1.0, delay: 1.1, ease: "easeOut" }, z: 8 },
  { src: `${A}/folder-1.svg`, bottom: 30, left: 13, width: 91, height: 58, enter: { y: [30, 0], duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }, z: 9 },
  { src: `${A}/folder-0.svg?v=2`, bottom: 0, left: 0, width: 113.67, height: 76.5, enter: { y: [30, 0], duration: 0.6, delay: 0, ease: [0.22, 1, 0.36, 1] }, z: 10 },
];

function FolderStack() {
  return (
    <div style={{ position: "relative", width: 113.67, height: 220, overflow: "visible", margin: "0 auto" }}>
      {STACK.map((s, i) => {
        return (
          <motion.img
            key={i}
            src={s.src}
            alt=""
            initial={{
              opacity: 0,
              ...(s.enter.y ? { y: s.enter.y[0] } : {}),
            }}
            animate={{
              opacity: 1,
              ...(s.enter.y ? { y: s.enter.y[1] } : {}),
            }}
            transition={{ duration: s.enter.duration, delay: s.enter.delay, ease: s.enter.ease as never }}
            style={{
              position: "absolute",
              bottom: s.bottom,
              left: s.left,
              width: s.width,
              height: s.height,
              zIndex: s.z,
              transform: s.centered ? "translateX(-50%)" : undefined,
              pointerEvents: "none",
            }}
          />
        );
      })}
      <FloatingCards />
    </div>
  );
}

/* ---------- Main hero ---------- */
function AmeroHero() {
  const typed = useTypewriter();

  return (
    <div className="amero-hero">
      <PixelGrid side="left" />
      <PixelGrid side="right" />

      {/* Navbar */}
      <nav style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50, background: "transparent" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 22,
            marginLeft: 22,
            width: 86.816,
            height: 16,
          }}
        >
          <img src={`${A}/logo-icon.svg`} alt="" style={{ height: 16, width: "auto" }} />
          <img src={`${A}/logo-text.svg`} alt="Sixsense" style={{ height: 16, width: "auto" }} />
        </div>
      </nav>

      {/* Left sidebar */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SidebarButton filled icon={`${A}/chat.svg`} />
        <SidebarButton icon={`${A}/search.svg`} />
      </div>

      {/* Main column */}
      <main
        style={{
          position: "relative",
          zIndex: 5,
          paddingTop: 60,
          maxWidth: 760,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <FolderStack />

        <motion.h1
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          style={{
            fontFamily: '"Inter Tight", sans-serif',
            fontSize: 32,
            fontWeight: 400,
            lineHeight: "32px",
            letterSpacing: "-0.64px",
            color: "#11315D",
            width: 385,
            margin: "32px auto 8px",
            textAlign: "center",
          }}
        >
          Let&apos;s find the right
          <br />
          references for your work
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          style={{
            fontFamily: '"Inter Tight", sans-serif',
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(13,27,75,0.50)",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          What type of references are you looking for?
        </motion.p>

        {/* Prompt box */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
          style={{
            width: 702,
            maxWidth: "100%",
            padding: 4,
            borderRadius: 24,
            border: "0.5px solid rgba(0,0,0,0.05)",
            background: "rgba(157,196,250,0.15)",
            backdropFilter: "blur(50px)",
            WebkitBackdropFilter: "blur(50px)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 116,
              background: "white",
              borderRadius: 20,
              border: "1px solid rgba(34,106,205,0.05)",
              padding: "14px 14px 12px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 32,
                fontFamily: '"Inter Tight", sans-serif',
                fontSize: 15,
                lineHeight: "22px",
                fontWeight: 400,
                color: "#0D1B4B",
                paddingBottom: 10,
                display: "flex",
                alignItems: "center",
              }}
            >
              <span>{typed}</span>
              <span className="amero-caret" />
            </div>

            <div
              style={{
                marginTop: 5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, transform: "translateY(35%)" }}>
                {/* Top Expert pill */}
                <div
                  style={{
                    width: 110,
                    height: 28,
                    background: "#E8F1FF",
                    borderRadius: 8,
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: "linear-gradient(166deg, #A0E4FF 9.8%, #9CA4FB 184.41%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img src={`${A}/ai-select.svg`} alt="" style={{ width: 8, height: 8 }} />
                  </div>
                  <span
                    style={{
                      fontFamily: '"Inter Tight", sans-serif',
                      fontSize: 12,
                      lineHeight: "16px",
                      color: "#5085CE",
                      whiteSpace: "nowrap",
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    Top Expert
                  </span>
                  <ChevronDown size={12} color="#5085CE" />
                </div>

                <IconBtn src={`${A}/image.svg`} />
                <IconBtn src={`${A}/Capa_1.svg`} />

                <div style={{ width: 1, height: 18, background: "rgba(0,0,0,0.12)", margin: "0 2px" }} />

                <button
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "transparent",
                    color: "rgba(0,0,0,0.40)",
                    fontSize: 16,
                    lineHeight: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +
                </button>

                <div
                  style={{
                    height: 28,
                    background: "rgba(0,0,0,0.05)",
                    borderRadius: 6,
                    padding: "0 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Inter Tight", sans-serif',
                      fontSize: 12,
                      color: "rgba(13,27,75,0.65)",
                    }}
                  >
                    UI Design
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", marginLeft: 2, cursor: "pointer" }}>
                    ×
                  </span>
                </div>
              </div>

              <SendButton />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          right: 0,
          zIndex: 5,
          textAlign: "center",
          fontFamily: '"Inter Tight", sans-serif',
          fontSize: 13,
          fontWeight: 400,
          color: "rgba(13,27,75,0.45)",
        }}
      >
        By sending a message to ChatBot, you agree to our{" "}
        <a
          href="#"
          style={{
            color: "rgba(13,27,75,0.65)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            cursor: "pointer",
          }}
        >
          Terms
        </a>{" "}
        and have read our{" "}
        <a
          href="#"
          style={{
            color: "rgba(13,27,75,0.65)",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            cursor: "pointer",
          }}
        >
          Privacy Policy.
        </a>
      </footer>
    </div>
  );
}

function SidebarButton({ filled, icon }: { filled?: boolean; icon: string }) {
  const [hover, setHover] = useState(false);
  const base: CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 12,
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: filled ? "1px solid rgba(34,106,205,0.05)" : "none",
    background: filled
      ? hover
        ? "rgba(255,255,255,1)"
        : "rgba(255,255,255,0.90)"
      : hover
        ? "rgba(255,255,255,0.5)"
        : "transparent",
    backdropFilter: filled ? "blur(8px)" : undefined,
    WebkitBackdropFilter: filled ? "blur(8px)" : undefined,
  };
  return (
    <button style={base} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <img src={icon} alt="" style={{ width: 18, height: 18 }} />
    </button>
  );
}

function IconBtn({ src }: { src: string }) {
  return (
    <button
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(255,255,255,0.80)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <img src={src} alt="" style={{ width: 14, height: 14 }} />
    </button>
  );
}

export { AmeroHero };
export default AmeroHero;
