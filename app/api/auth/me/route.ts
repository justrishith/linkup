import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const accessToken = (await cookies()).get("linkup_access_token")?.value
  if (!accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userResponse = await fetch(`${supabase.url}/auth/v1/user`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  const user = await userResponse.json().catch(() => null)
  if (!userResponse.ok || !user?.id) return NextResponse.json({ error: "Session expired" }, { status: 401 })

  const profileResponse = await fetch(`${supabase.url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`, {
    headers: { apikey: supabase.key, Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  const profiles = await profileResponse.json().catch(() => [])
  const savedProfile = Array.isArray(profiles) ? profiles[0] || null : null
  const displayName = savedProfile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Account"

  return NextResponse.json({ user, profile: { ...savedProfile, display_name: displayName } })
}
