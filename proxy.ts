import { NextRequest } from 'next/server'
import { redirectWithCookies, updateSession } from '@/lib/supabase-proxy'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { response, userId } = await updateSession(request)
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/app') || pathname === '/account'

  if (isProtected && !userId) {
    return redirectWithCookies(request, response, '/auth')
  }

  if (pathname === '/auth' && userId) {
    return redirectWithCookies(request, response, '/dashboard')
  }

  return response
}

export const config = {
  matcher: ['/auth/:path*', '/account/:path*', '/dashboard/:path*', '/app/:path*', '/api/:path*'],
}
