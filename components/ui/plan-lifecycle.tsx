"use client"

import { Check, CircleDot } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"
import styles from "./crew-components.module.css"

/**
 * Adapted from Componentry's Flight Status Card. It keeps the clear progress
 * language while replacing travel metaphors and dot-matrix treatment with a
 * Link's real planning states.
 */
export function PlanLifecycle({
  status,
  className,
  ...props
}: { status: "empty" | "choosing" | "confirmed" } & ComponentPropsWithoutRef<"section">) {
  const reducedMotion = useReducedMotion()
  const active = status === "confirmed" ? 3 : status === "choosing" ? 2 : 1
  const label = status === "confirmed" ? "Plan confirmed" : status === "choosing" ? "People are choosing" : "Start a plan"

  return <section {...props} className={cn(styles.lifecycle, className)} aria-label={label}>
    <div className={styles.lifecycleHead}><span>{label}</span><b>{status === "confirmed" ? "All set" : status === "choosing" ? "In motion" : "Your turn"}</b></div>
    <ol className={styles.lifecycleSteps}>
      {["Idea", "Times", "Set"].map((step, index) => {
        const reached = index + 1 <= active
        return <li key={step} data-reached={reached || undefined}>
          <i>{index + 1 < active ? <Check size={11} /> : <CircleDot size={11} />}</i><span>{step}</span>
        </li>
      })}
    </ol>
    <div className={styles.lifecycleTrack} aria-hidden="true"><motion.span initial={false} animate={{ width: `${((active - 1) / 2) * 100}%` }} transition={{ duration: reducedMotion ? 0 : .24, ease: [0.22, 1, 0.36, 1] }} /></div>
  </section>
}
