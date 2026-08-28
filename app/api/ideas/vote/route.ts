import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { ideaId } = await request.json().catch(() => ({}))
  if (!ideaId) return NextResponse.json({ error: "ideaId is required" }, { status: 400 })
  const { data: existing, error: lookupError } = await supabase.from("idea_votes").select("idea_id").eq("idea_id", ideaId).eq("user_id", user.id).maybeSingle()
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 })
  if (existing) {
    const { error } = await supabase.from("idea_votes").delete().eq("idea_id", ideaId).eq("user_id", user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ voted: false })
  }
  const { error } = await supabase.from("idea_votes").insert({ idea_id: ideaId, user_id: user.id, vote: "like" })
  if (error) return NextResponse.json({ error: error.message || "Unable to vote" }, { status: 400 })
  return NextResponse.json({ voted: true })
}
