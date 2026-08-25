import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function token() { return (await cookies()).get('linkup_access_token')?.value }

export async function GET() {
  const accessToken = await token()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/events?select=*&order=starts_at.asc`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` }, cache: 'no-store'
  })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load events' }, { status: response.status })
  return NextResponse.json({ events: data })
}

export async function POST(request: Request) {
  const accessToken = await token()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const response = await fetch(`${supabase.url}/rest/v1/events`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.message || data.hint || 'Unable to create event' }, { status: response.status })
  return NextResponse.json({ event: Array.isArray(data) ? data[0] : data }, { status: 201 })
}
