"use client"

import { useEffect, useState } from "react"

import type { ComponentType } from "react"
import { registryLoaders } from "@/content/registry/loaders"

import { DemoErrorBoundary } from "./demo-error-boundary"

interface RegistryDemoProps {
  slug: string
  refreshKey?: number
}

function DemoComponent({ slug }: { slug: string }) {
  const [Component, setComponent] = useState<ComponentType | null>(null)
  const [isLoading, setIsLoading] = useState(() => {
    return Boolean(registryLoaders[slug]?.demo)
  })

  useEffect(() => {
    const loader = registryLoaders[slug]?.demo
    if (!loader) {
      return
    }

    let isMounted = true

    loader().then((module) => {
      if (isMounted) {
        setComponent(() => module.default)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[70vh] items-center justify-center text-sm text-white/50">
        Loading demo…
      </div>
    )
  }

  if (!Component) {
    return (
      <div className="flex h-full min-h-[70vh] items-center justify-center text-sm text-white/50">
        Demo not found
      </div>
    )
  }

  return (
    <div className="demo-embed-root relative isolate min-h-full w-full overflow-hidden [transform:translateZ(0)]">
      <Component />
    </div>
  )
}

export function RegistryDemo({ slug, refreshKey = 0 }: RegistryDemoProps) {
  return (
    <DemoErrorBoundary resetKey={`${slug}-${refreshKey}`}>
      <DemoComponent key={refreshKey} slug={slug} />
    </DemoErrorBoundary>
  )
}
