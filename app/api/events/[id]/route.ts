import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function context() {
  const token = (await cookies()).get('linkup_access_token')?.value
  if (!token) return null
  const response = await fetch(`${supabase.url}/auth/v1/user`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const user = await response.json().catch(() => null)
  return response.ok && user?.id ? { token, user } : null
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/events?id=eq.${encodeURIComponent(params.id)}&select=*`, { headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok || !Array.isArray(data) || !data[0]) return NextResponse.json({ error: data?.message || 'Event not found' }, { status: response.ok ? 404 : response.status })
  return NextResponse.json({ event: data[0] })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const payload: Record<string, unknown> = {}
  for (const key of ['name', 'description', 'starts_at', 'ends_at', 'location', 'status', 'cover_url']) {
    if (key in body) payload[key] = key === 'name' ? String(body[key] || '').trim() : body[key] || null
  }
  if ('name' in payload && !payload.name) return NextResponse.json({ error: 'Event name is required' }, { status: 400 })
  if (payload.starts_at && payload.ends_at && new Date(String(payload.ends_at)) < new Date(String(payload.starts_at))) return NextResponse.json({ error: 'End time must be after the start time' }, { status: 400 })
  const response = await fetch(`${supabase.url}/rest/v1/events?id=eq.${encodeURIComponent(params.id)}`, { method: 'PATCH', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data?.message || data?.hint || 'Unable to update event' }, { status: response.status })
  return NextResponse.json({ event: Array.isArray(data) ? data[0] : data })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/events?id=eq.${encodeURIComponent(params.id)}`, { method: 'DELETE', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, Prefer: 'return=minimal' } })
  if (!response.ok) { const data = await response.json().catch(() => ({})); return NextResponse.json({ error: data?.message || 'Unable to delete event' }, { status: response.status }) }
  return NextResponse.json({ ok: true })
}
