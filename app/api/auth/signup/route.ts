import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { email, password, displayName } = await request.json().catch(() => ({}))
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const redirectTo = new URL('/auth/callback?next=/onboarding', request.nextUrl.origin).toString()
  const cookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, cookieResponse)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { display_name: displayName || email.split('@')[0] },
    },
  })
  if (error) return NextResponse.json({ error: error.message || 'Unable to sign up' }, { status: error.status || 400 })

  const response = NextResponse.json({ user: data.user, session: Boolean(data.session) })
  cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}
