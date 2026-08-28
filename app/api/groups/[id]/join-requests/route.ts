import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const { data, error } = await supabase
    .from("group_join_requests")
    .select("*,profiles!group_join_requests_user_id_fkey(display_name,avatar_url)")
    .eq("group_id", id)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ requests: data })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const requestId = typeof body.requestId === "string" ? body.requestId : ""
  if (!requestId || typeof body.approve !== "boolean") return NextResponse.json({ error: "requestId and approve are required" }, { status: 400 })
  const { data, error } = await supabase.rpc("review_group_join_request", { p_request_id: requestId, p_approve: body.approve })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ request: data, groupId: id })
}
