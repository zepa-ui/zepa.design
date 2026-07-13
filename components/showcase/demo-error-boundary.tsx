"use client"

import { Component, type ReactNode } from "react"
import { MonitorX, RefreshCw } from "lucide-react"

function isWebGLSupported() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    )
  } catch {
    return false
  }
}

function DemoFallback({ onRetry }: { onRetry: () => void }) {
  const webglMissing =
    typeof window !== "undefined" && !isWebGLSupported()

  return (
    <div className="flex h-full min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <MonitorX className="size-8 text-white/30" aria-hidden="true" />
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-white/80">
          {webglMissing
            ? "This demo needs WebGL"
            : "This demo couldn't load"}
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-white/45">
          {webglMissing
            ? "Your browser or device doesn't support WebGL, which this component uses for rendering. Try a different browser or device."
            : "Something went wrong while rendering this component on your device. The code and install commands still work fine."}
        </p>
      </div>
      {!webglMissing ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </div>
  )
}

interface DemoErrorBoundaryProps {
  children: ReactNode
  /** Change this value to reset the boundary (e.g. the demo refresh key). */
  resetKey?: string | number
}

interface DemoErrorBoundaryState {
  hasError: boolean
}

export class DemoErrorBoundary extends Component<
  DemoErrorBoundaryProps,
  DemoErrorBoundaryState
> {
  state: DemoErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: DemoErrorBoundaryProps) {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <DemoFallback
          onRetry={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
