"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, BarChart3, Database, Mic, Layers3, ScanLine } from "lucide-react";
import TextScramble from "./ui/text-scramble";
import { DemoShell } from "./ui/demo-shell";

const LOGO_URL =
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781877270/zepalogo1_bnzxuc.png";

const PRODUCT_IMAGES = [
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/01_wvqrxz.png",
  "https://res.cloudinary.com/dakrfj1oh/image/upload/v1781973294/05_ccn9so.png",
] as const;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePlatformsOpen, setMobilePlatformsOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string>("Overview");

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobilePlatformsOpen(false);
  };

  const platformItems = [
    {
      title: "Overview",
      description: "Explore all AI data infrastructure",
      href: "#overview",
      icon: Layers3,
      image: PRODUCT_IMAGES[0],
    },
    {
      title: "Multimodal Annotation",
      description: "Image, video, VQA & labeling",
      href: "#multimodal-annotation",
      icon: BarChart3,
      image: PRODUCT_IMAGES[1],
    },
    {
      title: "Data Collection",
      description: "Global multimodal capture pipelines",
      href: "#data-collection",
      icon: Database,
      image: PRODUCT_IMAGES[0],
    },
    {
      title: "Audio & Speech",
      description: "Speech-to-intent AI systems",
      href: "#audio-speech",
      icon: Mic,
      image: PRODUCT_IMAGES[1],
    },
    {
      title: "Dataset Engine",
      description: "Structured AI-ready datasets",
      href: "#dataset-engine",
      icon: Layers3,
      image: PRODUCT_IMAGES[0],
    },
    {
      title: "LiDAR",
      description: "ADAS & 3D perception systems",
      href: "#lidar",
      icon: ScanLine,
      image: PRODUCT_IMAGES[1],
    },
  ];

  const navItems = [
    { label: "SERVICES", path: "#services" },
    { label: "DATA-ENGINEERING", path: "#data-engineering" },
    { label: "PRODUCTS", path: "#products" },
    { label: "CAREERS", path: "#careers" },
    { label: "BLOG", path: "#blog" },
    { label: "CONTACT", path: "#contact" },
  ];

  return (
    <nav className="cohort-navbar sticky top-0 w-full bg-[#f3f3f3] border-b border-gray-200" aria-label="Primary">
      {/* CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 lg:py-3 flex justify-between items-center gap-3">

        {/* LOGO */}
        <Link
          href="#"
          className="flex shrink-0 items-center"
          onClick={() => {
            closeMobileMenu();
            scrollToTop();
          }}
        >
          <img
            src={LOGO_URL}
            alt="Zepa"
            className="h-10 w-auto sm:h-11 lg:h-12 xl:h-14"
          />
        </Link>

        {/* DESKTOP NAV LINKS — lg+ only; tablet uses mobile menu */}
        <div className="hidden lg:flex min-w-0 flex-1 justify-center gap-3 xl:gap-6 2xl:gap-8 text-[11px] xl:text-[13px] font-medium tracking-[0.06em] xl:tracking-[0.08em] items-center">
          {/* SERVICES */}
          <Link href="#services" onClick={scrollToTop}>
            <TextScramble
              text="SERVICES"
              className="text-[#266347] hover:text-[#266347] transition"
            />
          </Link>

          {/* DATA-ENGINEERING */}
          <Link href="#data-engineering" onClick={scrollToTop}>
            <TextScramble
              text="DATA-ENGINEERING"
              className="text-[#266347] hover:text-[#266347] transition"
            />
          </Link>

          {/* PLATFORMS MEGA MENU */}
          <div
            className="relative"
            onMouseEnter={() => setPlatformOpen(true)}
            onMouseLeave={() => setPlatformOpen(false)}
          >
            <button className="flex items-center gap-1 text-[#266347]">
              <TextScramble
                text="PRODUCTS"
                className="text-[#266347] hover:text-[#266347] transition"
              />
              <ChevronDown size={14} className="mt-[1px]" />
            </button>

            {/* DROPDOWN */}
            <div
              className={`cohort-navbar__mega absolute left-1/2 -translate-x-1/2 top-full pt-6 lg:pt-7 transition-all duration-300 ${
                platformOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-2"
              }`}
            >
              <div className="w-[min(92vw,640px)] xl:w-[760px] 2xl:w-[800px] rounded-2xl border border-gray-200 bg-[#f3f3f3] shadow-[0_25px_60px_rgba(0,0,0,0.08)] p-4 xl:p-6">

                <div className="grid grid-cols-3 gap-4 xl:gap-6">

                  {/* LEFT SIDE - PLATFORM LINKS */}
                  <div className="col-span-2 grid grid-cols-2 gap-1">

                    {platformItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={scrollToTop}
                          onMouseEnter={() => setHoveredPlatform(item.title)}
                          className="group flex items-start gap-2 rounded-lg p-2 hover:bg-white/70 transition"
                        >
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#143f42] transition">
                            <Icon
                              size={16}
                              className="text-[#143f42] group-hover:text-white transition"
                            />
                          </div>

                          <div>
                            <h3 className="text-[14px] font-semibold text-[#131313] leading-tight">
                              {item.title}
                            </h3>

                            <p className="mt-0.5 text-xs leading-4 text-[#666] normal-case tracking-normal">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}

                  </div>

                  {/* RIGHT SIDE - THUMBNAIL IMAGE */}
                  <div className="border-l border-gray-200 pl-4 flex items-center justify-center">
                    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={
                          platformItems.find((item) => item.title === hoveredPlatform)
                            ?.image ?? PRODUCT_IMAGES[0]
                        }
                        alt={hoveredPlatform}
                        className="w-full h-[120px] xl:h-[140px] object-cover"
                      />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* CAREERS */}
          <Link href="#careers" onClick={scrollToTop}>
            <TextScramble
              text="CAREERS"
              className="text-[#266347] hover:text-[#266347] transition"
            />
          </Link>

          {/* BLOG */}
          <Link href="#blog" onClick={scrollToTop}>
            <TextScramble
              text="BLOG"
              className="text-[#266347] hover:text-[#266347] transition"
            />
          </Link>

          {/* CONTACT */}
          <Link href="#contact" onClick={scrollToTop}>
            <TextScramble
              text="CONTACT"
              className="text-[#266347] hover:text-[#266347] transition"
            />
          </Link>

        </div>

        {/* BUTTON */}
        <Link
          href="#request-demo"
          onClick={scrollToTop}
          aria-label="Request a Demo"
          className="hidden lg:inline-flex shrink-0"
        >
          <div className="group border border-[#266347] p-[2px] rounded-[12px] hover:bg-[#266347] active:bg-[#266347] transition-colors">
            <div className="p-[2px] rounded-[10px] bg-white group-hover:bg-[#266347] active:bg-[#266347] shadow-[0_1px_2px_rgba(0,0,0,0.3)] active:shadow-[0_0px_1px_rgba(0,0,0,0.3)] active:scale-[0.995] transition-all cursor-pointer">
              <div className="rounded-[8px] px-2.5 py-1 xl:px-3 xl:py-1.5">
                <span className="font-semibold text-[11px] xl:text-[13px] text-black group-hover:text-white active:text-white transition-colors whitespace-nowrap">
                  Request a Demo
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* MOBILE HAMBURGER */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navbar-menu"
          className="lg:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-300 text-[#143f42]"
          onClick={() =>
            setMobileMenuOpen((prev) => {
              const next = !prev;
              if (!next) setMobilePlatformsOpen(false);
              return next;
            })
          }
        >
          <span className="sr-only">Toggle navigation menu</span>
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-200 ${
                mobileMenuOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition-opacity duration-200 ${
                mobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition-transform duration-200 ${
                mobileMenuOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div id="mobile-navbar-menu" className="lg:hidden border-t border-gray-200 bg-[#f3f3f3] px-4 sm:px-6 pb-4 pt-3 max-h-[calc(100dvh-4.5rem)] overflow-y-auto">
          <div className="flex flex-col gap-0.5 text-[13px] font-medium tracking-[0.08em]">
            {navItems.map((item) => {
              if (item.label === "PRODUCTS") {
                return (
                  <div key="products" className="flex flex-col border-b border-gray-100 pb-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-[#266347] uppercase"
                      aria-expanded={mobilePlatformsOpen}
                      aria-controls="mobile-platforms-submenu"
                      id="mobile-platforms-trigger"
                      onClick={() => setMobilePlatformsOpen((v) => !v)}
                    >
                      <span className="tracking-[0.08em]">PRODUCTS</span>
                      <ChevronDown
                        size={18}
                        strokeWidth={2.25}
                        className={`shrink-0 text-[#266347] transition-transform duration-200 ${
                          mobilePlatformsOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                    {mobilePlatformsOpen && (
                      <div
                        id="mobile-platforms-submenu"
                        role="region"
                        aria-labelledby="mobile-platforms-trigger"
                        className="mb-2 ml-0.5 flex flex-col gap-0.5 border-l-2 border-[#266347]/25 pl-3 normal-case tracking-normal"
                      >
                        {platformItems.map((p) => {
                          const Icon = p.icon;
                          return (
                            <Link
                              key={p.href}
                              href={p.href}
                              className="flex gap-3 rounded-lg py-2.5 pl-1 pr-2 text-[#131313] hover:bg-gray-50 active:bg-gray-100"
                              onClick={() => {
                                closeMobileMenu();
                                scrollToTop();
                              }}
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <Icon size={16} className="text-[#143f42]" aria-hidden />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[13px] font-semibold leading-tight">
                                  {p.title}
                                </span>
                                <span className="mt-0.5 block text-xs font-normal leading-snug text-[#666]">
                                  {p.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.path}
                  className="py-2.5 text-[#266347]"
                  onClick={() => {
                    closeMobileMenu();
                    scrollToTop();
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="#request-demo"
              aria-label="Request a Demo"
              className="mt-2 inline-flex w-full justify-center"
              onClick={() => {
                closeMobileMenu();
                scrollToTop();
              }}
            >
              <div className="group border border-[#266347] p-[2px] rounded-[12px] hover:bg-[#266347] active:bg-[#266347] transition-colors">
                <div className="p-[2px] rounded-[10px] bg-white group-hover:bg-[#266347] active:bg-[#266347] shadow-[0_1px_2px_rgba(0,0,0,0.3)] active:shadow-[0_0px_1px_rgba(0,0,0,0.3)] active:scale-[0.995] transition-all cursor-pointer">
                  <div className="rounded-[8px] px-3 py-1.5">
                    <span className="font-semibold text-[13px] text-black group-hover:text-white active:text-white transition-colors">
                      Request a Demo
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default function CohortNavbarDemo() {
  return (
    <DemoShell>
      <Navbar />
    </DemoShell>
  );
}
