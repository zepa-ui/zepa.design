"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const PHONE_FRAME =
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x2_fhg2ot.avif";
const PHONE_SCREEN =
  "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x1_ffmihs.avif";

/**
 * Floating side cards. Positioned in px from the horizontal CENTER so the
 * cluster hugs the phone at every screen width (edge-percentages pushed
 * them into the corners on wide screens).
 */
const CARDS = [
  // Left column — cascading, each card overlaps the previous (≈0 gap)
  {
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x6_ip6fyf.avif",
    style: { left: "calc(50% - 445px)", top: "1%", width: 250, zIndex: 10 },
    rotate: -15,
    delay: 0.55,
    column: "left",
  },
  {
    // Tilts LEFT, sits on TOP of the column (over stats + contact)
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x7_ku6d7d.avif",
    style: { left: "calc(50% - 490px)", top: "23%", width: 265, zIndex: 13 },
    rotate: 13,
    delay: 0.7,
    column: "left",
  },
  {
    // Moved up under the resume card (layer below it)
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552916/x8_ac3bhb.avif",
    style: { left: "calc(50% - 430px)", top: "42%", width: 255, zIndex: 11 },
    rotate: -9,
    delay: 0.85,
    column: "left",
  },
  // Right column — same cascade, mirrored
  {
    // On TOP of the FAQ card below it
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552915/x5_xtbkfd.avif",
    style: { left: "calc(50% + 195px)", top: "2%", width: 250, zIndex: 13 },
    rotate: 15,
    delay: 0.6,
    column: "right",
  },
  {
    // Moved up under my-stack; tilts RIGHT
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784552914/x3_hx27r3.avif",
    style: { left: "calc(50% + 230px)", top: "20%", width: 255, zIndex: 10 },
    rotate: -13,
    delay: 0.75,
    column: "right",
  },
  {
    // Tight under the FAQ card (small gap), on TOP of it
    src: "https://res.cloudinary.com/dzvffb6vv/image/upload/v1784553309/x4_zcdfk9.avif",
    style: { left: "calc(50% + 185px)", top: "34%", width: 260, zIndex: 12 },
    rotate: 10,
    delay: 0.9,
    column: "right",
  },
];

function rise(delay: number) {
  return {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1.1, ease: EASE, delay },
  };
}

export default function PopHero() {
  const stageRef = useRef<HTMLDivElement>(null);

  // Scroll parallax across the stage — columns drift at different speeds,
  // the phone eases up slightly slower than the page.
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start end", "end start"],
  });
  const leftY = useTransform(scrollYProgress, [0, 1], [60, -110]);
  const rightY = useTransform(scrollYProgress, [0, 1], [90, -150]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div
      className="relative w-full overflow-hidden bg-white text-[#111]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* ═══ Headline block ═══ */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-12 text-center md:pt-16">
        <motion.h1
          className="font-semibold leading-[1.02] tracking-[-0.03em]"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.6rem)" }}
          {...rise(0.15)}
        >
          Make a stunning
          <br />
          site, easily
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-[#111]/60 md:text-[18px]"
          {...rise(0.3)}
        >
          Used by 9,000+ people &amp; businesses in 50+ countries.
          <br className="hidden sm:block" />
          Built-in Analytics, SEO, Forms and more.
        </motion.p>

        {/* Claim input + CTA */}
        <motion.div
          className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3"
          {...rise(0.45)}
        >
          <div className="flex flex-1 items-center overflow-hidden rounded-full border border-[#111]/15 bg-white">
            <input
              type="text"
              placeholder="zepa"
              className="w-full min-w-0 bg-transparent px-5 py-3 text-[15px] outline-none placeholder:text-[#111]/70"
              readOnly
            />
            <span className="shrink-0 border-l border-[#111]/10 px-4 py-3 text-[15px] text-[#111]/55">
              .pop.site
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full bg-[#2f6bff] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#2558da]"
          >
            Claim your site
          </button>
        </motion.div>

        <motion.p
          className="mt-5 flex items-center justify-center gap-2 text-[14px] text-[#111]/40"
          {...rise(0.55)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20M4 3l16 18" />
          </svg>
          No Credit Card Required
        </motion.p>
      </div>

      {/* ═══ Stage — tall, so the full phone reveals as you scroll ═══ */}
      <div ref={stageRef} className="relative mx-auto mt-14 h-[135vh] md:mt-16">
        {/* Center phone: frame + screen inside, slight scroll ease */}
        <motion.div
          className="absolute left-1/2 top-0 z-20 w-[min(64vw,318px)] -translate-x-1/2"
          style={{ y: phoneY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.4 }}
          >
            <div className="relative">
              <img
                src={PHONE_SCREEN}
                alt=""
                className="absolute inset-x-[4.5%] top-[1.5%] h-[97%] w-[91%] rounded-[9%] object-cover object-top"
              />
              <img
                src={PHONE_FRAME}
                alt="Phone mockup"
                className="relative z-10 h-auto w-full"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Floating cards — entrance pop + scroll parallax per column */}
        {CARDS.map((card) => (
          <motion.div
            key={card.src}
            className="absolute z-10 hidden md:block"
            style={{
              ...card.style,
              y: card.column === "left" ? leftY : rightY,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 46, rotate: card.rotate * 1.6 }}
              animate={{ opacity: 1, y: 0, rotate: card.rotate }}
              transition={{ duration: 1.2, ease: EASE, delay: card.delay }}
            >
              <img
                src={card.src}
                alt=""
                className="h-auto w-full rounded-2xl shadow-[0_24px_60px_-12px_rgba(17,17,17,0.18)]"
              />
            </motion.div>
          </motion.div>
        ))}

        {/* Soft gradient floor, like the reference bottom fade */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, #e7ecf6 78%, #dfe4f0 100%)",
          }}
        />
      </div>
    </div>
  );
}
