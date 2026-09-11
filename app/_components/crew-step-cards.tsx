"use client"

import { HoverTransition } from "@/components/ui/hover-transition"
import styles from "./componentry-landing.module.css"

const steps = [
  ["01", "Make a Link", "A private home for the people in one plan.", "Start with a name.", "A clear home means no one has to hunt through the chat for the plan."],
  ["02", "Pick a time", "Everyone votes from the same clear choices.", "Put two real times down.", "The group can decide quickly because the choices are side by side."],
  ["03", "Show up", "Keep the plan, chat, and little memories together.", "Share one small link.", "Everyone arrives with the same answer, even the friend who missed the chat."],
] as const

export default function CrewStepCards() {
  return <div className={styles.stepGrid}>
    {steps.map(([number, title, copy, revealTitle, revealCopy]) => <HoverTransition
      key={number}
      className={styles.stepTransition}
      effect="wipe"
      direction={number === "02" ? "bottom" : "right"}
      label={`${title}: focus or tap to reveal the next detail`}
      defaultComponent={<div className={styles.stepFace}><small>{number}</small><b>{title}</b><span>{copy}</span></div>}
      hoverComponent={<div className={`${styles.stepFace} ${styles.stepBack}`}><small>THE NEXT SMALL MOVE</small><b>{revealTitle}</b><span>{revealCopy}</span></div>}
    />)}
  </div>
}
