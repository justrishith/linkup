import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

let browserClient: SupabaseClient<Database> | undefined

export function createSupabaseBrowserClient() {
  browserClient ??= createBrowserClient<Database>(supabase.url, supabase.key)
  return browserClient
}
