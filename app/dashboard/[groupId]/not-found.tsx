import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Link not found · Linkup" }

export default function LinkNotFound() {
  return (
    <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-10 text-center shadow-[6px_6px_0_#1a1a1a]">
      <h2 className="text-2xl font-black">Link not found.</h2>
      <p className="mt-2 text-sm text-zinc-500">It may have been removed, or the address is wrong.</p>
      <Link href="/dashboard" className="brutal-btn mt-6 inline-flex rounded-xl bg-brand-lemon px-5 py-3 text-sm">
        Back to your links
      </Link>
    </div>
  )
}
