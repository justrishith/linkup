import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: photo, error } = await supabase.from('photos').select('storage_path').eq('id', id).maybeSingle()
  if (error || !photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  const { data: signed, error: signedError } = await supabase.storage.from('photos').createSignedUrl(photo.storage_path, 60 * 60)
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: 'Photo is unavailable' }, { status: 404 })
  return NextResponse.redirect(signed.signedUrl)
}
