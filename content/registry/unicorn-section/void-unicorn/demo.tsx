/**
 * This Original Zepa scene created with: Unicorn Studio
 * you can use my Remix scene: https://unicorn.studio/remix/VJcTjaPl1WdRbR8yVsSP
 * React implementation: zepa
 * Used with permission.
 */
"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 1.2, ease: "easeOut", delay } as Transition,
});

export default function VoidUnicorn() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <UnicornScene
        jsonFilePath="/unicorn/void-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* NEW VOID — massive title, top, behind everything */}
      <motion.h1
        className="absolute top-0 left-0 w-full text-center text-white font-regular leading-none pointer-events-none select-none"
        style={{ fontSize: "clamp(6rem, 21vw, 21rem)", letterSpacing: "-0.03em" }}
        {...fade(3.0)}
      >
        NEW VOID
      </motion.h1>

      {/* Right descriptor — below title, shifted left */}
      <motion.p
        className="absolute text-white/60 text-m max-w-[320px] text-right leading-relaxed pointer-events-none select-none"
        style={{ top: "calc(clamp(5rem, 18vw, 18rem) + 2.5rem)", right: "10%" }}
        {...fade(3.3)}
      >
        a growing collection of components built for developers who care about details.
      </motion.p>

      {/* Bottom left — description + logo, moved up, wider */}
      <div className="absolute bottom-20 left-35 flex flex-col gap-3 pointer-events-none select-none">
        <motion.p
          className="text-white/60 text-m max-w-[350px] leading-relaxed"
          {...fade(3.5)}
        >
          zepa ships production-ready ui components crafted for the modern web. new components drop every week — open source and free to use.
        </motion.p>
        <motion.img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-14 w-auto object-contain object-left"
          {...fade(3.7)}
        />
      </div>
    </div>
  );
}
