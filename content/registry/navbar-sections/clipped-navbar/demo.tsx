"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Data ─── */
const BRANDS = ["crypto.com", "Podium", "FINOM", "RYANAIR", "amenitiz", "fever", "FAIRE"];

const PRODUCTS = [
  { label: "QA Studio",     desc: "Automated quality assurance for agents" },
  { label: "Sim Studio",    desc: "Simulate real customer conversations" },
  { label: "Scorecard",     desc: "Grade and benchmark agent performance" },
  { label: "Insights",      desc: "Analytics across every interaction" },
  { label: "Integrations",  desc: "Connect your existing toolstack" },
];

/* ─── Measurements ─── */
const GAP     = 12;
const NOTCH_H = 68;
const NOTCH_L = "20%";
const NOTCH_R = "20%";
const EAR     = 20;

/* ─── Drop animation (same pattern as photo-navbar) ─── */
const DROP = {
  initial:    { opacity: 0, y: -8, scale: 0.97 },
  animate:    { opacity: 1, y: 0,  scale: 1    },
  exit:       { opacity: 0, y: -8, scale: 0.97 },
  transition: { duration: 0.17, ease: [0.16, 1, 0.3, 1] },
};

/* ─── Products dropdown ─── */
function ProductsDropdown() {
  return (
    <motion.div
      {...DROP}
      className="absolute left-0 w-[280px] bg-white rounded-2xl overflow-hidden"
      style={{ top: "calc(100% + 10px)", zIndex: 50, boxShadow: "0 24px 64px -8px rgba(0,0,0,0.22)" }}
    >
      <div className="py-3 px-2">
        <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-black/30 mb-2 px-3 pt-1">
          Products
        </p>
        {PRODUCTS.map((item) => (
          <button
            key={item.label}
            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/[0.04] transition-colors"
          >
            <span className="block text-[14px] font-semibold text-[#111]">{item.label}</span>
            <span className="block text-[12px] text-black/40 mt-0.5">{item.desc}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Concave outer corner ears ─── */
function NotchEars() {
  return (
    <>
      <div style={{ position: "absolute", top: GAP, left: NOTCH_L, width: EAR, height: EAR, transform: "translateX(-100%)", pointerEvents: "none", zIndex: 10 }}>
        <svg viewBox="0 0 20 20" width={EAR} height={EAR}>
          <path d="M 20 0 L 0 0 C 11.046 0 20 8.954 20 20 Z" fill="white" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: GAP, right: NOTCH_R, width: EAR, height: EAR, transform: "translateX(100%)", pointerEvents: "none", zIndex: 10 }}>
        <svg viewBox="0 0 20 20" width={EAR} height={EAR}>
          <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" fill="white" />
        </svg>
      </div>
    </>
  );
}

/* ─── Icons ─── */
function ChevronDown({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d={up ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2.5" />
      <path d="M2 8.5l10 6.5 10-6.5" />
    </svg>
  );
}

/* ─── Marquee ─── */
function BrandMarquee() {
  // 4 copies → always fills far beyond the viewport; -50% animation = perfect seamless loop
  const items = [...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS];
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 18%, black 82%, transparent)",
      }}
    >
      <style>{`
        @keyframes clipped-mq {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .clipped-mq-track {
          animation: clipped-mq 28s linear infinite;
        }
      `}</style>
      <div className="clipped-mq-track flex items-center w-max" style={{ gap: "56px" }}>
        {items.map((brand, i) => (
          <span
            key={i}
            className="whitespace-nowrap text-[16px] font-bold text-white/75 select-none"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Component ─── */
export default function ClippedNavbar() {
  const [email, setEmail]   = useState("");
  const [open, setOpen]     = useState<string | null>(null);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-white flex flex-col"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >

      {/* ── LAYER 1: Hero image ── */}
      <div className="absolute rounded-[20px] overflow-hidden" style={{ inset: GAP }}>
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781518640/samples/balloons.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {/* ── LAYER 2: White notch ── */}
      <div
        className="absolute z-10 bg-white"
        style={{ top: GAP, left: NOTCH_L, right: NOTCH_R, height: NOTCH_H, borderRadius: "0 0 14px 14px" }}
      />
      <NotchEars />

      {/* ── LAYER 3: Navbar ── */}
      <nav
        className="absolute z-20 flex items-center"
        style={{ top: GAP, left: NOTCH_L, right: NOTCH_R, height: NOTCH_H, padding: "0 28px" }}
      >
        {/* Left: nav links */}
        <div className="hidden md:flex items-center gap-7">

          {/* Products — with dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setOpen("Products")}
            onMouseLeave={() => setOpen(null)}
          >
            <button className="flex items-center gap-1.5 text-[16px] font-semibold text-[#111] hover:text-black/45 transition-colors py-2">
              Products <ChevronDown up={open === "Products"} />
            </button>
            <AnimatePresence>
              {open === "Products" && <ProductsDropdown />}
            </AnimatePresence>
          </div>

          <button className="text-[16px] font-semibold text-[#111] hover:text-black/45 transition-colors py-2">
            Customers
          </button>
          <button className="text-[16px] font-semibold text-[#111] hover:text-black/45 transition-colors py-2">
            Careers
          </button>
        </div>

        {/* Center: logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
          <img
            src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1783958234/zepa22_vuauko.png"
            alt="Zepa"
            className="h-[36px] w-auto object-contain"
          />
        </div>

        {/* Right: sign in + CTA */}
        <div className="flex items-center gap-4 ml-auto">
          <button className="hidden sm:block text-[16px] font-semibold text-[#111] hover:text-black/45 transition-colors">
            Sign in
          </button>
          <button className="ml-3 flex items-center gap-2 rounded-full bg-[#22c55e] px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-[#16a34a] transition-colors">
            See a demo <ArrowRight />
          </button>
        </div>
      </nav>

      {/* ── LAYER 4: Hero content ── */}
      <div style={{ height: GAP + NOTCH_H }} />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6">
        <h1
          className="font-bold text-white leading-[1.06] tracking-[-0.03em] max-w-[660px]"
          style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.8rem)" }}
        >
          Train and QA your
          <br />
          human and AI agents
        </h1>

        <p className="mt-6 max-w-[500px] text-white/65 text-[16px] md:text-[18px] leading-relaxed">
          Make every customer interaction better, faster, and more
          consistent with the optimization platform for human and AI agents.
        </p>

        {/* Email + CTA pill */}
        <div className="mt-10 flex w-full max-w-md items-center overflow-hidden rounded-full bg-white shadow-2xl">
          <div className="flex flex-1 items-center gap-3 px-5 text-[#c0c0c0]">
            <EnvelopeIcon />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full min-w-0 bg-transparent py-3.5 text-[15px] text-[#111] outline-none placeholder:text-[#c0c0c0]"
            />
          </div>
          <button className="m-1 flex shrink-0 items-center gap-2 rounded-full bg-[#e9b84a] px-6 py-3 text-[14px] font-semibold text-[#111] hover:bg-[#d4a43a] transition-colors">
            See a demo <ArrowRight />
          </button>
        </div>

        {/* Brand marquee — directly below email box */}
        <div className="mt-8 w-full">
          <BrandMarquee />
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="pb-10" />

    </div>
  );
}
