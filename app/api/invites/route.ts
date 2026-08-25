import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function accessToken() {
  return (await cookies()).get('linkup_access_token')?.value || null
}

async function getUser(token: string) {
  const response = await fetch(`${supabase.url}/auth/v1/user`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => null)
  return response.ok && data?.id ? data : null
}

async function isMember(groupId: string, userId: string, token: string) {
  const response = await fetch(`${supabase.url}/rest/v1/group_members?group_id=eq.${encodeURIComponent(groupId)}&user_id=eq.${encodeURIComponent(userId)}&select=role`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => [])
  return response.ok && Array.isArray(data) && data.length > 0
}

export async function POST(request: Request) {
  const token = await accessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const groupId = String(body.groupId || '')
  if (!groupId) return NextResponse.json({ error: 'groupId is required' }, { status: 400 })
  if (!(await isMember(groupId, user.id, token))) return NextResponse.json({ error: 'You are not a member of this link' }, { status: 403 })

  const code = crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()
  const response = await fetch(`${supabase.url}/rest/v1/invites`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ group_id: groupId, code, created_by: user.id, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data?.message || 'Unable to create invite' }, { status: response.status })
  return NextResponse.json({ invite: Array.isArray(data) ? data[0] : data }, { status: 201 })
}

export async function GET(request: Request) {
  const token = await accessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })

  const response = await fetch(`${supabase.url}/rest/v1/invites?code=eq.${encodeURIComponent(code)}&select=id,group_id,code,expires_at,groups(id,name,description)`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await response.json().catch(() => [])
  const invite = Array.isArray(data) ? data[0] : null
  if (!response.ok || !invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 })
  return NextResponse.json({ invite })
}

export async function PUT(request: Request) {
  const token = await accessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = await getUser(token)
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const code = String(body.code || '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })

  const inviteResponse = await fetch(`${supabase.url}/rest/v1/invites?code=eq.${encodeURIComponent(code)}&select=id,group_id,expires_at`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const invites = await inviteResponse.json().catch(() => [])
  const invite = Array.isArray(invites) ? invites[0] : null
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 })

  const existing = await fetch(`${supabase.url}/rest/v1/group_members?group_id=eq.${encodeURIComponent(invite.group_id)}&user_id=eq.${encodeURIComponent(user.id)}&select=group_id`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const existingRows = await existing.json().catch(() => [])
  if (Array.isArray(existingRows) && existingRows.length) return NextResponse.json({ groupId: invite.group_id, alreadyMember: true })

  const memberResponse = await fetch(`${supabase.url}/rest/v1/group_members`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ group_id: invite.group_id, user_id: user.id, role: 'member' }),
  })
  const member = await memberResponse.json().catch(() => ({}))
  if (!memberResponse.ok) return NextResponse.json({ error: member?.message || 'Unable to join link' }, { status: memberResponse.status })
  return NextResponse.json({ groupId: invite.group_id, joined: true })
}
