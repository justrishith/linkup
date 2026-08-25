import Link from 'next/link'
import { CalendarDays, Camera, Lightbulb, WalletCards, Users } from 'lucide-react'
import BrandMark from '../../_components/brand-mark'

const links = [
  ['/dashboard', 'Home'],
  ['/dashboard/groups', 'Links'],
  ['/dashboard/events', 'Events'],
  ['/dashboard/ideas', 'Ideas'],
  ['/dashboard/expenses', 'Expenses'],
  ['/dashboard/photos', 'Photos'],
]

export default function DashboardShell({ title, eyebrow, children }: { title?: string; eyebrow?: string; children: React.ReactNode }) {
  return <main className="linkup-app min-h-screen bg-[#fafaf8] text-[#111]">
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-[#fafaf8]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6 sm:gap-5"><Link href="/dashboard" className="flex items-center gap-3 mr-2 shrink-0"><BrandMark size={38}/><div className="text-xl font-black tracking-tight">linkup</div></Link><nav className="hidden flex-1 items-center gap-1 overflow-x-auto sm:flex">{links.map(([href,label])=><Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white hover:text-black">{label}</Link>)}</nav><Link href="/account" className="ml-auto flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white" aria-label="Open account"><div className="hidden text-right sm:block"><div className="text-xs font-bold">Account</div><div className="text-[10px] text-zinc-500">Profile & settings</div></div><div className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 bg-brand-lemon text-xs font-black">A</div></Link></div></header>
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 sm:pt-10">{title&&<div className="mb-7"><div className="text-[10px] font-black tracking-[.16em] text-zinc-500">{eyebrow??'LINKUP'}</div><h1 className="mt-1 text-4xl font-black tracking-tight">{title}</h1></div>}{children}</div>
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-zinc-200 bg-[#fafaf8]/94 px-2 py-2 backdrop-blur-xl sm:hidden">{[["/dashboard","Home",null],["/dashboard/groups","Links",Users],["/dashboard/events","Events",CalendarDays],["/dashboard/ideas","Ideas",Lightbulb],["/dashboard/expenses","Money",WalletCards],["/dashboard/photos","Photos",Camera]].map(([href,label,Icon])=>{const I=Icon as typeof Users|null;return <Link key={href as string} href={href as string} className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-black text-zinc-500 hover:bg-white hover:text-black">{I?<I size={16}/>:<span className="text-base leading-none">⌂</span>}{label as string}</Link>})}</nav>
  </main>
}
