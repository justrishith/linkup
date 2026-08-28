import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const groupId = String(body.groupId || '')
  if (!groupId) return NextResponse.json({ error: 'groupId is required' }, { status: 400 })
  const { data, error } = await supabase.rpc('create_group_invite', { p_group_id: groupId })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ invite: data }, { status: 201 })
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
