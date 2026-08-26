import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://linkup-vjvg.vercel.app'

export async function POST(request: Request) {
  const { email, password, displayName } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const redirectTo = `${SITE_URL.replace(/\/$/, '')}/auth/confirmed`
  const response = await fetch(`${supabase.url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: 'POST',
    headers: { apikey: supabase.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      data: { display_name: displayName || email.split('@')[0] },
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.msg || data.message || 'Unable to sign up' }, { status: response.status })

  const out = NextResponse.json({ user: data.user, session: Boolean(data.access_token) })
  if (data.access_token) out.cookies.set('linkup_access_token', data.access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  if (data.refresh_token) out.cookies.set('linkup_refresh_token', data.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  return out
}
