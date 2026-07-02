"use client"

import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="px-4 pt-24 pb-8">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
          style={{ fontFamily: "var(--font-cal-sans)" }}
        >
          Ready to ship faster?
        </h2>
        <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Collabrate with thousands of components already built with zepa. start free, no credit card  no fees required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-white/20"
          >
            <Link href="/components">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 h-14 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent"
          >
            <Link
              href="https://calendly.com/shaiksameer8921/30min"
              target="_blank"
              rel="noreferrer"
            >
              Talk to Me
            </Link>
          </Button>
        </div>

        {/* <div className="flex justify-center">
          <video
            src="/111.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full max-w-5xl rounded-2xl"
          />
        </div> */}

        <p className="mt-4 text-sm text-zinc-500">100% free and open source. Built for developers who care about details.</p>
      </motion.div>
    </section>
  )
}
