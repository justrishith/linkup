import { NextResponse } from 'next/server'
import { validateLinkName } from '@/lib/server-name-policy'
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

  const uniqueMemberships = [...new Map((data || []).map((row) => [row.group_id, row])).values()]
  const groups = await Promise.all(uniqueMemberships.map(async (row) => {
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
  const nameValidation = validateLinkName(body.name)
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const parentGroupId = typeof body.parentGroupId === 'string' ? body.parentGroupId : ''
  const visibility = body.visibility === 'discoverable' ? 'discoverable' : 'private'
  if ('error' in nameValidation) return NextResponse.json({ error: nameValidation.error }, { status: 400 })
  if (description.length > 280) return NextResponse.json({ error: 'Keep the Link description to 280 characters or fewer.' }, { status: 400 })
  const name = nameValidation.value

  const result = parentGroupId
    ? await supabase.rpc('create_sub_group', {
        p_parent_group_id: parentGroupId,
        p_name: name,
        p_description: description || null,
      })
    : await supabase.rpc('create_group', {
        p_name: name,
        p_description: description || null,
      })
  const { data: group, error } = result
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  if (!parentGroupId && visibility === 'discoverable') {
    const { error: visibilityError } = await supabase
      .from('groups')
      .update({ visibility })
      .eq('id', group.id)
    if (visibilityError) return NextResponse.json({ error: visibilityError.message }, { status: 400 })
    group.visibility = visibility
  }

  return NextResponse.json({ group, member_count: 1 }, { status: 201 })
}
