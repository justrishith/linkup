"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, LogOut, UserRound } from 'lucide-react'

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
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-black text-zinc-500 hover:text-black"><ArrowLeft size={16}/> Back to dashboard</Link>
        <section className="mt-6 brutal-card overflow-hidden">
          <div className="bg-brand-blue p-7 sm:p-10">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-lemon text-xl font-black shadow-[4px_4px_0_#1a1a1a]">{name.slice(0,1).toUpperCase()}</div>
              <div><div className="text-[10px] font-black tracking-[.16em]">ACCOUNT</div><h1 className="mt-1 text-4xl font-black">{name}</h1><p className="mt-1 text-sm font-semibold text-zinc-700">{email || 'Loading email…'}</p></div>
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-xl border-2 border-[#1a1a1a] bg-white p-5"><UserRound size={18}/><h2 className="mt-3 text-lg font-black">Profile</h2><p className="mt-1 text-sm text-zinc-500">Your Linkup identity is pulled from the real Supabase account.</p></div>
            <button onClick={logout} className="brutal-btn justify-center rounded-lg bg-brand-coral px-4 py-3 text-sm"><LogOut size={16}/> Log out</button>
          </div>
        </section>
      </div>
    </main>
  )
}
