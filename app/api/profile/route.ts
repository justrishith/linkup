import { NextResponse } from "next/server"
import { getSignedAvatarUrl } from "@/lib/profile-avatar"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const displayNameError = "Use a display name between 2 and 48 characters."

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Session expired" }, { status: 401 })

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: profile ? { ...profile, avatarUrl: await getSignedAvatarUrl(supabase, profile.avatar_path) || profile.avatar_url } : null })
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Session expired" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const displayName = typeof body.displayName === "string" ? body.displayName.trim().replace(/\s+/g, " ") : ""
  if (displayName.length < 2 || displayName.length > 48) return NextResponse.json({ error: displayNameError }, { status: 400 })

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: { ...profile, avatarUrl: await getSignedAvatarUrl(supabase, profile.avatar_path) || profile.avatar_url } })
}
