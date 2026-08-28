import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const cookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, cookieResponse)
  await supabase.auth.signOut()

  const response = NextResponse.json({ ok: true })
  cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
  return response
}
