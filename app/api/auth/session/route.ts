import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { access_token, refresh_token } = await request.json().catch(() => ({}))
  if (!access_token) return NextResponse.json({ error: 'Missing access token' }, { status: 400 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('linkup_access_token', access_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  if (refresh_token) response.cookies.set('linkup_refresh_token', refresh_token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
  return response
}
