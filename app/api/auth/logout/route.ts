import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { clearAuthCookies } from '@/lib/auth-cookies'

export async function POST() {
  const accessToken = (await cookies()).get('linkup_access_token')?.value
  if (accessToken) await fetch(`${supabase.url}/auth/v1/logout`, { method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` } }).catch(() => undefined)
  return clearAuthCookies(NextResponse.json({ ok: true }))
}
