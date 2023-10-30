export { auth as default } from '@/libs/auth';

export const config = {
  matcher: [
    /**
     * https://github.com/vercel/next.js/tree/canary/examples/middleware-matcher
     * According to the documentation, the middleware always matches "_next" routes on server side.
     * Therefore, we need to exclude these routes from the middleware.
     * In addition, we cannnot restrict "_next" routes by mather configuration.
     */

    /**
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
