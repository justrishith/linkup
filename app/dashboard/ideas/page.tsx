"use client"

import { FormEvent, useEffect, useState } from 'react'
import { Lightbulb, Plus, ThumbsUp, X } from 'lucide-react'
import DashboardShell from '../_components/shell'

type Idea = { id:string; title:string; description?:string|null; category?:string|null; status:string }
type GroupRow = { group_id:string; groups:{name:string}|null }

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({title:'',description:'',category:''})

  async function load(){ const [g,i]=await Promise.all([fetch('/api/groups'),fetch('/api/ideas')]); const gd=await g.json().catch(()=>({})); const id=await i.json().catch(()=>({})); if(g.ok)setGroups(gd.groups||[]); if(i.ok)setIdeas(id.ideas||[]) }
  useEffect(()=>{load().catch(()=>{})},[])

  async function addIdea(e:FormEvent){e.preventDefault();setBusy(true);setError('');const groupId=groups[0]?.group_id;if(!groupId){setError('Create a crew first.');setBusy(false);return}const r=await fetch('/api/ideas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({group_id:groupId,...form})});const d=await r.json().catch(()=>({}));if(!r.ok)setError(d.error||'Could not add idea');else{setIdeas([d.idea,...ideas]);setForm({title:'',description:'',category:''});setOpen(false)}setBusy(false)}

  async function vote(id:string){const r=await fetch('/api/ideas/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ideaId:id})});if(!r.ok){const d=await r.json().catch(()=>({}));setError(d.error||'Vote failed');return}load().catch(()=>{})}

  return <DashboardShell title="Ideas" eyebrow="BRAIN DUMP">
    <div className="mb-5 flex items-center justify-between gap-3"><div><p className="text-sm font-medium text-zinc-500">Put something out there. Let the crew pick.</p>{groups[0]?.groups?.name&&<p className="mt-1 text-[10px] font-black uppercase tracking-[.14em] text-zinc-400">{groups[0].groups.name}</p>}</div><button onClick={()=>setOpen(true)} className="brutal-btn rounded-lg bg-brand-lemon px-4 py-3 text-sm"><Plus size={16}/> Add idea</button></div>
    {open&&<div className="mb-5 brutal-card p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">New idea</h2><button onClick={()=>setOpen(false)}><X size={18}/></button></div><form onSubmit={addIdea} className="space-y-3"><input className="brutal-input w-full rounded-lg px-3 py-3 text-sm" placeholder="What should we do?" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><input className="brutal-input w-full rounded-lg px-3 py-3 text-sm" placeholder="Category, like trip or hangout" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><textarea className="brutal-input w-full rounded-lg px-3 py-3 text-sm" rows={3} placeholder="A little context" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>{error&&<div className="rounded-lg border-2 border-[#1a1a1a] bg-brand-coral px-3 py-2 text-xs font-bold">{error}</div>}<button disabled={busy} className="brutal-btn w-full justify-center rounded-lg bg-brand-mint px-4 py-3 text-sm">{busy?'Saving…':'Add idea'}<Plus size={15}/></button></form></div>}
    {ideas.length===0?<div className="brutal-card p-10 text-center"><Lightbulb className="mx-auto" size={28}/><h2 className="mt-4 text-2xl font-black">Your board is empty.</h2><p className="mt-2 text-sm text-zinc-500">Be the first person to throw something into the mix.</p></div>:<div className="space-y-3">{ideas.map((idea,i)=><div key={idea.id} className="brutal-card flex items-center gap-4 p-5"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-lemon shadow-[3px_3px_0_#1a1a1a]"><Lightbulb size={20}/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-black text-zinc-400">0{i+1} · {idea.category||'Idea'}</div><div className="mt-1 text-base font-black">{idea.title}</div><div className="mt-1 text-xs font-medium text-zinc-500">{idea.description||'No extra details.'}</div></div><button onClick={()=>vote(idea.id)} className="flex shrink-0 items-center gap-2 rounded-lg border-2 border-[#1a1a1a] bg-white px-3 py-2 text-xs font-black hover:bg-brand-lemon"><ThumbsUp size={14}/> Vote</button></div>)}</div>}
  </DashboardShell>
}
