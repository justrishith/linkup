import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get('linkup_access_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/events?id=eq.${encodeURIComponent(params.id)}&select=*`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok || !Array.isArray(data) || !data[0]) return NextResponse.json({ error: data?.message || 'Event not found' }, { status: response.ok ? 404 : response.status })
  return NextResponse.json({ event: data[0] })
}
