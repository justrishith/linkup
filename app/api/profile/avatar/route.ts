import { NextResponse } from "next/server"
import { getSignedAvatarUrl } from "@/lib/profile-avatar"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maxAvatarSize = 5 * 1024 * 1024

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Session expired" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 })
  if (!allowedImageTypes.has(file.type)) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image." }, { status: 400 })
  if (file.size > maxAvatarSize) return NextResponse.json({ error: "Avatars must be 5MB or smaller." }, { status: 400 })

  const { data: existing } = await supabase.from("profiles").select("avatar_path,avatar_url").eq("id", user.id).maybeSingle()
  const cleanName = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-") || "avatar"
  const path = `${user.id}/${crypto.randomUUID()}-${cleanName}`
  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 })

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_path: path, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single()
  if (profileError || !profile) {
    await supabase.storage.from("avatars").remove([path])
    return NextResponse.json({ error: profileError?.message || "Unable to save your avatar." }, { status: 400 })
  }

  if (existing?.avatar_path && existing.avatar_path !== path) await supabase.storage.from("avatars").remove([existing.avatar_path])
  return NextResponse.json({ profile: { ...profile, avatarUrl: await getSignedAvatarUrl(supabase, path) || profile.avatar_url } }, { status: 201 })
}
