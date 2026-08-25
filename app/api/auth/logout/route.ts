import { NextResponse } from 'next/server'

export async function POST() {
  const out = NextResponse.json({ ok: true })
  out.cookies.delete('linkup_access_token')
  out.cookies.delete('linkup_refresh_token')
  return out
}
