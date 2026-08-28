import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { Database } from "@/lib/database.types"

async function clientForUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await clientForUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await clientForUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const payload: Database["public"]["Tables"]["events"]["Update"] = {}
  if ("name" in body) payload.name = String(body.name || "").trim()
  if ("description" in body) payload.description = body.description || null
  if ("starts_at" in body) payload.starts_at = body.starts_at || null
  if ("ends_at" in body) payload.ends_at = body.ends_at || null
  if ("location" in body) payload.location = body.location || null
  if ("status" in body) payload.status = String(body.status || "planning")
  if ("cover_url" in body) payload.cover_url = body.cover_url || null
  if ("name" in payload && !payload.name) return NextResponse.json({ error: "Event name is required" }, { status: 400 })
  if (payload.starts_at && payload.ends_at && new Date(String(payload.ends_at)) < new Date(String(payload.starts_at))) return NextResponse.json({ error: "End time must be after the start time" }, { status: 400 })
  const { data, error } = await supabase.from("events").update(payload).eq("id", id).select().maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data) return NextResponse.json({ error: "Event not found" }, { status: 404 })
  return NextResponse.json({ event: data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase, user } = await clientForUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { error } = await supabase.from("events").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
