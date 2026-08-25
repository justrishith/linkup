"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CalendarDays, Camera, ChevronRight, CircleDollarSign, Compass, Lightbulb, Plus, Users, WalletCards } from "lucide-react"

const events = [
  { name: "Santa Cruz Beach Day", date: "Aug 29", detail: "6 going · $24/person", color: "bg-brand-blue" },
  { name: "Fall Camping", date: "Sep 12–14", detail: "8 going · $68/person", color: "bg-brand-mint" },
  { name: "Movie + Dinner", date: "Sep 19", detail: "5 going · $15/person", color: "bg-brand-peach" },
]

const ideas = [["Lake Tahoe weekend", "6 votes"], ["Sunrise hike", "5 votes"], ["Bowling tournament", "4 votes"]]
const activity = [["Nikhil added a new event", "2h ago", CalendarDays], ["Ava uploaded 18 photos", "yesterday", Camera], ["You were added to Fall Camping", "yesterday", Users], ["Sam paid you $12.50", "2d ago", WalletCards]]

export default function DashboardPage() {
  const [profile, setProfile] = useState({ name: "Rishi", avatar: "R" })

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null).then((data) => {
      if (data?.profile?.display_name) setProfile({ name: data.profile.display_name, avatar: data.profile.display_name.slice(0, 1).toUpperCase() })
    }).catch(() => {})
  }, [])

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <header className="sticky top-0 z-20 border-b-2 border-[#1a1a1a] bg-[#fafaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3 sm:px-6 sm:gap-7">
          <Link href="/dashboard" className="flex items-center gap-3 mr-2"><div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div><div className="text-xl font-black tracking-tight">linkup</div></Link>
          <nav className="hidden flex-1 items-center gap-1 sm:flex">
            {[["/dashboard","Home"],["/dashboard/events","Events"],["/dashboard/ideas","Ideas"],["/dashboard/expenses","Expenses"],["/dashboard/photos","Photos"]].map(([href,label]) => <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white hover:text-black">{label}</Link>)}
          </nav>
          <Link href="/account" className="ml-auto flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white" aria-label="Open account"><div className="hidden text-right sm:block"><div className="text-xs font-bold">{profile.name}</div><div className="text-[10px] text-zinc-500">Account</div></div><div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xs font-black">{profile.avatar}</div></Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        <section className="hero-grid anim-1 overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white p-6 shadow-[6px_6px_0_#1a1a1a] sm:p-9">
          <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[11px] font-black shadow-[2px_2px_0_#1a1a1a]"><span className="h-2 w-2 rounded-full bg-green-500" /> YOUR CREW</div><h1 className="text-4xl font-black tracking-tight sm:text-6xl">Everything your group does, in one place.</h1><p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600 sm:text-lg">Plan the next thing, figure out who’s going, split the money, and keep the photos. Linkup is the shared home for your crew.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/events" className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16}/> New event</Link><Link href="/dashboard/ideas" className="brutal-btn rounded-lg bg-white px-4 py-3 text-sm"><Lightbulb size={16}/> Add idea</Link></div></div>
        </section>

        <section className="anim-2 mt-7 grid gap-4 sm:grid-cols-4">
          {[["UPCOMING","3","events",CalendarDays,"bg-brand-blue","/dashboard/events"],["YOU’RE OWED","$31","from 2 people",CircleDollarSign,"bg-brand-mint","/dashboard/expenses"],["IDEAS","12","to vote on",Lightbulb,"bg-brand-lemon","/dashboard/ideas"],["MEMBERS","8","in your crew",Users,"bg-brand-peach","/account"]].map(([label,value,sub,Icon,bg,href])=>{const I=Icon as typeof CalendarDays;return <Link key={label as string} href={href as string} className="brutal-card p-4 transition hover:-translate-y-0.5"><div className={`mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] ${bg}`}><I size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div><div className="text-xs font-medium text-zinc-500">{sub}</div></Link>})}
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.9fr]">
          <div className="brutal-card anim-3 p-5 sm:p-6"><div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">UP NEXT</div><h2 className="mt-1 text-2xl font-black">Events</h2></div><Link href="/dashboard/events" className="text-xs font-black text-zinc-500 hover:text-black">View all →</Link></div><div className="space-y-3">{events.map((event)=><Link key={event.name} href="/dashboard/events" className="group flex w-full items-center gap-4 rounded-xl border-2 border-transparent p-2 text-left transition hover:border-[#1a1a1a] hover:bg-[#fafaf8]"><div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] ${event.color} shadow-[3px_3px_0_#1a1a1a]`}><CalendarDays size={19}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{event.date}</div><div className="truncate text-sm font-black">{event.name}</div><div className="mt-1 text-xs font-medium text-zinc-500">{event.detail}</div></div><ChevronRight size={18} className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-black"/></Link>)}</div></div>

          <div className="brutal-card anim-3 p-5 sm:p-6"><div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">BRAIN DUMP</div><h2 className="mt-1 text-2xl font-black">Ideas</h2></div><Link href="/dashboard/ideas" className="text-xs font-black text-zinc-500 hover:text-black">All ideas →</Link></div><div className="divide-y-2 divide-zinc-100 border-y-2 border-zinc-100">{ideas.map(([name,votes],i)=><Link key={name} href="/dashboard/ideas" className="flex w-full items-center gap-3 py-4 text-left"><span className="text-[10px] font-black text-zinc-400">0{i+1}</span><span className="min-w-0 flex-1 text-sm font-black">{name}</span><span className="rounded-full bg-brand-lemon px-2 py-1 text-[10px] font-black">{votes}</span></Link>)}</div><Link href="/dashboard/ideas" className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500 hover:border-[#1a1a1a] hover:text-black"><Plus size={15}/> Add an idea</Link></div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Link href="/dashboard/expenses" className="brutal-card block p-5 sm:p-6 transition hover:-translate-y-0.5"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">MONEY</div><h2 className="mt-1 text-2xl font-black">Expenses</h2></div><span className="text-xs font-black text-zinc-500">Open →</span></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-coral p-4"><div className="text-xs font-bold text-zinc-600">You owe</div><div className="mt-2 text-2xl font-black">$12.50</div><div className="mt-1 text-xs font-medium text-zinc-600">to Alex</div></div><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-mint p-4"><div className="text-xs font-bold text-zinc-600">Owed to you</div><div className="mt-2 text-2xl font-black">$31.00</div><div className="mt-1 text-xs font-medium text-zinc-600">from 2 people</div></div></div></Link>

          <Link href="/dashboard/photos" className="brutal-card block p-5 sm:p-6 transition hover:-translate-y-0.5"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">MEMORIES</div><h2 className="mt-1 text-2xl font-black">Photos</h2></div><span className="text-xs font-black text-zinc-500">Open →</span></div><div className="grid grid-cols-3 gap-3">{['bg-brand-blue','bg-brand-mint','bg-brand-peach'].map((bg,i)=><div key={i} className={`grid aspect-square place-items-center rounded-xl border-2 border-[#1a1a1a] ${bg}`}><Camera size={20}/></div>)}</div><div className="mt-4 text-xs font-medium text-zinc-500">18 photos in Santa Cruz · 42 in Fall Camping · 96 in Summer 2026</div></Link>
        </section>

        <section className="mt-6 brutal-card p-5 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">RECENT</div><h2 className="mt-1 text-2xl font-black">Activity</h2></div><div className="text-xs font-black text-zinc-400">Live feed</div></div><div className="grid gap-4 sm:grid-cols-2">{activity.map(([text,time,Icon])=>{const I=Icon as typeof CalendarDays;return <div key={text as string} className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><I size={15}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-black">{text}</div><div className="text-[10px] font-medium text-zinc-500">{time}</div></div></div>})}</div></section>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t-2 border-[#1a1a1a] bg-[#fafaf8] px-2 py-2 sm:hidden">{[["/dashboard","Home",Compass],["/dashboard/events","Events",CalendarDays],["/dashboard/ideas","Ideas",Lightbulb],["/dashboard/expenses","Money",WalletCards],["/dashboard/photos","Photos",Camera]].map(([href,label,Icon])=>{const I=Icon as typeof Compass;return <Link key={href as string} href={href as string} className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black text-zinc-500 hover:bg-white hover:text-black"><I size={17}/>{label as string}</Link>})}</nav>
    </main>
  )
}
