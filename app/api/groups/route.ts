import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id,role,groups(*)')
    .order('joined_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const groups = await Promise.all((data || []).map(async (row) => {
    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', row.group_id)
    return { ...row, member_count: count ?? 0 }
  }))

  return NextResponse.json({ groups })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!name) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })

  const { data: group, error } = await supabase.rpc('create_group', {
    p_name: name,
    p_description: description || null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ group, member_count: 1 }, { status: 201 })
}
