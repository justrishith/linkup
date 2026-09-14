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
  const [captchaFailed, setCaptchaFailed] = useState(false)
  const captchaBox = useRef<HTMLDivElement>(null)
  const captchaWidget = useRef<string | undefined>(undefined)

  useEffect(() => {
    const initial = searchParams.get("mode")
    setMode(initial === "signup" ? "signup" : "login")
  }, [searchParams])

  const showCaptcha = mode === "signup" && Boolean(TURNSTILE_SITE_KEY) && !captchaFailed

  useEffect(() => {
    if (!showCaptcha || !captchaBox.current) return
    let cancelled = false
    function render() {
      if (cancelled || !window.turnstile || !captchaBox.current || captchaWidget.current) return
      try {
        captchaWidget.current = window.turnstile.render(captchaBox.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          ["expired-callback"]: () => setCaptchaToken(""),
          ["error-callback"]: () => setCaptchaFailed(true),
        })
      } catch {
        setCaptchaFailed(true)
      }
    }
    if (window.turnstile) render()
    else {
      const script = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]') as HTMLScriptElement | null
      const tag = script || document.createElement("script")
      if (!script) {
        tag.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
        tag.async = true
        tag.defer = true
        tag.addEventListener("error", () => setCaptchaFailed(true))
        document.head.appendChild(tag)
      }
      tag.addEventListener("load", render)
      tag.addEventListener("error", render)
    }
    return () => {
      cancelled = true
      if (captchaWidget.current && window.turnstile) {
        try { window.turnstile.remove(captchaWidget.current) } catch { /* gone */ }
        captchaWidget.current = undefined
      }
    }
  }, [showCaptcha])

  function chooseMode(nextMode: Mode) {
    setMode(nextMode)
    setMessage("")
    setError("")
    setCaptchaToken("")
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setError("")
    if (mode === "signup" && TURNSTILE_SITE_KEY && !captchaFailed && !captchaToken) {
      setError("Give the human check a second to finish, then try again.")
      setBusy(false)
      return
    }
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { displayName: name, email, password, ...(captchaToken ? { captchaToken } : {}) }
            : { email, password },
        ),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "We could not complete that request.")
      setCaptchaToken("")
      try { window.turnstile?.reset(captchaWidget.current) } catch { /* gone */ }
      if (mode === "signup" && !data.session) {
        setMessage(`Check ${email} for the confirmation email. Look in Spam too.`)
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

  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 py-10 text-[#1a1a1a]">
      <div className="w-full max-w-lg">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <BrandMark size={44} />
          <span className="text-2xl font-black tracking-tight">linkup</span>
        </Link>
        <div className="mt-6 text-center">
          <div className="kicker text-zinc-500">{isSignUp ? "START HERE" : "WELCOME BACK"}</div>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{isSignUp ? "Make your account." : "Log in to Linkup."}</h1>
        </div>
        <div className="mb-5 mt-7 grid grid-cols-2 rounded-2xl border-[3px] border-[#1a1a1a] bg-white p-1.5 shadow-[4px_4px_0_#1a1a1a]">
          <button type="button" onClick={() => chooseMode("signup")} aria-pressed={isSignUp} className={`rounded-xl px-3 py-3 text-sm font-black transition ${isSignUp ? "bg-brand-blue text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>
            Create account
          </button>
          <button type="button" onClick={() => chooseMode("login")} aria-pressed={!isSignUp} className={`rounded-xl px-3 py-3 text-sm font-black transition ${!isSignUp ? "bg-brand-mint text-black" : "text-zinc-500 hover:bg-zinc-100"}`}>
            Log in
          </button>
        </div>
        <form onSubmit={submit} className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-5 shadow-[6px_6px_0_#1a1a1a] sm:p-7">
          {isSignUp && (
            <label className="block">
              <span className="text-xs font-black">Your name</span>
              <input value={name} onChange={event => setName(event.target.value)} required className="brutal-input mt-2 w-full px-4 py-3.5 text-sm" placeholder="Rishith" autoComplete="name" />
            </label>
          )}
          <label className={`block ${isSignUp ? "mt-4" : ""}`}>
            <span className="text-xs font-black">Email</span>
            <input value={email} onChange={event => setEmail(event.target.value)} type="email" required className="brutal-input mt-2 w-full px-4 py-3.5 text-sm" placeholder="you@example.com" autoComplete="email" />
          </label>
          <label className="mt-4 block">
            <span className="text-xs font-black">Password</span>
            <div className="relative mt-2">
              <input
                value={password}
                onChange={event => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="brutal-input w-full py-3.5 pl-4 pr-12 text-sm"
                placeholder="At least 6 characters"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          {isSignUp && (
            <div className="mt-4 grid gap-2 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-cream p-3 text-[11px] font-bold text-zinc-600">
              <div className="flex items-center gap-2"><MailCheck size={14} /> We send one confirmation email.</div>
              <div className="flex items-center gap-2"><Check size={14} /> Then you create your first Link.</div>
            </div>
          )}
          {showCaptcha && <div className="mt-4 flex justify-center"><div ref={captchaBox} /></div>}
          {isSignUp && captchaFailed && (
            <div className="mt-4 rounded-xl border-[3px] border-dashed border-zinc-300 px-3 py-3 text-[11px] font-bold text-zinc-500">
              Human check could not load (it may be blocked on this network). You can still try — the server will say so if it needs the check.
            </div>
          )}
          {error && <div role="alert" className="mt-4 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-coral px-3 py-3 text-xs font-black">{error}</div>}
          {message && <div role="status" className="mt-4 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-mint px-3 py-3 text-xs font-black">{message}</div>}
          <Button type="submit" disabled={busy} tone="blue" fullWidth className="mt-5 justify-center">
            {busy ? (isSignUp ? "Creating your account…" : "Logging you in…") : (isSignUp ? "Create account" : "Log in")} <ArrowRight size={16} />
          </Button>
        </form>
        <div className="mt-5 flex items-start gap-3 rounded-xl border-[3px] border-[#1a1a1a] bg-white p-4 text-xs leading-5 text-zinc-600 shadow-[3px_3px_0_#1a1a1a]">
          <KeyRound className="mt-0.5 shrink-0" size={16} />
          <p>{isSignUp ? "Already signed up? Switch to Log in above." : "New here? Switch to Create account above — you will choose a name before joining your first Link."}</p>
        </div>
        <div className="mt-5 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-zinc-600 hover:text-black">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5"><div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-10 text-sm font-black shadow-[6px_6px_0_#1a1a1a]">Loading…</div></main>}>
      <AuthCard />
    </Suspense>
  )
}
