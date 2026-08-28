import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data, error } = await supabase.rpc("list_discoverable_groups")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ links: data })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const groupId = typeof body.groupId === "string" ? body.groupId : ""
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 })
  const { data, error } = await supabase.rpc("request_to_join_group", { p_group_id: groupId })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ request: data }, { status: 201 })
}
