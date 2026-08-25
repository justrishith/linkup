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
  const query = groupId ? `?group_id=eq.${encodeURIComponent(groupId)}&select=*&order=created_at.desc` : '?select=*&order=created_at.desc'
  const response = await fetch(`${supabase.url}/rest/v1/ideas${query}`, { headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load ideas' }, { status: response.status })
  return NextResponse.json({ ideas: data })
}

export async function POST(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.group_id || !body.title?.trim()) return NextResponse.json({ error: 'group_id and title are required' }, { status: 400 })
  const payload = {
    group_id: body.group_id,
    created_by: ctx.user.id,
    title: body.title.trim(),
    description: body.description || null,
    category: body.category || null,
    status: body.status || 'open',
  }
  const response = await fetch(`${supabase.url}/rest/v1/ideas`, { method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(payload) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.message || data.hint || 'Unable to create idea' }, { status: response.status })
  return NextResponse.json({ idea: Array.isArray(data) ? data[0] : data }, { status: 201 })
}
