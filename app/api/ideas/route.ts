import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const accessToken = (await cookies()).get('linkup_access_token')?.value
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/ideas?select=*&order=created_at.desc`, { headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load ideas' }, { status: response.status })
  return NextResponse.json({ ideas: data })
}

export async function POST(request: Request) {
  const accessToken = (await cookies()).get('linkup_access_token')?.value
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const response = await fetch(`${supabase.url}/rest/v1/ideas`, { method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(body) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.message || data.hint || 'Unable to create idea' }, { status: response.status })
  return NextResponse.json({ idea: Array.isArray(data) ? data[0] : data }, { status: 201 })
}
