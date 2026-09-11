import Link from "next/link"
import { ArrowRight, Link2 } from "lucide-react"
import styles from "../_components/crew-public.module.css"

export default function OnboardingPage() {
  return <main className={styles.page}><div className={styles.shell}><nav className={styles.nav}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link></nav><section className={styles.card}><p className={styles.eyebrow}>WELCOME TO LINKUP</p><h1 className={styles.title}>Your people,<br/><i>finally organized.</i></h1><p className={styles.copy}>You are ready. Make a private Link for your crew, or open an invite that someone shared with you.</p><div className={styles.steps}><div className={styles.step}><i>1</i><div><b>Pick your people</b><span>A Link is one private shared space.</span></div></div><div className={styles.step}><i>2</i><div><b>Suggest a plan</b><span>Everyone can vote on the dates.</span></div></div><div className={styles.step}><i>3</i><div><b>Keep the memory</b><span>Proof photos stay inside the Link.</span></div></div></div><div className={styles.actions}><Link className={styles.primary} href="/dashboard/groups">Make or open a Link <ArrowRight size={16}/></Link><Link className={styles.secondary} href="/dashboard">Explore first</Link></div></section></div></main>
}
