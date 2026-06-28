"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";

const NAV_ITEMS = ["Home", "Work", "Prices", "Projects", "Contact"];
const CONTACT_EMAIL = "fire@email.com";

export default function UpdatedNavbar() {
  const [active, setActive] = useState("Home");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <div className="flex justify-center px-4">
        <nav className="flex items-center justify-between w-full max-w-3xl bg-black rounded-full px-3 py-2.5">
          {/* LEFT — icon circle */}
          <div className="flex items-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Flame className="w-5 h-5 text-blue-500" strokeWidth={2} />
            </div>
          </div>

          {/* CENTER — nav items */}
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <button
                  onClick={() => setActive(item)}
                  className={`px-4 py-1.5 rounded-full text-base font-medium transition-colors duration-150 ${
                    active === item
                      ? "text-white/90"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>

          {/* RIGHT — email pill */}
          <div className="flex items-center flex-shrink-0">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors duration-150"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </nav>
      </div>

      {/* HERO SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p className="text-sm font-medium text-zinc-400 tracking-widest uppercase mb-4">
          Component Library
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 leading-tight mb-6">
          Build interfaces
          <br />
          people remember.
        </h1>
        <p className="text-zinc-500 text-lg max-w-md mb-8">
          A curated collection of production-ready UI components crafted for the modern web.
        </p>
        <Link
          href="/components"
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors duration-150"
        >
          Browse Components
        </Link>
      </div>
    </div>
  );
}
