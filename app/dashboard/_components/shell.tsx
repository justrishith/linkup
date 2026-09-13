"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, Camera, Lightbulb, Users, WalletCards } from "lucide-react"
import { Badge } from "neobrutalism-ui-react"
import AnimatedLinkLogo from "../../_components/animated-link-logo"
import ProfileButton from "./profile-button"

const links = [
  ["/dashboard", "Home"],
  ["/dashboard/groups", "Links"],
  ["/dashboard/events", "Events"],
  ["/dashboard/ideas", "Ideas"],
  ["/dashboard/expenses", "Expenses"],
  ["/dashboard/photos", "Photos"],
] as const

const mobileLinks = [
  ["/dashboard", "Home", null],
  ["/dashboard/groups", "Links", Users],
  ["/dashboard/events", "Events", CalendarDays],
  ["/dashboard/ideas", "Ideas", Lightbulb],
  ["/dashboard/expenses", "Money", WalletCards],
  ["/dashboard/photos", "Photos", Camera],
] as const

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardShell({ title, eyebrow, children }: { title?: string; eyebrow?: string; children: React.ReactNode }) {
  const pathname = usePathname()
  return <main className="linkup-app min-h-screen bg-[#fafaf8] text-[#111]">
    <header className="sticky top-0 z-20 border-b-[3px] border-[#1a1a1a] bg-brand-lemon"><div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6"><Link href="/dashboard" className="mr-1 flex shrink-0 items-center gap-2 rounded-lg border-2 border-[#1a1a1a] bg-white py-1 pl-2 pr-3 shadow-[2px_2px_0_#1a1a1a]" aria-label="Linkup home"><AnimatedLinkLogo compact /><div className="text-xl font-black tracking-tight">linkup</div></Link><nav className="hidden flex-1 items-center gap-2 overflow-x-auto sm:flex" aria-label="Dashboard">{links.map(([href, label]) => {
      const active = isActive(pathname, href)
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg border-2 px-3 py-2 text-sm font-black transition ${active ? "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-[2px_2px_0_rgba(26,26,26,.25)]" : "border-transparent text-zinc-700 hover:border-[#1a1a1a] hover:bg-white hover:text-black"}`}>{label}</Link>
    })}</nav><ProfileButton /></div></header>
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 sm:pt-10">{title && <div className="mb-7 flex flex-wrap items-center gap-3"><div><Badge tone="yellow">{eyebrow ?? "LINKUP"}</Badge><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1></div></div>}{children}</div>
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t-[3px] border-[#1a1a1a] bg-brand-lemon px-2 py-2 sm:hidden" aria-label="Dashboard">{mobileLinks.map(([href, label, Icon]) => {
      const active = isActive(pathname, href as string)
      const I = Icon as typeof Users | null
      return <Link key={href as string} href={href as string} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border-2 px-1 py-2 text-[10px] font-black ${active ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-transparent text-zinc-700"}`}>{I ? <I size={16}/> : <span className="text-base leading-none">⌂</span>}{label as string}</Link>
    })}</nav>
  </main>
}
