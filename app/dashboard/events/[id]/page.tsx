"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin, Users } from 'lucide-react'
import DashboardShell from '../../_components/shell'

type EventItem = { id:string; name:string; description?:string|null; starts_at?:string|null; ends_at?:string|null; location?:string|null; status:string }
type Task = { id:string; title:string; completed:boolean; assigned_to?:string|null }

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventItem|null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/events/${params.id}`).then(r=>r.json()).then(data=>{ if (data.event) setEvent(data.event); else setError(data.error||'Event not found') }).catch(()=>setError('Could not load event'))
  }, [params.id])

  if (error) return <DashboardShell><div className="brutal-card p-10 text-center"><h1 className="text-2xl font-black">{error}</h1><Link href="/dashboard/events" className="brutal-btn mt-5 inline-flex rounded-lg bg-brand-blue px-4 py-3 text-sm"><ArrowLeft size={16}/> Back to events</Link></div></DashboardShell>
  if (!event) return <DashboardShell><div className="brutal-card p-10 text-center">Loading event…</div></DashboardShell>

  return <DashboardShell>
    <Link href="/dashboard/events" className="mb-5 inline-flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-black"><ArrowLeft size={15}/> Events</Link>
    <section className="brutal-card overflow-hidden">
      <div className="bg-brand-blue p-6 sm:p-8"><div className="text-[10px] font-black tracking-[.16em]">EVENT</div><h1 className="mt-2 text-4xl font-black">{event.name}</h1><p className="mt-3 max-w-2xl text-sm font-medium text-zinc-700">{event.description || 'No description yet.'}</p></div>
      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
        <div className="rounded-xl border-2 border-[#1a1a1a] bg-white p-4"><CalendarDays size={18}/><div className="mt-3 text-xs font-black text-zinc-500">WHEN</div><div className="mt-1 text-sm font-black">{event.starts_at ? new Date(event.starts_at).toLocaleString([], {dateStyle:'medium', timeStyle:'short'}) : 'TBD'}</div></div>
        <div className="rounded-xl border-2 border-[#1a1a1a] bg-white p-4"><MapPin size={18}/><div className="mt-3 text-xs font-black text-zinc-500">WHERE</div><div className="mt-1 text-sm font-black">{event.location || 'TBD'}</div></div>
        <div className="rounded-xl border-2 border-[#1a1a1a] bg-white p-4"><Users size={18}/><div className="mt-3 text-xs font-black text-zinc-500">STATUS</div><div className="mt-1 text-sm font-black">{event.status}</div></div>
      </div>
    </section>
    <section className="mt-6 brutal-card p-5 sm:p-7"><div className="flex items-center justify-between"><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-500">DO THIS NEXT</div><h2 className="mt-1 text-2xl font-black">Tasks</h2></div><span className="text-xs font-black text-zinc-400">{tasks.filter(t=>t.completed).length}/{tasks.length || 0} done</span></div>{tasks.length===0?<p className="mt-5 text-sm text-zinc-500">No tasks yet. Task creation is the next layer of the event planner.</p>:<div className="mt-5 space-y-3">{tasks.map(task=><div key={task.id} className="flex items-center gap-3"><CheckCircle2 className={task.completed?'text-green-600':'text-zinc-300'} size={18}/><span className="text-sm font-bold">{task.title}</span></div>)}</div>}</section>
  </DashboardShell>
}
