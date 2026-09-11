"use client"

import Link from "next/link"
import { ArrowRight, Link2, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import styles from "../../_components/crew-public.module.css"

type Invite = { code: string; groups?: { name: string; description?: string | null } | null }

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const [code, setCode] = useState(""); const [invite, setInvite] = useState<Invite | null>(null); const [loading, setLoading] = useState(true); const [joining, setJoining] = useState(false); const [error, setError] = useState("")
  useEffect(() => { params.then(async ({ code: value }) => { const normalized = value.toUpperCase(); setCode(normalized); try { const response = await fetch(`/api/invites?code=${encodeURIComponent(normalized)}`); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "This invite is unavailable."); setInvite(data.invite) } catch (cause) { setError(cause instanceof Error ? cause.message : "This invite is unavailable.") } finally { setLoading(false) } }) }, [params])
  async function join() { setJoining(true); setError(""); try { const response = await fetch("/api/invites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Could not join this Link."); window.location.assign("/dashboard") } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not join this Link."); setJoining(false) } }
  return <main className={styles.page}><div className={styles.shell}><nav className={styles.nav}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link><Link href="/">Back</Link></nav><section className={styles.card}>{loading ? <p className={styles.copy}><LoaderCircle className="inline animate-spin" size={16}/> Opening your invite…</p> : invite ? <><p className={styles.eyebrow}>YOU&apos;RE INVITED</p><h1 className={styles.title}>Join<br/><i>{invite.groups?.name || "this Link"}.</i></h1><p className={styles.copy}>{invite.groups?.description || "A private place to make plans with your people."}</p><div className={styles.invite}><span>PRIVATE INVITE</span><b>{code}</b></div><div className={styles.actions}><button className={styles.primary} disabled={joining} onClick={join}>{joining ? "Joining…" : "Join this Link"}<ArrowRight size={16}/></button></div></> : <><p className={styles.eyebrow}>INVITE UNAVAILABLE</p><h1 className={styles.title}>This link<br/><i>is not ready.</i></h1><p className={styles.copy}>{error || "It may have expired."}</p><div className={styles.actions}><Link className={styles.secondary} href="/auth">Sign in to LinkUp</Link></div></>}{error && invite && <p className={styles.error} role="alert">{error}</p>}</section></div></main>
}
