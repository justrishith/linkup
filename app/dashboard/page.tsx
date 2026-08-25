"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Bell, CalendarDays, Camera, ChevronRight, CircleDollarSign, Clock3, Home, Lightbulb, MapPin, MessageCircle, Plus, Settings, Sparkles, Users, WalletCards } from "lucide-react"

const nav = [["/dashboard", "Home", Home], ["/dashboard/events", "Events", CalendarDays], ["/dashboard/ideas", "Ideas", Lightbulb], ["/dashboard/expenses", "Expenses", WalletCards], ["/dashboard/photos", "Photos", Camera]] as const

type Profile = { display_name?: string | null }
type GroupRow = { group_id: string; member_count?: number; groups: { id: string; name: string } | null }
type EventItem = { id: string; name: string; starts_at?: string | null; location?: string | null }
type IdeaItem = { id: string; title: string; category?: string | null }
type Expense = { id: string; amount: number; description: string; currency: string }

function formatDate(value?: string | null) { return value ? new Date(value).toLocaleDateString([], { month: "short", day: "numeric" }) : "TBD" }
function formatDay(value?: string | null) { return value ? new Date(value).toLocaleDateString([], { weekday: "short" }).toUpperCase() : "TBD" }

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile>({})
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    Promise.all([fetch("/api/auth/me"), fetch("/api/groups"), fetch("/api/events"), fetch("/api/ideas"), fetch("/api/expenses")]).then(async ([pr, gr, er, ir, xr]) => {
      const [p, g, e, i, x] = await Promise.all([pr.json().catch(() => ({})), gr.json().catch(() => ({})), er.json().catch(() => ({})), ir.json().catch(() => ({})), xr.json().catch(() => ({}))])
      if (pr.ok) setProfile(p.profile || {})
      if (gr.ok) setGroups(g.groups || [])
      if (er.ok) setEvents(e.events || [])
      if (ir.ok) setIdeas(i.ideas || [])
      if (xr.ok) setExpenses(x.expenses || [])
    }).catch(() => {})
  }, [])

  const crew = groups[0]?.groups
  const memberCount = groups[0]?.member_count ?? 0
  const upcoming = useMemo(() => events.filter(e => !e.starts_at || new Date(e.starts_at) >= new Date()).slice(0, 3), [events])
  const topIdea = ideas[0]
  const totalSpending = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const firstName = (profile.display_name || "there").split(" ")[0]
  const today = new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }).toUpperCase()

  async function voteTopIdea() {
    if (!topIdea || voting) return
    setVoting(true)
    try { await fetch("/api/ideas/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId: topIdea.id }) }) } finally { setVoting(false) }
  }

  return <main className="dashboard-shell min-h-screen text-[#111]">
    <aside className="app-sidebar hidden lg:flex">
      <Link href="/dashboard" className="brand-lockup"><span className="logo-mark" aria-hidden="true"><span /></span><span className="text-xl font-black tracking-tight">linkup</span></Link>
      <Link href="/dashboard" className="mt-8 rounded-2xl border-2 border-[#1a1a1a] bg-white p-3 shadow-[4px_4px_0_#1a1a1a] transition hover:-translate-y-0.5">
        <div className="text-[9px] font-black tracking-[.18em] text-zinc-400">YOUR CREW</div>
        <div className="mt-2 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-blue font-black">{crew?.name?.slice(0,1).toUpperCase() || "L"}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{crew?.name || "Create a crew"}</div><div className="text-[10px] font-medium text-zinc-500">{memberCount} member{memberCount === 1 ? "" : "s"}</div></div><ChevronRight size={16} className="text-zinc-400" /></div>
      </Link>
      <nav className="mt-6 space-y-1">{nav.map(([href, label, Icon], index) => { const I = Icon as typeof Home; return <Link key={href} href={href} className={`sidebar-link ${index === 0 ? "active" : ""}`}><I size={17}/><span>{label}</span>{index === 1 && upcoming.length > 0 && <span className="ml-auto rounded-full bg-brand-lemon px-2 py-0.5 text-[9px] font-black">{upcoming.length}</span>}</Link> })}</nav>
      <div className="mt-7 px-2 text-[9px] font-black tracking-[.18em] text-zinc-400">TOOLS</div>
      <nav className="mt-2 space-y-1"><Link href="/dashboard/ideas?new=1" className="sidebar-link"><Sparkles size={17}/><span>New idea</span></Link><Link href="/dashboard/photos" className="sidebar-link"><Camera size={17}/><span>Memories</span></Link><Link href="/account" className="sidebar-link"><Settings size={17}/><span>Settings</span></Link></nav>
    </aside>

    <section className="dashboard-main">
      <header className="app-topbar">
        <div className="flex items-center gap-3 lg:hidden"><Link href="/dashboard" className="brand-lockup"><span className="logo-mark" aria-hidden="true"><span /></span><span className="text-lg font-black">linkup</span></Link></div>
        <div className="hidden md:block"><div className="text-[10px] font-black tracking-[.18em] text-zinc-400">{today}</div><div className="text-sm font-black">{crew?.name || "Your crew"}</div></div>
        <div className="ml-auto flex items-center gap-2"><Link href="/dashboard#activity" className="icon-button hidden sm:grid" aria-label="View activity"><Bell size={17}/></Link><Link href="/account" className="profile-pill"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xs font-black">{(profile.display_name || "A").slice(0,1).toUpperCase()}</span><span className="hidden text-left sm:block"><span className="block text-[11px] font-black">{profile.display_name || "Account"}</span><span className="block text-[9px] text-zinc-500">Profile & settings</span></span></Link></div>
      </header>

      <div className="dashboard-content">
        <section className="hero-workspace">
          <div className="hero-copy"><div className="inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[10px] font-black shadow-[2px_2px_0_#1a1a1a]"><span className="h-2 w-2 rounded-full bg-green-500"/> ACTIVE CREW</div><div className="mt-5 text-[10px] font-black tracking-[.2em] text-zinc-400">THIS WEEK</div><h1 className="mt-1 max-w-3xl text-4xl font-black leading-[.98] tracking-tight sm:text-6xl">Plans in. Chaos out.</h1><p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-zinc-600 sm:text-base">Hey {firstName}. Here’s what your crew has going on.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/events?new=1" className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16}/> New event</Link><Link href="/dashboard/ideas?new=1" className="brutal-btn rounded-lg bg-white px-4 py-3 text-sm"><Lightbulb size={16}/> Drop an idea</Link></div></div>
          <div className="hero-scene" aria-hidden="true"><div className="hero-orb orb-a"/><div className="hero-orb orb-b"/><div className="hero-card back-card"><div className="text-[9px] font-black tracking-[.16em]">NEXT UP</div><div className="mt-2 text-lg font-black">{upcoming[0]?.name || "Nothing planned"}</div><div className="mt-1 text-[10px] font-medium text-zinc-600">{formatDate(upcoming[0]?.starts_at)} · {crew?.name || "your crew"}</div></div><div className="hero-card front-card"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-blue"><MapPin size={18}/></div><span className="rounded-full border-2 border-[#1a1a1a] bg-white px-2 py-1 text-[9px] font-black">{formatDay(upcoming[0]?.starts_at)}</span></div><div className="mt-4 text-2xl font-black">{upcoming[0]?.name || "Make a plan"}</div><div className="mt-1 text-xs font-medium text-zinc-500">{upcoming[0]?.location || "Add a location when you create it"}</div><div className="mt-4 text-[10px] font-black text-zinc-400">{upcoming[0] ? <Link href={`/dashboard/events/${upcoming[0].id}`} className="pointer-events-auto">Open event →</Link> : "Start with New event"}</div></div></div>
        </section>

        <section className="stats-row">{[["UPCOMING",String(upcoming.length),"events",CalendarDays,"bg-brand-blue","/dashboard/events"],["SPENDING",`$${totalSpending.toFixed(0)}`,`${expenses.length} logged`,CircleDollarSign,"bg-brand-mint","/dashboard/expenses"],["IDEAS",String(ideas.length),"to vote on",Lightbulb,"bg-brand-lemon","/dashboard/ideas"],["MEMBERS",String(memberCount),"in your crew",Users,"bg-brand-peach","/account"]].map(([label,value,sub,Icon,bg,href])=>{const I=Icon as typeof CalendarDays;return <Link key={label as string} href={href as string} className="stat-card"><div className={`stat-icon ${bg}`}><I size={18}/></div><div className="mt-4 text-[9px] font-black tracking-[.18em] text-zinc-400">{label}</div><div className="mt-1 text-3xl font-black">{value}</div><div className="text-xs font-medium text-zinc-500">{sub}</div><ChevronRight size={15} className="stat-arrow"/></Link>})}</section>

        <section className="main-grid"><div className="space-y-6">
          <section className="panel panel-large"><div className="panel-head"><div><div className="eyebrow">UP NEXT</div><h2 className="panel-title">Events</h2></div><Link href="/dashboard/events" className="panel-link">View all <ChevronRight size={14}/></Link></div>
            <div className="event-stack">{upcoming.map((event,index)=><Link key={event.id} href={`/dashboard/events/${event.id}`} className="event-row"><div className={`event-date ${index%3===0?"bg-brand-blue":index%3===1?"bg-brand-mint":"bg-brand-peach"}`}><span className="text-[9px] font-black uppercase">{formatDay(event.starts_at)}</span><span className="text-lg font-black">{event.starts_at?new Date(event.starts_at).getDate():"?"}</span></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{event.name}</div><div className="mt-1 flex items-center gap-2 text-xs text-zinc-500"><Clock3 size={12}/>{formatDate(event.starts_at)}<span>·</span>{event.location||"Location TBD"}</div></div><ChevronRight size={18} className="text-zinc-400"/></Link>)}</div>
            <Link href="/dashboard/events?new=1" className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500 transition hover:border-[#1a1a1a] hover:bg-brand-cream hover:text-black"><Plus size={14} className="mr-2"/> Add an event</Link>
          </section>

          <section className="panel"><div className="panel-head"><div><div className="eyebrow">BRAIN DUMP</div><h2 className="panel-title">Ideas</h2></div><Link href="/dashboard/ideas" className="panel-link">All ideas <ChevronRight size={14}/></Link></div><div className="idea-grid">{ideas.slice(0,3).map((idea,i)=><Link key={idea.id} href={`/dashboard/ideas?idea=${encodeURIComponent(idea.id)}`} className="idea-card"><div className="idea-number">0{i+1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{idea.title}</div><div className="mt-1 text-[10px] text-zinc-500">{idea.category||"Idea"} · open vote</div></div><div className="idea-pill">↗</div></Link>)}</div><Link href="/dashboard/ideas?new=1" className="mt-4 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-3 text-xs font-black text-zinc-500 transition hover:border-[#1a1a1a] hover:bg-brand-cream hover:text-black"><Plus size={14} className="mr-2"/> Add an idea</Link></section>
        </div>

        <aside className="right-rail">
          <section className="panel crew-pulse"><div className="panel-head"><div><div className="eyebrow">CREW PULSE</div><h2 className="panel-title">Right now</h2></div><span className="live-chip"><span className="h-1.5 w-1.5 rounded-full bg-green-500"/> LIVE</span></div>{topIdea?<div className="space-y-3"><div className="rail-card bg-brand-lemon"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-white"><MessageCircle size={16}/></div><div><div className="text-[11px] font-black">Top idea</div><div className="text-[10px] font-medium text-zinc-500">{topIdea.category||"Crew idea"}</div></div></div><div className="mt-4 text-sm font-black">{topIdea.title}</div><div className="mt-2 flex gap-2"><button onClick={voteTopIdea} disabled={voting} className="mini-action bg-brand-mint">{voting?"Saving":"Vote"}</button><Link href={`/dashboard/ideas?idea=${encodeURIComponent(topIdea.id)}`} className="mini-action bg-white">Open</Link></div></div><div className="rail-card"><div className="flex items-center justify-between"><div className="text-[9px] font-black tracking-[.16em] text-zinc-400">LOGGED SPENDING</div><CircleDollarSign size={16}/></div><div className="mt-2 text-2xl font-black">${totalSpending.toFixed(2)}</div><div className="text-xs text-zinc-500">Across {expenses.length} expense{expenses.length===1?"":"s"}</div></div></div>:<div className="rail-card bg-brand-lemon"><div className="text-sm font-black">No ideas yet.</div><div className="mt-1 text-xs text-zinc-500">Be the first to throw one in.</div><Link href="/dashboard/ideas?new=1" className="brutal-btn mt-3 w-full justify-center rounded-lg bg-white px-3 py-2 text-xs">Add idea</Link></div>}</section>
          <section id="activity" className="panel"><div className="panel-head"><div><div className="eyebrow">RECENT</div><h2 className="panel-title">Activity</h2></div><Bell size={15} className="text-zinc-400"/></div><div className="space-y-4">{upcoming.length?upcoming.map(event=><div key={event.id} className="activity-row"><div className="activity-icon"><CalendarDays size={14}/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-black">{event.name}</div><div className="text-[10px] text-zinc-500">{formatDate(event.starts_at)} · upcoming</div></div></div>):<div className="text-xs text-zinc-500">Nothing happening yet. Start with an event or idea.</div>}</div></section>
          <section className="panel quick-panel"><div className="eyebrow">QUICK TOOLS</div><div className="mt-3 grid grid-cols-2 gap-2"><Link href="/dashboard/events?new=1" className="quick-tool bg-brand-blue"><CalendarDays size={16}/><span>Plan</span></Link><Link href="/dashboard/ideas?new=1" className="quick-tool bg-brand-lemon"><Lightbulb size={16}/><span>Idea</span></Link><Link href="/dashboard/expenses?new=1" className="quick-tool bg-brand-mint"><WalletCards size={16}/><span>Split</span></Link><Link href="/dashboard/photos" className="quick-tool bg-brand-peach"><Camera size={16}/><span>Share</span></Link></div></section>
        </aside></section>
      </div>
    </section>

    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t-2 border-[#1a1a1a] bg-[#fafaf8] px-2 py-2 lg:hidden">{[["/dashboard","Home",Home],["/dashboard/events","Events",CalendarDays],["/dashboard/ideas","Ideas",Lightbulb],["/dashboard/expenses","Expenses",WalletCards],["/dashboard/photos","Photos",Camera]].map(([href,label,Icon])=>{const I=Icon as typeof Home;return <Link key={href as string} href={href as string} className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] font-black text-zinc-500 hover:bg-white hover:text-black"><I size={17}/>{label as string}</Link>})}</nav>
  </main>
}
