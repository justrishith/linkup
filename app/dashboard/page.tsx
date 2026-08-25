"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  Home,
  Lightbulb,
  MapPin,
  MessageCircle,
  Plus,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react"

const nav = [
  ["/dashboard", "Home", Home],
  ["/dashboard/events", "Events", CalendarDays],
  ["/dashboard/ideas", "Ideas", Lightbulb],
  ["/dashboard/expenses", "Expenses", WalletCards],
  ["/dashboard/photos", "Photos", Camera],
] as const

const events = [
  { name: "Santa Cruz Beach Day", date: "Aug 29", detail: "6 going", color: "bg-brand-blue" },
  { name: "Fall Camping", date: "Sep 12–14", detail: "8 going", color: "bg-brand-mint" },
  { name: "Movie + Dinner", date: "Sep 19", detail: "5 going", color: "bg-brand-peach" },
]

const ideas = [
  ["Lake Tahoe weekend", "6 votes"],
  ["Sunrise hike", "5 votes"],
  ["Bowling tournament", "4 votes"],
]

const activity = [
  ["Nikhil added a new event", "2h", CalendarDays],
  ["Ava uploaded 18 photos", "yesterday", Camera],
  ["You joined Fall Camping", "yesterday", Users],
  ["Sam paid you $12.50", "2d", WalletCards],
]

export default function DashboardPage() {
  const [profile, setProfile] = useState({ name: "Rishi", avatar: "R" })

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const name = data?.profile?.display_name
        if (typeof name === "string" && name.trim()) {
          setProfile({ name, avatar: name.slice(0, 1).toUpperCase() })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <main className="dashboard-shell min-h-screen text-[#111]">
      <aside className="app-sidebar hidden lg:flex">
        <Link href="/dashboard" className="brand-lockup">
          <span className="logo-mark" aria-hidden="true"><span /></span>
          <span className="text-xl font-black tracking-tight">linkup</span>
        </Link>

        <div className="mt-8 rounded-2xl border-2 border-[#1a1a1a] bg-white p-3 shadow-[4px_4px_0_#1a1a1a]">
          <div className="text-[9px] font-black tracking-[.18em] text-zinc-400">YOUR CREW</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-blue font-black">L</div>
            <div className="min-w-0 flex-1"><div className="truncate text-sm font-black">Weekend Crew</div><div className="text-[10px] font-medium text-zinc-500">8 members</div></div>
            <ChevronRight size={16} className="text-zinc-400" />
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {nav.map(([href, label, Icon], index) => {
            const I = Icon as typeof Home
            return <Link key={href} href={href} className={`sidebar-link ${index === 0 ? "active" : ""}`}><I size={17} /> <span>{label}</span>{index === 1 && <span className="ml-auto rounded-full bg-brand-lemon px-2 py-0.5 text-[9px] font-black">3</span>}</Link>
          })}
        </nav>

        <div className="mt-7 px-2 text-[9px] font-black tracking-[.18em] text-zinc-400">TOOLS</div>
        <nav className="mt-2 space-y-1">
          <Link href="/dashboard/ideas" className="sidebar-link"><Sparkles size={17} /> <span>Polls</span></Link>
          <Link href="/dashboard/photos" className="sidebar-link"><Camera size={17} /> <span>Memories</span></Link>
          <Link href="/account" className="sidebar-link"><Settings size={17} /> <span>Settings</span></Link>
        </nav>

        <div className="mt-auto rounded-2xl border-2 border-[#1a1a1a] bg-brand-lemon p-4 shadow-[4px_4px_0_#1a1a1a]">
          <div className="flex items-start justify-between gap-3"><Sparkles size={17} /><span className="text-[9px] font-black uppercase tracking-[.14em]">Quick tip</span></div>
          <p className="mt-3 text-xs font-bold leading-5">Keep the plan here. Let the group chat stay for chaos.</p>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="app-topbar">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/dashboard" className="brand-lockup"><span className="logo-mark" aria-hidden="true"><span /></span><span className="text-lg font-black">linkup</span></Link>
          </div>
          <div className="hidden md:block"><div className="text-[10px] font-black tracking-[.18em] text-zinc-400">FRIDAY · AUG 28</div><div className="text-sm font-black">Weekend Crew</div></div>
          <div className="ml-auto flex items-center gap-2">
            <button className="icon-button hidden sm:grid" aria-label="Notifications"><Bell size={17} /><span className="notification-dot" /></button>
            <Link href="/account" className="profile-pill"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xs font-black">{profile.avatar}</span><span className="hidden text-left sm:block"><span className="block text-[11px] font-black">{profile.name}</span><span className="block text-[9px] text-zinc-500">Crew admin</span></span></Link>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-workspace">
            <div className="hero-copy">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[10px] font-black shadow-[2px_2px_0_#1a1a1a]"><span className="h-2 w-2 rounded-full bg-green-500" /> ACTIVE CREW</div>
              <div className="mt-5 text-[10px] font-black tracking-[.2em] text-zinc-400">THIS WEEK</div>
              <h1 className="mt-1 max-w-3xl text-4xl font-black leading-[.98] tracking-tight sm:text-6xl">Plans in. Chaos out.</h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-zinc-600 sm:text-base">The next hang, what everyone wants to do, and who owes who. All in one spot.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/events" className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16} /> New event</Link>
                <Link href="/dashboard/ideas" className="brutal-btn rounded-lg bg-white px-4 py-3 text-sm"><Lightbulb size={16} /> Drop an idea</Link>
              </div>
            </div>
            <div className="hero-scene" aria-hidden="true">
              <div className="hero-orb orb-a" />
              <div className="hero-orb orb-b" />
              <div className="hero-card back-card"><div className="text-[9px] font-black tracking-[.16em]">NEXT UP</div><div className="mt-2 text-lg font-black">Santa Cruz</div><div className="mt-1 text-[10px] font-medium text-zinc-600">Aug 29 · 6 going</div></div>
              <div className="hero-card front-card"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-blue"><MapPin size={18}/></div><span className="rounded-full border-2 border-[#1a1a1a] bg-white px-2 py-1 text-[9px] font-black">SAT</span></div><div className="mt-4 text-2xl font-black">Beach day</div><div className="mt-1 text-xs font-medium text-zinc-500">Leave 10:30 AM</div><div className="mt-4 flex -space-x-2">{["R","A","N","S","+2"].map((letter, i) => <div key={i} className={`grid h-7 w-7 place-items-center rounded-full border-2 border-[#1a1a1a] text-[9px] font-black ${i % 2 ? "bg-brand-mint" : "bg-brand-peach"}`}>{letter}</div>)}</div></div>
            </div>
          </section>

          <section className="stats-row">
            {[
              ["UPCOMING", "3", "events", CalendarDays, "bg-brand-blue", "/dashboard/events"],
              ["YOU’RE OWED", "$31", "from 2 people", CircleDollarSign, "bg-brand-mint", "/dashboard/expenses"],
              ["IDEAS", "12", "to vote on", Lightbulb, "bg-brand-lemon", "/dashboard/ideas"],
              ["MEMBERS", "8", "in your crew", Users, "bg-brand-peach", "/account"],
            ].map(([label, value, sub, Icon, bg, href]) => {
              const I = Icon as typeof CalendarDays
              return <Link key={label as string} href={href as string} className="stat-card"><div className={`stat-icon ${bg}`}><I size={18}/></div><div className="mt-4 text-[9px] font-black tracking-[.18em] text-zinc-400">{label}</div><div className="mt-1 text-3xl font-black">{value}</div><div className="text-xs font-medium text-zinc-500">{sub}</div><ChevronRight size={15} className="stat-arrow" /></Link>
            })}
          </section>

          <section className="main-grid">
            <div className="space-y-6">
              <section className="panel panel-large">
                <div className="panel-head"><div><div className="eyebrow">UP NEXT</div><h2 className="panel-title">Events</h2></div><Link href="/dashboard/events" className="panel-link">View all <ChevronRight size={14}/></Link></div>
                <div className="event-stack">{events.map((event, index) => <Link key={event.name} href="/dashboard/events" className="event-row"><div className={`event-date ${event.color}`}><span className="text-[9px] font-black uppercase">{index === 0 ? "SAT" : index === 1 ? "SEP" : "FRI"}</span><span className="text-lg font-black">{event.date.replace("Sep ", "").replace("Aug ", "")}</span></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{event.name}</div><div className="mt-1 flex items-center gap-2 text-xs text-zinc-500"><Users size={12}/> {event.detail}<span>·</span><Clock3 size={12}/> planned</div></div><ChevronRight size={18} className="text-zinc-400"/></Link>)}</div>
                <Link href="/dashboard/events" className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500 transition hover:border-[#1a1a1a] hover:bg-brand-cream hover:text-black"><Plus size={14} className="mr-2"/> Add an event</Link>
              </section>

              <section className="panel">
                <div className="panel-head"><div><div className="eyebrow">BRAIN DUMP</div><h2 className="panel-title">Ideas</h2></div><Link href="/dashboard/ideas" className="panel-link">All ideas <ChevronRight size={14}/></Link></div>
                <div className="idea-grid">{ideas.map(([name, votes], i) => <Link key={name} href="/dashboard/ideas" className="idea-card"><div className="idea-number">0{i + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{name}</div><div className="mt-1 text-[10px] text-zinc-500">{votes} · open vote</div></div><div className="idea-pill">↗</div></Link>)}</div>
              </section>
            </div>

            <aside className="right-rail">
              <section className="panel crew-pulse"><div className="panel-head"><div><div className="eyebrow">CREW PULSE</div><h2 className="panel-title">Right now</h2></div><span className="live-chip"><span className="h-1.5 w-1.5 rounded-full bg-green-500"/> LIVE</span></div><div className="space-y-3"><div className="rail-card bg-brand-lemon"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-white"><MessageCircle size={16}/></div><div><div className="text-[11px] font-black">Group chat energy</div><div className="text-[10px] font-medium text-zinc-500">4 people active</div></div></div><div className="mt-4 text-sm font-black">“Tahoe?”</div><div className="mt-2 flex gap-2"><button className="mini-action bg-brand-mint">Yes</button><button className="mini-action bg-white">Maybe</button></div></div><div className="rail-card"><div className="flex items-center justify-between"><div className="text-[9px] font-black tracking-[.16em] text-zinc-400">UPCOMING COST</div><CircleDollarSign size={16}/></div><div className="mt-2 text-2xl font-black">$68</div><div className="text-xs text-zinc-500">Fall Camping · per person</div></div></div></section>

              <section className="panel"><div className="panel-head"><div><div className="eyebrow">RECENT</div><h2 className="panel-title">Activity</h2></div><Bell size={15} className="text-zinc-400"/></div><div className="space-y-4">{activity.map(([text, time, Icon]) => { const I = Icon as typeof CalendarDays; return <div key={text as string} className="activity-row"><div className="activity-icon"><I size={14}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-black">{text}</div><div className="text-[10px] text-zinc-500">{time}</div></div></div> })}</div></section>

              <section className="panel quick-panel"><div className="eyebrow">QUICK TOOLS</div><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/dashboard/events" className="quick-tool bg-brand-blue"><CalendarDays size={16}/><span>Plan</span></Link><Link href="/dashboard/ideas" className="quick-tool bg-brand-lemon"><Lightbulb size={16}/><span>Vote</span></Link><Link href="/dashboard/expenses" className="quick-tool bg-brand-mint"><WalletCards size={16}/><span>Split</span></Link><Link href="/dashboard/photos" className="quick-tool bg-brand-peach"><Camera size={16}/><span>Share</span></Link></div></section>
            </aside>
          </section>
        </div>
      </section>

      <nav className="mobile-nav sm:hidden">{nav.map(([href, label, Icon]) => { const I = Icon as typeof Home; return <Link key={href} href={href}><I size={17}/><span>{label}</span></Link> })}</nav>
    </main>
  )
}
