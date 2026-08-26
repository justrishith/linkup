import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const response = await fetch(`${supabase.url}/rest/v1/profiles?select=id&limit=1`, {
      headers: { apikey: supabase.key },
      cache: 'no-store',
    })
    return NextResponse.json({ ok: response.ok, database: response.ok ? 'connected' : 'unavailable' }, { status: response.ok ? 200 : 503 })
  } catch {
    return NextResponse.json({ ok: false, database: 'unavailable' }, { status: 503 })
  }
}
