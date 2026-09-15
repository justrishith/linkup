"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, Clock3, ImagePlus } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { getLocalTimeZone, parseDate, today, type CalendarDate } from "@internationalized/date"
import { Button as AriaButton, Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, Heading } from "react-aria-components"
import { HoverTransition } from "@/components/ui/hover-transition"
import styles from "./crew-components.module.css"

export type CrewMember = { id: string; name: string; avatarUrl?: string | null }
export type CrewVote = { user_id: string; vote: "like" | "dislike" | "undecided" }
export type CrewMemory = { id: string; caption?: string | null; signedUrl?: string | null }

/** Adapted from the 21st.dev React Aria date-picker pattern: a labelled,
 * keyboard-operable calendar whose visual layer is restyled for Crew. */
export function CrewDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const minimumDate = useMemo(() => today(getLocalTimeZone()), [])
  return <Calendar<CalendarDate> className={styles.datePicker} aria-label="Choose a plan date" value={value ? parseDate(value) : null} minValue={minimumDate} onChange={(date) => onChange(date.toString())}>
    <div className={styles.calendarHead}><AriaButton slot="previous" aria-label="Previous month"><ChevronLeft size={16}/></AriaButton><Heading/><AriaButton slot="next" aria-label="Next month"><ChevronRight size={16}/></AriaButton></div>
    <CalendarGrid className={styles.calendarGrid}><CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader><CalendarGridBody>{(date) => <CalendarCell className={styles.calendarCell} date={date}/>}</CalendarGridBody></CalendarGrid>
  </Calendar>
}

/** Adapted from Componentry's Wheel Carousel: motion and explicit keyboard
 * controls remain, while promotional images and theme plumbing are removed. */
export function TimeWheel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const times = useMemo(() => Array.from({ length: 29 }, (_, index) => {
    const minutes = 10 * 60 + index * 30
    const hour = Math.floor(minutes / 60); const minute = minutes % 60
    const key = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    return { key, label: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, hour, minute)) }
  }), [])
  const selected = Math.max(0, times.findIndex((time) => time.key === value))
  const reducedMotion = useReducedMotion()
  const move = (amount: number) => onChange(times[(selected + amount + times.length) % times.length]!.key)
  return <section className={styles.timeWheel} aria-label="Choose a plan time">
    <div className={styles.wheelHead}><Clock3 size={15}/><span>TIME</span></div>
    <div className={styles.wheelBody} role="listbox" tabIndex={0} aria-activedescendant={`time-${times[selected]!.key}`} onKeyDown={(event) => { if (["ArrowDown", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(1) }; if (["ArrowUp", "ArrowLeft"].includes(event.key)) { event.preventDefault(); move(-1) } }} onWheel={(event) => { event.preventDefault(); move(event.deltaY > 0 ? 1 : -1) }}>
      <button type="button" aria-label="Earlier time" onClick={() => move(-1)}><ChevronLeft size={15}/></button>
      <AnimatePresence mode="wait" initial={false}><motion.output key={times[selected]!.key} id={`time-${times[selected]!.key}`} role="option" aria-selected="true" initial={reducedMotion ? false : { clipPath: "inset(0 0 100% 0)", x: 9 }} animate={{ clipPath: "inset(0)", x: 0 }} exit={reducedMotion ? undefined : { clipPath: "inset(100% 0 0 0)", x: -9 }} transition={{ duration: reducedMotion ? 0 : .18 }}>{times[selected]!.label}</motion.output></AnimatePresence>
      <button type="button" aria-label="Later time" onClick={() => move(1)}><ChevronRight size={15}/></button>
    </div>
  </section>
}

/** Adapted from Componentry's GitHub Calendar. It deliberately receives Crew
 * vote data and never calls GitHub or any external endpoint. */
export function AvailabilityGrid({ members, votes }: { members: CrewMember[]; votes: CrewVote[] }) {
  const liked = votes.filter((vote) => vote.vote === "like").length
  return <section className={styles.availabilityGrid} aria-label={`${liked} of ${members.length} people like this time`}>
    <div><span>CREW AVAILABILITY</span><b>{liked}/{Math.max(members.length, 1)} in</b></div>
    <ul>{members.map((member) => { const vote = votes.find((item) => item.user_id === member.id)?.vote || "undecided"; return <li key={member.id} data-vote={vote} title={`${member.name}: ${vote === "like" ? "in" : vote === "dislike" ? "out" : "waiting"}`}><span>{member.name.slice(0, 1).toUpperCase()}</span></li> })}</ul>
    <small>{liked === members.length && members.length ? "Everyone can make it." : "Green squares are in. Warm squares are waiting."}</small>
  </section>
}

/** Adapted from Componentry's Layered Stack. Explicit controls replace the
 * source's hover-only reveal, and each rendered card is a distinct real photo. */
export function MemoryStack({ photos, onAdd }: { photos: CrewMemory[]; onAdd: () => void }) {
  const [index, setIndex] = useState(0)
  const reducedMotion = useReducedMotion()
  const total = photos.length
  const active = total ? photos[index % total] : null
  const canMove = total > 1
  const move = (amount: number) => setIndex((current) => (current + amount + total) % total)
  return <article className={styles.memoryStack}><div className={styles.memoryStackHead}><span>MEMORIES</span><b>{total ? `${index % total + 1} / ${total}` : "0 / 0"}</b></div>
    {active?.signedUrl ? <div className={styles.memoryStackStage}><i aria-hidden="true"/><AnimatePresence mode="wait" initial={false}><motion.div key={active.id} className={styles.memoryCard} initial={reducedMotion ? false : { rotate: -4, x: 14, clipPath: "inset(0 100% 0 0 round 18px)" }} animate={{ rotate: 0, x: 0, clipPath: "inset(0 round 18px)" }} exit={reducedMotion ? undefined : { rotate: 4, x: -14, clipPath: "inset(0 0 0 100% round 18px)" }} transition={{ duration: reducedMotion ? 0 : .22, ease: [0.22, 1, 0.36, 1] }}><Image src={active.signedUrl} alt={active.caption || "Link memory"} fill sizes="(max-width: 720px) 100vw, 460px" unoptimized /></motion.div></AnimatePresence></div> : <button type="button" className={styles.memoryEmpty} onClick={onAdd}><ImagePlus size={20}/><b>Add the first real memory</b><span>No placeholders. No repeats.</span></button>}
    {active && <><p>{active.caption || "A Link memory"}</p><div className={styles.memoryStackControls}><button type="button" disabled={!canMove} onClick={() => move(-1)}><ChevronLeft size={15}/> Previous</button><button type="button" disabled={!canMove} onClick={() => move(1)}>Next <ChevronRight size={15}/></button></div></>}
  </article>
}

/** Componentry Hover Transition, constrained to an explicit click/focus plan
 * handoff so it communicates a real next step instead of decorative motion. */
export function DecisionHandoff({ title, detail, onOpen }: { title: string; detail: string; onOpen: () => void }) {
  return <HoverTransition className={styles.decisionHandoff} effect="wipe" direction="right" duration={.22} label={`Open plan: ${title}`} description={`${detail} Activate this card to open the plan.`} onActivate={onOpen} defaultComponent={<div className={styles.decisionFace}><span>PLAN CONTEXT</span><b>{title}</b><small>{detail}</small><ChevronRight size={18}/></div>} hoverComponent={<div className={styles.decisionFace}><span>OPEN THE PLAN</span><b>See the choices.</b><small>Vote or make the call in one place.</small><ChevronRight size={18}/></div>} />
}
