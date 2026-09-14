"use client"

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { ArrowRight, CalendarDays, Camera, Check, Copy, ImagePlus, Lightbulb, Link2, Plus, ReceiptText, Share2, ThumbsUp, Users, WalletCards, X } from "lucide-react"
import { Avatar, Badge, Button, Dialog, DialogContent, DialogTitle, Skeleton, Stat } from "neobrutalism-ui-react"
import type { DialogHandle } from "neobrutalism-ui-react"

type Group = { group_id: string; role: string; member_count?: number; groups: { id: string; name: string; description?: string | null } | null }
type EventItem = { id: string; name: string; description?: string | null; starts_at?: string | null; location?: string | null }
type Idea = { id: string; title: string; description?: string | null; category?: string | null }
type Expense = { id: string; description: string; amount: number; currency: string }
type Photo = { id: string; storage_path: string; caption?: string | null }

const categories = ["Trip", "Food", "Hangout", "Activity", "Random"]

function SectionHead({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><Badge tone="white">{kicker}</Badge><h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2></div>{action}</div>
}

export default function LinkPage({ groupId }: { groupId: string }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [voted, setVoted] = useState<Record<string, boolean>>({})
  const [inviteUrl, setInviteUrl] = useState("")
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState({ name: "", starts_at: "", location: "" })
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaCategory, setIdeaCategory] = useState("")
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "" })
  const [uploadMsg, setUploadMsg] = useState("")
  const inviteDialog = useRef<DialogHandle>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [g, e, i, x, p] = await Promise.all([
          fetch("/api/groups").then(r => r.json().catch(() => ({}))),
          fetch(`/api/events?groupId=${encodeURIComponent(groupId)}`).then(r => r.json().catch(() => ({}))),
          fetch(`/api/ideas?groupId=${encodeURIComponent(groupId)}`).then(r => r.json().catch(() => ({}))),
          fetch(`/api/expenses?groupId=${encodeURIComponent(groupId)}`).then(r => r.json().catch(() => ({}))),
          fetch("/api/photos").then(r => r.json().catch(() => ({}))),
        ])
        if (cancelled) return
        const found = (g.groups || []).find((row: Group) => row.group_id === groupId) || null
        setGroup(found)
        if (found) try { localStorage.setItem("linkup-active-group", groupId) } catch { /* private mode */ }
        setEvents(e.events || [])
        setIdeas(i.ideas || [])
        setExpenses(x.expenses || [])
        setPhotos((p.photos || []).slice(0, 6))
        if (!found) setError("We could not find this Link. It may have been removed.")
      } catch {
        if (!cancelled) setError("We could not load this Link.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load().catch(() => undefined)
    return () => { cancelled = true }
  }, [groupId])

  async function createInvite() {
    setBusy("invite"); setError(""); setCopied(false)
    const response = await fetch("/api/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId }) })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) { setError(data.error || "Could not make an invite."); return }
    setInviteUrl(`${window.location.origin}/join/${data.invite.code}`)
    inviteDialog.current?.open()
  }

  async function copyInvite() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true) } catch { setError("Copy failed. Select the link and copy it manually.") }
  }

  async function addEvent(event: FormEvent) {
    event.preventDefault()
    if (!eventForm.name.trim()) return
    setBusy("event"); setError("")
    const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group_id: groupId, name: eventForm.name.trim(), starts_at: eventForm.starts_at || null, location: eventForm.location.trim() || null }) })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) { setError(data.error || "Could not create event."); return }
    setEvents(current => [...current, data.event])
    setEventForm({ name: "", starts_at: "", location: "" })
  }

  async function addIdea() {
    if (!ideaTitle.trim() || busy) return
    setBusy("idea"); setError("")
    const response = await fetch("/api/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ group_id: groupId, title: ideaTitle.trim(), description: null, category: ideaCategory || null }) })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) { setError(data.error || "Could not add idea."); return }
    setIdeas(current => [data.idea, ...current])
    setIdeaTitle(""); setIdeaCategory("")
  }

  async function vote(id: string) {
    const response = await fetch("/api/ideas/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ideaId: id }) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setError(data.error || "Vote failed."); return }
    setVoted(value => ({ ...value, [id]: !value[id] }))
  }

  async function addExpense(event: FormEvent) {
    event.preventDefault()
    setBusy("expense"); setError("")
    const response = await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupId, description: expenseForm.description, amount: Number(expenseForm.amount) }) })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    if (!response.ok) { setError(data.error || "Could not add expense."); return }
    setExpenses(current => [data.expense, ...current])
    setExpenseForm({ description: "", amount: "" })
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy("upload"); setUploadMsg("Uploading…")
    const body = new FormData()
    body.append("file", file)
    body.append("groupId", groupId)
    body.append("albumName", "Linkup album")
    const response = await fetch("/api/photos", { method: "POST", body })
    const data = await response.json().catch(() => ({}))
    setBusy(null)
    event.target.value = ""
    if (!response.ok) { setUploadMsg(data.error || "Upload failed."); return }
    setUploadMsg("Uploaded.")
    setPhotos(current => [data.photo, ...current].slice(0, 6))
  }

  if (loading) return <div className="space-y-4"><Skeleton variant="block" className="h-44" /><Skeleton variant="block" className="h-64" /><Skeleton variant="block" className="h-64" /></div>
  if (!group) return <div className="rounded-2xl border-[3px] border-[#111] bg-white p-10 text-center shadow-[6px_6px_0_#111]"><h2 className="text-2xl font-black">Link not found.</h2><p className="mt-2 text-sm text-zinc-500">{error || "It may have been removed."}</p></div>

  const name = group.groups?.name || "Untitled link"
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0)

  return <div className="space-y-10">
    <section className="relative overflow-hidden rounded-2xl border-[3px] border-[#111] bg-brand-blue p-6 shadow-[6px_6px_0_#111] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar tone="white" className="text-xl">{name.slice(0, 1).toUpperCase()}</Avatar>
          <div><div className="flex flex-wrap items-center gap-2"><Badge tone="white">{group.role}</Badge><Badge tone="yellow"><Users size={12} /> {group.member_count ?? 0} people</Badge></div>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{name}</h1>
            {group.groups?.description && <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-700">{group.groups.description}</p>}</div>
        </div>
        <Button size="sm" tone="white" onClick={createInvite} disabled={busy === "invite"}><Share2 size={14} /> {busy === "invite" ? "Making invite…" : "Invite people"}</Button>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Link sections">
        {[["#plan", "Plan", CalendarDays], ["#votes", "Votes", Lightbulb], ["#money", "Money", WalletCards], ["#memories", "Memories", Camera]].map(([href, label, Icon]) => {
          const I = Icon as typeof Users
          return <a key={href as string} href={href as string} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#111] bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_#111] transition hover:-translate-y-0.5"><I size={14} />{label as string}</a>
        })}
      </nav>
    </section>

    {error && <div role="alert" className="rounded-xl border-2 border-[#111] bg-brand-coral px-4 py-3 text-xs font-bold">{error}</div>}

    <section id="plan" className="scroll-mt-28">
      <SectionHead kicker="THE PLAN" title="What's happening" action={<span className="text-xs font-black text-zinc-500">{events.length} events</span>} />
      <div className="rounded-2xl border-[3px] border-[#111] bg-white p-5 shadow-[6px_6px_0_#111] sm:p-6">
        <form onSubmit={addEvent} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} required className="brutal-input rounded-lg px-3 py-3 text-sm" placeholder="Name the next thing" />
          <div className="grid gap-3 sm:grid-cols-2 sm:col-span-1 col-span-1 sm:col-start-1">
            <input value={eventForm.starts_at} onChange={e => setEventForm({ ...eventForm, starts_at: e.target.value })} type="datetime-local" className="brutal-input rounded-lg px-3 py-3 text-sm" />
            <input value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} className="brutal-input rounded-lg px-3 py-3 text-sm" placeholder="Where?" />
          </div>
          <Button type="submit" disabled={busy === "event"} tone="blue" className="sm:row-span-1"><Plus size={15} /> {busy === "event" ? "Adding…" : "Add"}</Button>
        </form>
        <div className="mt-5 space-y-3">{events.length === 0 ? <p className="rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center text-sm font-bold text-zinc-500">No plans yet. Name the first one above.</p> : events.map(item => <article key={item.id} className="flex items-center gap-4 rounded-xl border-2 border-[#111] bg-brand-cream p-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#111] bg-brand-lemon"><CalendarDays size={20} /></div><div className="min-w-0 flex-1"><div className="truncate text-base font-black">{item.name}</div><div className="mt-1 text-xs font-medium text-zinc-500">{item.starts_at ? new Date(item.starts_at).toLocaleString() : "Date TBD"}{item.location ? ` · ${item.location}` : ""}</div></div></article>)}</div>
      </div>
    </section>

    <section id="votes" className="scroll-mt-28">
      <SectionHead kicker="THE VOTE" title="What should we do" action={<span className="text-xs font-black text-zinc-500">{ideas.length} ideas</span>} />
      <div className="rounded-2xl border-[3px] border-[#111] bg-white p-5 shadow-[6px_6px_0_#111] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={ideaTitle} onChange={e => setIdeaTitle(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addIdea() }} className="brutal-input flex-1 rounded-lg px-3 py-3 text-sm font-bold" placeholder="e.g. Sunrise hike" />
          <Button onClick={addIdea} disabled={!ideaTitle.trim() || busy === "idea"} tone="mint"><Lightbulb size={15} /> {busy === "idea" ? "Adding…" : "Throw it in"}</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{categories.map(c => <button key={c} type="button" onClick={() => setIdeaCategory(ideaCategory === c ? "" : c)} className={`rounded-full border-2 border-[#111] px-3 py-1.5 text-xs font-black transition ${ideaCategory === c ? "bg-brand-lemon shadow-[2px_2px_0_#111]" : "bg-white hover:bg-zinc-100"}`}>{c}</button>)}</div>
        <div className="mt-5 space-y-3">{ideas.length === 0 ? <p className="rounded-xl border-2 border-dashed border-zinc-300 p-6 text-center text-sm font-bold text-zinc-500">Board is empty. Be the first.</p> : ideas.map((idea, index) => <div key={idea.id} className="flex items-center gap-4 rounded-xl border-2 border-[#111] bg-white p-4 shadow-[3px_3px_0_#111]"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#111] bg-brand-peach text-sm font-black">{String(index + 1).padStart(2, "0")}</div><div className="min-w-0 flex-1"><div className="truncate text-base font-black">{idea.title}</div>{idea.category && <div className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">{idea.category}</div>}</div><Button size="sm" tone={voted[idea.id] ? "mint" : "white"} onClick={() => vote(idea.id)}><ThumbsUp size={14} /> {voted[idea.id] ? "Voted" : "Vote"}</Button></div>)}</div>
      </div>
    </section>

    <section id="money" className="scroll-mt-28">
      <SectionHead kicker="THE MONEY" title="Keep it fair" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Logged spending" value={`$${total.toFixed(2)}`} />
        <Stat label="Expenses" value={String(expenses.length)} />
        <div className="rounded-2xl border-[3px] border-[#111] bg-white p-5 shadow-[6px_6px_0_#111]">
          <form onSubmit={addExpense} className="grid gap-2">
            <input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} required className="brutal-input rounded-lg px-3 py-2.5 text-sm" placeholder="What was it?" />
            <input value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required type="number" min="0.01" step="0.01" className="brutal-input rounded-lg px-3 py-2.5 text-sm" placeholder="Amount" />
            <Button type="submit" disabled={busy === "expense"} tone="blue" size="sm" fullWidth className="justify-center"><WalletCards size={14} /> {busy === "expense" ? "Saving…" : "Log it"}</Button>
          </form>
        </div>
      </div>
      <div className="mt-4 space-y-3">{expenses.map(item => <div key={item.id} className="flex items-center gap-4 rounded-xl border-2 border-[#111] bg-white p-4 shadow-[3px_3px_0_#111]"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-[#111] bg-brand-mint"><ReceiptText size={17} /></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-black">{item.description}</div><div className="text-xs text-zinc-500">{item.currency}</div></div><div className="text-base font-black">${Number(item.amount).toFixed(2)}</div></div>)}</div>
    </section>

    <section id="memories" className="scroll-mt-28">
      <SectionHead kicker="THE MEMORIES" title="Proof it happened" action={<Button size="sm" tone="white" onClick={() => fileInput.current?.click()} disabled={busy === "upload"}><ImagePlus size={14} /> {busy === "upload" ? "Uploading…" : "Upload"}</Button>} />
      <input ref={fileInput} onChange={upload} className="hidden" type="file" accept="image/*" />
      {uploadMsg && <div className="mb-4 inline-flex rounded-lg border-2 border-[#111] bg-brand-mint px-3 py-2 text-xs font-black">{uploadMsg}</div>}
      {photos.length === 0 ? <div className="rounded-2xl border-[3px] border-dashed border-zinc-300 bg-white p-10 text-center"><Camera className="mx-auto" size={28} /><h3 className="mt-3 text-xl font-black">No photos yet.</h3><p className="mt-1 text-sm text-zinc-500">Upload one to start the album.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map(photo => <a key={photo.id} href={`/api/photos/${photo.id}`} className="overflow-hidden rounded-2xl border-[3px] border-[#111] bg-white shadow-[5px_5px_0_#111] transition hover:-translate-y-0.5"><div className="grid aspect-square place-items-center bg-brand-peach"><Camera size={28} /></div><div className="border-t-2 border-[#111] p-3"><div className="truncate text-sm font-black">{photo.caption || photo.storage_path.split("/").pop()}</div></div></a>)}</div>}
    </section>

    <Dialog ref={inviteDialog} tone="white">
      <DialogTitle>Private invite link</DialogTitle>
      <DialogContent>
        <p className="text-sm font-medium text-zinc-600">Send this to the group chat. Anyone with it can join {name}.</p>
        <code className="mt-3 block break-all rounded-lg border-2 border-[#111] bg-brand-cream p-3 text-xs font-bold">{inviteUrl}</code>
        <Button size="sm" tone="yellow" className="mt-4" onClick={copyInvite}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied — send it" : "Copy invite"}</Button>
      </DialogContent>
    </Dialog>
  </div>
}
