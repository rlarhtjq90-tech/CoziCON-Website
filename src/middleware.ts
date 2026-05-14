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

    // PENDING/REJECTED 사용자는 대시보드 외 보호 경로 차단
    const restrictedForPending = [
      '/notices/create',
      '/my-bids',
      '/contracts',
    ]
    const isPending = token?.status !== 'ACTIVE' && !token?.isAdmin
    if (isPending && restrictedForPending.some((p) => pathname.startsWith(p))) {
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
    '/notifications/:path*',
    '/contracts/:path*',
    '/my-bookmarks/:path*',
  ],
}
