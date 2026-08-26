import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setAuthCookies } from '@/lib/auth-cookies'

export async function POST(request: Request) {
  const { access_token, refresh_token } = await request.json().catch(() => ({}))
  if (!access_token) return NextResponse.json({ error: 'Missing access token' }, { status: 400 })

  const userResponse = await fetch(`${supabase.url}/auth/v1/user`, { headers: { apikey: supabase.key, Authorization: `Bearer ${access_token}` } })
  if (!userResponse.ok) return NextResponse.json({ error: 'This confirmation session is no longer valid. Request a new email.' }, { status: 401 })
  return setAuthCookies(NextResponse.json({ ok: true }), { access_token, refresh_token })
}
