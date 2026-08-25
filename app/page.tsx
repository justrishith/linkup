"use client"

import { useState } from "react"
import { ArrowRight, CalendarDays, Camera, Check, ChevronRight, CircleDollarSign, Compass, Lightbulb, MapPin, Plus, Users, WalletCards } from "lucide-react"

const events = [
  { name: "Santa Cruz Beach Day", date: "Aug 29", detail: "6 going · $24/person", color: "bg-brand-blue" },
  { name: "Fall Camping", date: "Sep 12–14", detail: "8 going · $68/person", color: "bg-brand-mint" },
  { name: "Movie + Dinner", date: "Sep 19", detail: "5 going · $15/person", color: "bg-brand-peach" },
]

const ideas = [
  ["Lake Tahoe weekend", "6 votes"],
  ["Sunrise hike", "5 votes"],
  ["Bowling tournament", "4 votes"],
]

const activity = [
  ["Nikhil added a new event", "2h ago", CalendarDays],
  ["Ava uploaded 18 photos", "yesterday", Camera],
  ["You were added to Fall Camping", "yesterday", Users],
  ["Sam paid you $12.50", "2d ago", WalletCards],
]

export default function HomePage() {
  const [tab, setTab] = useState("home")
  const [showIdea, setShowIdea] = useState(false)

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <header className="sticky top-0 z-20 border-b-2 border-[#1a1a1a] bg-[#fafaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-7 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 mr-2">
            <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div>
            <div className="text-xl font-black tracking-tight">linkup</div>
          </div>
          <nav className="desktop-nav hidden flex-1 items-center gap-1 sm:flex">
            {[["home","Home"],["events","Events"],["ideas","Ideas"],["expenses","Expenses"],["photos","Photos"]].map(([key,label]) => (
              <button key={key} onClick={() => setTab(key)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${tab===key?"bg-[#111] text-white":"text-zinc-600 hover:bg-white hover:text-black"}`}>{label}</button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block"><div className="text-xs font-bold">Rishi</div><div className="text-[10px] text-zinc-500">Crew admin</div></div>
            <div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xs font-black">R</div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        {tab === "home" && <>
          <section className="hero-grid anim-1 overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white p-6 shadow-[6px_6px_0_#1a1a1a] sm:p-9">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[11px] font-black shadow-[2px_2px_0_#1a1a1a]"><span className="h-2 w-2 rounded-full bg-green-500" /> YOUR CREW</div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Everything your group does, in one place.</h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-zinc-600 sm:text-lg">Plan the next thing, figure out who’s going, split the money, and keep the photos. Linkup is the shared home for your crew.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm" onClick={() => setTab("events")}><Plus size={16}/> New event</button>
                <button className="brutal-btn rounded-lg bg-white px-4 py-3 text-sm" onClick={() => setShowIdea(true)}><Lightbulb size={16}/> Add idea</button>
              </div>
            </div>
          </section>

          <section className="anim-2 mt-7 grid gap-4 sm:grid-cols-4">
            {[["UPCOMING","3","events",CalendarDays,"bg-brand-blue"],["YOU’RE OWED","$31","from 2 people",CircleDollarSign,"bg-brand-mint"],["IDEAS","12","to vote on",Lightbulb,"bg-brand-lemon"],["MEMBERS","8","in your crew",Users,"bg-brand-peach"]].map(([label,value,sub,Icon,bg]) => {
              const I = Icon as typeof CalendarDays
              return <div key={label as string} className="brutal-card p-4"><div className={`mb-4 inline-grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] ${bg}`}><I size={17}/></div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">{label}</div><div className="mt-1 text-2xl font-black">{value}</div><div className="text-xs font-medium text-zinc-500">{sub}</div></div>
            })}
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.9fr]">
            <div className="brutal-card anim-3 p-5 sm:p-6">
              <div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">UP NEXT</div><h2 className="mt-1 text-2xl font-black">Events</h2></div><button className="text-xs font-black text-zinc-500 hover:text-black" onClick={() => setTab("events")}>View all →</button></div>
              <div className="space-y-3">
                {events.map((event) => <button key={event.name} onClick={() => setTab("events")} className="group flex w-full items-center gap-4 rounded-xl border-2 border-transparent p-2 text-left transition hover:border-[#1a1a1a] hover:bg-[#fafaf8]"><div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] ${event.color} shadow-[3px_3px_0_#1a1a1a]`}><CalendarDays size={19}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{event.date}</div><div className="truncate text-sm font-black">{event.name}</div><div className="mt-1 text-xs font-medium text-zinc-500">{event.detail}</div></div><ChevronRight size={18} className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-black"/></button>)}
              </div>
            </div>

            <div className="brutal-card anim-3 p-5 sm:p-6">
              <div className="mb-4 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">BRAIN DUMP</div><h2 className="mt-1 text-2xl font-black">Ideas</h2></div><button className="text-xs font-black text-zinc-500 hover:text-black" onClick={() => setTab("ideas")}>All ideas →</button></div>
              <div className="divide-y-2 divide-zinc-100 border-y-2 border-zinc-100">
                {ideas.map(([name,votes],i)=><button key={name} onClick={() => setTab("ideas")} className="flex w-full items-center gap-3 py-4 text-left"><span className="text-[10px] font-black text-zinc-400">0{i+1}</span><span className="min-w-0 flex-1 text-sm font-black">{name}</span><span className="rounded-full bg-brand-lemon px-2 py-1 text-[10px] font-black">{votes}</span></button>)}
              </div>
              <button onClick={() => setShowIdea(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500 hover:border-[#1a1a1a] hover:text-black"><Plus size={15}/> Add an idea</button>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="brutal-card p-5 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">MONEY</div><h2 className="mt-1 text-2xl font-black">Expenses</h2></div><button onClick={() => setTab("expenses")} className="text-xs font-black text-zinc-500">Open →</button></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-coral p-4"><div className="text-xs font-bold text-zinc-600">You owe</div><div className="mt-2 text-2xl font-black">$12.50</div><div className="mt-1 text-xs font-medium text-zinc-600">to Alex</div></div><div className="rounded-xl border-2 border-[#1a1a1a] bg-brand-mint p-4"><div className="text-xs font-bold text-zinc-600">Owed to you</div><div className="mt-2 text-2xl font-black">$31.00</div><div className="mt-1 text-xs font-medium text-zinc-600">from 2 people</div></div></div></div>

            <div className="brutal-card p-5 sm:p-6"><div className="mb-5 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">RECENT</div><h2 className="mt-1 text-2xl font-black">Activity</h2></div><div className="text-xs font-black text-zinc-400">Live feed</div></div><div className="space-y-4">{activity.map(([text,time,Icon])=>{const I=Icon as typeof CalendarDays;return <div key={text as string} className="flex items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><I size={15}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-black">{text}</div><div className="text-[10px] font-medium text-zinc-500">{time}</div></div></div>})}</div></div>
          </section>
        </>}

        {tab !== "home" && <section className="anim-1"><div className="mb-6 flex items-end justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">LINKUP</div><h1 className="mt-1 text-4xl font-black capitalize">{tab}</h1><p className="mt-2 text-sm font-medium text-zinc-500">This section is ready for the real data layer next.</p></div><button className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm" onClick={() => setTab("home")}><ArrowRight size={16} className="rotate-180"/> Back home</button></div><div className="grid gap-4 md:grid-cols-2">{Array.from({length:4}).map((_,i)=><div key={i} className="brutal-card p-6"><div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-white shadow-[3px_3px_0_#1a1a1a]"><Compass size={20}/></div><div className="text-lg font-black">{tab === "events" ? events[i % events.length].name : tab === "ideas" ? ideas[i % ideas.length][0] : tab === "expenses" ? "Shared expense" : "Shared album"}</div><p className="mt-2 text-sm font-medium text-zinc-500">The real {tab} data will live here once Supabase is connected.</p></div>)}</div></section>}
      </div>

      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-30 hidden border-t-2 border-[#1a1a1a] bg-[#fafaf8] px-2 py-2 sm:hidden">
        {[["home","Home",Compass],["events","Events",CalendarDays],["ideas","Ideas",Lightbulb],["expenses","Money",WalletCards],["photos","Photos",Camera]].map(([key,label,Icon])=>{const I=Icon as typeof Compass;return <button key={key as string} onClick={()=>setTab(key as string)} className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black ${tab===key?"bg-[#111] text-white":"text-zinc-500"}`}><I size={17}/>{label as string}</button>})}
      </nav>

      {showIdea && <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4" onClick={() => setShowIdea(false)}><div className="brutal-card w-full max-w-md p-6" onClick={(e)=>e.stopPropagation()}><div className="flex items-start justify-between"><div><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">NEW IDEA</div><h2 className="mt-1 text-2xl font-black">What should the crew do?</h2></div><button onClick={()=>setShowIdea(false)} className="rounded-lg border-2 border-[#1a1a1a] px-2 py-1 text-sm font-black">×</button></div><input autoFocus className="brutal-input mt-5 w-full rounded-lg px-4 py-3 text-sm outline-none" placeholder="e.g. Lake Tahoe weekend"/><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setShowIdea(false)} className="rounded-lg border-2 border-[#1a1a1a] bg-white px-4 py-2 text-sm font-black">Cancel</button><button onClick={()=>setShowIdea(false)} className="brutal-btn rounded-lg bg-brand-blue px-4 py-2 text-sm">Add idea</button></div></div></div>}
    </main>
  )
}
