"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { ArrowRight, Check, Eye, EyeOff, KeyRound, MailCheck, Sparkles } from "lucide-react"
import BrandMark from "../_components/brand-mark"

type Mode = "signup" | "login"

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => setMode(new URLSearchParams(window.location.search).get("mode") === "signup" ? "signup" : "login"), [])

  function chooseMode(nextMode: Mode) {
    setMode(nextMode)
    setMessage("")
    setError("")
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setError("")
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { displayName: name, email, password } : { email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "We could not complete that request.")
      if (mode === "signup" && !data.session) {
        setMessage(`Check ${email} for the confirmation email. Look in Spam too. If the link does not bring you back automatically, return here and use Log in.`)
        return
      }
      window.location.assign(mode === "signup" ? "/onboarding" : "/dashboard")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We could not complete that request.")
    } finally {
      setBusy(false)
    }
  }

  const isSignUp = mode === "signup"

  return <main className="min-h-screen overflow-hidden bg-[#fafaf8] text-[#111]">
    <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1fr_.9fr]">
      <section className="relative hidden overflow-hidden border-r-2 border-[#1a1a1a] bg-[#111] p-10 text-white lg:block lg:p-14 xl:p-16">
        <Link href="/" className="relative z-10 inline-flex items-center gap-3"><BrandMark size={44}/><span className="text-2xl font-black tracking-tight">linkup</span></Link>
        <div className="relative z-10 mt-20 max-w-2xl xl:mt-28">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-brand-mint px-3 py-1.5 text-[11px] font-black text-[#111] shadow-[3px_3px_0_#93cdff]"><Sparkles size={13}/> LESS CHAT. MORE HAPPENING.</div>
          <h1 className="mt-7 text-[clamp(4rem,7vw,7rem)] font-black leading-[.86] tracking-[-.06em]">Make plans<br/>feel easy.</h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-zinc-300">One shared home for the people who actually need to know what is going on.</p>
        </div>
        <div className="auth-orbit pointer-events-none absolute inset-0"><div className="orbit-card orbit-one">Create one link<br/><b>for the whole crew</b></div><div className="orbit-card orbit-two">Invite once<br/><b>share the same plan</b></div><div className="orbit-card orbit-three">Keep it simple<br/><b>events, ideas, money</b></div></div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-10 inline-flex items-center gap-3 lg:hidden"><BrandMark size={40}/><span className="text-xl font-black">linkup</span></Link>
          <div className="mb-7"><div className="text-[10px] font-black tracking-[.18em] text-zinc-500">{isSignUp ? "START HERE" : "WELCOME BACK"}</div><h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{isSignUp ? "Make your account." : "Log in to Linkup."}</h2><p className="mt-3 max-w-md text-sm font-medium leading-6 text-zinc-500">{isSignUp ? "A quick email check keeps your group private." : "Use the email and password from when you made your account."}</p></div>
          <div className="mb-6 grid grid-cols-2 rounded-2xl border-2 border-[#111] bg-white p-1.5 shadow-[3px_3px_0_#111]"><button onClick={() => chooseMode("signup")} className={`rounded-xl px-3 py-3 text-sm font-black transition ${isSignUp ? "bg-brand-blue text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>Create account</button><button onClick={() => chooseMode("login")} className={`rounded-xl px-3 py-3 text-sm font-black transition ${!isSignUp ? "bg-brand-mint text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>Log in</button></div>
          <form onSubmit={submit} className="brutal-card relative overflow-hidden p-5 sm:p-7">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-lemon/75 blur-3xl" />
            {isSignUp && <label className="relative block"><span className="text-xs font-black">Your name</span><input value={name} onChange={event => setName(event.target.value)} required className="brutal-input mt-2 w-full rounded-lg px-4 py-3.5 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="Rishith" autoComplete="name" /></label>}
            <label className={`relative block ${isSignUp ? "mt-4" : ""}`}><span className="text-xs font-black">Email</span><input value={email} onChange={event => setEmail(event.target.value)} type="email" required className="brutal-input mt-2 w-full rounded-lg px-4 py-3.5 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="you@example.com" autoComplete="email" /></label>
            <label className="relative mt-4 block"><span className="text-xs font-black">Password</span><div className="relative mt-2"><input value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required minLength={6} className="brutal-input w-full rounded-lg px-4 py-3.5 pr-12 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="At least 6 characters" autoComplete={isSignUp ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
            {isSignUp && <div className="relative mt-4 grid gap-2 rounded-xl border border-zinc-200 bg-brand-cream p-3 text-[11px] font-semibold text-zinc-600"><div className="flex items-center gap-2"><MailCheck size={14}/> We send one confirmation email.</div><div className="flex items-center gap-2"><Check size={14}/> Then you create your first Link.</div></div>}
            {error && <div role="alert" className="relative mt-4 rounded-lg border-2 border-[#111] bg-brand-coral px-3 py-3 text-xs font-bold">{error}</div>}
            {message && <div role="status" className="relative mt-4 rounded-lg border-2 border-[#111] bg-brand-mint px-3 py-3 text-xs font-bold">{message}</div>}
            <button disabled={busy} className="brutal-btn relative mt-5 w-full justify-center rounded-lg bg-brand-blue px-4 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{busy ? (isSignUp ? "Creating your account…" : "Logging you in…") : (isSignUp ? "Create account" : "Log in")}<ArrowRight size={16}/></button>
          </form>
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-white p-4 text-xs leading-5 text-zinc-600"><KeyRound className="mt-0.5 shrink-0" size={16}/><p>{isSignUp ? "Already signed up? Switch to Log in above. New accounts need a confirmation email before they can enter a private Link." : "New here? Switch to Create account above — you will choose a name before joining your first Link."}</p></div>
          <Link href="/" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-black">← Back to home</Link>
        </div>
      </section>
    </div>
  </main>
}
