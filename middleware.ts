import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get('linkup_access_token')?.value)

  if (pathname === '/' && !hasSession) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  if ((pathname.startsWith('/dashboard') || pathname === '/account') && !hasSession) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (pathname === '/auth' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/auth', '/account', '/dashboard/:path*'],
}
