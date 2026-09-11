import Link from "next/link"
import { ArrowUpRight, Link2 } from "lucide-react"
import CrewStepCards from "./crew-step-cards"
import HomePreview from "./home-preview"
import styles from "./homepage.module.css"
import motion from "./landing-motion.module.css"
import polish from "./landing-polish.module.css"
import flow from "./homepage-flow.module.css"
import LinkLoader from "./link-loader"

export default function CrewLanding() {
  return <main className={`${styles.page} ${motion.page} ${polish.page}`}>
    <LinkLoader />
    <nav className={`${styles.nav} ${motion.nav} ${polish.nav}`}><Link className={styles.brand} href="/"><Link2 size={24}/>linkup</Link><div className={styles.links}><a href="#how-it-works">How it works</a><Link href="/auth">Log in</Link><Link className={styles.cta} href="/auth?mode=signup">Start a Link</Link></div></nav>
    <section className={`${styles.hero} ${motion.hero} ${polish.hero}`}><div className={motion.heroCopy}><p className={styles.eyebrow}>PLANS, WITHOUT THE CHAT CHAOS</p><h1>Make plans<br/><i>actually happen.</i></h1><p className={styles.microcopy}>One calm place for your people to choose a time, keep the chat clear, and show up.</p><Link className={styles.primary} href="/auth?mode=signup">Start a Link <ArrowUpRight size={15}/></Link><p className={styles.microcopy}>Google or email sign-in · No password to remember</p></div><HomePreview /></section>
    <section id="how-it-works" className={`${styles.intro} ${polish.intro}`}><p>HOW IT WORKS</p><h2>One plan.<br/><i>One clear answer.</i></h2><CrewStepCards /></section>
    <section className={`${styles.questions} ${polish.questions} ${flow.questions}`}><div className={flow.questionIntro}><p>BEFORE YOU START</p><h2>Three things people ask first.</h2><span>The rest can stay simple.</span></div><details><summary>What is a Link?<span>+</span></summary><div>A Link is a private shared space for one friend crew and the plans they make together.</div></details><details><summary>Do I need another app?<span>+</span></summary><div>No. LinkUp opens in your browser. Start with Google or an email sign-in link.</div></details><details><summary>Can I invite people later?<span>+</span></summary><div>Yes. Make your Link first, then share a private invite when you are ready.</div></details></section>
    <section className={`${styles.final} ${polish.final}`}><p>THE GROUP CHAT CAN REST</p><h2>Make the next plan<br/><i>the one that happens.</i></h2><Link className={styles.primary} href="/auth?mode=signup">Start a Link <ArrowUpRight size={15}/></Link></section>
    <footer className={styles.footer}><Link className={styles.brand} href="/"><Link2 size={20}/>linkup</Link><span>For the plans worth leaving the house for.</span><Link href="/auth">Log in</Link></footer>
  </main>
}
