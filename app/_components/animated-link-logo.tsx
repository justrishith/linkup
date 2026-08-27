"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

export default function AnimatedLinkLogo({ compact = false }: { compact?: boolean }) {
  const logo = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = logo.current
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } })
      timeline
        .set(".linkup-logo-path", { strokeDasharray: 170, strokeDashoffset: 170 })
        .from(".linkup-logo-left", { x: -34, rotate: -18, transformOrigin: "50% 50%", duration: 0.9 })
        .from(".linkup-logo-right", { x: 34, rotate: 18, transformOrigin: "50% 50%", duration: 0.9 }, "<")
        .to(".linkup-logo-path", { strokeDashoffset: 0, duration: 1.1, stagger: 0.08 }, 0.12)
        .to(".linkup-logo-glow", { scale: 1.22, opacity: 0, duration: 0.8 }, "-=0.3")
    }, svg)
    return () => context.revert()
  }, [])

  return (
    <svg ref={logo} viewBox="0 0 132 76" className={compact ? "h-9 w-[62px]" : "h-16 w-28"} role="img" aria-label="Linkup interlocking links">
      <circle className="linkup-logo-glow" cx="66" cy="38" r="22" fill="#9cf7d5" opacity=".42" />
      <g className="linkup-logo-left">
        <path className="linkup-logo-path" d="M59 22H39C22 22 22 54 39 54h24c10 0 15-7 15-16" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g className="linkup-logo-right">
        <path className="linkup-logo-path" d="M73 54h20c17 0 17-32 0-32H69c-10 0-15 7-15 16" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </g>
    </svg>
  )
}
