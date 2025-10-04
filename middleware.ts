import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be protected
const protectedPaths = [
  '/dashboard',
  '/master-data',
  '/work-plan-report',
  // Hidden modules - uncomment when ready to use
  // '/project-management',
  // '/survey-estimation',
  // '/quotation-negotiation',
  // '/procurement-vendor',
  // '/warehouse-material',
  // '/technician-work',
  // '/finance-payment',
  // '/reporting',
]

// Add paths that should redirect to dashboard if user is authenticated
const authPaths = ['/login']

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )
  const isAuthPath = authPaths.includes(path)

  // Get token from cookie (we'll set this in the AuthContext)
  const token = request.cookies.get('auth_token')?.value

  // If accessing protected path without token, redirect to login
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If accessing auth path with token, redirect to dashboard
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If accessing root path, redirect based on auth status
  if (path === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}