import Link from "next/link"
import { ArrowRight, Check, Link2 } from "lucide-react"
import styles from "../../_components/crew-public.module.css"

export default function ConfirmedPage() {
  return <main className={styles.page}><div className={styles.shell}><nav className={styles.nav}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link></nav><section className={styles.card}><p className={styles.eyebrow}>EMAIL CONFIRMED</p><h1 className={styles.title}>You&apos;re<br/><i>all set.</i></h1><p className={styles.copy}>Your account is ready. The next step is choosing a Link or making one with your people.</p><div className={styles.actions}><Link className={styles.primary} href="/onboarding">Continue <Check size={16}/></Link><Link className={styles.secondary} href="/dashboard">Open LinkUp <ArrowRight size={16}/></Link></div></section></div></main>
}
