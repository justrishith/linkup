"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Avatar } from "neobrutalism-ui-react"

export default function ProfileButton() {
  const [name, setName] = useState("Account")

  useEffect(() => {
    fetch("/api/auth/me")
      .then(response => response.ok ? response.json() : null)
      .then(data => setName(data?.profile?.display_name || data?.user?.user_metadata?.display_name || "Account"))
      .catch(() => undefined)
  }, [])

  return <Link href="/account" className="ml-auto flex items-center gap-3 rounded-xl border-2 border-transparent px-2 py-1 transition hover:border-[#1a1a1a] hover:bg-white" aria-label="Open account">
    <div className="hidden text-right sm:block"><div className="text-xs font-black">{name}</div><div className="text-[10px] font-bold text-zinc-600">Profile & settings</div></div>
    <Avatar tone="yellow" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</Avatar>
  </Link>
}
