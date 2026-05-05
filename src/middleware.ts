export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/dashboard/:path*', '/verify-license/:path*', '/admin/:path*', '/company/:path*'],
}
