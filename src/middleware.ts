import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // /admin 은 isAdmin만 접근 허용
    if (pathname.startsWith('/admin') && !token?.isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/verify-license/:path*',
    '/admin/:path*',
    '/company/:path*',
    '/change-password',
    '/notices/create',
    '/notices/:id/edit',
    '/notices/:id/bids',
    '/my-bids/:path*',
  ],
}
