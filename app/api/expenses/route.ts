import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const groupId = new URL(request.url).searchParams.get("groupId")
  let query = supabase.from("expenses").select("*").order("created_at", { ascending: false })
  if (groupId) query = query.eq("group_id", groupId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message || "Unable to load expenses" }, { status: 400 })
  return NextResponse.json({ expenses: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { groupId, eventId = null, description, amount, currency = "USD", participants = [] } = await request.json().catch(() => ({}))
  if (!groupId || !description?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: "groupId, description, and a positive amount are required" }, { status: 400 })
  }
  const { data: expense, error } = await supabase.from("expenses").insert({ group_id: groupId, event_id: eventId, paid_by: user.id, description: description.trim(), amount: Number(amount), currency }).select().single()
  if (error || !expense) return NextResponse.json({ error: error?.message || "Unable to create expense" }, { status: 400 })
  const shares = Array.isArray(participants) && participants.length ? participants : [{ userId: user.id, share: Number(amount) }]
  const rows = shares.map((participant: { userId: string; share: number }) => ({ expense_id: expense.id, user_id: participant.userId, share: Number(participant.share), settled: participant.userId === user.id }))
  const { error: participantError } = await supabase.from("expense_participants").insert(rows)
  if (participantError) {
    await supabase.from("expenses").delete().eq("id", expense.id)
    return NextResponse.json({ error: participantError.message || "Unable to save expense shares" }, { status: 400 })
  }
  return NextResponse.json({ expense }, { status: 201 })
}
