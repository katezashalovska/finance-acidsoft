import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define static files and auth-related paths to ignore
  const isAuthPage = pathname.startsWith('/login');
  const isPublicFile = pathname.match(/\.(.*)$/);
  const isApi = pathname.startsWith('/api');

  const isAuthenticated = request.cookies.has('auth_session');

  // If trying to access dashboard without auth, redirect to login
  if (!isAuthenticated && !isAuthPage && !isPublicFile && !isApi && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login while authenticated, redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
