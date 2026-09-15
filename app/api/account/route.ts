import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

const deleteAccountFunctionUrl = `${supabase.url}/functions/v1/delete-account`

export async function DELETE(request: NextRequest) {
  const cookieResponse = NextResponse.next()
  const client = createSupabaseRouteClient(request, cookieResponse)
  const reply = (body: Record<string, unknown>, status: number) => {
    const response = NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } })
    cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  const { data: { user }, error: userError } = await client.auth.getUser()
  if (userError || !user) return reply({ error: "Your session has expired. Sign in again before deleting your account." }, 401)

  const { data: { session } } = await client.auth.getSession()
  if (!session?.access_token) return reply({ error: "Your session has expired. Sign in again before deleting your account." }, 401)

  try {
    const deletion = await fetch(deleteAccountFunctionUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    })
    const payload = await deletion.json().catch(() => ({}))
    if (!deletion.ok) return reply({ error: typeof payload.error === "string" ? payload.error : "We could not delete your account. Please try again." }, deletion.status >= 400 && deletion.status < 600 ? deletion.status : 500)

    await client.auth.signOut()
    return reply({ ok: true }, 200)
  } catch {
    return reply({ error: "We could not reach account deletion right now. Please try again." }, 503)
  }
}
