"use client"

import { RefObject, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

export function useLinkupMotion(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    const raf = (time: number) => lenis.raf(time * 1000)

    lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((node) => {
        gsap.fromTo(
          node,
          { autoAlpha: 0, y: 44, scale: 0.965 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
          },
        )
      })

      gsap.to("[data-float='slow']", {
        y: -20,
        rotate: 4,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
      gsap.to("[data-float='fast']", {
        y: 16,
        x: 10,
        rotate: -5,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, element)

    return () => {
      context.revert()
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [root])
}

export function useMagneticButton(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const moveX = gsap.quickTo(element, "x", { duration: 0.55, ease: "elastic.out(1, 0.35)" })
    const moveY = gsap.quickTo(element, "y", { duration: 0.55, ease: "elastic.out(1, 0.35)" })
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      moveX((event.clientX - box.left - box.width / 2) * 0.16)
      moveY((event.clientY - box.top - box.height / 2) * 0.16)
    }
    const reset = () => {
      moveX(0)
      moveY(0)
    }

    element.addEventListener("pointermove", move)
    element.addEventListener("pointerleave", reset)
    return () => {
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerleave", reset)
    }
  }, [ref])
}
