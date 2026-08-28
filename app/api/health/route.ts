import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

export async function GET() {
  try {
    const client = createClient<Database>(supabase.url, supabase.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await client.rpc('health_check')
    const ok = data === true && !error
    return NextResponse.json({ ok, database: ok ? 'connected' : 'unavailable' }, { status: ok ? 200 : 503 })
  } catch {
    return NextResponse.json({ ok: false, database: 'unavailable' }, { status: 503 })
  }
}
