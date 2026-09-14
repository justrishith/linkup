"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Link2, Plus, Users, X } from "lucide-react"
import { Avatar, Badge, Button } from "neobrutalism-ui-react"
import { useLinks } from "@/lib/use-linkup"

const fills = ["bg-brand-blue", "bg-brand-mint", "bg-brand-peach", "bg-brand-lemon", "bg-brand-coral"]

export default function LinksPicker() {
  const { links } = useLinks()
  const [name, setName] = useState("")
  const [local, setLocal] = useState<typeof links>([])
  const all = [...local, ...links]

  // TODO(plug): POST /api/groups then prepend the real row.
  function create(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    const id = `preview-${Date.now()}`
    setLocal(current => [{ group_id: id, role: "owner", member_count: 1, groups: { id, name: name.trim(), description: null } }, ...current])
    setName("")
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge tone="yellow">THE PEOPLE YOU PLAN WITH</Badge>
        <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Your links</h1>
      </div>

      <section className="brutal-card grid gap-6 p-6 sm:p-8 lg:grid-cols-[.92fr_1.08fr]">
        <div>
          <div className="kicker text-zinc-500">START HERE</div>
          <h2 className="mt-1 text-3xl font-black tracking-tight">Make one shared space.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
            A link is not another chat. It is the clear place where your group sees what is happening next.
          </p>
          <form onSubmit={create} className="mt-6 flex gap-2">
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              className="brutal-input min-w-0 flex-1 px-3 py-3 text-sm"
              placeholder="Weekend crew"
              aria-label="Link name"
            />
            <Button type="submit" tone="blue">
              <Plus size={16} /> Create
            </Button>
          </form>
        </div>
        <div aria-live="polite">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="kicker text-zinc-500">YOUR SPACES</div>
            <Badge tone="yellow">
              {all.length} {all.length === 1 ? "link" : "links"}
            </Badge>
          </div>
          <div className="space-y-4">
            {all.map((link, index) => (
              <Link
                key={link.group_id}
                href={`/dashboard/${link.group_id}`}
                className={`block rounded-[20px] border-[3px] border-[#1a1a1a] p-5 shadow-[5px_5px_0_#1a1a1a] transition hover:-translate-y-0.5 ${fills[index % fills.length]}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar tone="white" aria-hidden="true">
                    <Link2 size={16} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black">{link.groups?.name || "Untitled link"}</h3>
                      <Badge tone="white">{link.role}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-700">{link.groups?.description || "A shared space for your people."}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-700">
                        <Users size={14} /> {link.member_count ?? 0} people
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-black">
                        Open <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs font-bold text-zinc-400">
        <X size={12} /> Preview data — flips to your real Links when the API plugs in.
      </p>
    </div>
  )
}
