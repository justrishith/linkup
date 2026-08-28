import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
  const supabaseClient = await createSupabaseServerClient()
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const code = new URL(request.url).searchParams.get('code')?.trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })

  const { data, error } = await supabaseClient.rpc('get_group_invite', { p_code: code })
  const row = data?.[0]
  if (error || !row) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  const invite = {
    group_id: row.group_id,
    code: row.code,
    expires_at: row.expires_at,
    groups: {
      id: row.group_id,
      name: row.group_name,
      description: row.group_description,
    },
  }
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'This invite has expired' }, { status: 410 })
  return NextResponse.json({ invite })
}

export async function PUT(request: Request) {
  const supabaseClient = await createSupabaseServerClient()
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const code = String(body.code || '').trim().toUpperCase()
  if (!code) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })

  const { data: groupId, error } = await supabaseClient.rpc('accept_group_invite', { p_code: code })
  if (error) {
    const status = error.message.includes('expired') ? 410 : error.message.includes('10 people') ? 409 : 400
    return NextResponse.json({ error: error.message }, { status })
  }
  return NextResponse.json({ groupId, joined: true })
}
