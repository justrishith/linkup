"use client"

import { FormEvent, useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import DashboardShell from '../_components/shell'

type GroupRow={group_id:string;role:string;groups:{id:string;name:string;description?:string|null}|null}

export default function GroupsPage(){
 const [groups,setGroups]=useState<GroupRow[]>([]);const [name,setName]=useState('');const [description,setDescription]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('')
 async function load(){const r=await fetch('/api/groups');const d=await r.json().catch(()=>({}));if(r.ok)setGroups(d.groups||[])}
 useEffect(()=>{load().catch(()=>{})},[])
 async function create(e:FormEvent){e.preventDefault();setBusy(true);setError('');const r=await fetch('/api/groups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description})});const d=await r.json().catch(()=>({}));if(!r.ok)setError(d.error||'Could not create crew');else{setGroups([{group_id:d.group.id,role:'owner',groups:d.group},...groups]);setName('');setDescription('')}setBusy(false)}
 return <DashboardShell title="Your crews" eyebrow="KEEP YOUR PEOPLE TOGETHER"><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="brutal-card p-6 sm:p-8"><Users size={24}/><h2 className="mt-4 text-3xl font-black">Make a crew.</h2><p className="mt-2 text-sm leading-6 text-zinc-500">Give your people one place to plan instead of 47 messages about the same weekend.</p><form onSubmit={create} className="mt-6 space-y-3"><input className="brutal-input w-full rounded-lg px-3 py-3 text-sm" placeholder="Crew name" required value={name} onChange={e=>setName(e.target.value)}/><textarea className="brutal-input w-full rounded-lg px-3 py-3 text-sm" rows={3} placeholder="What is this crew for?" value={description} onChange={e=>setDescription(e.target.value)}/>{error&&<div className="rounded-lg border-2 border-[#1a1a1a] bg-brand-coral px-3 py-2 text-xs font-bold">{error}</div>}<button disabled={busy} className="brutal-btn w-full justify-center rounded-lg bg-brand-blue px-4 py-3 text-sm">{busy?'Creating…':'Create crew'}<Plus size={16}/></button></form></div><div className="space-y-3">{groups.length===0?<div className="brutal-card bg-brand-lemon p-6"><div className="text-[10px] font-black tracking-[.16em]">EMPTY</div><h3 className="mt-2 text-xl font-black">No crews yet.</h3><p className="mt-2 text-sm text-zinc-600">Create your first one on the left.</p></div>:groups.map(g=><div key={g.group_id} className="brutal-card p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-zinc-400">{g.role}</div><h3 className="mt-1 text-xl font-black">{g.groups?.name}</h3><p className="mt-1 text-sm text-zinc-500">{g.groups?.description||'No description.'}</p></div>)}</div></div></DashboardShell>
}
