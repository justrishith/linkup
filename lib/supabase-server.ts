import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(supabase.url, supabase.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot write cookies; proxy.ts performs refreshes.
        }
      },
    },
  })
}

export function createSupabaseRouteClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(supabase.url, supabase.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
}
