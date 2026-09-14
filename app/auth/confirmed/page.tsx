import Link from "next/link"
import { Badge } from "../../_components/ui"
import BrandMark from "../../_components/brand-mark"

export default function ConfirmedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 py-10 text-[#1a1a1a]">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <BrandMark size={44} />
          <span className="text-2xl font-black tracking-tight">linkup</span>
        </Link>
        <div className="brutal-card mt-8 p-8 sm:p-10">
          <Badge tone="mint">CHECK YOUR INBOX</Badge>
          <h1 className="mt-3 text-4xl font-black tracking-tight">Email confirmed.</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-zinc-600">
            Your account is ready. Log in to meet your Links.
          </p>
          <Link href="/auth?mode=login" className="brutal-btn mt-6 inline-flex rounded-xl bg-brand-mint px-5 py-3 text-sm">
            Log in
          </Link>
        </div>
      </div>
    </main>
  )
}
