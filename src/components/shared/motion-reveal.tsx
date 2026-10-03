"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

type MotionRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

/** A one-time entrance for presentation content; server-rendered content stays visible. */
export function MotionReveal({ children, className = "", delay = 0 }: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    let observer: IntersectionObserver | undefined
    const show = () => {
      element.dataset.motionState = "visible"
      observer?.disconnect()
    }
    const preferenceChanged = () => {
      if (media.matches) show()
    }
    if (!media.matches && "IntersectionObserver" in window) {
      // Only hide offscreen content, so hydration never flashes the hero or a form.
      if (element.getBoundingClientRect().top > window.innerHeight * 0.9) {
        element.dataset.motionState = "pending"
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) show()
          },
          { threshold: 0.06, rootMargin: "0px 0px -24px 0px" },
        )
        observer.observe(element)
      } else show()
    }
    media.addEventListener("change", preferenceChanged)
    return () => {
      observer?.disconnect()
      media.removeEventListener("change", preferenceChanged)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`se-reveal ${className}`}
      style={{ "--se-delay": `${Math.max(0, Math.min(delay, 350))}ms` } as CSSProperties}
      onFocusCapture={() => {
        if (ref.current) ref.current.dataset.motionState = "visible"
      }}
    >
      {children}
    </div>
  )
}
