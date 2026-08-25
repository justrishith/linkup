import Link from 'next/link'
import { ArrowRight, CalendarDays, Camera, CircleDollarSign, Lightbulb, Users, Sparkles } from 'lucide-react'

const features = [
  [CalendarDays, 'Plan events', 'Dates, people, tasks, and the whole plan in one place.', 'bg-brand-blue'],
  [Lightbulb, 'Vote on ideas', 'Throw ideas into the crew and let everyone decide.', 'bg-brand-lemon'],
  [CircleDollarSign, 'Track money', 'See what you owe and what your friends owe you.', 'bg-brand-mint'],
  [Camera, 'Keep the memories', 'Put the photos with the event instead of losing them in a chat.', 'bg-brand-peach'],
]

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <header className="border-b-2 border-[#1a1a1a] bg-[#fafaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-brand-blue text-lg font-black shadow-[4px_4px_0_#1a1a1a]">L</div>
            <span className="text-xl font-black tracking-tight">linkup</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="rounded-lg px-3 py-2 text-sm font-black text-zinc-600 hover:bg-white hover:text-black">Log in</Link>
            <Link href="/auth" className="brutal-btn rounded-lg bg-brand-blue px-4 py-2.5 text-sm">Create account <ArrowRight size={15}/></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-14">
        <section className="hero-grid anim-1 overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white p-7 shadow-[7px_7px_0_#1a1a1a] sm:p-12">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-brand-mint px-3 py-1.5 text-[11px] font-black shadow-[2px_2px_0_#1a1a1a]"><Sparkles size={13}/> YOUR CREW, TOGETHER</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.95] tracking-tight sm:text-7xl">Stop planning in six different apps.</h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-zinc-600 sm:text-xl">Linkup gives your friend group one home for plans, events, ideas, money, and memories.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth" className="brutal-btn rounded-lg bg-brand-blue px-5 py-3.5 text-sm">Create your crew <ArrowRight size={16}/></Link>
              <Link href="/auth" className="brutal-btn rounded-lg bg-white px-5 py-3.5 text-sm">I already have an account</Link>
            </div>
          </div>
        </section>

        <section className="anim-2 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([Icon, title, desc, bg]) => { const I = Icon as typeof CalendarDays; return <div key={title as string} className="brutal-card p-5"><div className={`grid h-10 w-10 place-items-center rounded-lg border-2 border-[#1a1a1a] ${bg}`}><I size={18}/></div><h2 className="mt-4 text-lg font-black">{title as string}</h2><p className="mt-2 text-sm font-medium leading-6 text-zinc-500">{desc as string}</p></div> })}
        </section>

        <section className="anim-3 mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="brutal-card bg-brand-blue p-6 sm:p-8">
            <div className="text-[10px] font-black tracking-[.16em]">HOW IT WORKS</div>
            <h2 className="mt-2 text-3xl font-black">Create the group once. Keep everything there.</h2>
            <div className="mt-6 space-y-4">
              {[['01','Make your account'],['02','Create or join your crew'],['03','Plan the next thing']].map(([n,t]) => <div key={n} className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1a1a1a] bg-white text-xs font-black">{n}</div><div className="text-sm font-black">{t}</div></div>)}
            </div>
          </div>
          <div className="brutal-card p-6 sm:p-8">
            <div className="mb-3 text-[10px] font-black tracking-[.16em] text-zinc-500">A LITTLE BETTER</div>
            <h2 className="text-3xl font-black">No “wait, what did we decide?”</h2>
            <p className="mt-4 text-sm font-medium leading-6 text-zinc-500">Everyone sees the same event, the same plan, the same expenses, and the same photos.</p>
            <div className="mt-6 flex items-center gap-3 rounded-xl border-2 border-[#1a1a1a] bg-brand-lemon p-4"><Users size={19}/><span className="text-sm font-black">Built for the whole crew.</span></div>
          </div>
        </section>
      </div>
    </main>
  )
}
