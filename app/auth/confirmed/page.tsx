"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import BrandMark from '../../_components/brand-mark'

export default function ConfirmedPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [working, setWorking] = useState(true)

  useEffect(() => {
    async function finish() {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      if (params.get('error')) {
        setError(params.get('error_description') || 'That confirmation link is no longer valid.')
        setWorking(false)
        return
      }

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      if (!accessToken) {
        setWorking(false)
        return
      }

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
      })
      if (!response.ok) setError('We confirmed your email, but could not finish signing you in.')
      setWorking(false)
      router.replace('/onboarding')
    }
    finish().catch(() => { setError('We confirmed your email, but could not finish signing you in.'); setWorking(false) })
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
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-[#1a1a1a] bg-brand-mint">{working?<Loader2 size={25} className="animate-spin"/>:<Check size={25}/>}</div>
          <h1 className="mt-5 text-3xl font-black">{working?'Finishing your account…':'Email confirmed.'}</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-zinc-500">{working?'One tiny auth handoff, because apparently email has to be a journey.':'Your Linkup account is ready.'}</p>
          {!working&&<Link href="/dashboard" className="brutal-btn mx-auto mt-7 inline-flex rounded-lg bg-brand-blue px-5 py-3 text-sm">Open Linkup <ArrowRight size={15}/></Link>}
        </>}
      </div>
      <p className="mt-5 text-xs font-medium text-zinc-400">If the confirmation link is expired, return to the login page and request a fresh account.</p>
    </div>
  </main>
}
