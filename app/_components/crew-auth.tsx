"use client"

import Link from "next/link"
import { ArrowRight, Link2, Mail } from "lucide-react"
import { FormEvent, useState } from "react"
import { safeNextPath } from "@/lib/auth-redirect"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import styles from "./crew-public.module.css"

export default function CrewAuth({
  nextPath: initialNextPath = "/dashboard",
  initialError = "",
  mode = "login",
}: {
  nextPath?: string
  initialError?: string
  mode?: "login" | "signup"
}) {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState(initialError)
  const [emailIssue, setEmailIssue] = useState("")
  const nextPath = safeNextPath(initialNextPath)
  const isSignup = mode === "signup"

  async function google() {
    setBusy(true)
    setError("")
    const callback = new URL("/auth/callback", window.location.origin)
    if (nextPath !== "/dashboard") callback.searchParams.set("next", nextPath)
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    })
    if (authError) {
      setError(authError.message || "Google sign-in could not start.")
      setBusy(false)
    }
  }

  async function magic(event: FormEvent) {
    event.preventDefault()
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setEmailIssue("Enter an email address to receive your link.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailIssue("Enter a valid email address.")
      return
    }
    setBusy(true)
    setError("")
    setMessage("")
    setEmailIssue("")
    const callback = new URL("/auth/callback", window.location.origin)
    callback.searchParams.set("next", nextPath)
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
    })
    if (authError) setError(authError.message || "The sign-in link could not be sent.")
    else setMessage(`Check ${normalizedEmail} for your ${isSignup ? "LinkUp start" : "LinkUp sign-in"} link.`)
    setBusy(false)
  }

  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link><Link href="/">Back</Link></nav>
    <section className={styles.card}>
      <p className={styles.eyebrow}>{isSignup ? "START A PRIVATE LINK" : "YOUR PRIVATE LINK"}</p><h1 className={styles.title} aria-label={isSignup ? "Start with your people." : "Come back to your people."}>{isSignup ? <>Start with<br/><i>your people.</i></> : <>Come back to<br/><i>your people.</i></>}</h1>
      <p className={styles.copy}>{isSignup ? "Create a private home for your plans in a minute. Google is quickest; an email link works too." : "Google is quickest. An email link works too—there are no password tabs to remember."}</p>
      <div className={styles.actions}><button className={styles.primary} disabled={busy} onClick={google}>{isSignup ? "Get started with Google" : "Continue with Google"} <ArrowRight size={16}/></button></div>
      <form className={styles.form} noValidate onSubmit={magic}><label>Email<input value={email} onChange={(event) => { setEmail(event.target.value); if (emailIssue) setEmailIssue("") }} type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(emailIssue)} aria-describedby={emailIssue ? "email-error" : undefined} /></label>{emailIssue && <p id="email-error" className={styles.error} role="alert">{emailIssue}</p>}<button className={styles.secondary} disabled={busy}><Mail size={16}/>{busy ? "Sending…" : isSignup ? "Email me a start link" : "Email me a sign-in link"}</button></form>
      {message && <p className={styles.notice} role="status">{message}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.footer}>By continuing, you create or return to your private LinkUp account.</p>
    </section>
  </div></main>
}
