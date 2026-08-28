import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const allowedVotes = new Set(["like", "dislike", "undecided"])

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const groupId = new URL(request.url).searchParams.get("groupId")
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 })

  const { data, error } = await supabase
    .from("events")
    .select("*,event_date_options(*,event_date_votes(*))")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ plans: data })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const groupId = typeof body.groupId === "string" ? body.groupId : ""
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const options = Array.isArray(body.options) ? body.options : []
  if (!groupId || !name) return NextResponse.json({ error: "groupId and name are required" }, { status: 400 })

  const { data: eventId, error } = await supabase.rpc("create_plan", {
    p_group_id: groupId,
    p_name: name,
    p_description: typeof body.description === "string" ? body.description : null,
    p_location: typeof body.location === "string" ? body.location : null,
    p_options: options,
    p_idea_id: typeof body.ideaId === "string" ? body.ideaId : null,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ eventId }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const optionId = typeof body.optionId === "string" ? body.optionId : ""
  const vote = typeof body.vote === "string" ? body.vote : ""
  if (!optionId || !allowedVotes.has(vote)) return NextResponse.json({ error: "A valid optionId and vote are required" }, { status: 400 })

  const { data, error } = await supabase
    .from("event_date_votes")
    .upsert({ option_id: optionId, user_id: user.id, vote, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ vote: data })
}
