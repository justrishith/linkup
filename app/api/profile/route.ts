import { NextResponse } from "next/server"
import { getSignedAvatarUrl } from "@/lib/profile-avatar"
import { validateDisplayName } from "@/lib/server-name-policy"
import { createSupabaseServerClient } from "@/lib/supabase-server"

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
  const validation = validateDisplayName(body.displayName)
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 })
  const displayName = validation.value

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("*")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ profile: { ...profile, avatarUrl: await getSignedAvatarUrl(supabase, profile.avatar_path) || profile.avatar_url } })
}
