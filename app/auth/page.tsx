"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { FormEvent, Suspense, useEffect, useRef, useState } from "react"
import { ArrowRight, Check, Eye, EyeOff, KeyRound, MailCheck } from "lucide-react"
import { Button } from "neobrutalism-ui-react"
import BrandMark from "../_components/brand-mark"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; ["expired-callback"]?: () => void; ["error-callback"]?: () => void }) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

type Mode = "signup" | "login"

function AuthCard() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const captchaBox = useRef<HTMLDivElement>(null)
  const captchaWidget = useRef<string | undefined>(undefined)

  useEffect(() => {
    const initial = searchParams.get("mode")
    setMode(initial === "signup" ? "signup" : initial === "login" ? "login" : "login")
  }, [searchParams])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !captchaBox.current) return
    let cancelled = false
    function render() {
      if (cancelled || !window.turnstile || !captchaBox.current || captchaWidget.current) return
      captchaWidget.current = window.turnstile.render(captchaBox.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setCaptchaToken(token),
        ["expired-callback"]: () => setCaptchaToken(""),
        ["error-callback"]: () => setCaptchaToken(""),
      })
    }
    if (window.turnstile) render()
    else {
      const script = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]') as HTMLScriptElement | null
      const tag = script || document.createElement("script")
      if (!script) {
        tag.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
        tag.async = true
        tag.defer = true
        document.head.appendChild(tag)
      }
      tag.addEventListener("load", render)
      tag.addEventListener("error", render)
    }
    return () => {
      cancelled = true
      if (captchaWidget.current && window.turnstile) {
        try { window.turnstile.remove(captchaWidget.current) } catch { /* widget already gone */ }
        captchaWidget.current = undefined
      }
    }
  }, [mode])

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
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the human check below first.")
      setBusy(false)
      return
    }
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { displayName: name, email, password, captchaToken } : { email, password, captchaToken }),
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
      setCaptchaToken("")
      try { window.turnstile?.reset(captchaWidget.current) } catch { /* widget already gone */ }
    }
  }

  const isSignUp = mode === "signup"

  return <main className="grid min-h-screen place-items-center overflow-hidden bg-brand-lemon px-5 py-10 text-[#111]">
    <div className="w-full max-w-lg">
      <Link href="/" className="mx-auto flex w-fit items-center gap-3"><BrandMark size={44} /><span className="text-2xl font-black tracking-tight">linkup</span></Link>
      <div className="mt-6 text-center"><div className="text-[10px] font-black tracking-[.18em] text-zinc-600">{isSignUp ? "START HERE" : "WELCOME BACK"}</div><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{isSignUp ? "Make your account." : "Log in to Linkup."}</h1></div>
      <div className="mb-5 mt-7 grid grid-cols-2 rounded-2xl border-[3px] border-[#111] bg-white p-1.5 shadow-[4px_4px_0_#111]">
        <button type="button" onClick={() => chooseMode("signup")} aria-pressed={isSignUp} className={`rounded-xl px-3 py-3 text-sm font-black transition ${isSignUp ? "bg-brand-blue text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>Create account</button>
        <button type="button" onClick={() => chooseMode("login")} aria-pressed={!isSignUp} className={`rounded-xl px-3 py-3 text-sm font-black transition ${!isSignUp ? "bg-brand-mint text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>Log in</button>
      </div>
      <form onSubmit={submit} className="relative overflow-hidden rounded-2xl border-[3px] border-[#111] bg-white p-5 shadow-[6px_6px_0_#111] sm:p-7">
        {isSignUp && <label className="relative block"><span className="text-xs font-black">Your name</span><input value={name} onChange={event => setName(event.target.value)} required className="brutal-input mt-2 w-full rounded-lg px-4 py-3.5 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="Rishith" autoComplete="name" /></label>}
        <label className={`relative block ${isSignUp ? "mt-4" : ""}`}><span className="text-xs font-black">Email</span><input value={email} onChange={event => setEmail(event.target.value)} type="email" required className="brutal-input mt-2 w-full rounded-lg px-4 py-3.5 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="you@example.com" autoComplete="email" /></label>
        <label className="relative mt-4 block"><span className="text-xs font-black">Password</span><div className="relative mt-2"><input value={password} onChange={event => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required minLength={6} className="brutal-input w-full rounded-lg px-4 py-3.5 pr-12 text-sm outline-none focus:shadow-[3px_3px_0_#93cdff]" placeholder="At least 6 characters" autoComplete={isSignUp ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-label="Toggle password visibility">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {isSignUp && <div className="relative mt-4 grid gap-2 rounded-xl border-2 border-[#111] bg-brand-cream p-3 text-[11px] font-bold text-zinc-600"><div className="flex items-center gap-2"><MailCheck size={14} /> We send one confirmation email.</div><div className="flex items-center gap-2"><Check size={14} /> Then you create your first Link.</div></div>}
        {TURNSTILE_SITE_KEY
          ? <div className="relative mt-4 flex justify-center"><div ref={captchaBox} /></div>
          : <div className="relative mt-4 rounded-lg border-2 border-dashed border-zinc-300 px-3 py-3 text-[11px] font-bold text-zinc-500">Human check is not configured (missing site key), so signups will be rejected. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to continue.</div>}
        {error && <div role="alert" className="relative mt-4 rounded-lg border-2 border-[#111] bg-brand-coral px-3 py-3 text-xs font-bold">{error}</div>}
        {message && <div role="status" className="relative mt-4 rounded-lg border-2 border-[#111] bg-brand-mint px-3 py-3 text-xs font-bold">{message}</div>}
        <Button type="submit" disabled={busy} tone="blue" fullWidth className="mt-5 justify-center">{busy ? (isSignUp ? "Creating your account…" : "Logging you in…") : (isSignUp ? "Create account" : "Log in")}<ArrowRight size={16} /></Button>
      </form>
      <div className="mt-5 flex items-start gap-3 rounded-xl border-2 border-[#111] bg-white p-4 text-xs leading-5 text-zinc-600 shadow-[3px_3px_0_#111]"><KeyRound className="mt-0.5 shrink-0" size={16} /><p>{isSignUp ? "Already signed up? Switch to Log in above. New accounts need a confirmation email before they can enter a private Link." : "New here? Switch to Create account above — you will choose a name before joining your first Link."}</p></div>
      <div className="mt-5 text-center"><Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-zinc-600 hover:text-black">← Back to home</Link></div>
    </div>
  </main>
}

export default function AuthPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-brand-lemon px-5"><div className="rounded-2xl border-[3px] border-[#111] bg-white p-10 text-sm font-black shadow-[6px_6px_0_#111]">Loading…</div></main>}><AuthCard /></Suspense>
}
