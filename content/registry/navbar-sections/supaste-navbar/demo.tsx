"use client";

import { useState } from "react";
import Link from "next/link";

const SUPASTE_LOGO =
  "https://framerusercontent.com/images/E5Op3vw8SO4i4cThRZINxLqTKlE.png?scale-down-to=512&width=1024&height=1024";

const APPLE_LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1782668323/copy_of_d_vflro3.png";

const NAV_ITEMS = ["Features", "FAQ", "Updates", "Cooldock", "Pricing"];

const NAVBAR_BG = "#0c0c18";
const EAR = 24;

function Ears() {
  return (
    <>
      {/* Left ear */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: EAR,
          height: EAR,
          transform: "translateX(-100%)",
          pointerEvents: "none",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={EAR} height={EAR} overflow="visible">
          <path d="M 20 0 L 0 0 C 11.046 0 20 8.954 20 20 Z" fill={NAVBAR_BG} />
        </svg>
      </div>
      {/* Right ear */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: EAR,
          height: EAR,
          transform: "translateX(100%)",
          pointerEvents: "none",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width={EAR} height={EAR} overflow="visible">
          <path d="M 0 0 L 20 0 C 8.954 0 0 8.954 0 20 Z" fill={NAVBAR_BG} />
        </svg>
      </div>
    </>
  );
}

export default function SupasteNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(170deg, #1254e8 0%, #2b7ef5 30%, #5ab0f7 60%, #b8deff 85%, #e8f5ff 100%)",
      }}
    >
      {/* ── NAVBAR ── */}
      <div className="w-full flex justify-center flex-shrink-0 px-4 md:px-0">
        <div
          className="relative w-full max-w-3xl flex-shrink-0"
          style={{
            background: NAVBAR_BG,
            borderBottomLeftRadius: EAR,
            borderBottomRightRadius: EAR,
          }}
        >
          {/* ── DESKTOP header row ── */}
          <div className="hidden md:flex items-center justify-between px-6 py-3">
            {/* Logo + brand */}
            <div className="flex items-center gap-2.5">
              <img src={SUPASTE_LOGO} alt="Supaste" className="w-8 h-8 rounded-xl object-cover" />
              <span className="text-white font-semibold text-[15px] tracking-tight">Supaste</span>
            </div>

            {/* Nav links */}
            <ul className="flex items-center gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item}>
                  <a href="#" className="px-4 py-1.5 text-[14px] text-white/55 hover:text-white/90 transition-colors duration-150 rounded-full whitespace-nowrap">
                    {item}
                  </a>
                </li>
              ))}
            </ul>

            {/* Download CTA */}
            <a href="#" className="flex items-center gap-1.5 bg-white text-black text-[14px] font-semibold px-4 py-1.5 rounded-lg hover:bg-white/90 transition-colors duration-150">
              <img src={APPLE_LOGO} alt="" className="w-4 h-4 object-contain" />
              Download
            </a>
          </div>

          {/* ── MOBILE header row ── */}
          <div className="flex md:hidden items-center justify-between px-4 py-3">
            {/* Logo + brand */}
            <div className="flex items-center gap-2.5">
              <img src={SUPASTE_LOGO} alt="Supaste" className="w-8 h-8 rounded-xl object-cover" />
              <span className="text-white font-semibold text-[15px] tracking-tight">Supaste</span>
            </div>

            {/* Hamburger / Close */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                /* X icon */
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* Hamburger icon */
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>

          {/* ── MOBILE expanded menu ── */}
          {mobileOpen && (
            <div className="flex md:hidden flex-col px-6 pb-6">
              {/* Nav items — large stacked */}
              <nav className="flex flex-col mb-8 mt-4">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item}
                    href="#"
                    onClick={() => setMobileOpen(false)}
                    className="text-white/60 hover:text-white py-5 text-4xl font-medium border-b border-white/10 transition-colors duration-150"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              {/* Download CTA — full width */}
              <a
                href="#"
                className="flex items-center justify-center gap-2 bg-white text-black text-base font-semibold py-4 rounded-2xl hover:bg-white/90 transition-colors duration-150"
              >
                <img src={APPLE_LOGO} alt="" className="w-5 h-5 object-contain" />
                Download
              </a>
            </div>
          )}

          <Ears />
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-2">
        <p className="text-white/70 text-sm font-medium tracking-[0.18em] uppercase mb-5">
          zepa · component library
        </p>
        <h1 className="text-white font-bold leading-[1.05] mb-5" style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}>
          Copy once.
          <br />
          <em className="font-light italic">Build anytime.</em>
        </h1>
        <p className="text-white/65 text-lg max-w-md mb-8 leading-relaxed">
          A curated collection of production-ready UI components crafted for the modern web — open source and free.
        </p>
        <Link href="/components" className="bg-black/25 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black/35 transition-colors duration-150">
          Browse Components
        </Link>
      </div>
    </div>
  );
}
