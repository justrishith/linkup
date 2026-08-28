import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const cookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, cookieResponse)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return NextResponse.json({ error: error?.message || 'Invalid login' }, { status: 401 })

  const response = NextResponse.json({ user: data.user })
  cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}
