"use client"

import { useEffect, useState } from 'react'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import BrandMark from '../../_components/brand-mark'

export default function ConfirmedPage() {
  const [error, setError] = useState('')

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      setError(params.get('error_description') || 'That confirmation link is no longer valid.')
    }
  }, [])

  return <main className="grid min-h-screen place-items-center bg-[#fafaf8] px-5 text-[#111]">
    <div className="w-full max-w-lg text-center">
      <BrandMark size={56} className="mx-auto" />
      <div className="brutal-card mt-7 p-8 sm:p-10">
        {error ? <>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-coral"><span className="text-2xl font-black">!</span></div>
          <h1 className="mt-5 text-3xl font-black">Confirmation didn’t work</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{error}</p>
          <Link href="/auth" className="brutal-btn mx-auto mt-7 inline-flex rounded-lg bg-brand-blue px-5 py-3 text-sm">Back to Linkup <ArrowRight size={15}/></Link>
        </> : <>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-mint"><Check size={25}/></div>
          <h1 className="mt-5 text-3xl font-black">Email confirmed.</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">Your Linkup account is ready. Human verification ritual complete.</p>
          <Link href="/dashboard" className="brutal-btn mx-auto mt-7 inline-flex rounded-lg bg-brand-blue px-5 py-3 text-sm">Open Linkup <ArrowRight size={15}/></Link>
        </>}
      </div>
      <p className="mt-5 text-xs font-medium text-zinc-400"><Loader2 size={12} className="mr-1 inline"/> If the button doesn’t work, go back to the login page and sign in normally.</p>
    </div>
  </main>
}
