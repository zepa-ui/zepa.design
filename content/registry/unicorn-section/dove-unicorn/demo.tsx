/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
 remix it from here: https://unicorn.studio/remix/mvzXZOiCvF090kH1Bd6y
 */

"use client";

import { motion } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const EASE = [0.16, 1, 0.3, 1] as const;

const INK = "#1c1c1c";
const SERIF = "Georgia, 'Times New Roman', serif";

function reveal(delay: number) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.5, ease: EASE, delay },
  };
}

export default function DoveUnicorn() {
  return (
    <div
      className="relative w-full h-screen overflow-hidden [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden"
      style={{ background: "#f5f3ef", color: INK }}
    >
      <UnicornScene
        jsonFilePath="/unicorn/dove-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* ═══ Passe-partout — hairline museum mat, inset all around ═══ */}
      <motion.div
        className="absolute inset-6 pointer-events-none select-none z-10 border"
        style={{ borderColor: "rgba(28,28,28,0.14)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
      />

      {/* ═══ Top furniture — logotype · exhibit line · year ═══ */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between px-7 pt-5 pointer-events-none select-none z-10">
        <motion.p
          className="text-[15px] font-semibold tracking-tight"
          {...reveal(0.5)}
        >
          zepa<span className="align-super text-[9px]">®</span>
        </motion.p>
        <motion.p
          className="hidden sm:block text-[10px] uppercase tracking-[0.45em]"
          style={{ color: "rgba(28,28,28,0.45)" }}
          {...reveal(0.65)}
        >
          Atelier — Paper &amp; Light
        </motion.p>
        <motion.p
          className="text-[10px] uppercase tracking-[0.35em]"
          style={{ color: "rgba(28,28,28,0.45)" }}
          {...reveal(0.8)}
        >
          MMXXVI
        </motion.p>
      </div>

      {/* ═══ Headline — asymmetric, serif italic × heavy sans ═══ */}
      <div className="absolute left-6 right-6 top-[24%] px-7 pointer-events-none select-none z-10">
        <motion.p
          className="mb-6 text-[10px] uppercase tracking-[0.5em]"
          style={{ color: "rgba(28,28,28,0.4)" }}
          {...reveal(0.9)}
        >
          The dove series — № 08
        </motion.p>

        <div className="overflow-hidden">
          <motion.h1
            className="leading-[1.05]"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(2.6rem, 6.5vw, 6.5rem)",
            }}
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.4, ease: EASE, delay: 1.05 }}
          >
            Where silence
          </motion.h1>
        </div>
        <div className="overflow-hidden">
          <motion.h1
            className="uppercase leading-[0.95]"
            style={{
              fontFamily: "var(--font-manrope), sans-serif",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              fontSize: "clamp(3.2rem, 8.5vw, 8.5rem)",
            }}
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 1.4, ease: EASE, delay: 1.2 }}
          >
            takes flight
          </motion.h1>
        </div>

        <motion.p
          className="mt-7 text-[15px]"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            color: "rgba(28,28,28,0.55)",
          }}
          {...reveal(1.6)}
        >
          — brush the canvas, the garden remembers —
        </motion.p>
      </div>

      {/* ═══ Museum label card — bottom left ═══ */}
      <motion.div
        className="absolute bottom-6 left-6 mb-5 ml-7 pointer-events-none select-none z-10 hidden md:block"
        {...reveal(1.9)}
      >
        <div
          className="border px-5 py-4 max-w-[240px]"
          style={{
            borderColor: "rgba(28,28,28,0.16)",
            background: "rgba(245,243,239,0.6)",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] mb-2.5" style={{ color: "rgba(28,28,28,0.45)" }}>
            Exhibit № 08
          </p>
          <p className="text-[11px] leading-[1.7]" style={{ color: "rgba(28,28,28,0.65)" }}>
            <em style={{ fontFamily: SERIF }}>Doves, in relief</em> — porcelain
            on paper. Hand-finished. Hidden beneath a blank field; restored by
            the visitor&apos;s cursor.
          </p>
        </div>
      </motion.div>

      {/* ═══ Bottom right — a small manifesto ═══ */}
      <motion.div
        className="absolute bottom-6 right-6 mb-5 mr-7 text-right pointer-events-none select-none z-10"
        {...reveal(2.1)}
      >
        <p
          className="text-[14px]"
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            color: "rgba(28,28,28,0.6)",
          }}
        >
          Scroll is optional. Curiosity is not.
        </p>
        <p
          className="mt-2 text-[9px] uppercase tracking-[0.4em]"
          style={{ color: "rgba(28,28,28,0.35)" }}
        >
          Zepa unicorn series
        </p>
      </motion.div>

      {/* ═══ Centered whisper under the headline zone ═══ */}
      <motion.p
        className="absolute bottom-[8.5rem] left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] pointer-events-none select-none z-10 hidden lg:block"
        style={{ color: "rgba(28,28,28,0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.4, 1] }}
        transition={{ duration: 3.2, delay: 2.4, ease: "easeOut" }}
      >
        ( move slowly — they startle )
      </motion.p>
    </div>
  );
}
