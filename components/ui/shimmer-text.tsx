"use client"

import { motion } from "motion/react"
import React, { useMemo } from "react"

import { cn } from "@/lib/utils"

/**
 * Motion components are created once, at module scope.
 *
 * The reference version called `motion.create(...)` inside the render body,
 * which mints a brand-new component type on every render — React then sees a
 * different type and remounts the subtree each pass. It also trips
 * `react-hooks/static-components`. A fixed map covers every tag this is
 * actually used with and costs nothing per render.
 */
const MOTION_TAGS = {
  p: motion.p,
  span: motion.span,
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
} as const

export type ShimmerTag = keyof typeof MOTION_TAGS

export type TextShimmerProps = {
  children: string
  as?: ShimmerTag
  className?: string
  duration?: number
  spread?: number
}

/**
 * A light sweep travelling across the text, done with a moving
 * `background-position` on a clipped gradient — the glyphs themselves carry
 * the highlight, so nothing sits on top of them.
 */
function TextShimmerComponent({
  children,
  as = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = MOTION_TAGS[as]

  // longer strings need a wider highlight, or the sweep reads as a dot
  const dynamicSpread = useMemo(
    () => children.length * spread,
    [children, spread]
  )

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text",
        "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#000]",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff] dark:[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage:
            "var(--bg), linear-gradient(var(--base-color), var(--base-color))",
        } as React.CSSProperties
      }
      transition={{
        repeat: Number.POSITIVE_INFINITY,
        duration,
        ease: "linear",
      }}
    >
      {children}
    </MotionComponent>
  )
}

export const TextShimmer = React.memo(TextShimmerComponent)
