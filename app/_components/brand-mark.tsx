"use client"

import { useEffect, useRef, useState } from "react"

export default function BrandMark({ size = 40 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const element = ref.current
      if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const rect = element.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const distance = Math.hypot(dx, dy)
      setNear(distance < Math.max(90, size * 2.3))
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [size])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`link-mark ${near ? "link-mark-near" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" width={Math.round(size * 0.68)} height={Math.round(size * 0.68)} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 22.8 10.9 19.2a7.4 7.4 0 0 1 10.5-10.5l3.2 3.2" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m25.5 17.2 3.6 3.6a7.4 7.4 0 0 1-10.5 10.5l-3.2-3.2" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m15.5 24.5 9-9" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round"/>
      </svg>
      <span className="link-mark-dot" />
    </div>
  )
}
