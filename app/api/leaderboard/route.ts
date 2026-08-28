import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const groupId = new URL(request.url).searchParams.get("groupId")
  if (!groupId) return NextResponse.json({ error: "groupId is required" }, { status: 400 })

  const { data, error } = await supabase
    .from("point_ledger")
    .select("user_id,points,profiles(display_name,avatar_url)")
    .eq("group_id", groupId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const totals = new Map<string, { userId: string; displayName: string; avatarUrl: string | null; points: number }>()
  for (const row of data || []) {
    const current = totals.get(row.user_id)
    const profile = row.profiles
    totals.set(row.user_id, {
      userId: row.user_id,
      displayName: profile?.display_name || "LinkUp member",
      avatarUrl: profile?.avatar_url || null,
      points: (current?.points || 0) + row.points,
    })
  }

  const leaderboard = [...totals.values()].sort((a, b) => b.points - a.points)
  return NextResponse.json({ leaderboard })
}
