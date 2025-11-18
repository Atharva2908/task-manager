import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = [
    '/auth',
    '/auth/login',
    '/auth/signup',
    '/auth/admin-login',
    '/auth/employee-login',
    '/auth/forgot-password',
    '/auth/reset-password',
  ]

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow all public routes without auth
  if (isPublicRoute) {
    // Redirect authenticated users from /auth to dashboard
    if (token && pathname === '/auth') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Do NOT redirect users from root; let app/page.tsx handle it
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Allow authorized access to protected routes
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
