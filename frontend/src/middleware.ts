import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware ()
  {
    // Add any additional middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) =>
      {
        // Check if user is authenticated
        const isAuthenticated = !!token

        // Define protected routes
        const protectedPaths = [
          '/dashboard',
          '/orders',
          '/profile',
        ]

        // Check if the current path is protected
        const isProtectedPath = protectedPaths.some(path =>
          req.nextUrl.pathname.startsWith(path)
        )

        // Allow access to auth pages and public routes
        if (req.nextUrl.pathname.startsWith('/auth') ||
          req.nextUrl.pathname === '/' ||
          !isProtectedPath)
        {
          return true
        }

        // For protected routes, require authentication
        return isAuthenticated
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

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
