import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

const allowedVotes = new Set(["like", "dislike", "undecided"])

type CalendarOption = { starts_at?: unknown }

function normalizeFutureOptions(value: unknown): { options?: { starts_at: string }[]; error?: string } {
  if (!Array.isArray(value) || value.length < 2 || value.length > 4) {
    return { error: "Choose between two and four times." }
  }

  const startsAt = value.map((option: CalendarOption) => typeof option?.starts_at === "string" ? option.starts_at : "")
  if (startsAt.some((date) => !date || Number.isNaN(Date.parse(date)))) {
    return { error: "Every option needs a valid time." }
  }
  if (startsAt.some((date) => Date.parse(date) <= Date.now())) {
    return { error: "Plan times need to be in the future." }
  }
  if (new Set(startsAt).size !== startsAt.length) {
    return { error: "Each plan time needs to be different." }
  }

  return { options: startsAt.map((starts_at) => ({ starts_at })) }
}

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
  const normalized = normalizeFutureOptions(body.options)
  if (!groupId || !name) return NextResponse.json({ error: "groupId and name are required" }, { status: 400 })
  if (name.length > 120) return NextResponse.json({ error: "Plan names must be 120 characters or fewer" }, { status: 400 })
  if (!normalized.options) return NextResponse.json({ error: normalized.error || "Invalid plan times" }, { status: 400 })

  const { data: eventId, error } = await supabase.rpc("create_plan", {
    p_group_id: groupId,
    p_name: name,
    p_description: typeof body.description === "string" ? body.description : null,
    p_location: typeof body.location === "string" ? body.location : null,
    p_options: normalized.options,
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
