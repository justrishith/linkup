import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const groupId = new URL(request.url).searchParams.get("groupId")
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 })

  const { data, error } = await supabase
    .from("group_messages")
    .select("*,profiles(display_name,avatar_url)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ messages: data })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const payload = await request.json().catch(() => ({}))
  const groupId = typeof payload.groupId === "string" ? payload.groupId : ""
  const body = typeof payload.body === "string" ? payload.body.trim() : ""
  if (!groupId || !body) return NextResponse.json({ error: "groupId and message are required" }, { status: 400 })
  if (body.length > 2000) return NextResponse.json({ error: "Messages can be at most 2,000 characters" }, { status: 400 })

  const { data, error } = await supabase
    .from("group_messages")
    .insert({ group_id: groupId, user_id: user.id, body })
    .select("*,profiles(display_name,avatar_url)")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: data }, { status: 201 })
}
