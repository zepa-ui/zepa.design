"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { SmoothScroll } from "@/components/landing/smooth-scroll"
import { EnterpriseHero } from "@/components/enterprise/hero"
import { Circuit } from "@/components/enterprise/circuit"
import { Services } from "@/components/enterprise/services"
import {
  Booking,
  ClosingStrip,
  Engagement,
  FeaturedBuild,
  FinalCTA,
  Process,
  Stack,
  Wordmark,
} from "@/components/enterprise/sections"

export function EnterprisePage() {
  return (
    <SmoothScroll>
      <main className="min-h-screen overflow-x-clip bg-landing">
        <Navbar />
        <EnterpriseHero />
        <Circuit />
        <Services />
        <FeaturedBuild />
        <Stack />
        <Process />
        <Engagement />
        <Booking />
        <FinalCTA />
        <ClosingStrip />
        <Wordmark />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
