import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const response = await fetch(`${supabase.url}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: { apikey: supabase.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.error_description || data.msg || 'Invalid login' }, { status: 401 })
  const out = NextResponse.json({ user: data.user })
  out.cookies.set('linkup_access_token', data.access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  out.cookies.set('linkup_refresh_token', data.refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  return out
}
