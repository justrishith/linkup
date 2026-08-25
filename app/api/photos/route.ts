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

export async function GET(request: Request) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const albumId = url.searchParams.get('albumId')
  const query = albumId ? `?album_id=eq.${encodeURIComponent(albumId)}&select=*&order=created_at.desc` : '?select=*&order=created_at.desc'
  const response = await fetch(`${supabase.url}/rest/v1/photos${query}`, { headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load photos' }, { status: response.status })
  return NextResponse.json({ photos: data })
}

export async function POST(request: Request) {
  const ctx = await getContext()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file')
  const groupId = String(form.get('groupId') || '')
  const albumIdValue = form.get('albumId')
  const albumName = String(form.get('albumName') || 'Shared photos')
  const caption = String(form.get('caption') || '')
  if (!(file instanceof File) || !groupId) return NextResponse.json({ error: 'A photo and group are required' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 })
  if (file.size > 6 * 1024 * 1024) return NextResponse.json({ error: 'Keep test uploads under 6MB' }, { status: 400 })

  const memberResponse = await fetch(`${supabase.url}/rest/v1/group_members?group_id=eq.${encodeURIComponent(groupId)}&user_id=eq.${encodeURIComponent(ctx.user.id)}&select=group_id&limit=1`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store'
  })
  const members = await memberResponse.json().catch(() => [])
  if (!Array.isArray(members) || !members.length) return NextResponse.json({ error: 'You are not in that crew' }, { status: 403 })

  let albumId = albumIdValue ? String(albumIdValue) : ''
  if (!albumId) {
    const albumResponse = await fetch(`${supabase.url}/rest/v1/albums`, {
      method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ group_id: groupId, name: albumName, created_by: ctx.user.id }),
    })
    const albums = await albumResponse.json().catch(() => [])
    if (!albumResponse.ok) return NextResponse.json({ error: albums.message || albums.hint || 'Unable to create album' }, { status: albumResponse.status })
    albumId = (Array.isArray(albums) ? albums[0] : albums).id
  }

  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-')
  const path = `${groupId}/${ctx.user.id}/${crypto.randomUUID()}-${cleanName}`
  const bytes = await file.arrayBuffer()
  const uploadResponse = await fetch(`${supabase.url}/storage/v1/object/photos/${path}`, {
    method: 'POST',
    headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': file.type, 'x-upsert': 'false' },
    body: bytes,
  })
  const uploadData = await uploadResponse.json().catch(() => ({}))
  if (!uploadResponse.ok) return NextResponse.json({ error: uploadData.message || 'Unable to upload photo' }, { status: uploadResponse.status })

  const publicUrl = `${supabase.url}/storage/v1/object/public/photos/${path}`
  const photoResponse = await fetch(`${supabase.url}/rest/v1/photos`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ album_id: albumId, uploaded_by: ctx.user.id, storage_path: path, caption }),
  })
  const photos = await photoResponse.json().catch(() => [])
  if (!photoResponse.ok) return NextResponse.json({ error: photos.message || photos.hint || 'Photo uploaded but metadata could not be saved' }, { status: photoResponse.status })
  return NextResponse.json({ photo: Array.isArray(photos) ? photos[0] : photos, publicUrl, albumId }, { status: 201 })
}
