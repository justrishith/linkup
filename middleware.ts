import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' }

function clearAuth(response: NextResponse) {
  response.cookies.set('linkup_access_token', '', { ...cookieOptions, maxAge: 0 })
  response.cookies.set('linkup_refresh_token', '', { ...cookieOptions, maxAge: 0 })
  return response
}

function tokenNeedsRefresh(token: string) {
  try {
    const [, payload] = token.split('.')
    const { exp } = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return !exp || exp * 1000 < Date.now() + 60_000
  } catch { return true }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let accessToken = request.cookies.get('linkup_access_token')?.value
  const hadAccessToken = Boolean(accessToken)
  const refreshToken = request.cookies.get('linkup_refresh_token')?.value
  let response = NextResponse.next()

  if (accessToken && tokenNeedsRefresh(accessToken)) {
    if (!refreshToken) accessToken = undefined
    else {
      const refresh = await fetch(`${supabase.url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST', headers: { apikey: supabase.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }),
      })
      const tokens = await refresh.json().catch(() => ({}))
      if (refresh.ok && tokens.access_token) {
        accessToken = tokens.access_token
        request.cookies.set('linkup_access_token', tokens.access_token)
        response.cookies.set('linkup_access_token', tokens.access_token, cookieOptions)
        if (tokens.refresh_token) {
          request.cookies.set('linkup_refresh_token', tokens.refresh_token)
          response.cookies.set('linkup_refresh_token', tokens.refresh_token, cookieOptions)
        }
      } else accessToken = undefined
    }
  }
  const hasSession = Boolean(accessToken)

  if ((pathname.startsWith('/dashboard') || pathname === '/account') && !hasSession) {
    return clearAuth(NextResponse.redirect(new URL('/auth', request.url)))
  }

  if (pathname === '/auth' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!hasSession && hadAccessToken) clearAuth(response)
  return response
}

export const config = {
  matcher: ['/auth/:path*', '/account/:path*', '/dashboard/:path*', '/api/:path*'],
}
