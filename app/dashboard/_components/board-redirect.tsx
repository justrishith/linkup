"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BoardRedirect({ anchor }: { anchor: string }) {
  const router = useRouter()
  useEffect(() => {
    let cancelled = false
    async function go() {
      let id: string | null = null
      try { id = localStorage.getItem("linkup-active-group") } catch { /* private mode */ }
      if (!id) {
        try {
          const response = await fetch("/api/groups")
          const data = await response.json().catch(() => ({}))
          id = response.ok && data.groups?.[0]?.group_id ? data.groups[0].group_id : null
        } catch { id = null }
      }
      if (!cancelled) router.replace(id ? `/dashboard/${id}${anchor}` : "/dashboard")
    }
    go().catch(() => { if (!cancelled) router.replace("/dashboard") })
    return () => { cancelled = true }
  }, [router, anchor])
  return <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5"><div className="rounded-2xl border-[3px] border-[#111] bg-white p-8 text-sm font-black shadow-[5px_5px_0_#111]">Taking you to your Link…</div></main>
}
