import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = (await cookies()).get('linkup_access_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const response = await fetch(`${supabase.url}/rest/v1/photos?id=eq.${encodeURIComponent(id)}&select=storage_path`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok || !Array.isArray(data) || !data[0]) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  return NextResponse.redirect(`${supabase.url}/storage/v1/object/public/photos/${data[0].storage_path}`)
}
