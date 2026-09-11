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
}: {
  nextPath?: string
  initialError?: string
}) {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState(initialError)
  const nextPath = safeNextPath(initialNextPath)

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
    if (!email.trim()) return
    setBusy(true)
    setError("")
    setMessage("")
    const callback = new URL("/auth/callback", window.location.origin)
    callback.searchParams.set("next", nextPath)
    const { error: authError } = await createSupabaseBrowserClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
    })
    if (authError) setError(authError.message || "The sign-in link could not be sent.")
    else setMessage(`Check ${email.trim()} for your LinkUp sign-in link.`)
    setBusy(false)
  }

  return <main className={styles.page}><div className={styles.shell}>
    <nav className={styles.nav}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link><Link href="/">Back</Link></nav>
    <section className={styles.card}>
      <p className={styles.eyebrow}>YOUR PRIVATE LINK</p><h1 className={styles.title}>Come back to<br/><i>your people.</i></h1>
      <p className={styles.copy}>Google is quickest. An email link works too—there are no password tabs to remember.</p>
      <div className={styles.actions}><button className={styles.primary} disabled={busy} onClick={google}>Continue with Google <ArrowRight size={16}/></button></div>
      <form className={styles.form} onSubmit={magic}><label>Email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" required /></label><button className={styles.secondary} disabled={busy}><Mail size={16}/>{busy ? "Sending…" : "Email me a sign-in link"}</button></form>
      {message && <p className={styles.notice} role="status">{message}</p>}{error && <p className={styles.error} role="alert">{error}</p>}
      <p className={styles.footer}>By continuing, you create or return to your private LinkUp account.</p>
    </section>
  </div></main>
}
