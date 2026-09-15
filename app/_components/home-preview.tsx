"use client"

import { useState } from "react"
import { CalendarDays, Check, MessageCircle, Sparkles, Users } from "lucide-react"
import { PlanLifecycle } from "@/components/ui/plan-lifecycle"
import styles from "./home-preview.module.css"
import polish from "./home-preview-polish.module.css"
import componentry from "./componentry-landing.module.css"

type Choice = "friday" | "saturday"

const choices: Record<Choice, { label: string; detail: string; count: string }> = {
  friday: { label: "Fri, Sep 4", detail: "8:30 PM · Cha Time", count: "4 of 4 free" },
  saturday: { label: "Sat, Sep 5", detail: "9:00 PM · Boba Guys", count: "2 of 4 free" },
}

export default function HomePreview() {
  const [choice, setChoice] = useState<Choice | null>(null)
  const confirmed = choice === "friday"

  return <section className={`${styles.preview} ${polish.preview} ${confirmed ? styles.confirmed : ""}`} aria-label="Try a sample LinkUp plan">
    <div className={styles.sparkles} aria-hidden="true"><i /><i /><i /></div>
    <div className={styles.top}><span>RISHITH&apos;S WEEKEND</span><i>RW</i></div>
    <div className={styles.status}><span className={styles.liveDot} />{confirmed ? "PLAN CONFIRMED" : "YOUR MOVE"}</div>
    <h2>{confirmed ? <>Boba is<br/><em>happening.</em></> : <>Late-night<br/>boba run</>}</h2>
    <p className={styles.details}>{confirmed ? "Friday · 8:30 PM · Cha Time" : "Pick the time that works for you."}</p>
    <div className={styles.lifecycleArea}>
      <PlanLifecycle status={confirmed ? "confirmed" : "choosing"} className={componentry.planLifecycle} />
      <p className={componentry.planHint}>{confirmed ? "Friday has the deciding vote." : "Two clear choices. Your crew decides together."}</p>
    </div>
    <div className={styles.votes} aria-label="Choose a time">
      {(Object.keys(choices) as Choice[]).map((key) => {
        const item = choices[key]
        const selected = choice === key
        return <button key={key} type="button" aria-pressed={selected} className={`${styles.vote} ${selected ? styles.selected : ""}`} onClick={() => setChoice(key)}>
          <CalendarDays size={15}/><span><b>{item.label}</b><small>{item.detail}</small></span><strong>{selected ? item.count : key === "friday" ? "3 free" : "1 free"}</strong>{selected && <Check size={16}/>}
        </button>
      })}
    </div>
    <div className={styles.footer}><span><Users size={15}/> 4 people</span><span><MessageCircle size={15}/> 3 messages</span></div>
    <p className={styles.prompt}><Sparkles size={14}/>{confirmed ? "You made a plan happen." : "Tap a time — this is a local demo."}</p>
  </section>
}
