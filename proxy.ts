import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Routes that are always accessible without a login
const PUBLIC_PATHS = [
  '/',
  '/explore',
  '/resources',
  '/about',
  '/contact',
  '/api/articles',
  '/api/resources',
  '/api/topics',
  '/api/contact',
];

// Auth pages — redirect away if already logged in
const AUTH_PATHS = ['/sign-in', '/sign-up'];

// Requires login
const PROTECTED_PATHS = ['/dashboard'];

// Requires admin role
const ADMIN_PATHS = ['/admin', '/api/admin'];

function isMatch(pathname: string, paths: string[]): boolean {
  return paths.some((p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, Next internals, and public API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Attempt to decode the access token (don't throw — token may just be expired)
  let session = null;
  const accessToken = request.cookies.get('sn_access')?.value;
  if (accessToken) {
    try {
      session = verifyAccessToken(accessToken);
    } catch {
      // Token expired or invalid — session stays null
      // The client-side AuthInitializer will call /api/auth/refresh automatically
    }
  }

  // Redirect logged-in users away from sign-in/sign-up
  if (isMatch(pathname, AUTH_PATHS) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (isMatch(pathname, PROTECTED_PATHS) && !session) {
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Protect admin routes — must be logged in AND have admin role
  if (isMatch(pathname, ADMIN_PATHS)) {
    // API routes return JSON, page routes redirect
    const isApiRoute = pathname.startsWith('/api/');
    if (!session) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (session.role !== 'admin') {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
