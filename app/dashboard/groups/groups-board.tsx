"use client"

import { FormEvent, useEffect, useState } from 'react'
import { Check, Copy, Link2, Plus, Share2, Users } from 'lucide-react'

type LinkRow = { group_id: string; role: string; member_count?: number; groups: { name: string; description?: string | null } | null }

function LinkSkeleton() {
  return <div className="space-y-3" aria-label="Loading your links"><div className="flex h-40 items-center justify-center rounded-2xl border-2 border-[#111] bg-brand-blue/35"><div className="link-loader" aria-hidden="true"><span className="link-loader-line" /></div></div>{[1, 2].map(item => <div key={item} className="h-28 animate-pulse rounded-2xl border border-zinc-200 bg-white" />)}</div>
}

export default function GroupsBoard() {
  const [links, setLinks] = useState<LinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [inviteFor, setInviteFor] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  async function load() {
    setLoading(true)
    const response = await fetch('/api/groups')
    const data = await response.json().catch(() => ({}))
    if (response.ok) setLinks(data.groups || [])
    else setError(data.error || 'We could not load your links.')
    setLoading(false)
  }

  useEffect(() => { load().catch(() => { setError('We could not load your links.'); setLoading(false) }) }, [])

  async function create(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    const response = await fetch('/api/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) setError(data.error || 'Could not create this link.')
    else { setLinks([{ group_id: data.group.id, role: 'owner', member_count: 1, groups: data.group }, ...links]); setName(''); setDescription('') }
    setBusy(false)
  }

  async function createInvite(groupId: string) {
    setInviteFor(groupId); setCopied(false); setInviteUrl(''); setError('')
    const response = await fetch('/api/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupId }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setError(data.error || 'Could not make an invite.'); setInviteFor(''); return }
    const url = `${window.location.origin}/join/${data.invite.code}`
    setInviteUrl(url)
    try { await navigator.clipboard.writeText(url); setCopied(true) } catch { /* Visible copy button remains available. */ }
  }

  async function copyInvite() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true) } catch { setError('Copy failed. Select the link and copy it manually.') }
  }

  if (loading) return <LinkSkeleton />
  return <div className="space-y-6">
    <section className="grid gap-3 rounded-2xl border-2 border-[#111] bg-brand-lemon p-4 shadow-[3px_3px_0_#111] sm:grid-cols-3 sm:p-5"><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-600">01 · CREATE</div><p className="mt-1 text-sm font-black">A Link is a private space for one crew.</p></div><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-600">02 · INVITE</div><p className="mt-1 text-sm font-black">Make one invite, then send it in the group chat.</p></div><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-600">03 · USE IT</div><p className="mt-1 text-sm font-black">Plan events, collect ideas, track money, and save photos here.</p></div></section>
    <div className="grid gap-6 lg:grid-cols-[.92fr_1.08fr]">
    <section className="link-feature-card p-6 sm:p-8"><div className="link-mark-pulse"><Link2 size={24}/></div><div className="mt-5 text-[10px] font-black tracking-[.16em] text-zinc-500">START HERE</div><h2 className="mt-1 text-3xl font-black tracking-tight">Make one shared space.</h2><p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">A link is not another chat. It is the clear place where your group can see what is happening and what to do next.</p><form onSubmit={create} className="mt-6 space-y-3"><label className="block text-xs font-black">Link name<input className="brutal-input mt-2 w-full rounded-lg px-3 py-3 text-sm" placeholder="Weekend crew" required value={name} onChange={event => setName(event.target.value)}/></label><label className="block text-xs font-black">What is this group for? <span className="font-medium text-zinc-500">(optional)</span><textarea className="brutal-input mt-2 w-full rounded-lg px-3 py-3 text-sm" rows={3} placeholder="Trips, dinners, ideas, whatever keeps you together." value={description} onChange={event => setDescription(event.target.value)}/></label><button disabled={busy} className="brutal-btn w-full justify-center rounded-lg bg-brand-blue px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Making your link…' : 'Create link'}<Plus size={16}/></button></form></section>
    <section aria-live="polite"><div className="mb-4 flex items-end justify-between gap-4"><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-500">YOUR SPACES</div><h2 className="mt-1 text-2xl font-black">What your groups can see.</h2></div><span className="rounded-full border-2 border-[#111] bg-brand-lemon px-3 py-1 text-xs font-black">{links.length} {links.length === 1 ? 'link' : 'links'}</span></div>{error && <div className="mb-4 rounded-lg border-2 border-[#111] bg-brand-coral px-3 py-2.5 text-xs font-bold">{error}</div>}{links.length === 0 ? <div className="brutal-card p-8 text-center"><Users className="mx-auto" size={28}/><h3 className="mt-4 text-2xl font-black">No links yet.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Create one above. Then you will get an invite link to drop in the group chat.</p></div> : <div className="space-y-4">{links.map((link, index) => <article key={link.group_id} className={`brutal-card-soft p-5 ${index % 3 === 0 ? 'tint-blue' : index % 3 === 1 ? 'tint-mint' : 'tint-peach'}`}><div className="flex items-start gap-3"><div className="link-node shrink-0"><Link2 size={16}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black">{link.groups?.name || 'Untitled link'}</h3><span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-zinc-500">{link.role}</span></div><p className="mt-2 text-sm leading-6 text-zinc-600">{link.groups?.description || 'A shared space for your people.'}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-600"><Users size={14}/>{link.member_count ?? 0} people can see this</span><button onClick={() => createInvite(link.group_id)} disabled={inviteFor === link.group_id} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#111] bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 disabled:opacity-60"><Share2 size={14}/>{inviteFor === link.group_id ? 'Making invite…' : 'Invite people'}</button></div></div></div>{inviteFor === link.group_id && inviteUrl && <div className="mt-4 rounded-xl border-2 border-[#111] bg-brand-cream p-3"><div className="text-[9px] font-black tracking-[.14em] text-zinc-500">PRIVATE INVITE LINK</div><code className="mt-2 block break-all rounded-lg bg-white p-2 text-[11px] text-zinc-700">{inviteUrl}</code><button onClick={copyInvite} className="mt-3 inline-flex items-center gap-2 text-xs font-black underline decoration-2 underline-offset-4">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied — send it to the group' : 'Copy invite'}</button></div>}</article>)}</div>}</section>
    </div>
  </div>
}
