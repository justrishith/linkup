import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  if (body.action === "confirm") {
    const optionId = typeof body.optionId === "string" ? body.optionId : ""
    if (!optionId) return NextResponse.json({ error: "optionId is required" }, { status: 400 })
    const { data, error } = await supabase.rpc("confirm_plan", { p_event_id: id, p_option_id: optionId })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ plan: data })
  }

  if (body.action === "rsvp") {
    const rsvp = typeof body.rsvp === "string" ? body.rsvp : ""
    if (!["going", "maybe", "not_going"].includes(rsvp)) {
      return NextResponse.json({ error: "A valid RSVP is required" }, { status: 400 })
    }
    const { data, error } = await supabase
      .from("event_members")
      .upsert({ event_id: id, user_id: user.id, rsvp })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ attendance: data })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await context.params
  const body = await request.json().catch(() => ({}))
  const photoReference = typeof body.photoReference === "string" ? body.photoReference.trim() : ""
  if (!photoReference || photoReference.length > 2000) {
    return NextResponse.json({ error: "A valid photo reference is required" }, { status: 400 })
  }
  const { data, error } = await supabase
    .from("event_proofs")
    .insert({ event_id: id, user_id: user.id, photo_reference: photoReference })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ proof: data }, { status: 201 })
}
