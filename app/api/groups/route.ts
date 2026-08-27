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

  const groups = await Promise.all((Array.isArray(data) ? data : []).map(async (row) => {
    const membersResponse = await fetch(`${supabase.url}/rest/v1/group_members?group_id=eq.${encodeURIComponent(row.group_id)}&select=user_id`, {
      headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })
    const members = await membersResponse.json().catch(() => [])
    return { ...row, member_count: Array.isArray(members) ? members.length : 0 }
  }))

  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const accessToken = await getAccessToken()
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUser(accessToken)
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!name) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })

  // Use a server-generated ID and a minimal response. Returning the new row here
  // would invoke the read policy before the owner membership exists.
  const group = { id: crypto.randomUUID(), name, description, owner_id: user.id }

  const groupResponse = await fetch(`${supabase.url}/rest/v1/groups`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(group),
  })
  if (!groupResponse.ok) {
    const error = await groupResponse.json().catch(() => ({}))
    return NextResponse.json({ error: error?.message || error?.hint || 'Unable to create group' }, { status: groupResponse.status })
  }

  const memberResponse = await fetch(`${supabase.url}/rest/v1/group_members`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ group_id: group.id, user_id: user.id, role: 'owner' }),
  })
  if (!memberResponse.ok) {
    await fetch(`${supabase.url}/rest/v1/groups?id=eq.${group.id}`, { method: 'DELETE', headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` } })
    const error = await memberResponse.json().catch(() => ({}))
    return NextResponse.json({ error: error?.message || 'Unable to add group owner' }, { status: memberResponse.status })
  }

  return NextResponse.json({ group, member_count: 1 }, { status: 201 })
}
