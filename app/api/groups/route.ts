import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function getAccessToken() {
  return (await cookies()).get('linkup_access_token')?.value || null
}

async function getUser(accessToken: string) {
  const response = await fetch(`${supabase.url}/auth/v1/user`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  return response.ok && data?.id ? data : null
}

export async function GET() {
  const accessToken = await getAccessToken()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const response = await fetch(`${supabase.url}/rest/v1/group_members?select=group_id,role,groups(*)&order=joined_at.desc`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data?.message || 'Unable to load groups' }, { status: response.status })
  return NextResponse.json({ groups: data })
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUser(accessToken)
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const { name, description = '' } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })

  const groupResponse = await fetch(`${supabase.url}/rest/v1/groups`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ name: name.trim(), description, owner_id: user.id }),
  })
  const groups = await groupResponse.json().catch(() => [])
  if (!groupResponse.ok) return NextResponse.json({ error: groups?.message || groups?.hint || 'Unable to create group' }, { status: groupResponse.status })

  const group = Array.isArray(groups) ? groups[0] : groups
  const memberResponse = await fetch(`${supabase.url}/rest/v1/group_members`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ group_id: group.id, user_id: user.id, role: 'owner' }),
  })
  if (!memberResponse.ok) {
    await fetch(`${supabase.url}/rest/v1/groups?id=eq.${group.id}`, { method: 'DELETE', headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` } })
    const error = await memberResponse.json().catch(() => ({}))
    return NextResponse.json({ error: error?.message || 'Unable to add group owner' }, { status: memberResponse.status })
  }

  return NextResponse.json({ group }, { status: 201 })
}
