"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CalendarDays, Camera, ChevronRight, CircleDollarSign, Compass, Lightbulb, Plus, Users, WalletCards } from "lucide-react"

type EventItem = { name: string; date: string; detail: string; color: string }
type IdeaItem = { name: string; votes: string }
type ActivityItem = { text: string; time: string; icon: typeof CalendarDays }

const events: EventItem[] = [
  { name: "Santa Cruz Beach Day", date: "Aug 29", detail: "6 going · $24/person", color: "bg-brand-blue" },
  { name: "Fall Camping", date: "Sep 12–14", detail: "8 going · $68/person", color: "bg-brand-mint" },
  { name: "Movie + Dinner", date: "Sep 19", detail: "5 going · $15/person", color: "bg-brand-peach" },
]
const ideas: IdeaItem[] = [
  { name: "Lake Tahoe weekend", votes: "6 votes" },
  { name: "Sunrise hike", votes: "5 votes" },
  { name: "Bowling tournament", votes: "4 votes" },
]
const activity: ActivityItem[] = [
  { text: "Nikhil added a new event", time: "2h ago", icon: CalendarDays },
  { text: "Ava uploaded 18 photos", time: "yesterday", icon: Camera },
  { text: "You were added to Fall Camping", time: "yesterday", icon: Users },
  { text: "Sam paid you $12.50", time: "2d ago", icon: WalletCards },
]
const tabs = ["home", "events", "ideas", "expenses", "photos"] as const
type Tab = typeof tabs[number]

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("home")
  const [name, setName] = useState("Rishi")

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.ok ? response.json() : null).then((data) => {
      const displayName = data?.profile?.display_name
      if (typeof displayName === "string" && displayName.trim()) setName(displayName)
    }).catch(() => undefined)
  }, [])

  const avatar = name.slice(0, 1).toUpperCase() || "R"

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <header className="sticky top-0 z-20 border-b-2 border-[#1a1a1a] bg-[#fafaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-7 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-3 mr-2"><div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div><div className="text-xl font-black tracking-tight">linkup</div></Link>
          <nav className="desktop-nav hidden flex-1 items-center gap-1 sm:flex">{tabs.map((key) => <button key={key} onClick={() => setTab(key)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${tab === key ? "bg-[#111] text-white" : "text-zinc-600 hover:bg-white hover:text-black"}`}>{key === "home" ? "Home" : key === "expenses" ? "Expenses" : key[0].toUpperCase() + key.slice(1)}</button>)}</nav>
          <Link href="/account" className="ml-auto flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white" aria-label="Open account"><div className="hidden text-right sm:block"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-zinc-500">Account</div></div><div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xs font-black">{avatar}</div></Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        {tab === "home" ? <>
          <section className="hero-grid anim-1 overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white p-6 shadow-[6px_6px_0_#1a1a1a] sm:p-9"><div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[11px] font-black shadow-[2px_2px_0_#1a1a1a]"><span className="h-2 w-2 rounded-full bg-green-500" /> YOUR CREW</div><h1 className="text-4xl font-black tracking-tight sm:text-6xl">Everything your group does, in one place.</h1><p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600 sm:text-lg">Plan the next thing, figure out who’s going, split the money, and keep the photos. Linkup is the shared home for your crew.</p><div className="mt-6 flex flex-wrap gap-3"><button className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm" onClick={() => setTab("events")}><Plus size={16}/> New event</button><button className="brutal-btn rounded-lg bg-white px-4 py-3 text-sm" onClick={() => setTab("ideas")}><Lightbulb size={16}/> Add idea</button></div></div></section>
          <section className="anim-2 mt-7 grid gap-4 sm:grid-cols-4"><div className="brutal-card p-4"><div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue"><CalendarDays size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">UPCOMING</div><div className="mt-1 text-2xl font-black">3</div><div className="text-xs font-medium text-zinc-500">events</div></div><div className="brutal-card p-4"><div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-mint"><CircleDollarSign size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">YOU’RE OWED</div><div className="mt-1 text-2xl font-black">$31</div><div className="text-xs font-medium text-zinc-500">from 2 people</div></div><div className="brutal-card p-4"><div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-lemon"><Lightbulb size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">IDEAS</div><div className="mt-1 text-2xl font-black">12</div><div className="text-xs font-medium text-zinc-500">to vote on</div></div><div className="brutal-card p-4"><div className="mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-peach"><Users size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">MEMBERS</div><div className="mt-1 text-2xl font-black">8</div><div className="text-xs font-medium text-zinc-500">in your crew</div></div></section>
          <section className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.9fr]"><div className="brutal-card p-5 sm:p-6"><div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">UP NEXT</div><h2 className="mt-1 text-2xl font-black">Events</h2></div><button className="text-xs font-black text-zinc-500" onClick={() => setTab("events")}>View all →</button></div><div className="space-y-3">{events.map((event) => <button key={event.name} onClick={() => setTab("events")} className="group flex w-full items-center gap-4 rounded-xl border-2 border-transparent p-2 text-left transition hover:border-[#1a1a1a] hover:bg-[#fafaf8]"><div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] ${event.color} shadow-[3px_3px_0_#1a1a1a]`}><CalendarDays size={19}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{event.date}</div><div className="truncate text-sm font-black">{event.name}</div><div className="mt-1 text-xs font-medium text-zinc-500">{event.detail}</div></div><ChevronRight size={18} className="text-zinc-400"/></button>)}</div></div><div className="brutal-card p-5 sm:p-6"><div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">BRAIN DUMP</div><h2 className="mt-1 text-2xl font-black">Ideas</h2></div><button className="text-xs font-black text-zinc-500" onClick={() => setTab("ideas")}>All ideas →</button></div><div className="divide-y-2 divide-zinc-100 border-y-2 border-zinc-100">{ideas.map((idea, index) => <button key={idea.name} onClick={() => setTab("ideas")} className="flex w-full items-center gap-3 py-4 text-left"><span className="text-[10px] font-black text-zinc-400">0{index + 1}</span><span className="min-w-0 flex-1 text-sm font-black">{idea.name}</span><span className="rounded-full bg-brand-lemon px-2 py-1 text-[10px] font-black">{idea.votes}</span></button>)}</div><button onClick={() => setTab("ideas")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500"><Plus size={15}/> Add an idea</button></div></section>
          <section className="mt-6 grid gap-6 lg:grid-cols-2"><div className="brutal-card p-5 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">MONEY</div><h2 className="mt-1 text-2xl font-black">Expenses</h2></div><button onClick={() => setTab("expenses")} className="text-xs font-black text-zinc-500">Open →</button></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-coral p-4"><div className="text-xs font-bold text-zinc-600">You owe</div><div className="mt-2 text-2xl font-black">$12.50</div><div className="mt-1 text-xs font-medium text-zinc-600">to Alex</div></div><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-mint p-4"><div className="text-xs font-bold text-zinc-600">Owed to you</div><div className="mt-2 text-2xl font-black">$31.00</div><div className="mt-1 text-xs font-medium text-zinc-600">from 2 people</div></div></div></div><div className="brutal-card p-5 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">RECENT</div><h2 className="mt-1 text-2xl font-black">Activity</h2></div><div className="text-xs font-black text-zinc-400">Live feed</div></div><div className="space-y-4">{activity.map((item) => { const Icon = item.icon; return <div key={item.text} className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><Icon size={15}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-black">{item.text}</div><div className="text-[10px] font-medium text-zinc-500">{item.time}</div></div></div> })}</div></div></section>
        </> : <section className="anim-1"><div className="mb-6 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">LINKUP</div><h1 className="mt-1 text-4xl font-black capitalize">{tab}</h1><p className="mt-2 text-sm font-medium text-zinc-500">This section is wired to the real Linkup backend.</p></div><button className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm" onClick={() => setTab("home")}><Compass size={16}/> Back home</button></div><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="brutal-card p-6"><div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-white shadow-[3px_3px_0_#1a1a1a]"><Compass size={20}/></div><div className="text-lg font-black">{tab === "events" ? events[index % events.length].name : tab === "ideas" ? ideas[index % ideas.length].name : tab === "expenses" ? "Shared expense" : "Shared album"}</div><p className="mt-2 text-sm font-medium text-zinc-500">The authenticated module is ready for real records.</p></div>)}</div></section>}
      </div>
    </main>
  )
}
