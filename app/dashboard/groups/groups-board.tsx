"use client"

import { FormEvent, useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, Link2, MousePointer2, Plus, Share2, Sparkles, Users, X } from 'lucide-react'

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
  const [guideStep, setGuideStep] = useState(0)
  const nameInput = useRef<HTMLInputElement>(null)
  const newestLink = useRef<HTMLElement>(null)

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
    else {
      setLinks([{ group_id: data.group.id, role: 'owner', member_count: 1, groups: data.group }, ...links])
      setName(''); setDescription(''); setGuideStep(1)
      requestAnimationFrame(() => newestLink.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    }
    setBusy(false)
  }

  async function createInvite(groupId: string) {
    setInviteFor(groupId); setCopied(false); setInviteUrl(''); setError('')
    const response = await fetch('/api/invites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupId }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setError(data.error || 'Could not make an invite.'); setInviteFor(''); return }
    const url = `${window.location.origin}/join/${data.invite.code}`
    setInviteUrl(url)
    try { await navigator.clipboard.writeText(url); setCopied(true); setGuideStep(2) } catch { /* Visible copy button remains available. */ }
  }

  async function copyInvite() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true) } catch { setError('Copy failed. Select the link and copy it manually.') }
  }

  if (loading) return <LinkSkeleton />
  const guideVisible = guideStep < 2
  const guide = guideStep === 0
    ? { count: '1 of 2', title: 'Make a home for one crew.', copy: 'Start with the people who plan things together. Give the Link a name, then create it.', action: 'Show me where to start', onAction: () => nameInput.current?.focus() }
    : { count: '2 of 2', title: 'Your Link is ready. Invite the crew.', copy: 'Tap Invite people, copy the private link, and paste it in your group chat.', action: 'Show invite button', onAction: () => newestLink.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }

  return <div className="space-y-6">
    {guideVisible && <section aria-label="First Link guide" className="relative overflow-hidden rounded-2xl border-2 border-[#111] bg-brand-lemon p-5 shadow-[3px_3px_0_#111] sm:p-6"><div className="absolute -right-5 -top-5 grid h-28 w-28 place-items-center rounded-full border-2 border-[#111] bg-brand-peach/80 rotate-12"><MousePointer2 size={30}/></div><button onClick={() => setGuideStep(2)} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-[#111] bg-white text-zinc-700 transition hover:bg-zinc-100" aria-label="Dismiss guide"><X size={15}/></button><div className="relative max-w-xl"><div className="inline-flex items-center gap-2 text-[10px] font-black tracking-[.16em] text-zinc-600"><Sparkles size={13}/> FIRST LINK TOUR · {guide.count}</div><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{guide.title}</h2><p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-zinc-700">{guide.copy}</p><button onClick={guide.onAction} className="brutal-btn mt-5 rounded-lg bg-white px-4 py-2.5 text-xs">{guide.action}<ArrowRight size={15}/></button></div></section>}
    <div className="grid gap-6 lg:grid-cols-[.92fr_1.08fr]">
    <section className={`link-feature-card p-6 transition sm:p-8 ${guideStep === 0 ? 'ring-4 ring-brand-lemon ring-offset-4 ring-offset-[#fafaf8]' : ''}`}><div className="link-mark-pulse"><Link2 size={24}/></div><div className="mt-5 text-[10px] font-black tracking-[.16em] text-zinc-500">START HERE</div><h2 className="mt-1 text-3xl font-black tracking-tight">Make one shared space.</h2><p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">A link is not another chat. It is the clear place where your group can see what is happening and what to do next.</p><form onSubmit={create} className="mt-6 space-y-3"><label className="block text-xs font-black">Link name<input ref={nameInput} className="brutal-input mt-2 w-full rounded-lg px-3 py-3 text-sm" placeholder="Weekend crew" required value={name} onChange={event => setName(event.target.value)}/></label><label className="block text-xs font-black">What is this group for? <span className="font-medium text-zinc-500">(optional)</span><textarea className="brutal-input mt-2 w-full rounded-lg px-3 py-3 text-sm" rows={3} placeholder="Trips, dinners, ideas, whatever keeps you together." value={description} onChange={event => setDescription(event.target.value)}/></label><button disabled={busy} className="brutal-btn w-full justify-center rounded-lg bg-brand-blue px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Making your link…' : 'Create link'}<Plus size={16}/></button></form></section>
    <section aria-live="polite"><div className="mb-4 flex items-end justify-between gap-4"><div><div className="text-[10px] font-black tracking-[.16em] text-zinc-500">YOUR SPACES</div><h2 className="mt-1 text-2xl font-black">What your groups can see.</h2></div><span className="rounded-full border-2 border-[#111] bg-brand-lemon px-3 py-1 text-xs font-black">{links.length} {links.length === 1 ? 'link' : 'links'}</span></div>{error && <div className="mb-4 rounded-lg border-2 border-[#111] bg-brand-coral px-3 py-2.5 text-xs font-bold">{error}</div>}{links.length === 0 ? <div className="brutal-card p-8 text-center"><Users className="mx-auto" size={28}/><h3 className="mt-4 text-2xl font-black">No links yet.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">Your first Link will show up here after you create it.</p></div> : <div className="space-y-4">{links.map((link, index) => <article ref={index === 0 ? newestLink : undefined} key={link.group_id} className={`brutal-card-soft p-5 transition ${guideStep === 1 && index === 0 ? 'ring-4 ring-brand-lemon ring-offset-4 ring-offset-[#fafaf8]' : ''} ${index % 3 === 0 ? 'tint-blue' : index % 3 === 1 ? 'tint-mint' : 'tint-peach'}`}><div className="flex items-start gap-3"><div className="link-node shrink-0"><Link2 size={16}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-black">{link.groups?.name || 'Untitled link'}</h3><span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-black uppercase text-zinc-500">{link.role}</span></div><p className="mt-2 text-sm leading-6 text-zinc-600">{link.groups?.description || 'A shared space for your people.'}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-600"><Users size={14}/>{link.member_count ?? 0} people can see this</span><button onClick={() => createInvite(link.group_id)} disabled={inviteFor === link.group_id} className="inline-flex items-center gap-2 rounded-lg border-2 border-[#111] bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5 disabled:opacity-60"><Share2 size={14}/>{inviteFor === link.group_id ? 'Making invite…' : 'Invite people'}</button></div></div></div>{inviteFor === link.group_id && inviteUrl && <div className="mt-4 rounded-xl border-2 border-[#111] bg-brand-cream p-3"><div className="text-[9px] font-black tracking-[.14em] text-zinc-500">PRIVATE INVITE LINK</div><code className="mt-2 block break-all rounded-lg bg-white p-2 text-[11px] text-zinc-700">{inviteUrl}</code><button onClick={copyInvite} className="mt-3 inline-flex items-center gap-2 text-xs font-black underline decoration-2 underline-offset-4">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied — send it to the group' : 'Copy invite'}</button></div>}</article>)}</div>}</section>
    </div>
  </div>
}
