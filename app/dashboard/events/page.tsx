"use client"

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, ChevronRight, Plus, Users, X } from 'lucide-react'
import DashboardShell from '../_components/shell'

type GroupRow = { group_id: string; role: string; groups: { id: string; name: string } | null }
type EventItem = { id: string; name: string; description?: string | null; starts_at?: string | null; ends_at?: string | null; location?: string | null; status: string }

export default function EventsPage() {
  const searchParams = useSearchParams()
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [open, setOpen] = useState(searchParams.get('new') === '1')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', starts_at: '', ends_at: '', location: '' })

  async function load() {
    const [g, e] = await Promise.all([fetch('/api/groups'), fetch('/api/events')])
    const gd = await g.json().catch(() => ({})); const ed = await e.json().catch(() => ({}))
    if (g.ok) setGroups(gd.groups || [])
    if (e.ok) setEvents(ed.events || [])
  }
  useEffect(() => { load().catch(() => {}) }, [])

  async function createEvent(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const groupId = groups[0]?.group_id
    if (!groupId) { setError('Create a crew first.'); setBusy(false); return }
    const response = await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, group_id: groupId }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'Could not create event')
    else { setEvents((current) => [...current, data.event].sort((a,b) => String(a.starts_at||'').localeCompare(String(b.starts_at||'')))); setForm({ name:'', description:'', starts_at:'', ends_at:'', location:'' }); setOpen(false) }
    setBusy(false)
  }

  return <DashboardShell title="Events" eyebrow="PLAN THE NEXT THING">
    <div className="mb-5 flex items-center justify-between gap-3">
      <div><p className="text-sm font-medium text-zinc-500">Your crew’s plans, with the actual details attached.</p>{groups[0]?.groups?.name && <p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-zinc-400">{groups[0].groups.name}</p>}</div>
      <button onClick={() => setOpen(true)} className="brutal-btn rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16}/> New event</button>
    </div>

    {open && <div className="mb-5 brutal-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">New event</h2><button onClick={() => setOpen(false)} aria-label="Close"><X size={18}/></button></div>
      <form onSubmit={createEvent} className="grid gap-3 sm:grid-cols-2">
        <input className="brutal-input rounded-lg px-3 py-3 text-sm" placeholder="Event name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="brutal-input rounded-lg px-3 py-3 text-sm" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
        <input className="brutal-input rounded-lg px-3 py-3 text-sm" type="datetime-local" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/>
        <input className="brutal-input rounded-lg px-3 py-3 text-sm" type="datetime-local" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})}/>
        <textarea className="brutal-input rounded-lg px-3 py-3 text-sm sm:col-span-2" placeholder="What are you doing?" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        {error && <div className="rounded-lg border-2 border-[#1a1a1a] bg-brand-coral px-3 py-2 text-xs font-bold sm:col-span-2">{error}</div>}
        <button disabled={busy} className="brutal-btn rounded-lg bg-brand-mint px-4 py-3 text-sm sm:col-span-2">{busy ? 'Saving…' : 'Create event'} <ChevronRight size={16}/></button>
      </form>
    </div>}

    {events.length === 0 ? <div className="brutal-card p-10 text-center"><CalendarDays className="mx-auto" size={28}/><h2 className="mt-4 text-2xl font-black">Nothing planned yet.</h2><p className="mt-2 text-sm text-zinc-500">Create the first thing your crew is doing.</p><button onClick={() => setOpen(true)} className="brutal-btn mt-5 rounded-lg bg-brand-blue px-4 py-3 text-sm"><Plus size={16}/> New event</button></div> : <div className="grid gap-4 lg:grid-cols-2">{events.map((event) => <Link key={event.id} href={`/dashboard/events/${event.id}`} className="brutal-card group p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-blue shadow-[3px_3px_0_#1a1a1a]"><CalendarDays size={20}/></div>
        <div className="min-w-0 flex-1"><div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{event.starts_at ? new Date(event.starts_at).toLocaleString([], { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }) : 'Date TBD'}</div><h2 className="mt-1 text-xl font-black">{event.name}</h2><p className="mt-1 truncate text-xs font-medium text-zinc-500">{event.location || event.description || 'No details yet'}</p></div>
        <ChevronRight className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-black" size={19}/>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t-2 border-zinc-100 pt-4 text-xs font-bold text-zinc-500"><Users size={14}/> Open event</div>
    </Link>)}</div>}
  </DashboardShell>
}
