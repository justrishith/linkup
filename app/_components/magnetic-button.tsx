"use client"

import { ButtonHTMLAttributes, MouseEvent, useRef, useState } from "react"
import { useMagneticButton } from "./linkup-motion"

type MagneticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "violet" | "mint" | "ghost" | "coral"
}

export default function MagneticButton({ className = "", tone = "violet", children, onClick, ...props }: MagneticButtonProps) {
  const button = useRef<HTMLButtonElement>(null)
  const [ripple, setRipple] = useState<{ x: number; y: number; id: number } | null>(null)
  useMagneticButton(button)

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    setRipple({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, id: Date.now() })
    onClick?.(event)
  }

  return (
    <button ref={button} className={`liquid-button liquid-${tone} ${className}`} onClick={handleClick} {...props}>
      <span className="liquid-button-content">{children}</span>
      {ripple && <span key={ripple.id} className="liquid-ripple" style={{ left: ripple.x, top: ripple.y }} aria-hidden="true" />}
    </button>
  )
}
