import Link from "next/link"
import { ArrowRight, CalendarDays, Link2, MousePointer2, Sparkles, Users } from "lucide-react"
import { Badge, Button } from "./_components/ui"
import BrandMark from "./_components/brand-mark"

const steps = [
  { number: "01", title: "Make a Link", copy: "Give the hangout a name. Your Link becomes the shared home for this group.", icon: Link2, fill: "bg-brand-blue" },
  { number: "02", title: "Drop dates + ideas", copy: "Events and suggestions live on one calendar, so decisions have context.", icon: CalendarDays, fill: "bg-brand-mint" },
  { number: "03", title: "Send one invite", copy: "Share the Link in your group chat. Everyone sees the same clear next step.", icon: Users, fill: "bg-brand-coral" },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      <header className="sticky top-4 z-20 mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between gap-3 rounded-[18px] border-[3px] border-[#1a1a1a] bg-white px-4 py-2.5 shadow-[4px_4px_0_#1a1a1a]">
        <Link href="/" className="flex items-center gap-3" aria-label="Linkup home">
          <BrandMark size={38} />
          <span className="text-xl font-black tracking-tight">linkup</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          <Link href="#how-it-works" className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-brand-lemon hover:text-black">
            How it works
          </Link>
          <Link href="#sample" className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 hover:bg-brand-lemon hover:text-black">
            See a Link
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth?mode=login" className="hidden px-3 py-2 text-sm font-black sm:block">
            Log in
          </Link>
          <Button size="sm" tone="black" href="/auth?mode=signup">
            <span>Create a Link</span>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <Badge tone="yellow">
          <Sparkles size={12} /> planning should feel like the trip
        </Badge>
        <h1 className="mt-6 text-[clamp(56px,10vw,128px)] font-black leading-[.85] tracking-tight">
          Get the group
          <br />
          out of the chat.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-zinc-600">
          One playful home for the date, the vote, and the plan. Everyone knows what is happening next — without digging through 300 messages.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button tone="blue" href="/preview">
            <MousePointer2 size={16} /> Explore the demo
          </Button>
          <Button tone="white" href="/auth?mode=signup">
            Start a Link <ArrowRight size={16} />
          </Button>
        </div>

        <div className="relative mx-auto mt-14 max-w-2xl">
          <div className="absolute -left-3 top-8 -rotate-6 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-mint px-4 py-2 text-xs font-black shadow-[3px_3px_0_#1a1a1a]">
            6 friends are in
          </div>
          <div className="absolute -right-3 top-24 rotate-3 rounded-xl border-[3px] border-[#1a1a1a] bg-brand-peach px-4 py-2 text-xs font-black shadow-[3px_3px_0_#1a1a1a]">
            Cabin wins 5–1
          </div>
          <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-6 text-left shadow-[8px_8px_0_#1a1a1a] sm:p-8">
            <div className="kicker text-zinc-500">NEXT LINKUP</div>
            <div className="mt-1 text-3xl font-black">Big Bear weekend</div>
            <div className="mt-1 text-sm font-bold text-zinc-500">Cabin · 6 people · Jul 18</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["3 plans", "bg-brand-blue"],
                ["3 ideas", "bg-brand-lemon"],
                ["$677 logged", "bg-brand-mint"],
              ].map(([label, fill]) => (
                <div key={label as string} className={`rounded-xl border-[3px] border-[#1a1a1a] px-3 py-3 text-center text-sm font-black ${fill as string}`}>
                  {label as string}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-[min(1180px,calc(100%-40px))] scroll-mt-28 py-16">
        <Badge tone="white">THREE THINGS. THAT IS IT.</Badge>
        <h2 className="mt-3 max-w-2xl text-5xl font-black leading-[.9] tracking-tight sm:text-6xl">
          A plan everyone can understand.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, copy, icon: Icon, fill }) => (
            <article key={number} className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-7 shadow-[6px_6px_0_#1a1a1a]">
              <div className="flex items-center justify-between">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-[#1a1a1a] ${fill}`}>
                  <Icon size={24} />
                </div>
                <span className="text-5xl font-black text-zinc-200">{number}</span>
              </div>
              <h3 className="mt-6 text-2xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="sample" className="mx-auto w-[min(1180px,calc(100%-40px))] scroll-mt-28 py-10">
        <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-brand-lemon p-8 shadow-[8px_8px_0_#1a1a1a] sm:p-12">
          <Badge tone="black">THE GROUP CHAT CAN REST</Badge>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Make the plan real.</h2>
          <p className="mt-3 max-w-lg font-medium text-zinc-700">Start with one Link. Invite the people. Pick the thing.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button tone="black" href="/auth?mode=signup">
              Create your first Link <ArrowRight size={16} />
            </Button>
            <Button tone="white" href="/preview">
              Peek at a Link
            </Button>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex w-[min(1180px,calc(100%-40px))] flex-wrap items-center justify-between gap-3 px-1 py-10 text-xs font-bold text-zinc-500">
        <Link href="/" className="flex items-center gap-2 text-base font-black text-black">
          <BrandMark size={30} /> linkup
        </Link>
        <span>Plans in. Chaos out. © {new Date().getFullYear()} Linkup</span>
      </footer>
    </main>
  )
}
