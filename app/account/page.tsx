"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, Link2, LogOut, UserRound } from 'lucide-react'
import BrandMark from '../_components/brand-mark'

export default function AccountPage() {
  const [profile, setProfile] = useState<{display_name?: string; avatar_url?: string | null} | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((data) => {
      if (data?.profile) setProfile(data.profile)
      if (data?.user?.email) setEmail(data.user.email)
    }).catch(() => {})
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/welcome'
  }

  const name = profile?.display_name || 'Your account'

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-4"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 hover:text-black"><ArrowLeft size={16}/> Back</Link><Link href="/dashboard" className="brand-lockup"><BrandMark size={36}/><span className="text-xl font-black tracking-tight">linkup</span></Link></div>
        <section className="mt-7 overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[4px_4px_0_rgba(26,26,26,.07)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-white to-brand-mint p-7 sm:p-10">
            <div className="absolute -right-10 -top-14 h-52 w-52 rounded-full bg-brand-lemon/80 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xl font-black shadow-[3px_3px_0_rgba(26,26,26,.75)]">{name.slice(0,1).toUpperCase()}</div>
              <div><div className="text-[10px] font-black tracking-[.16em]">YOUR LINKUP IDENTITY</div><h1 className="mt-1 text-4xl font-black">{name}</h1><p className="mt-1 text-sm font-semibold text-zinc-700">{email || 'Loading email…'}</p></div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="brutal-card-soft p-5"><div className="flex items-center gap-3"><div className="link-node"><UserRound size={17}/></div><div><h2 className="text-lg font-black">Profile</h2><p className="mt-1 text-sm text-zinc-500">Your Linkup identity comes from your account.</p></div></div></div>
            <div className="brutal-card-soft tint-mint p-5"><div className="flex items-center gap-3"><div className="link-node bg-brand-mint"><Link2 size={17}/></div><div><h2 className="text-lg font-black">Your links</h2><p className="mt-1 text-sm text-zinc-500">Keep your people grouped by the things that connect you.</p></div></div><Link href="/dashboard/groups" className="mt-4 inline-flex text-xs font-black text-zinc-700 hover:text-black">Manage links →</Link></div>
            <button onClick={logout} className="brutal-btn justify-center rounded-lg bg-brand-coral px-4 py-3 text-sm sm:col-span-2"><LogOut size={16}/> Log out</button>
          </div>
        </section>
      </div>
    </main>
  )
}
