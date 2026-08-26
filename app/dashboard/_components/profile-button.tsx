"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function ProfileButton() {
  const [name, setName] = useState("Account")

  useEffect(() => {
    fetch("/api/auth/me")
      .then(response => response.ok ? response.json() : null)
      .then(data => setName(data?.profile?.display_name || data?.user?.user_metadata?.display_name || "Account"))
      .catch(() => undefined)
  }, [])

  return <Link href="/account" className="ml-auto flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-white" aria-label="Open account">
    <div className="hidden text-right sm:block"><div className="text-xs font-bold">{name}</div><div className="text-[10px] text-zinc-500">Profile & settings</div></div>
    <div className="grid h-9 w-9 place-items-center rounded-full border border-zinc-300 bg-brand-lemon text-xs font-black">{name.slice(0, 1).toUpperCase()}</div>
  </Link>
}
