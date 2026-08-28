import { NextRequest, NextResponse } from "next/server"
import { safeNextPath } from "@/lib/auth-redirect"
import { setAuthCookies } from "@/lib/auth-cookies"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

function authError(request: NextRequest, message: string) {
  const url = new URL("/auth", request.url)
  url.searchParams.set("error", message)
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const providerError = request.nextUrl.searchParams.get("error_description")
  if (providerError) return authError(request, providerError)
  if (!code) return authError(request, "Google did not return a sign-in code. Please try again.")

  const supabaseCookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, supabaseCookieResponse)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) return authError(request, "That Google sign-in could not be completed. Please try again.")

  const requestedPath = request.nextUrl.searchParams.get("next")
  const createdAt = Date.parse(data.user.created_at)
  const lastSignInAt = Date.parse(data.user.last_sign_in_at || "")
  const isNewUser = Number.isFinite(createdAt) && Number.isFinite(lastSignInAt) && Math.abs(lastSignInAt - createdAt) < 15_000
  const destination = requestedPath ? safeNextPath(requestedPath) : isNewUser ? "/onboarding" : "/dashboard"
  const response = NextResponse.redirect(new URL(destination, request.url))
  supabaseCookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))

  return setAuthCookies(response, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  })
}
