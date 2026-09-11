import { NextRequest, NextResponse } from "next/server"
import { safeNextPath } from "@/lib/auth-redirect"
import { createSupabaseRouteClient } from "@/lib/supabase-server"

function authError(request: NextRequest, message: string) {
  const url = new URL("/auth", request.url)
  url.searchParams.set("error", message)
  const next = request.nextUrl.searchParams.get("next")
  if (next) url.searchParams.set("next", safeNextPath(next))
  return NextResponse.redirect(url)
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const providerError = request.nextUrl.searchParams.get("error_description")
  const errorCode = request.nextUrl.searchParams.get("error_code") || request.nextUrl.searchParams.get("error")
  if (errorCode === "access_denied") return authError(request, "Sign-in was canceled. Try again whenever you are ready.")
  if (errorCode === "otp_expired" || errorCode === "expired") return authError(request, "That sign-in link expired. Request a fresh one and open it in this browser.")
  if (providerError) return authError(request, providerError)
  if (!code) return authError(request, "Your sign-in link did not return a valid code. Please try again.")

  const supabaseCookieResponse = NextResponse.next()
  const supabase = createSupabaseRouteClient(request, supabaseCookieResponse)
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session) return authError(request, "That sign-in could not be completed. Please request a new link and try again.")

  const requestedPath = request.nextUrl.searchParams.get("next")
  const { count, error: membershipError } = await supabase
    .from("group_members")
    .select("group_id", { count: "exact", head: true })
    .eq("user_id", data.user.id)
  const createdAt = Date.parse(data.user.created_at)
  const lastSignInAt = Date.parse(data.user.last_sign_in_at || "")
  const likelyNewUser = Number.isFinite(createdAt) && Number.isFinite(lastSignInAt) && Math.abs(lastSignInAt - createdAt) < 15_000
  const needsOnboarding = membershipError ? likelyNewUser : count === 0
  const destination = requestedPath ? safeNextPath(requestedPath) : needsOnboarding ? "/onboarding" : "/dashboard"
  const response = NextResponse.redirect(new URL(destination, request.url))
  supabaseCookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))

  return response
}
