"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { CalendarDays, Camera, Check, Copy, ImagePlus, Lightbulb, Plus, ReceiptText, Share2, ThumbsUp, Users, WalletCards } from "lucide-react"
import { Avatar, Badge, Button, Dialog, DialogContent, DialogTitle, Stat } from "neobrutalism-ui-react"
import type { DialogHandle } from "neobrutalism-ui-react"
import type { PreviewEvent, PreviewExpense, PreviewIdea, PreviewPhoto } from "@/lib/fixtures"

type Props = {
  groupId: string
  name: string
  description: string | null
  role: string
  memberCount: number
  initialEvents: PreviewEvent[]
  initialIdeas: PreviewIdea[]
  initialExpenses: PreviewExpense[]
  initialPhotos: PreviewPhoto[]
}

function SectionHead({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <Badge tone="white">{kicker}</Badge>
        <h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export default function LinkView(props: Props) {
  const { groupId, name, description, role, memberCount } = props
  // TODO(plug): initialize from props (server fetch), mutate via POST/PUT, revalidate.
  const [events, setEvents] = useState(props.initialEvents)
  const [ideas, setIdeas] = useState(props.initialIdeas)
  const [expenses, setExpenses] = useState(props.initialExpenses)
  const [photos, setPhotos] = useState(props.initialPhotos)
  const [voted, setVoted] = useState<Record<string, boolean>>({})
  const [eventName, setEventName] = useState("")
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaCategory, setIdeaCategory] = useState("")
  const [expenseDesc, setExpenseDesc] = useState("")
  const [expenseAmount, setExpenseAmount] = useState("")
  const [inviteCode] = useState("DEMO-CODE")
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  const inviteDialog = useRef<DialogHandle>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  function addEvent(event: FormEvent) {
    event.preventDefault()
    if (!eventName.trim()) return
    setEvents(current => [...current, { id: `ev-${Date.now()}`, name: eventName.trim(), starts_at: null, location: null }])
    setEventName("")
  }

  function addIdea() {
    if (!ideaTitle.trim()) return
    setIdeas(current => [{ id: `idea-${Date.now()}`, title: ideaTitle.trim(), category: ideaCategory || null, votes: 0 }, ...current])
    setIdeaTitle("")
    setIdeaCategory("")
  }

  function addExpense(event: FormEvent) {
    event.preventDefault()
    if (!expenseDesc.trim() || !Number(expenseAmount)) return
    setExpenses(current => [{ id: `ex-${Date.now()}`, description: expenseDesc.trim(), amount: Number(expenseAmount), currency: "USD" }, ...current])
    setExpenseDesc("")
    setExpenseAmount("")
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(`${origin}/join/${inviteCode}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0)

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[20px] border-[3px] border-[#1a1a1a] bg-brand-blue p-6 shadow-[6px_6px_0_#1a1a1a] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar tone="white" className="text-xl">
              {name.slice(0, 1).toUpperCase()}
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="white">{role}</Badge>
                <Badge tone="yellow">
                  <Users size={12} /> {memberCount} people
                </Badge>
              </div>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{name}</h1>
              {description && <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-zinc-700">{description}</p>}
            </div>
          </div>
          <Button size="sm" tone="white" onClick={() => inviteDialog.current?.open()}>
            <Share2 size={14} /> Invite people
          </Button>
        </div>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Link sections">
          {[
            ["#plan", "Plan", CalendarDays],
            ["#votes", "Votes", Lightbulb],
            ["#money", "Money", WalletCards],
            ["#memories", "Memories", Camera],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof Users
            return (
              <a
                key={href as string}
                href={href as string}
                className="inline-flex items-center gap-1.5 rounded-xl border-[3px] border-[#1a1a1a] bg-white px-3 py-2 text-xs font-black shadow-[2px_2px_0_#1a1a1a] transition hover:-translate-y-0.5"
              >
                <I size={14} />
                {label as string}
              </a>
            )
          })}
        </nav>
      </section>

      <section id="plan" className="scroll-mt-28">
        <SectionHead kicker="THE PLAN" title="What's happening" action={<span className="text-xs font-black text-zinc-500">{events.length} events</span>} />
        <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-5 shadow-[6px_6px_0_#1a1a1a] sm:p-6">
          <form onSubmit={addEvent} className="flex gap-2">
            <input value={eventName} onChange={e => setEventName(e.target.value)} className="brutal-input min-w-0 flex-1 px-3 py-3 text-sm" placeholder="Name the next thing" aria-label="Event name" />
            <Button type="submit" tone="blue">
              <Plus size={15} /> Add
            </Button>
          </form>
          <div className="mt-5 space-y-3">
            {events.length === 0 ? (
              <p className="rounded-xl border-[3px] border-dashed border-zinc-300 p-6 text-center text-sm font-bold text-zinc-500">No plans yet. Name the first one above.</p>
            ) : (
              events.map(item => (
                <article key={item.id} className="flex items-center gap-4 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-cream p-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-[3px] border-[#1a1a1a] bg-brand-lemon">
                    <CalendarDays size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-black">{item.name}</div>
                    <div className="mt-1 text-xs font-medium text-zinc-500">
                      {item.starts_at ? new Date(item.starts_at).toLocaleString() : "Date TBD"}
                      {item.location ? ` · ${item.location}` : ""}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="votes" className="scroll-mt-28">
        <SectionHead kicker="THE VOTE" title="What should we do" action={<span className="text-xs font-black text-zinc-500">{ideas.length} ideas</span>} />
        <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-5 shadow-[6px_6px_0_#1a1a1a] sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={ideaTitle}
              onChange={e => setIdeaTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addIdea() }}
              className="brutal-input min-w-0 flex-1 px-3 py-3 text-sm font-bold"
              placeholder="e.g. Sunrise hike"
              aria-label="Idea title"
            />
            <Button onClick={addIdea} disabled={!ideaTitle.trim()} tone="mint">
              <Lightbulb size={15} /> Throw it in
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Trip", "Food", "Hangout", "Activity", "Random"].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setIdeaCategory(ideaCategory === c ? "" : c)}
                className={`rounded-full border-[3px] border-[#1a1a1a] px-3 py-1.5 text-xs font-black transition ${ideaCategory === c ? "bg-brand-lemon shadow-[2px_2px_0_#1a1a1a]" : "bg-white hover:bg-zinc-100"}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {ideas.map((idea, index) => (
              <div key={idea.id} className="flex items-center gap-4 rounded-xl border-[3px] border-[#1a1a1a] bg-white p-4 shadow-[3px_3px_0_#1a1a1a]">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] border-[#1a1a1a] bg-brand-peach text-sm font-black">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-black">{idea.title}</div>
                  {idea.category && <div className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-400">{idea.category}</div>}
                </div>
                <Button size="sm" tone={voted[idea.id] ? "mint" : "white"} onClick={() => setVoted(v => ({ ...v, [idea.id]: !v[idea.id] }))}>
                  <ThumbsUp size={14} /> {voted[idea.id] ? "Voted" : "Vote"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="money" className="scroll-mt-28">
        <SectionHead kicker="THE MONEY" title="Keep it fair" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Logged spending" value={`$${total.toFixed(2)}`} />
          <Stat label="Expenses" value={String(expenses.length)} />
          <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-5 shadow-[6px_6px_0_#1a1a1a]">
            <form onSubmit={addExpense} className="grid gap-2">
              <input value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required className="brutal-input px-3 py-2.5 text-sm" placeholder="What was it?" aria-label="Expense description" />
              <input value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} required type="number" min="0.01" step="0.01" className="brutal-input px-3 py-2.5 text-sm" placeholder="Amount" aria-label="Expense amount" />
              <Button type="submit" tone="blue" size="sm" fullWidth className="justify-center">
                <WalletCards size={14} /> Log it
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {expenses.map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border-[3px] border-[#1a1a1a] bg-white p-4 shadow-[3px_3px_0_#1a1a1a]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-[3px] border-[#1a1a1a] bg-brand-mint">
                <ReceiptText size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">{item.description}</div>
                <div className="text-xs text-zinc-500">{item.currency}</div>
              </div>
              <div className="text-base font-black">${Number(item.amount).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="memories" className="scroll-mt-28">
        <SectionHead
          kicker="THE MEMORIES"
          title="Proof it happened"
          action={
            <Button size="sm" tone="white" onClick={() => undefined} aria-label="Upload photo (preview)">
              <ImagePlus size={14} /> Upload
            </Button>
          }
        />
        {photos.length === 0 ? (
          <div className="rounded-[20px] border-[3px] border-dashed border-zinc-300 bg-white p-10 text-center">
            <Camera className="mx-auto" size={28} />
            <h3 className="mt-3 text-xl font-black">No photos yet.</h3>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map(photo => (
              <div key={photo.id} className="overflow-hidden rounded-[20px] border-[3px] border-[#1a1a1a] bg-white shadow-[5px_5px_0_#1a1a1a]">
                <div className="grid aspect-square place-items-center bg-brand-peach">
                  <Camera size={28} />
                </div>
                <div className="border-t-[3px] border-[#1a1a1a] p-3">
                  <div className="truncate text-sm font-black">{photo.caption || photo.storage_path.split("/").pop()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog ref={inviteDialog} tone="white">
        <DialogTitle>Private invite link</DialogTitle>
        <DialogContent>
          <p className="text-sm font-medium text-zinc-600">Send this to the group chat. Anyone with it can join {name}.</p>
          <code className="mt-3 block break-all rounded-lg border-[3px] border-[#1a1a1a] bg-brand-cream p-3 text-xs font-bold">
            {origin ? `${origin}/join/DEMO-CODE` : "/join/DEMO-CODE"}
          </code>
          <Button size="sm" tone="yellow" className="mt-4" onClick={copyInvite}>
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied — send it" : "Copy invite"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
