import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/auth-cookies'
import { createSupabaseRouteClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const cookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, cookieResponse)
  await supabase.auth.signOut()

  const response = clearAuthCookies(NextResponse.json({ ok: true }))
  cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}
