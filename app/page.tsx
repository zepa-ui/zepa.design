"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { SmoothScroll } from "@/components/landing/smooth-scroll"
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { LogoMarquee } from "@/components/landing/logo-marquee"
import { FeatureSection } from "@/components/landing/feature-section"
import { BentoGrid } from "@/components/landing/bento-grid"

import { FinalCTA } from "@/components/landing/final-cta"
import { Testimonials } from "@/components/landing/testimonails"
import { Footer } from "@/components/landing/footer"
import { Preloader } from "@/components/shared/preloader"

const DemoSection = dynamic(() => import("@/components/landing/DemoSection"), {
  ssr: false,
})

export default function Home() {
  const [ready, setReady] = useState(false)

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-landing">
        <Preloader onComplete={() => setReady(true)} />
        {/* The page mounts *behind* the preloader so the hero scene, fonts and
            images load while the intro plays. Only the entrance animations wait. */}
        {ready && <Navbar />}
        <Hero play={ready} />
        <LogoMarquee />

        <FeatureSection />
        <DemoSection />
        <BentoGrid />
        <FinalCTA />
        <Testimonials />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
