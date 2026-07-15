/*
 This zepa scene is a custom scene created in the unicorn studio with the permission if you want to use it you can
 remix it from here: https://unicorn.studio/remix/2l9tnRuNL9VahLxsQAdB
 */

"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 2.6, ease: "easeOut", delay } as Transition,
});

export default function RingUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#08111a] [&_canvas+div]:hidden [&_[data-us-project]>div:last-child]:hidden">
      <style>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      <UnicornScene
        jsonFilePath="/unicorn/ring-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.6/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* ─── Corners ─── */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-8 pt-7 pointer-events-none select-none z-10">
        <motion.div {...fade(0.3)}>
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
            alt="Zepa"
            className="h-10 w-auto object-contain"
          />
        </motion.div>

        <motion.p
          className="text-white/30 text-[9px] tracking-[0.35em] uppercase font-mono pt-2"
          {...fade(0.5)}
        >
          41.30° N — 122.31° W
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-8 pb-7 pointer-events-none select-none z-10">
        <motion.p
          className="flex items-center gap-2 text-[9px] tracking-[0.35em] uppercase font-mono text-white/30"
          {...fade(1.8)}
        >
          <span
            className="w-1 h-1 rounded-full bg-amber-200/80"
            style={{ animation: "ring-pulse 2.8s ease-in-out infinite" }}
          />
          Observing — Dusk
        </motion.p>

        <motion.p
          className="text-white/30 text-[9px] tracking-[0.35em] uppercase font-mono"
          {...fade(1.8)}
        >
          № 07
        </motion.p>
      </div>

      {/* ─── One line, floating in the sky between ring and hill ─── */}
      <motion.div
        className="absolute inset-x-0 top-[54%] pointer-events-none select-none z-10 text-center px-6"
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 1 }}
      >
        <p
          className="text-white/75 text-[clamp(1.1rem,1.9vw,1.6rem)]"
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 300,
            letterSpacing: "0.01em",
          }}
        >
          It has not stopped moving.
        </p>
      </motion.div>
    </div>
  );
}
