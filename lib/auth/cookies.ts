import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const IS_PROD = process.env.NODE_ENV === 'production';

// Access token — short-lived, available to all routes
const ACCESS_COOKIE = 'sn_access';
// Refresh token — long-lived, scoped only to the refresh endpoint
const REFRESH_COOKIE = 'sn_refresh';

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15, // 15 minutes
  });

  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/api/auth', // scope to auth endpoints only
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set(ACCESS_COOKIE, '', { maxAge: 0, path: '/' });
  response.cookies.set(REFRESH_COOKIE, '', { maxAge: 0, path: '/api/auth' });
  return response;
}

export async function getAccessToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value;
}
