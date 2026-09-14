"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, Link2, LogOut, UserRound } from "lucide-react"
import { Avatar, Badge, Button } from "neobrutalism-ui-react"
import BrandMark from "../_components/brand-mark"

export default function AccountPage() {
  const [profile, setProfile] = useState<{ display_name?: string } | null>(null)
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.profile) setProfile(data.profile)
        if (data?.user?.email) setEmail(data.user.email)
      })
      .catch(() => undefined)
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  const name = profile?.display_name || "Your account"

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 hover:text-black">
            <ArrowLeft size={16} /> Back
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandMark size={36} />
            <span className="text-xl font-black tracking-tight">linkup</span>
          </Link>
        </div>
        <section className="mt-7 overflow-hidden rounded-[20px] border-[3px] border-[#1a1a1a] bg-white shadow-[6px_6px_0_#1a1a1a]">
          <div className="border-b-[3px] border-[#1a1a1a] bg-brand-lemon p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <Avatar tone="white" className="text-xl">
                {name.slice(0, 1).toUpperCase()}
              </Avatar>
              <div>
                <Badge tone="white">YOUR LINKUP IDENTITY</Badge>
                <h1 className="mt-2 text-4xl font-black">{name}</h1>
                <p className="mt-1 text-sm font-bold text-zinc-700">{email || "Loading email…"}</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border-[3px] border-[#1a1a1a] bg-white p-5 shadow-[4px_4px_0_#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border-[3px] border-[#1a1a1a] bg-brand-blue">
                  <UserRound size={17} />
                </div>
                <div>
                  <h2 className="text-lg font-black">Profile</h2>
                  <p className="mt-1 text-sm text-zinc-500">Your Linkup identity comes from your account.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border-[3px] border-[#1a1a1a] bg-brand-mint p-5 shadow-[4px_4px_0_#1a1a1a]">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border-[3px] border-[#1a1a1a] bg-white">
                  <Link2 size={17} />
                </div>
                <div>
                  <h2 className="text-lg font-black">Your links</h2>
                  <p className="mt-1 text-sm text-zinc-600">Keep your people grouped by the things that connect you.</p>
                </div>
              </div>
              <Link href="/dashboard" className="mt-4 inline-flex text-xs font-black underline decoration-[3px] underline-offset-4">
                Manage links →
              </Link>
            </div>
          </div>
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <Button tone="white" size="sm" onClick={logout}>
              <LogOut size={14} /> Log out
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
