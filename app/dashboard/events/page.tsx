import Link from 'next/link'
import { CalendarDays, ChevronRight, Plus, Users } from 'lucide-react'
import DashboardShell from '../_components/shell'

const events = [
  { name: 'Santa Cruz Beach Day', date: 'Aug 29', detail: '6 going · $24/person', color: 'bg-brand-blue' },
  { name: 'Fall Camping', date: 'Sep 12–14', detail: '8 going · $68/person', color: 'bg-brand-mint' },
  { name: 'Movie + Dinner', date: 'Sep 19', detail: '5 going · $15/person', color: 'bg-brand-peach' },
]

export default function EventsPage() {
  return <DashboardShell title="Events" eyebrow="PLAN THE NEXT THING">
    <div className="mb-5 flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-zinc-500">Everything your crew has planned, in one timeline.</p>
      <button className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16}/> New event</button>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {events.map((event) => <Link key={event.name} href="/dashboard/events" className="brutal-card group p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] ${event.color} shadow-[3px_3px_0_#1a1a1a]`}><CalendarDays size={20}/></div>
          <div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{event.date}</div><h2 className="mt-1 text-xl font-black">{event.name}</h2><p className="mt-1 text-xs font-medium text-zinc-500">{event.detail}</p></div>
          <ChevronRight className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-black" size={19}/>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t-2 border-zinc-100 pt-4 text-xs font-bold text-zinc-500"><Users size={14}/> Shared with the crew</div>
      </Link>)}
    </div>
  </DashboardShell>
}
