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

export async function GET(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const groupId = new URL(request.url).searchParams.get('groupId')
  const query = groupId ? `?group_id=eq.${encodeURIComponent(groupId)}&select=*&order=starts_at.asc` : '?select=*&order=starts_at.asc'
  const response = await fetch(`${supabase.url}/rest/v1/events${query}`, { headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load events' }, { status: response.status })
  return NextResponse.json({ events: data })
}

export async function POST(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.group_id || !body.name?.trim()) return NextResponse.json({ error: 'group_id and name are required' }, { status: 400 })
  const payload = {
    group_id: body.group_id,
    created_by: ctx.user.id,
    name: body.name.trim(),
    description: body.description || null,
    starts_at: body.starts_at || null,
    ends_at: body.ends_at || null,
    location: body.location || null,
    status: body.status || 'planning',
    cover_url: body.cover_url || null,
  }
  const response = await fetch(`${supabase.url}/rest/v1/events`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.message || data.hint || 'Unable to create event' }, { status: response.status })
  const event = Array.isArray(data) ? data[0] : data
  await fetch(`${supabase.url}/rest/v1/event_members`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ event_id: event.id, user_id: ctx.user.id, rsvp: 'going' }),
  })
  return NextResponse.json({ event }, { status: 201 })
}
