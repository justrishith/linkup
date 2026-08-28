import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: "Session expired" }, { status: 401 })

  const { data: savedProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  const metadataName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name
  const displayName = savedProfile?.display_name || metadataName || user.email?.split("@")[0] || "Account"

  return NextResponse.json({ user, profile: { ...savedProfile, display_name: displayName } })
}
