"use client"

import { useSyncExternalStore } from "react"

const query = "(prefers-reduced-motion: reduce)"

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

/**
 * Returns true when the user's OS has "Reduce motion" enabled.
 * Use it to skip autoplay, GSAP timelines, or WebGL animation loops.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
