import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const albumId = new URL(request.url).searchParams.get('albumId')
  let query = supabase.from('photos').select('*').order('created_at', { ascending: false })
  if (albumId) query = query.eq('album_id', albumId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const photos = await Promise.all((data || []).map(async (photo) => {
    const { data: signed } = await supabase.storage.from('photos').createSignedUrl(photo.storage_path, 60 * 60)
    return { ...photo, signedUrl: signed?.signedUrl || null }
  }))
  return NextResponse.json({ photos })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  const groupId = String(form.get('groupId') || '')
  const albumIdValue = form.get('albumId')
  const albumName = String(form.get('albumName') || 'Shared photos').trim()
  const caption = String(form.get('caption') || '').trim()
  if (!(file instanceof File) || !groupId) return NextResponse.json({ error: 'A photo and group are required' }, { status: 400 })
  if (!allowedImageTypes.has(file.type)) return NextResponse.json({ error: 'Use a JPEG, PNG, or WebP image' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Photos must be 10MB or smaller' }, { status: 400 })

  const { data: membership } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'You are not in that Link' }, { status: 403 })

  let albumId = albumIdValue ? String(albumIdValue) : ''
  if (!albumId) {
    const { data: existing } = await supabase
      .from('albums')
      .select('id')
      .eq('group_id', groupId)
      .eq('name', albumName || 'Shared photos')
      .maybeSingle()
    albumId = existing?.id || ''
  }
  if (!albumId) {
    const { data: album, error } = await supabase
      .from('albums')
      .insert({ group_id: groupId, name: albumName || 'Shared photos', created_by: user.id })
      .select('id')
      .single()
    if (error || !album) return NextResponse.json({ error: error?.message || 'Unable to create album' }, { status: 400 })
    albumId = album.id
  }

  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')
  const path = `${groupId}/${user.id}/${crypto.randomUUID()}-${cleanName}`
  const { error: uploadError } = await supabase.storage.from('photos').upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { data: photo, error: photoError } = await supabase
    .from('photos')
    .insert({ album_id: albumId, uploaded_by: user.id, storage_path: path, caption: caption || null })
    .select()
    .single()
  if (photoError || !photo) {
    await supabase.storage.from('photos').remove([path])
    return NextResponse.json({ error: photoError?.message || 'Unable to save photo details' }, { status: 400 })
  }
  const { data: signed } = await supabase.storage.from('photos').createSignedUrl(path, 60 * 60)
  return NextResponse.json({ photo, signedUrl: signed?.signedUrl || null, albumId }, { status: 201 })
}
