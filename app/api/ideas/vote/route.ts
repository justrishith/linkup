import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function getContext() {
  const token = (await cookies()).get('linkup_access_token')?.value
  if (!token) return null
  const response = await fetch(`${supabase.url}/auth/v1/user`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const user = await response.json().catch(() => null)
  return response.ok && user?.id ? { token, user } : null
}

export async function POST(request: Request) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { ideaId } = await request.json()
  if (!ideaId) return NextResponse.json({ error: 'ideaId is required' }, { status: 400 })

  const existingResponse = await fetch(`${supabase.url}/rest/v1/idea_votes?idea_id=eq.${encodeURIComponent(ideaId)}&user_id=eq.${encodeURIComponent(ctx.user.id)}&select=idea_id`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store'
  })
  const existing = await existingResponse.json().catch(() => [])
  if (Array.isArray(existing) && existing.length) {
    await fetch(`${supabase.url}/rest/v1/idea_votes?idea_id=eq.${encodeURIComponent(ideaId)}&user_id=eq.${encodeURIComponent(ctx.user.id)}`, {
      method: 'DELETE', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }
    })
    return NextResponse.json({ voted: false })
  }

  const response = await fetch(`${supabase.url}/rest/v1/idea_votes`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ idea_id: ideaId, user_id: ctx.user.id }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return NextResponse.json({ error: data.message || data.hint || 'Unable to vote' }, { status: response.status })
  return NextResponse.json({ voted: true })
}
