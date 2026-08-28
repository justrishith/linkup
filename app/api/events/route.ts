import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const groupId = new URL(request.url).searchParams.get("groupId")
  let query = supabase.from("events").select("*").order("starts_at", { ascending: true })
  if (groupId) query = query.eq("group_id", groupId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message || "Unable to load events" }, { status: 400 })
  return NextResponse.json({ events: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  if (!body.group_id || !body.name?.trim()) return NextResponse.json({ error: "group_id and name are required" }, { status: 400 })
  const { data: event, error } = await supabase.from("events").insert({
    group_id: body.group_id, created_by: user.id, name: body.name.trim(),
    description: body.description || null, starts_at: body.starts_at || null,
    ends_at: body.ends_at || null, location: body.location || null,
    status: body.status || "planning", cover_url: body.cover_url || null,
  }).select().single()
  if (error || !event) return NextResponse.json({ error: error?.message || "Unable to create event" }, { status: 400 })
  const { error: memberError } = await supabase.from("event_members").insert({ event_id: event.id, user_id: user.id, rsvp: "going" })
  if (memberError) return NextResponse.json({ error: memberError.message || "Unable to join the event" }, { status: 400 })
  return NextResponse.json({ event }, { status: 201 })
}
