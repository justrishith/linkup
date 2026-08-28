import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

let browserClient: SupabaseClient | undefined

export function createSupabaseBrowserClient() {
  browserClient ??= createBrowserClient(supabase.url, supabase.key)
  return browserClient
}
