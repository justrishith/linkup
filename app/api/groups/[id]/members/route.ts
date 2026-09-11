import { NextRequest, NextResponse } from "next/server"
import { getSignedAvatarUrl } from "@/lib/profile-avatar"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const { data, error } = await supabase
    .from("group_members")
    .select("user_id,role,joined_at,profiles(display_name,avatar_url,avatar_path)")
    .eq("group_id", id)
    .order("joined_at", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  const members = await Promise.all((data || []).map(async (member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] : member.profiles
    const avatarUrl = await getSignedAvatarUrl(supabase, profile?.avatar_path)
    return { ...member, profiles: profile ? { ...profile, avatarUrl: avatarUrl || profile.avatar_url || null } : null }
  }))
  return NextResponse.json({ members })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const userId = typeof body.userId === "string" ? body.userId : ""
  const role = body.role === "admin" ? "admin" : body.role === "member" ? "member" : ""
  if (!userId || !role) return NextResponse.json({ error: "userId and a valid role are required" }, { status: 400 })
  const { data, error } = await supabase.rpc("set_group_member_role", { p_group_id: id, p_user_id: userId, p_role: role })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ member: data })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const userId = new URL(request.url).searchParams.get("userId") || user.id
  const { error } = await supabase.rpc("remove_group_member", { p_group_id: id, p_user_id: userId })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ removed: true })
}
