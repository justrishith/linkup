"use client"

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Link2, Users, CalendarDays } from 'lucide-react'
import BrandMark from '../_components/brand-mark'

const steps = [
  { icon: Link2, title: 'Make a link', body: 'A link is one shared space for a group of people. Keep the plan, ideas, money, and photos there.' },
  { icon: Users, title: 'Invite your people', body: 'Copy one private invite link and send it to the group chat. Everybody sees the same plan.' },
  { icon: CalendarDays, title: 'Start with the next thing', body: 'Add one idea or event. You do not need to fill out the whole app before it becomes useful.' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  return <main className="grid min-h-screen place-items-center overflow-hidden bg-[#fafaf8] px-5 py-10 text-[#111]">
    <div className="w-full max-w-2xl">
      <Link href="/welcome" className="mx-auto flex w-fit items-center gap-3"><BrandMark size={44}/><span className="text-2xl font-black">linkup</span></Link>
      <section className="brutal-card relative mt-8 overflow-hidden p-6 sm:p-10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-blue/45 blur-3xl" />
        <div className="relative flex gap-2">{steps.map((_, index) => <div key={index} className={`h-2 flex-1 rounded-full border border-[#111] ${index <= step ? 'bg-brand-mint' : 'bg-white'}`} />)}</div>
        <div className="relative mt-10 grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#111] bg-brand-lemon shadow-[4px_4px_0_#111]"><Icon size={29}/></div>
        <div className="relative mt-7 text-[10px] font-black tracking-[.18em] text-zinc-500">STEP {step + 1} OF {steps.length}</div>
        <h1 className="relative mt-2 text-4xl font-black sm:text-5xl">{current.title}.</h1>
        <p className="relative mt-4 max-w-xl text-base font-medium leading-7 text-zinc-600">{current.body}</p>
        <div className="relative mt-8 flex flex-wrap gap-3">
          {step < steps.length - 1 ? <button onClick={() => setStep(step + 1)} className="brutal-btn rounded-lg bg-brand-blue px-5 py-3.5 text-sm">Next <ArrowRight size={16}/></button> : <Link href="/dashboard/groups" className="brutal-btn rounded-lg bg-brand-mint px-5 py-3.5 text-sm">Open my links <Check size={16}/></Link>}
          <Link href="/dashboard" className="rounded-lg px-4 py-3 text-sm font-black text-zinc-500 hover:bg-white hover:text-black">Skip for now</Link>
        </div>
      </section>
    </div>
  </main>
}
