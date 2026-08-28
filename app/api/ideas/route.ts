import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const groupId = new URL(request.url).searchParams.get("groupId")
  let query = supabase.from("ideas").select("*").order("created_at", { ascending: false })
  if (groupId) query = query.eq("group_id", groupId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message || "Unable to load ideas" }, { status: 400 })
  return NextResponse.json({ ideas: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (!body.group_id || !body.title?.trim()) return NextResponse.json({ error: "group_id and title are required" }, { status: 400 })
  const { data, error } = await supabase.from("ideas").insert({
    group_id: body.group_id, created_by: user.id, title: body.title.trim(),
    description: body.description || null, category: body.category || null, status: body.status || "open",
  }).select().single()
  if (error || !data) return NextResponse.json({ error: error?.message || "Unable to create idea" }, { status: 400 })
  return NextResponse.json({ idea: data }, { status: 201 })
}
