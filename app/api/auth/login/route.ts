import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { setAuthCookies } from '@/lib/auth-cookies'

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  const response = await fetch(`${supabase.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: supabase.key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.error_description || data.msg || 'Invalid login' }, { status: 401 })
  return setAuthCookies(NextResponse.json({ user: data.user }), data)
}
