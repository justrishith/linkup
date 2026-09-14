"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashNav() {
  const pathname = usePathname()
  const active = pathname === "/dashboard"
  return (
    <>
      <nav className="hidden items-center gap-2 sm:flex" aria-label="Dashboard">
        <Link
          href="/dashboard"
          aria-current={active ? "page" : undefined}
          className={`rounded-xl border-[3px] px-4 py-2 text-sm font-black transition ${
            active
              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white shadow-[3px_3px_0_rgba(26,26,26,.25)]"
              : "border-transparent text-zinc-700 hover:border-[#1a1a1a] hover:bg-white hover:text-black"
          }`}
        >
          Links
        </Link>
      </nav>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t-[3px] border-[#1a1a1a] bg-white px-2 py-2 sm:hidden" aria-label="Dashboard">
        <Link
          href="/dashboard"
          aria-current={active ? "page" : undefined}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border-[3px] px-1 py-2 text-[10px] font-black ${
            active ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-transparent text-zinc-700"
          }`}
        >
          Links
        </Link>
      </nav>
    </>
  )
}
