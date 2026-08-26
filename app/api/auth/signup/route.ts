import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setAuthCookies } from '@/lib/auth-cookies'

export async function POST(request: NextRequest) {
  const { email, password, displayName } = await request.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const redirectTo = new URL('/auth/confirmed', request.nextUrl.origin).toString()
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

  return setAuthCookies(NextResponse.json({ user: data.user, session: Boolean(data.access_token) }), data)
}
