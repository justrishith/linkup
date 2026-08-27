"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { CalendarEvent, CalendarProvider, CalMonthView, CalTimeGridView, CalYearView } from "@ascentsparksoftware/react-calendar"
import { DateFnsDateAdapter } from "@ascentsparksoftware/react-calendar/date-fns"

export type LinkupCalendarItem = {
  id: string
  title: string
  start: Date
  end: Date
  kind: "event" | "idea"
}

const adapter = new DateFnsDateAdapter()

export default function ExperienceCalendar({ items }: { items: LinkupCalendarItem[] }) {
  const [view, setView] = useState<"day" | "month" | "year">("month")
  const [date, setDate] = useState(new Date())
  const events = useMemo<CalendarEvent<{ kind: "event" | "idea" }>[]>(() => items.map((item) => ({
    id: item.id,
    title: item.title,
    start: item.start,
    end: item.end,
    status: item.kind,
    meta: { kind: item.kind },
  })), [items])

  function moveDate(direction: -1 | 1) {
    const next = new Date(date)
    if (view === "day") next.setDate(next.getDate() + direction)
    if (view === "month") next.setMonth(next.getMonth() + direction)
    if (view === "year") next.setFullYear(next.getFullYear() + direction)
    setDate(next)
  }

  const label = date.toLocaleDateString([], view === "year" ? { year: "numeric" } : view === "day" ? { weekday: "long", month: "long", day: "numeric" } : { month: "long", year: "numeric" })
  const common = { events, viewDate: date, baseColor: "#eef0ff", accentColor: "#7457ff", themeMode: "light" as const, statusColors: { event: "#7457ff", idea: "#ff7b66" } }

  return (
    <div className="experience-calendar" data-tour="calendar">
      <div className="calendar-toolbar">
        <div>
          <div className="mini-kicker"><Sparkles size={13} /> events + ideas, together</div>
          <h3>{label}</h3>
        </div>
        <div className="calendar-controls">
          <button type="button" onClick={() => moveDate(-1)} aria-label={`Previous ${view}`}><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => setDate(new Date())}>Today</button>
          <button type="button" onClick={() => moveDate(1)} aria-label={`Next ${view}`}><ChevronRight size={17} /></button>
        </div>
        <div className="view-toggle" data-tour="views" aria-label="Calendar view">
          {(["day", "month", "year"] as const).map((option) => <button type="button" key={option} className={view === option ? "active" : ""} onClick={() => setView(option)}>{option}</button>)}
        </div>
      </div>
      <div className={`calendar-surface calendar-${view}`}>
        <CalendarProvider dateAdapter={adapter} defaults={{ weekStartsOn: 0, hour12: true }}>
          {view === "day" && <CalTimeGridView {...common} days={1} anchorToWeek={false} dayStartMinutes={480} dayEndMinutes={1320} density="compact" />}
          {view === "month" && <CalMonthView {...common} />}
          {view === "year" && <CalYearView {...common} />}
        </CalendarProvider>
      </div>
      <div className="calendar-legend"><span><i className="legend-event" /> Event</span><span><i className="legend-idea" /> Idea to decide</span><span className="calendar-hint">Try the view buttons — this demo is fully interactive.</span></div>
    </div>
  )
}
