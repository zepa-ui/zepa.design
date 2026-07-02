/**
 * This Original Zepa scene created with: Unicorn Studio
 * React implementation: zepa
 * Used with permission.
 */
"use client";

import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import UnicornScene from "unicornstudio-react/next";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(12px)", y: 20 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  transition: { duration: 1.1, ease: "easeOut", delay } as Transition,
});

export default function CubeUnicorn() {
  return (
    <div className="relative w-full h-screen">
      <UnicornScene
        jsonFilePath="/unicorn/cube-unicorn.json"
        sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.5/dist/unicornStudio.umd.js"
        width="100%"
        height="100%"
        lazyLoad={true}
      />

      {/* Logo + tagline — top right */}
      <div className="absolute top-16 right-16 flex flex-col items-end gap-1 pointer-events-none select-none">
        <motion.img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png"
          alt="Zepa"
          className="h-20 w-auto object-contain"
          {...fadeUp(0.2)}
        />
      </div>

      {/* Text overlay — bottom left */}
      <div className="absolute bottom-20 left-20 flex flex-col gap-1 pointer-events-none select-none">
        <motion.p
          className="text-6xl font-semibold tracking-[0.04em] uppercase"
          style={{ color: "#0349ac" }}
          {...fadeUp(0.3)}
        >
          zepa cube
        </motion.p>
        <motion.p
          className="text-white/70 text-base font-medium max-w-sm leading-snug pb-6"
          {...fadeUp(0.5)}
        >
          growing react and next components, curated ui library built for developers who care about details.
          <br />
          zepa — crafting interfaces people remember.
        </motion.p>
      </div>
    </div>
  );
}
