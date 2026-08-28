import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export function createSupabaseRouteClient(request: NextRequest, response: NextResponse) {
  return createServerClient(supabase.url, supabase.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
}
