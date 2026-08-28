import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabase as supabaseConfig } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

const legacyCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient<Database>(supabaseConfig.url, supabaseConfig.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value))
      },
    },
  })

  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = typeof claimsData?.claims?.sub === "string" ? claimsData.claims.sub : null

  // Temporary bridge for legacy API routes. Supabase remains the source of truth;
  // these duplicate cookies disappear as those routes move to the server client.
  if (userId) {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      response.cookies.set("linkup_access_token", data.session.access_token, legacyCookieOptions)
      response.cookies.set("linkup_refresh_token", data.session.refresh_token, legacyCookieOptions)
    }
  } else {
    response.cookies.set("linkup_access_token", "", { ...legacyCookieOptions, maxAge: 0 })
    response.cookies.set("linkup_refresh_token", "", { ...legacyCookieOptions, maxAge: 0 })
  }

  return { response, userId }
}

export function redirectWithCookies(request: NextRequest, source: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url))
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}
