"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Link2, LoaderCircle } from "lucide-react"
import BrandMark from "../../_components/brand-mark"

type Invite = { group_id: string; code: string; expires_at?: string | null; groups?: { id: string; name: string; description?: string | null } | null }

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const [code, setCode] = useState("")
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    params.then(({ code: routeCode }) => {
      const normalized = routeCode.toUpperCase()
      setCode(normalized)
      fetch(`/api/invites?code=${encodeURIComponent(normalized)}`).then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) setError(data.error || "This invite is unavailable")
        else setInvite(data.invite)
      }).catch(() => setError("Could not load this invite")).finally(() => setLoading(false))
    })
  }, [params])

  async function join() {
    setJoining(true); setError("")
    try {
      const response = await fetch("/api/invites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Could not join this link")
      setJoined(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join this link")
    } finally { setJoining(false) }
  }

  return <main className="min-h-screen bg-[#fafaf8] px-5 py-10 text-[#111] sm:px-8">
    <div className="mx-auto max-w-xl">
      <Link href="/" className="inline-flex items-center gap-3"><BrandMark size={40}/><span className="text-xl font-black">linkup</span></Link>
      <div className="brutal-card mt-12 overflow-hidden p-6 sm:p-9">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#1a1a1a] bg-brand-blue shadow-[3px_3px_0_#1a1a1a]"><Link2 size={22}/></div>
        {loading ? <div className="mt-8 flex items-center gap-2 text-sm font-bold"><LoaderCircle className="animate-spin" size={16}/> Loading invite…</div> : invite ? <>
          <div className="mt-7 text-[10px] font-black tracking-[.18em] text-zinc-400">YOU’RE INVITED</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Join {invite.groups?.name || "this link"}.</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{invite.groups?.description || "A shared space for plans, ideas, expenses, and memories."}</p>
          <div className="mt-6 rounded-xl border-2 border-[#1a1a1a] bg-brand-cream p-4"><div className="text-[9px] font-black tracking-[.16em] text-zinc-400">INVITE CODE</div><div className="mt-1 font-mono text-lg font-black tracking-[.16em]">{code}</div></div>
          {joined ? <div className="mt-5 rounded-lg border-2 border-[#1a1a1a] bg-brand-mint px-4 py-3 text-sm font-black">You’re in. Link connected.</div> : <button disabled={joining} onClick={join} className="brutal-btn mt-5 w-full justify-center rounded-lg bg-brand-blue px-4 py-3.5 text-sm">{joining ? "Joining…" : "Join link"}<ArrowRight size={16}/></button>}
          {joined && <Link href="/dashboard" className="brutal-btn mt-3 w-full justify-center rounded-lg bg-white px-4 py-3.5 text-sm">Go to dashboard</Link>}
        </> : <>
          <h1 className="mt-7 text-3xl font-black">Invite unavailable.</h1>
          <p className="mt-2 text-sm text-zinc-500">{error || "This invite may have expired or been removed."}</p>
          <Link href="/auth" className="brutal-btn mt-5 inline-flex rounded-lg bg-white px-4 py-3 text-sm">Go to account</Link>
        </>}
        {error && invite && <div className="mt-4 rounded-lg border-2 border-[#1a1a1a] bg-brand-coral px-3 py-2.5 text-xs font-bold">{error}</div>}
      </div>
    </div>
  </main>
}
