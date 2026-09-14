"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, CalendarDays, Check, Link2, Users } from "lucide-react"
import { Button } from "neobrutalism-ui-react"
import BrandMark from "../_components/brand-mark"

const steps = [
  { icon: Link2, title: "Make a link", body: "A link is one shared space for a group of people. Keep the plan, ideas, money, and photos there.", fill: "bg-brand-blue" },
  { icon: Users, title: "Invite your people", body: "Copy one private invite link and send it to the group chat. Everybody sees the same plan.", fill: "bg-brand-mint" },
  { icon: CalendarDays, title: "Start with the next thing", body: "Add one idea or event. You do not need to fill out the whole app before it becomes useful.", fill: "bg-brand-lemon" },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const current = steps[step]
  const Icon = current.icon
  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 py-10 text-[#1a1a1a]">
      <div className="w-full max-w-2xl">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <BrandMark size={44} />
          <span className="text-2xl font-black">linkup</span>
        </Link>
        <section className="brutal-card relative mt-8 overflow-hidden p-6 sm:p-10">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div key={index} className={`h-2 flex-1 rounded-full border-[3px] border-[#1a1a1a] ${index <= step ? "bg-brand-mint" : "bg-white"}`} />
            ))}
          </div>
          <div className={`mt-10 grid h-16 w-16 place-items-center rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0_#1a1a1a] ${current.fill}`}>
            <Icon size={29} />
          </div>
          <div className="kicker mt-7 text-zinc-500">STEP {step + 1} OF {steps.length}</div>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">{current.title}.</h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-zinc-600">{current.body}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step < steps.length - 1 ? (
              <Button tone="blue" onClick={() => setStep(step + 1)}>
                Next <ArrowRight size={16} />
              </Button>
            ) : (
              <Button tone="mint" href="/dashboard">
                Open my links <Check size={16} />
              </Button>
            )}
            <Link href="/dashboard" className="rounded-xl px-4 py-3 text-sm font-black text-zinc-500 hover:bg-white hover:text-black">
              Skip for now
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
