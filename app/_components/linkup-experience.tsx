"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { SpotlightProvider, SpotlightTour, useSpotlight } from "react-tourlight"
import { ArrowDown, ArrowRight, CalendarDays, Camera, Check, CircleDollarSign, Compass, Link2, LockKeyhole, Menu, MousePointer2, Plus, Route, Sparkles, Users, X } from "lucide-react"
import AnimatedLinkLogo from "./animated-link-logo"
import MagneticButton from "./magnetic-button"
import { useLinkupMotion } from "./linkup-motion"
import type { LinkupCalendarItem } from "./experience-calendar"

const ExperienceCalendar = dynamic(() => import("./experience-calendar"), { ssr: false, loading: () => <CalendarSkeleton /> })

type ApiEvent = { id: string; name: string; starts_at?: string | null }
type ApiIdea = { id: string; title: string }
type Profile = { display_name?: string | null }

const demoItems: LinkupCalendarItem[] = [
  { id: "demo-1", title: "Beach sunset", start: dateAt(2, 17), end: dateAt(2, 20), kind: "event" },
  { id: "demo-2", title: "Pick the cabin", start: dateAt(6, 12), end: dateAt(6, 13), kind: "idea" },
  { id: "demo-3", title: "Birthday dinner", start: dateAt(10, 19), end: dateAt(10, 21), kind: "event" },
  { id: "demo-4", title: "Vote: summer trip", start: dateAt(14, 10), end: dateAt(14, 11), kind: "idea" },
]

function dateAt(daysFromNow: number, hour: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hour, 0, 0, 0)
  return date
}

function CalendarSkeleton() {
  return <div className="calendar-skeleton" aria-label="Loading calendar"><div className="skeleton-line skeleton-wide" /><div className="skeleton-grid">{Array.from({ length: 21 }, (_, index) => <span key={index} />)}</div></div>
}

function DashboardSkeleton() {
  return (
    <div className="demo-skeleton" role="status" aria-label="Loading your Linkup dashboard">
      <div className="skeleton-head"><span /><span /></div>
      <div className="skeleton-grid">{Array.from({ length: 14 }, (_, index) => <span key={index} />)}</div>
      <span className="sr-only">Loading dashboard</span>
    </div>
  )
}

function AuthGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeButton.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="auth-gate-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-gate" role="dialog" aria-modal="true" aria-labelledby="auth-gate-title">
        <button ref={closeButton} type="button" className="modal-close" onClick={onClose} aria-label="Close sign in dialog"><X size={19} /></button>
        <div className="auth-gate-mark"><AnimatedLinkLogo compact /></div>
        <div className="mini-kicker"><LockKeyhole size={13} /> your demo is safe</div>
        <h2 id="auth-gate-title">Ready to make it yours?</h2>
        <p>You can explore everything without an account. Sign up only when you want to save a Link and invite your people.</p>
        <div className="auth-actions">
          <Link href="/auth?mode=signup" className="liquid-anchor liquid-violet">Create free account <ArrowRight size={16} /></Link>
          <Link href="/auth?mode=login" className="liquid-anchor liquid-ghost">I already have one</Link>
        </div>
        <button type="button" className="keep-exploring" onClick={onClose}>Keep exploring the demo</button>
      </section>
    </div>
  )
}

function TourStarter({ loading }: { loading: boolean }) {
  const { start } = useSpotlight()
  const started = useRef(false)

  useEffect(() => {
    if (loading || started.current || sessionStorage.getItem("linkup-tour-seen")) return
    started.current = true
    const timer = window.setTimeout(() => start("linkup-onboarding"), 1300)
    return () => window.clearTimeout(timer)
  }, [loading, start])

  return <MagneticButton tone="ghost" className="tour-button" onClick={() => start("linkup-onboarding")}><Compass size={16} /> Show me around</MagneticButton>
}

function LinkupExperienceInner({ isAuthenticated }: { isAuthenticated: boolean }) {
  const page = useRef<HTMLElement>(null)
  const [loading, setLoading] = useState(true)
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile>({})
  const [items, setItems] = useState<LinkupCalendarItem[]>(demoItems)
  useLinkupMotion(page)

  useEffect(() => {
    const minimumLoader = window.setTimeout(() => setLoading(false), 1150)
    if (!isAuthenticated) return () => window.clearTimeout(minimumLoader)

    Promise.all([fetch("/api/auth/me"), fetch("/api/events"), fetch("/api/ideas")])
      .then(async ([profileResponse, eventResponse, ideaResponse]) => {
        const [profileData, eventData, ideaData] = await Promise.all([
          profileResponse.json().catch(() => ({})),
          eventResponse.json().catch(() => ({})),
          ideaResponse.json().catch(() => ({})),
        ])
        if (profileResponse.ok) setProfile(profileData.profile || {})
        const realEvents: LinkupCalendarItem[] = eventResponse.ok ? (eventData.events || []).map((event: ApiEvent) => {
          const start = event.starts_at ? new Date(event.starts_at) : dateAt(3, 18)
          return { id: event.id, title: event.name, start, end: new Date(start.getTime() + 7_200_000), kind: "event" as const }
        }) : []
        const realIdeas: LinkupCalendarItem[] = ideaResponse.ok ? (ideaData.ideas || []).map((idea: ApiIdea, index: number) => ({
          id: idea.id,
          title: idea.title,
          start: dateAt(index + 4, 12),
          end: dateAt(index + 4, 13),
          kind: "idea" as const,
        })) : []
        if (realEvents.length || realIdeas.length) setItems([...realEvents, ...realIdeas])
      })
      .catch(() => undefined)

    return () => window.clearTimeout(minimumLoader)
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) return
    const timer = window.setTimeout(() => setAuthOpen(true), 180_000)
    return () => window.clearTimeout(timer)
  }, [isAuthenticated])

  const firstName = useMemo(() => profile.display_name?.trim().split(/\s+/)[0] || "friend", [profile.display_name])

  function createLink() {
    if (isAuthenticated) window.location.assign("/dashboard/groups")
    else setAuthOpen(true)
  }

  function scrollToDemo() {
    document.querySelector("#demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main ref={page} className="linkup-experience">
      <div className="mesh mesh-one" aria-hidden="true" /><div className="mesh mesh-two" aria-hidden="true" /><div className="mesh mesh-three" aria-hidden="true" />
      <header className="experience-nav">
        <Link href="/" className="experience-brand" aria-label="Linkup home"><AnimatedLinkLogo compact /><span>linkup</span></Link>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#how-it-works">How it works</a><a href="#demo">Live demo</a><a href="#integrations">Integrations</a>
        </nav>
        <div className="nav-actions">
          {isAuthenticated ? <Link className="account-chip" href="/account"><span>{firstName.slice(0, 1).toUpperCase()}</span>{firstName}</Link> : <Link href="/auth?mode=login" className="nav-login">Log in</Link>}
          <MagneticButton className="nav-cta" onClick={createLink}><Plus size={15} /> Create a Link</MagneticButton>
          <button type="button" className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}><Menu size={21} /></button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-badge" data-reveal><span className="pulse-dot" /> planning should feel like the trip</div>
        <h1 data-reveal>Get the group<br /><span>out of the chat.</span></h1>
        <p data-reveal>One playful home for the date, the vote, and the plan. Everyone knows what’s happening next — without digging through 300 messages.</p>
        <div className="hero-actions" data-reveal>
          <MagneticButton onClick={scrollToDemo}>Explore the demo <MousePointer2 size={17} /></MagneticButton>
          <MagneticButton tone="ghost" onClick={createLink}>Start a Link <ArrowRight size={17} /></MagneticButton>
        </div>
        <button type="button" className="scroll-cue" onClick={scrollToDemo}><span>Scroll to explore</span><ArrowDown size={15} /></button>

        <div className="hero-visual" aria-hidden="true">
          <div className="floating-pill pill-people" data-float="slow"><Users size={16} /> 6 friends are in</div>
          <div className="floating-pill pill-vote" data-float="fast"><Sparkles size={16} /> Cabin wins 5–1</div>
          <div className="floating-card trip-card" data-float="slow"><div className="trip-image"><span>JUL</span><strong>18</strong></div><div><small>NEXT LINKUP</small><strong>Big Bear weekend</strong><span>Cabin · 6 people</span></div></div>
          <div className="hero-link-orbit"><AnimatedLinkLogo /></div>
        </div>
      </section>

      <section id="how-it-works" className="how-section">
        <div className="section-heading" data-reveal><div className="mini-kicker"><Route size={14} /> three things. that’s it.</div><h2>A plan everyone<br />can understand.</h2><p>No tabs called “records.” No mystery dashboards. Linkup guides the group from maybe to happening.</p></div>
        <div className="story-cards">
          {[
            { number: "01", title: "Make a Link", copy: "Give the hangout a name. Your Link becomes the shared home for this group.", icon: Link2, color: "story-violet" },
            { number: "02", title: "Drop dates + ideas", copy: "Events and suggestions live on one calendar, so decisions have context.", icon: CalendarDays, color: "story-mint" },
            { number: "03", title: "Send one invite", copy: "Share the Link in your group chat. Everyone sees the same clear next step.", icon: Users, color: "story-coral" },
          ].map(({ number, title, copy, icon: StoryIcon, color }) => {
            return <article key={number} className={`story-card ${color}`} data-reveal><span className="story-number">{number}</span><div className="story-icon"><StoryIcon size={22} /></div><h3>{title}</h3><p>{copy}</p></article>
          })}
        </div>
      </section>

      <section id="demo" className="demo-section">
        <div className="section-heading centered" data-reveal><div className="mini-kicker"><span className="pulse-dot" /> no account needed</div><h2>Touch everything.<br />You can’t break it.</h2><p>This is a real interactive dashboard demo. Switch calendar views, move through dates, and learn the product before signing up.</p></div>
        <div className="demo-window" data-reveal>
          <div className="demo-window-bar"><div className="window-dots"><i /><i /><i /></div><div className="demo-title"><AnimatedLinkLogo compact /><span>{isAuthenticated ? `${firstName}’s Link` : "Weekend people"}</span><em>{isAuthenticated ? "LIVE" : "DEMO"}</em></div><TourStarter loading={loading} /></div>
          {loading ? <DashboardSkeleton /> : <div className="demo-content">
            <aside className="demo-sidebar"><div className="sidebar-label">THIS LINK</div><button className="active" type="button"><CalendarDays size={17} /> Plan</button><a href="#integrations"><CircleDollarSign size={17} /> Splitwise</a><a href="#integrations"><Camera size={17} /> Memories</a><div className="people-stack"><span>RK</span><span>JM</span><span>AL</span><button type="button" aria-label="Invite another friend">+</button></div></aside>
            <div className="demo-main"><div className="demo-welcome"><div><span className="mini-kicker">THE WHOLE PLAN</span><h3>{isAuthenticated ? `Hey ${firstName}, what’s next?` : "Big Bear weekend"}</h3></div><MagneticButton onClick={createLink}><Plus size={15} /> Create a Link</MagneticButton></div><ExperienceCalendar items={items} /></div>
          </div>}
        </div>
      </section>

      <section id="integrations" className="integrations-section">
        <div className="section-heading" data-reveal><div className="mini-kicker"><Check size={14} /> less app. more useful.</div><h2>Let the best apps<br />do the heavy lifting.</h2><p>Linkup keeps the plan clear and hands specialized jobs to tools your friends already trust.</p></div>
        <div className="integration-grid">
          <article className="integration-card splitwise-card" data-reveal data-tour="integrations"><div className="integration-logo splitwise-logo">S</div><span className="integration-status">PLACEHOLDER</span><h3>Expenses, without another ledger.</h3><p>Connect Splitwise to see who owes what. Linkup shows the summary; Splitwise handles the math.</p><MagneticButton tone="mint" onClick={() => !isAuthenticated && setAuthOpen(true)}>Connect Splitwise <ArrowRight size={16} /></MagneticButton></article>
          <article className="integration-card photos-card" data-reveal><div className="integration-logo photos-logo"><i /><i /><i /><i /></div><span className="integration-status">PLACEHOLDER</span><h3>Memories stay where photos belong.</h3><p>Attach a shared Google Photos album and keep the best moments one tap from the plan.</p><MagneticButton tone="coral" onClick={() => !isAuthenticated && setAuthOpen(true)}>Connect Google Photos <ArrowRight size={16} /></MagneticButton></article>
        </div>
      </section>

      <section className="final-cta" data-reveal><div className="final-orb" /><AnimatedLinkLogo /><div><span className="mini-kicker">THE GROUP CHAT CAN REST</span><h2>Make the plan real.</h2><p>Start with one Link. Invite the people. Pick the thing.</p></div><MagneticButton onClick={createLink}>Create your first Link <ArrowRight size={17} /></MagneticButton></section>
      <footer><Link href="/" className="experience-brand"><AnimatedLinkLogo compact /><span>linkup</span></Link><p>Plans in. Chaos out.</p><span>© {new Date().getFullYear()} Linkup</span></footer>

      <AuthGate open={authOpen} onClose={() => setAuthOpen(false)} />
      {/* Future gamification: verified trips will award points toward a global Linkup leaderboard. */}
    </main>
  )
}

export default function LinkupExperience({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <SpotlightProvider persist persistKey="linkup-onboarding" onComplete={() => sessionStorage.setItem("linkup-tour-seen", "1")} onSkip={() => sessionStorage.setItem("linkup-tour-seen", "1")}>
      <SpotlightTour id="linkup-onboarding" steps={[
        { target: "[data-tour='calendar'] .calendar-toolbar", title: "Your plan lives here", content: "Events and ideas share one calendar, so the group can see both what is decided and what still needs a vote.", placement: "bottom" },
        { target: "[data-tour='views']", title: "Zoom in or out", content: "Use day for details, month for the whole plan, and year for the big picture.", placement: "bottom", interactive: true },
        { target: "[data-tour='integrations'] .integration-logo", title: "Keep the specialist apps", content: "Splitwise handles expense math and Google Photos holds memories. Linkup simply keeps both connected to the plan.", placement: "bottom" },
      ]} />
      <LinkupExperienceInner isAuthenticated={isAuthenticated} />
    </SpotlightProvider>
  )
}
