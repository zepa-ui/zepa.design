"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Data ─── */
const CATEGORIES = ["Agency", "Startup", "Enterprise", "Professional Services", "E-commerce"];

const SOLUTION_CARDS = [
  {
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/02_efyml3.png",
    title: "For Teams",
    desc: "Gain actionable insights to enhance brand success and consistency across all locations.",
  },
  {
    img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
    title: "For Founders",
    desc: "Boost presence with components that drive visibility and increase conversions.",
  },
];

const COMPANY_LINKS = [
  { label: "About", desc: "Our story and mission" },
  { label: "Team", desc: "The people behind Zepa" },
  { label: "Careers", desc: "Join us — we're hiring" },
  { label: "Blog", desc: "Thoughts on design & code" },
  { label: "Press", desc: "Media kit and coverage" },
];

const COMPANY_CARD = {
  img: "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/08_bu1urh.png",
  title: "We're hiring",
  desc: "Join the team building the future of UI components.",
  cta: "See open roles →",
};

/* ─── Drop animation preset ─── */
const DROP = {
  initial: { opacity: 0, y: -8, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit:    { opacity: 0, y: -8, scale: 0.97 },
  transition: { duration: 0.17, ease: [0.16, 1, 0.3, 1] },
};

/* ─── Icons ─── */
function GridMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {[3, 9, 15].flatMap((cx) =>
        [3, 9, 15].map((cy) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="white" />
        ))
      )}
    </svg>
  );
}

function Chevron({ up }: { up: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d={up ? "M2 8l4-4 4 4" : "M2 4l4 4 4-4"}
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Hamburger → X ─── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 relative text-white"
    >
      <motion.span
        animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="block h-[1.5px] w-6 bg-white origin-left"
      />
      <motion.span
        animate={{ opacity: open ? 0 : 1, x: open ? 6 : 0 }}
        transition={{ duration: 0.15 }}
        className="block h-[1.5px] w-6 bg-white"
      />
      <motion.span
        animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="block h-[1.5px] w-6 bg-white origin-left"
      />
    </button>
  );
}

/* ─── Solutions dropdown (desktop) ─── */
function SolutionsDropdown() {
  return (
    <motion.div
      {...DROP}
      className="absolute left-1/2 -translate-x-[52%] w-[min(92vw,1020px)] bg-white rounded-2xl shadow-[0_32px_80px_-8px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      <div className="flex">
        {/* Left — categories: no selected state, uniform bold */}
        <div className="w-[230px] flex-shrink-0 py-6 px-4 border-r border-black/[0.07]">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-black/35 mb-4 px-3">
            Industries
          </p>
          <div className="flex flex-col gap-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] font-semibold text-[#111] hover:bg-black/[0.05] transition-colors duration-100"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right — photo cards */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-4">
          {SOLUTION_CARDS.map((card) => (
            <button key={card.title} className="text-left group">
              <div className="rounded-xl overflow-hidden mb-3 aspect-[16/10] bg-black/5">
                <img
                  src={card.img} alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                />
              </div>
              <p className="text-[15px] font-semibold text-black">{card.title}</p>
              <p className="mt-1 text-[13px] text-black/50 leading-relaxed">{card.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Company dropdown (desktop) ─── */
function CompanyDropdown() {
  return (
    <motion.div
      {...DROP}
      className="absolute left-1/2 -translate-x-[40%] w-[min(92vw,680px)] bg-white rounded-2xl shadow-[0_32px_80px_-8px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      <div className="flex">
        {/* Left — links */}
        <div className="flex-1 py-5 px-4">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-black/35 mb-3 px-3">
            Company
          </p>
          <div className="flex flex-col gap-0.5">
            {COMPANY_LINKS.map((link) => (
              <button
                key={link.label}
                className="w-full text-left px-3 py-2.5 rounded-lg group hover:bg-black/[0.04] transition-colors"
              >
                <span className="text-[14px] font-semibold text-[#111] group-hover:text-black/70">
                  {link.label}
                </span>
                <span className="block text-[12px] text-black/40 mt-0.5">{link.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right — bigger featured card */}
        <div className="w-[260px] flex-shrink-0 p-5 border-l border-black/[0.07] flex flex-col">
          <div className="rounded-xl overflow-hidden aspect-[4/3] bg-black/5 mb-4">
            <img
              src={COMPANY_CARD.img}
              alt={COMPANY_CARD.title}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[16px] font-bold text-black">{COMPANY_CARD.title}</p>
          <p className="mt-1.5 text-[13px] text-black/50 leading-relaxed flex-1">{COMPANY_CARD.desc}</p>
          <p className="mt-4 text-[13px] font-semibold text-black/70 hover:text-black transition-colors cursor-pointer">
            {COMPANY_CARD.cta}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Mobile panel ─── */
function MobilePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-[90]"
            onClick={onClose}
          />
          {/* Slide-in panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-[min(100vw,360px)] bg-white z-[100] flex flex-col shadow-2xl overflow-y-auto"
            style={{ fontFamily: "var(--font-manrope), sans-serif" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
              <span className="font-semibold text-[15px] text-[#111]">Zepa Studio</span>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="#111" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Panel links */}
            <nav className="flex-1 px-4 py-4 flex flex-col gap-1">

              {/* Solutions accordion */}
              <div>
                <button
                  onClick={() => setExpanded(expanded === "Solutions" ? null : "Solutions")}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-semibold text-[#111] hover:bg-black/[0.04] transition-colors"
                >
                  Solutions
                  <motion.span animate={{ rotate: expanded === "Solutions" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {expanded === "Solutions" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pb-2 flex flex-col gap-0.5">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/30 px-3 pt-2 pb-1">
                          Industries
                        </p>
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            className="w-full text-left px-3 py-2 rounded-lg text-[14px] font-medium text-[#111]/70 hover:text-[#111] hover:bg-black/[0.04] transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Products */}
              <button className="w-full text-left px-3 py-3 rounded-lg text-[15px] font-semibold text-[#111] hover:bg-black/[0.04] transition-colors">
                Products
              </button>

              {/* Company accordion */}
              <div>
                <button
                  onClick={() => setExpanded(expanded === "Company" ? null : "Company")}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-[15px] font-semibold text-[#111] hover:bg-black/[0.04] transition-colors"
                >
                  Company
                  <motion.span animate={{ rotate: expanded === "Company" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence>
                  {expanded === "Company" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pb-2 flex flex-col gap-0.5">
                        {COMPANY_LINKS.map((link) => (
                          <button
                            key={link.label}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-black/[0.04] transition-colors"
                          >
                            <span className="block text-[14px] font-medium text-[#111]/80">{link.label}</span>
                            <span className="block text-[12px] text-black/40 mt-0.5">{link.desc}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Case Study */}
              <button className="w-full text-left px-3 py-3 rounded-lg text-[15px] font-semibold text-[#111] hover:bg-black/[0.04] transition-colors">
                Case Study
              </button>
            </nav>

            {/* CTA at bottom */}
            <div className="px-6 py-5 border-t border-black/[0.07]">
              <button className="w-full bg-[#111] text-white text-[14px] font-medium py-3 rounded-full hover:bg-black/80 transition-colors">
                Contact us
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Main ─── */
export default function PhotoNavbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973295/09_b5kt8t.png"
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero copy */}
      <div className="absolute left-6 md:left-10 bottom-16 md:bottom-20 text-white z-0 pointer-events-none">
        <p className="text-[11px] tracking-[0.3em] uppercase opacity-50 mb-3">
          Specialists in design systems
        </p>
        <h1
          className="font-bold leading-[0.9] max-w-[520px]"
          style={{ fontSize: "clamp(2.4rem, 6vw, 5rem)" }}
        >
          Accelerate<br />your product<br />growth
        </h1>
        <p className="mt-6 md:mt-8 text-sm opacity-50 flex items-center gap-2">
          Scroll to learn more
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
      </div>

      {/* Navbar */}
      <div className="relative z-50">
        <nav className="flex items-center justify-between px-6 md:px-8 py-5">

          {/* Logo */}
          <div className="flex items-center gap-2.5 text-white cursor-default">
            <GridMark />
            <span className="font-semibold text-[15px] tracking-[-0.01em]">Zepa Studio</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-7">

            {/* Solutions */}
            <div
              className="relative"
              onMouseEnter={() => setOpen("Solutions")}
              onMouseLeave={() => setOpen(null)}
            >
              <button className="flex items-center gap-1 text-[14px] text-white/80 hover:text-white transition-colors py-2">
                Solutions <Chevron up={open === "Solutions"} />
              </button>
              <AnimatePresence>
                {open === "Solutions" && <SolutionsDropdown />}
              </AnimatePresence>
            </div>

            <button className="text-[14px] text-white/80 hover:text-white transition-colors py-2">
              Products
            </button>

            {/* Company */}
            <div
              className="relative"
              onMouseEnter={() => setOpen("Company")}
              onMouseLeave={() => setOpen(null)}
            >
              <button className="flex items-center gap-1 text-[14px] text-white/80 hover:text-white transition-colors py-2">
                Company <Chevron up={open === "Company"} />
              </button>
              <AnimatePresence>
                {open === "Company" && <CompanyDropdown />}
              </AnimatePresence>
            </div>

            <button className="text-[14px] text-white/80 hover:text-white transition-colors py-2">
              Case Study
            </button>
          </div>

          {/* Desktop CTA */}
          <button className="hidden lg:block bg-white text-[#111] text-[14px] font-medium px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors">
            Contact us
          </button>

          {/* Hamburger */}
          <Hamburger open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
        </nav>
      </div>

      {/* Mobile panel */}
      <MobilePanel open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
