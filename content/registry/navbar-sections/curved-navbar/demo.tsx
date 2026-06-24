"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const ZEPA_LOGO =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973374/zzepa_fur8kl.png";

const navItems = ["Technology", "About Us", "Our Thoughts", "Contact"];

export default function CurvedNavbar() {
  const [active, setActive] = useState("Technology");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c8c4e8] via-[#ddd8ee] to-[#b8c8e8] flex flex-col items-center pt-12 px-4">
      {/* NAV PILL */}
      <nav className="relative flex items-center gap-1 rounded-full bg-[#1a1a1f]/90 backdrop-blur-md border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-3 py-2.5">

        {/* LOGO */}
        <div className="flex items-center pl-2 pr-5 mr-1">
          <img
            src={ZEPA_LOGO}
            alt="Zepa"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* DIVIDER */}
        <div className="w-px h-6 bg-white/10 mr-2" />

        {/* NAV ITEMS */}
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className="relative px-5 py-2 text-[14px] font-medium rounded-full transition-colors duration-200 outline-none"
          >
            {/* ACTIVE PILL */}
            {active === item && (
              <motion.span
                layoutId="active-pill"
                className="absolute inset-0 rounded-full bg-white/90 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-200 whitespace-nowrap ${
                active === item ? "text-[#1a1a1f]" : "text-white/60 hover:text-white/90"
              }`}
            >
              {item}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
