"use client"

import Link from "next/link"
import { Avatar } from "neobrutalism-ui-react"
import { useSession } from "@/lib/use-linkup"

export default function ProfileChip() {
  const { session } = useSession()
  return (
    <Link
      href="/account"
      aria-label="Open account"
      className="ml-auto flex items-center gap-3 rounded-xl border-[3px] border-transparent px-2 py-1 transition hover:border-[#1a1a1a] hover:bg-white"
    >
      <div className="hidden text-right sm:block">
        <div className="text-xs font-black">{session.name}</div>
        <div className="text-[10px] font-bold text-zinc-600">Profile & settings</div>
      </div>
      <Avatar tone="yellow" aria-hidden="true">
        {session.initial}
      </Avatar>
    </Link>
  )
}
