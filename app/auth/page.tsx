"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Eye, EyeOff, KeyRound, Users, Sparkles } from "lucide-react"

export default function AuthPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setError("")

    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup"
          ? { displayName: name, email, password }
          : { email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "Something went wrong")

      if (mode === "signup" && !data.session) {
        setMessage("Account created. Check your email to confirm it, then come back and log in.")
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1fr_.9fr]">
        <section className="relative hidden overflow-hidden border-r-2 border-[#1a1a1a] bg-brand-blue p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div>
              <span className="text-2xl font-black tracking-tight">linkup</span>
            </Link>

            <div className="mt-24 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1 text-[11px] font-black shadow-[2px_2px_0_#1a1a1a]">
                <Sparkles size={13} /> YOUR CREW, TOGETHER
              </div>
              <h1 className="text-6xl font-black leading-[.96] tracking-tight">Make plans.<br />Actually make them happen.</h1>
              <p className="mt-6 max-w-lg text-base font-semibold leading-7 text-zinc-700">Events, ideas, money and memories in one place. No spreadsheet archaeology required.</p>
            </div>
          </div>

          <div className="relative z-10 grid gap-3 sm:grid-cols-2">
            {[
              [Users, "One shared crew", "Invite everyone in one link."],
              [KeyRound, "Private by default", "Your group stays your group."],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof Users
              return <div key={title as string} className="brutal-card bg-white/95 p-4">
                <div className="grid h-9 w-9 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-lemon"><I size={16} /></div>
                <div className="mt-3 text-sm font-black">{title as string}</div>
                <div className="mt-1 text-xs font-medium text-zinc-500">{desc as string}</div>
              </div>
            })}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-6 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div>
                <span className="text-xl font-black">linkup</span>
              </Link>
            </div>

            <div className="mb-7">
              <div className="text-[10px] font-black tracking-[.16em] text-zinc-500">WELCOME TO LINKUP</div>
              <h2 className="mt-2 text-4xl font-black tracking-tight">{mode === "signup" ? "Create your crew account." : "Welcome back."}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{mode === "signup" ? "Get your group out of the group chat and into one place." : "Pick up where your crew left off."}</p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-xl border-2 border-[#1a1a1a] bg-white p-1 shadow-[3px_3px_0_#1a1a1a]">
              <button onClick={() => { setMode("signup"); setMessage(""); setError("") }} className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${mode === "signup" ? "bg-[#111] text-white" : "text-zinc-500"}`}>Create account</button>
              <button onClick={() => { setMode("login"); setMessage(""); setError("") }} className={`rounded-lg px-4 py-2.5 text-sm font-black transition ${mode === "login" ? "bg-[#111] text-white" : "text-zinc-500"}`}>Log in</button>
            </div>

            <form onSubmit={submit} className="brutal-card p-5 sm:p-6">
              {mode === "signup" && <label className="block">
                <span className="text-xs font-black">Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="brutal-input mt-2 w-full rounded-lg px-4 py-3 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="Rishi" autoComplete="name" />
              </label>}

              <label className={`block ${mode === "signup" ? "mt-4" : ""}`}>
                <span className="text-xs font-black">Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="brutal-input mt-2 w-full rounded-lg px-4 py-3 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="you@example.com" autoComplete="email" />
              </label>

              <label className="mt-4 block">
                <span className="text-xs font-black">Password</span>
                <div className="relative mt-2">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} required minLength={6} className="brutal-input w-full rounded-lg px-4 py-3 pr-12 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="At least 6 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {mode === "signup" && <div className="mt-4 grid gap-2 rounded-xl bg-brand-cream p-3 text-[11px] font-semibold text-zinc-600">
                <div className="flex items-center gap-2"><Check size={14} /> Your crew can invite you after signup.</div>
                <div className="flex items-center gap-2"><Check size={14} /> You can create groups and events after logging in.</div>
              </div>}

              {error && <div className="mt-4 rounded-lg border-2 border-[#1a1a1a] bg-brand-coral px-3 py-2 text-xs font-bold">{error}</div>}
              {message && <div className="mt-4 rounded-lg border-2 border-[#1a1a1a] bg-brand-mint px-3 py-2 text-xs font-bold">{message}</div>}

              <button disabled={busy} className="brutal-btn mt-5 w-full justify-center rounded-lg bg-brand-blue px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "One sec…" : mode === "signup" ? "Create my account" : "Log me in"}
                <ArrowRight size={16} />
              </button>
            </form>

            <Link href="/" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-black">← Back to Linkup</Link>
          </div>
        </section>
      </div>
    </main>
  )
}
