import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { supabase as supabaseConfig } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

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

  return { response, userId }
}

export function redirectWithCookies(request: NextRequest, source: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url))
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}
