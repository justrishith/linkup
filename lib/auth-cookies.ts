import { NextResponse } from 'next/server'

type Tokens = { access_token?: string; refresh_token?: string }

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function setAuthCookies(response: NextResponse, tokens: Tokens) {
  if (tokens.access_token) response.cookies.set('linkup_access_token', tokens.access_token, cookieOptions)
  if (tokens.refresh_token) response.cookies.set('linkup_refresh_token', tokens.refresh_token, cookieOptions)
  return response
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set('linkup_access_token', '', { ...cookieOptions, maxAge: 0 })
  response.cookies.set('linkup_refresh_token', '', { ...cookieOptions, maxAge: 0 })
  return response
}
